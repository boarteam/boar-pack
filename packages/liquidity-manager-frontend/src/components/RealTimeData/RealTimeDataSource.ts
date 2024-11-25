import {
  AccountStateDto,
  PositionDto,
  PositionEventDto,
  QuoteDto,
  QuoteEventDto,
  SnapshotDto,
  SnapshotEventDto,
  SubscribeToPositionsEventDto,
  SubscribeToQuotesEventDto,
  SubscribeToSnapshotsEventDto,
  UserInfoDto,
  UserInfoEventDto,
  WebsocketsErrorEventDto,
} from "../../tools/api-client/generated";
import { WebsocketClient, WsErrorCodes } from "@jifeon/boar-pack-common-frontend";
import { useEffect, useState } from "react";
import { TConnectionStatus } from "./realTimeDataStatuses";
import { logout } from "@jifeon/boar-pack-users-frontend/src/pages/getInitialState";
import apiClient from "@@api/apiClient";

export type TIncomeEvent =
  | { event: 'error' } & WebsocketsErrorEventDto
  | { event: 'quote' } & QuoteEventDto
  | { event: 'position' } & PositionEventDto
  | { event: 'snapshot' } & SnapshotEventDto
  | { event: 'user' } & UserInfoEventDto
  | { event: 'status', data: {status: WebSocket['readyState']} };

export type TOutputEvent =
  | { event: 'subscribeToQuotes' } & SubscribeToQuotesEventDto
  | { event: 'subscribeToPositions' } & SubscribeToPositionsEventDto;

export class RealTimeDataSource {
  private primarySocket: WebsocketClient | null = null;
  private active: boolean = false;
  private symbols: string[] = [];
  private snapshotSymbols: string[] = [];
  private moduleId: number = null;
  private userId: number = null;
  private subscriptions: Set<'quotes' | 'snapshots' | 'positions' | 'userInfo'> = new Set();
  public readonly quotesEvents: EventTarget = new EventTarget();
  public readonly snapshotsEvents: EventTarget = new EventTarget();
  public readonly positionsEvents: EventTarget = new EventTarget();
  public readonly socketStatusEvents: EventTarget = new EventTarget();
  public readonly userInfoEvents: EventTarget = new EventTarget();

  get status() {
    return this.primarySocket?.status ?? WebSocket.CLOSED;
  }

  private createSocket() {
    this.active = true;

    this.primarySocket = new WebsocketClient({
      worker: null,
      onOpen: this.onOpen,
      onMessage: this.onSocketMessage,
      onClose: this.onSocketClose,
    });
    this.emitStatusEvent();
  }

  private onOpen = () => {
    this.emitStatusEvent();

    if (this.subscriptions.has('quotes')) {
      this.listenQuotes();
    }
    if (this.subscriptions.has('snapshots')) {
      this.listenSnapshots();
    }
    if (this.subscriptions.has('positions')) {
      this.listenPositions();
    }
    if (this.subscriptions.has('userInfo')) {
      this.listenUserInfo();
    }
  }

  public subscribeToQuotes(symbols: string[], moduleId: number) {
    this.subscriptions.add('quotes');
    this.symbols = symbols;
    this.moduleId = moduleId;

    if (this.active) {
      this.listenQuotes();
      return;
    }

    this.createSocket();
  }

  public subscribeToSnapshots(symbols: string[], moduleId: number) {
    this.subscriptions.add('snapshots');
    this.snapshotSymbols = symbols;
    this.moduleId = moduleId;

    if (this.active) {
      this.listenSnapshots();
      return;
    }

    this.createSocket();
  }

  public subscribeToPositions(userId: number) {
    this.subscriptions.add('positions');
    this.userId = userId;

    if (this.active) {
      this.listenPositions();
      return;
    }

    this.createSocket();
  }

  public subscribeToUserInfo(userId: number) {
    this.subscriptions.add('userInfo');
    this.userId = userId;

    if (this.active) {
      this.listenUserInfo();
      return;
    }

    this.createSocket();
  }

