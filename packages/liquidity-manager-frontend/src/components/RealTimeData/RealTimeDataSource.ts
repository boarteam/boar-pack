import {
  PositionDto,
  PositionEventDto,
  QuoteDto,
  QuoteEventDto,
  SubscribeToPositionsEventDto,
  SubscribeToQuotesEventDto,
  UserInfoDto,
  UserInfoEventDto,
  WebsocketsErrorEventDto,
} from "../../tools/api-client/generated";
import { WebsocketClient } from "@jifeon/boar-pack-common-frontend";
import { useEffect, useState } from "react";
import { TConnectionStatus } from "./realTimeDataStatuses";

export type TIncomeEvent =
  | { event: 'error' } & WebsocketsErrorEventDto
  | { event: 'quote' } & QuoteEventDto
  | { event: 'position' } & PositionEventDto
  | { event: 'user' } & UserInfoEventDto
  | { event: 'status', status: WebSocket['readyState'] };

export type TOutputEvent =
  | { event: 'subscribeToQuotes' } & SubscribeToQuotesEventDto
  | { event: 'subscribeToPositions' } & SubscribeToPositionsEventDto;

export class RealTimeDataSource {
  private primarySocket: WebsocketClient | null = null;
  private active: boolean = false;
  private symbols: string[] = [];
  private moduleId: number = null;
  private userId: number = null;
  private subscriptions: Set<'quotes' | 'positions' | 'userInfo'> = new Set();
  public readonly quotesEvents: EventTarget = new EventTarget();
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
    if (this.subscriptions.has('positions')) {
      this.listenPositons();
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

  public subscribeToPositions(userId: number) {
    this.subscriptions.add('positions');
    this.userId = userId;

    if (this.active) {
      this.listenPositons();
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

  private onSocketClose = () => {
    this.emitStatusEvent();
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

  private listenPositons = () => {
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

  private emitUserInfoEvent(userInfo: UserInfoDto) {
    this.userInfoEvents.dispatchEvent(new CustomEvent<UserInfoDto>(
      `userInfo`,
      {
        detail: userInfo,
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
