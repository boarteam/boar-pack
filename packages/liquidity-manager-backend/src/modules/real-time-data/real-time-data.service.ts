import { Injectable, Logger } from "@nestjs/common";
import { AmtsDcService } from "../amts-dc/amts-dc.service";
import { mtPlatformsIds, MTVersions } from "../amts-dc/amts-dc.constants";
import { CLOSED_OBSERVABLE, MessagesStream } from "./dto/real-time-data.dto";
import {
  MTPositionsWSMessage,
  MTQuoteWSMessage,
  MTSnapshotWSMessage,
  MTUserInfoWSMessage,
  MTWSMessage
} from "../amts-dc/dto/amts-dc.dto";
import { Subject } from "rxjs";
import WebSocket from "ws";
import { PositionSide } from "../positions/dto/positions.dto";
import { TConnectorConfig } from "./real-time-data.types";
import { UserInfoService } from "../user-info/user-info.service";

@Injectable()
export class RealTimeDataService {
  private readonly logger = new Logger(RealTimeDataService.name);
  private readonly subjectsToConfigs = new Map<MessagesStream, TConnectorConfig>();

  constructor(
    private readonly amtsDcService: AmtsDcService,
    private readonly userInfoService: UserInfoService,
  ) {
  }

  public createConnectionConfig(moduleId: number): TConnectorConfig {
    return {
      moduleId,
      socket: null,
      quotesSubscription: null,
      snapshotsSubscription: null,
      positionsSubscription: null,
      userInfoSubscription: null,
    };
  }

  public async createMessagesStream(config: TConnectorConfig): Promise<MessagesStream> {
    const messagesStream: MessagesStream = new Subject();
    this.subjectsToConfigs.set(messagesStream, config);

    this.logger.log(`Connecting AMTS socket to new messages stream...`);
    this.tryToPipeWebsocketToStream({ messagesStream }).catch(e => {
      this.logger.error(`Error while connecting to AMTS websocket`);
      this.logger.error(e, e.stack);
      this.stopMessagesStream(messagesStream).catch(e => {
        this.logger.error(`Error while stopping messages stream`);
        this.logger.error(e, e.stack);
      });
    });

    return messagesStream;
  }

  public async stopMessagesStream(messagesStream: MessagesStream): Promise<void> {
    const config = this.subjectsToConfigs.get(messagesStream);
    messagesStream[CLOSED_OBSERVABLE] = true;
    this.subjectsToConfigs.delete(messagesStream);
    if (config?.socket) {
      await this.amtsDcService.closeWebsocket(config.socket).catch(e => {
        this.logger.error(`Error while closing AMTS websocket`);
        this.logger.error(e, e.stack);
      });
    }
    messagesStream.complete();
  }

  private async tryToPipeWebsocketToStream({
    messagesStream,
    reconnectTries = 5,
  }: {
    messagesStream: MessagesStream,
    reconnectTries?: number
  }): Promise<void> {
    this.logger.log(`Connecting to AMTS websocket...`);
    try {
      const config = this.subjectsToConfigs.get(messagesStream);
      if (!config) {
        throw new Error(`Config not found for stream, can't connect`);
      }

      const socket = this.pipeWebsocketToStream({
        messagesStream,
        config,
        onOpen: () => {
          this.onSocketConnect({ ws: socket, config });
        }
      });
      config.socket = socket;
      return;
    } catch (e) {
      if (reconnectTries <= 0) {
        this.logger.error(`Error while reconnecting to AMTS websocket, no more tries left`);
        this.logger.error(e, e.stack);
        await this.stopMessagesStream(messagesStream);
        return;
      }

      this.logger.error(`Error while reconnecting to AMTS websocket, reconnect in 5s..`);
      this.logger.error(e, e.stack);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return this.tryToPipeWebsocketToStream({
        messagesStream,
        reconnectTries: reconnectTries - 1,
      });
    }
  }