  private emitStatusEvent() {
    this.socketStatusEvents.dispatchEvent(new CustomEvent('status', {
      detail: this.primarySocket?.status,
      bubbles: false,
      cancelable: true
    }));
  }

  private onSocketClose = async (event: WebSocketEventMap['close']) => {
    this.emitStatusEvent();
    if (event.code === WsErrorCodes.Unauthorized) {
      await logout(apiClient.amtsAuthentication.logout.bind(apiClient.amtsAuthentication));
      return;
    }

    console.log('RealTimeDataSource: onSocketClose: reconnecting in 1s...');
    if (this.active) {
      this.primarySocket?.reconnect(1000);
    }
  }

  public async closeSocketConnections() {
    console.log('RealTimeDataSource: closeSocketConnections');
    this.active = false;
    await this.primarySocket?.close();
  }

  private onSocketMessage = async (msg: TIncomeEvent) => {
    switch (msg.event) {
      case 'quote':
        this.emitQuoteEvent(msg.data);
        break;

      case 'snapshot':
        this.emitSnapshotEvent(msg.data);
        break;

      case 'position':
        this.emitPositionEvent(msg.data);
        break;

      case 'user':
        this.emitUserInfoEvent(msg.data);
        break;

      case 'status':
        this.emitStatusEvent();
        break;
    }
  }

  private listenQuotes = () => {
    this.primarySocket?.send<SubscribeToQuotesEventDto>({
      event: 'subscribeToQuotes',
      data: {
        symbols: this.symbols,
        moduleId: this.moduleId,
      },
    });
  }

  private listenSnapshots = () => {
    this.primarySocket?.send<SubscribeToSnapshotsEventDto>({
      event: 'subscribeToSnapshots',
      data: {
        symbols: this.snapshotSymbols,
        moduleId: this.moduleId,
      },
    });
  }

  private listenPositions = () => {
    this.primarySocket?.send<SubscribeToPositionsEventDto>({
      event: 'subscribeToPositions',
      data: {
        userId: this.userId,
      },
    });
  }

  private listenUserInfo = () => {
    this.primarySocket?.send({
      event: 'subscribeToUserInfo',
      data: {
        userId: this.userId,
      },
    });
  }

  private emitQuoteEvent(quote: QuoteDto) {
    this.quotesEvents.dispatchEvent(new CustomEvent<QuoteDto>(
      `quote:${quote.symbol}`,
      {
        detail: quote,
        bubbles: false,
        cancelable: true,
      }
    ));
  }

  private emitSnapshotEvent(snapshot: SnapshotDto) {
    this.snapshotsEvents.dispatchEvent(new CustomEvent<SnapshotDto>(
      `snapshot:${snapshot.symbol}`,
      {
        detail: snapshot,
        bubbles: false,
        cancelable: true,
      }
    ));
  }

  private emitPositionEvent(position: PositionDto) {
    this.positionsEvents.dispatchEvent(new CustomEvent<PositionDto>(
      `position:${position.userId}`,
      {
        detail: position,
        bubbles: false,
        cancelable: true,
      }
    ));
  }

  private emitUserInfoEvent(accountState: AccountStateDto) {
    this.userInfoEvents.dispatchEvent(new CustomEvent<AccountStateDto>(
      `userInfo`,
      {
        detail: accountState,
        bubbles: false,
        cancelable: true,
      }
    ));
  }
}

const realTimeDataSource = new RealTimeDataSource();

export function useRealTimeData(): {
  realTimeDataSource: RealTimeDataSource,
  connectionStatus: TConnectionStatus,
} {
  const [connectionStatus, setConnectionStatus] = useState<TConnectionStatus>(WebSocket.CLOSED);

  useEffect(() => {
    const handler = (evt: CustomEvent<TConnectionStatus | undefined>) => {
      setConnectionStatus(evt.detail ?? WebSocket.CLOSED);
    };

    realTimeDataSource.socketStatusEvents.addEventListener('status', handler);

    return () => {
      realTimeDataSource.socketStatusEvents.removeEventListener('status', handler);
    }
  }, []);

  return {
    connectionStatus,
    realTimeDataSource,
  };
}