  private async onSocketConnect({
    ws,
    config,
  }: {
    ws: WebSocket,
    config: TConnectorConfig,
  }) {
    if (config.quotesSubscription && config.quotesSubscription.symbols.length) {
      await this.amtsDcService.subscribeToQuotesStream({
        ws,
        instruments: config.quotesSubscription.symbols,
        options: {
          platform_id: mtPlatformsIds[MTVersions.MT5],
        }
      });
    }

    if (config.snapshotsSubscription && config.snapshotsSubscription.symbols.length) {
      await this.amtsDcService.subscribeToSnapshotsStream({
        ws,
        instruments: config.snapshotsSubscription.symbols,
      });
    }

    if (config.positionsSubscription) {
      await this.amtsDcService.subscribeToPositionsUpdate({
        ws,
        userId: config.positionsSubscription.userId,
      });
    }

    if (config.userInfoSubscription) {
      await this.amtsDcService.subscribeToUserUpdate({
        ws,
        userId: config.userInfoSubscription.userId,
      });
    }
  }

  private pipeWebsocketToStream({
    messagesStream,
    config,
    onOpen,
  }: {
    messagesStream: MessagesStream,
    config: TConnectorConfig,
    onOpen?: () => void,
  }): WebSocket {
    const ws = this.amtsDcService.connectWebsocket({
      url: this.amtsDcService.getWsUrl(config.moduleId),
      onOpen: () => {
        messagesStream.next({
          event: 'status',
          data: {
            status: ws.readyState,
          },
        });
        onOpen?.();
      },
      onMessage: (event) => {
        this.processWSMessage(messagesStream, event);
      },
      onClose: () => {
        this.recreateSocketForMessageStream(messagesStream);
      },
    });

    messagesStream.next({
      event: 'status',
      data: {
        status: ws.readyState,
      },
    });

    return ws;
  }

  private recreateSocketForMessageStream(messagesStream: MessagesStream, timeout: number = 1000) {
    const config = this.subjectsToConfigs.get(messagesStream);

    if (messagesStream[CLOSED_OBSERVABLE]) {
      this.logger.log(`AMTS websocket closed, but stream is already closed, no need to reconnect`);
      return;
    }

    if (!config) {
      this.logger.error(`Config not found for stream, can't reconnect`);
      this.stopMessagesStream(messagesStream).catch(e => {
        this.logger.error(`Error while stopping messages stream`);
        this.logger.error(e, e.stack);
      });
      return;
    }

    messagesStream.next({
      event: 'status',
      data: {
        status: config.socket?.readyState || WebSocket.CLOSED,
      },
    });

    this.logger.log(`Reconnecting to AMTS websocket in 1 second...`);

    setTimeout(() => this.tryToPipeWebsocketToStream({ messagesStream }).catch(e => {
      this.logger.error(`Error while reconnecting to AMTS websocket`);
      this.logger.error(e, e.stack);
      this.stopMessagesStream(messagesStream).catch(e => {
        this.logger.error(`Error while stopping messages stream`);
        this.logger.error(e, e.stack);
      });
    }), timeout);
  }

  public async subscribeToQuotes({
    messagesStream,
    symbols,
    moduleId,
  }: {
    messagesStream: MessagesStream,
    symbols: string[],
    moduleId: number,
  }) {
    const config = this.subjectsToConfigs.get(messagesStream);
    if (!config) {
      throw new Error(`Config not found for stream, can't update`);
    }

    if (!config.socket) {
      config.moduleId = moduleId;
      config.quotesSubscription = {
        symbols,
      };
      this.logger.warn(`Socket is not connected, updating instruments and connecting socket to existing stream...`);
      await this.tryToPipeWebsocketToStream({ messagesStream });
      return;
    }

    // this happens if several requests for subscription to quotes come at the same time
    // todo: fix frontend to avoid such behaviour
    if (config.socket.readyState !== WebSocket.OPEN) {
      this.logger.warn(`Socket is not connected, subscribing to quotes after socket is open...`);
      return;
    }

    this.logger.log(`Detaching messages stream from existing socket...`);
    if (config.quotesSubscription) {
      await this.amtsDcService.unsubscribeFromQuotesStream({
        ws: config.socket,
        instruments: config.quotesSubscription.symbols,
      })
    }

    config.quotesSubscription = {
      symbols,
    };

    if (moduleId === config.moduleId) {
      if (symbols.length) {
        this.logger.log(`Attaching messages stream to existing socket...`);
        await this.amtsDcService.subscribeToQuotesStream({
          ws: config.socket,
          instruments: symbols,
          options: {
            platform_id: mtPlatformsIds[MTVersions.MT5],
          },
        });
      } else {
        this.logger.log(`No symbols to subscribe for quotes, skipping...`);
      }
    } else {
      this.logger.log(`Reconnecting to AMTS websocket with new module id...`);
      config.moduleId = moduleId;
      this.recreateSocketForMessageStream(messagesStream, 0);
    }
  }

  public async subscribeToSnapshots({
    messagesStream,
    symbols,
    moduleId,
  }: {
    messagesStream: MessagesStream,
    symbols: string[],
    moduleId: number,
  }) {
    const config = this.subjectsToConfigs.get(messagesStream);
    if (!config) {
      throw new Error(`Config not found for stream, can't update`);
    }

    if (!config.socket) {
      config.moduleId = moduleId;
      config.snapshotsSubscription = {
        symbols,
      };
      this.logger.warn(`Socket is not connected, updating instruments and connecting socket to existing stream...`);
      await this.tryToPipeWebsocketToStream({ messagesStream });
      return;
    }

    // this happens if several requests for subscription to snapshots come at the same time
    // todo: fix frontend to avoid such behaviour
    if (config.socket.readyState !== WebSocket.OPEN) {
      this.logger.warn(`Socket is not connected, subscribing to snapshots after socket is open...`);
      return;
    }

    this.logger.log(`Detaching messages stream from existing socket...`);
    if (config.snapshotsSubscription) {
      await this.amtsDcService.unsubscribeFromSnapshotsStream({
        ws: config.socket,
        instruments: config.snapshotsSubscription.symbols,
      })
    }

    config.snapshotsSubscription = {
      symbols,
    };

    if (moduleId === config.moduleId) {
      if (symbols.length) {
        this.logger.log(`Attaching messages stream to existing socket...`);
        await this.amtsDcService.subscribeToSnapshotsStream({
          ws: config.socket,
          instruments: symbols,
        });
      } else {
        this.logger.log(`No symbols to subscribe for snapshots, skipping...`);
      }
    } else {
      this.logger.log(`Reconnecting to AMTS websocket with new module id...`);
      config.moduleId = moduleId;
      this.recreateSocketForMessageStream(messagesStream, 0);
    }
  }

  public async subscribeToUserInfo({
    messagesStream,
    userId,
    moduleId,
  }: {
    messagesStream: MessagesStream,
    userId: number,
    moduleId: number,
  }) {
    const config = this.subjectsToConfigs.get(messagesStream);
    if (!config) {
      throw new Error(`Config not found for stream, can't update`);
    }

    if (!config.socket) {
      config.moduleId = moduleId;
      config.userInfoSubscription = {
        userId,
      };
      this.logger.warn(`Socket is not connected, updating user info and connecting socket to existing stream...`);
      await this.tryToPipeWebsocketToStream({ messagesStream });
      return;
    }

    this.logger.log(`Detaching messages stream from existing socket...`);
    if (config.userInfoSubscription) {
      await this.amtsDcService.unsubscribeFromUserUpdate({
        ws: config.socket,
        userId: config.userInfoSubscription.userId,
      })
    }

    config.userInfoSubscription = {
      userId,
    };

    if (moduleId === config.moduleId) {
        this.logger.log(`Attaching messages stream to existing socket...`);
        await this.amtsDcService.subscribeToUserUpdate({
          ws: config.socket,
          userId,
        });
    } else {
      this.logger.log(`Reconnecting to AMTS websocket with new module id...`);
      config.moduleId = moduleId;
      this.recreateSocketForMessageStream(messagesStream, 0);
    }
  }

  public async subscribeToPositions({
    messagesStream,
    userId,
    moduleId,
  }: {
    messagesStream: MessagesStream,
    userId: number,
    moduleId: number,
  }) {
    const config = this.subjectsToConfigs.get(messagesStream);
    if (!config) {
      throw new Error(`Config not found for stream, can't update`);
    }

    if (!config.socket) {
      config.moduleId = moduleId;
      config.positionsSubscription = {
        userId,
      };
      this.logger.warn(`Socket is not connected, updating positions and connecting socket to existing stream...`);
      await this.tryToPipeWebsocketToStream({ messagesStream });
      return;
    }

    this.logger.log(`Detaching messages stream from existing socket...`);
    if (config.positionsSubscription) {
      await this.amtsDcService.unsubscribeFromPositionsUpdate({
        ws: config.socket,
        userId: config.positionsSubscription.userId,
      })
    }

    config.positionsSubscription = {
      userId,
    };

    if (moduleId === config.moduleId) {
        this.logger.log(`Attaching messages stream to existing socket...`);
        await this.amtsDcService.subscribeToPositionsUpdate({
          ws: config.socket,
          userId,
        });
    } else {
      this.logger.log(`Reconnecting to AMTS websocket with new module id...`);
      config.moduleId = moduleId;
      this.recreateSocketForMessageStream(messagesStream, 0);
    }
  }

  private processWSMessage(messagesStream: MessagesStream, event: MTWSMessage) {
    if ('quote' in event) {
      this.processQuoteMessage(messagesStream, event);
    } else if ('snapshot' in event) {
      this.processSnapshotMessage(messagesStream, event);
    } else if ('position' in event) {
      this.processPositionMessage(messagesStream, event);
    } else if ('user' in event) {
      this.processUserMessage(messagesStream, event);
    } else {
      this.logger.warn(`Unknown WS message type for message: ${JSON.stringify(event)}`);
    }
  }

  private processQuoteMessage(messagesStream: MessagesStream, msg: MTQuoteWSMessage): void {
    messagesStream.next({
      event: 'quote',
      data: {
        symbol: msg.quote.instrument,
        bid: msg.quote.bid,
        ask: msg.quote.ask,
        timestamp: msg.quote.ts_msc,
      },
    });
  }

  private processSnapshotMessage(messagesStream: MessagesStream, msg: MTSnapshotWSMessage): void {
    messagesStream.next({
      event: 'snapshot',
      data: {
        symbol: msg.snapshot.instrument,
        timestamp: msg.snapshot.ts_msc,
        asks: msg.snapshot.asks,
        bids: msg.snapshot.bids,
      },
    });
  }

  private processPositionMessage(messagesStream: MessagesStream, msg: MTPositionsWSMessage): void {
    messagesStream.next({
      event: 'position',
      data: {
        id: msg.position.id,
        userId: msg.position.user_id,
        instrument: msg.position.instrument,
        side: msg.position.side as PositionSide,
        amount: msg.position.amount,
        openPrice: msg.position.open_price,
        margin: msg.position.margin,
        profit: msg.position.profit,
        createdAt: new Date(msg.position.ts_create),
        updatedAt: new Date(msg.position.ts_update),
      }
    });
  }

  private processUserMessage(messagesStream: MessagesStream, msg: MTUserInfoWSMessage): void {
    messagesStream.next({
      event: 'user',
      data: this.userInfoService.formatUserInfo(msg.user),
    });
  }
}
