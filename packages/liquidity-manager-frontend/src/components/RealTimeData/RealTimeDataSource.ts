import {
  PositionDto,
  PositionEventDto,
  QuoteDto,
  QuoteEventDto,
  SubscribeEventDto,
  WebsocketsErrorEventDto,
} from "../../tools/api-client/generated";
import { WebsocketClient } from "@jifeon/boar-pack-common-frontend";
import { useEffect, useState } from "react";
import { TConnectionStatus } from "./realTimeDataStatuses";

export type TIncomeEvent =
  | { event: 'error' } & WebsocketsErrorEventDto
  | { event: 'quote' } & QuoteEventDto
  | { event: 'position' } & PositionEventDto
  | { event: 'status', status: WebSocket['readyState'] };

export type TOutputEvent =
  | { event: 'subscribe' } & SubscribeEventDto;

export class RealTimeDataSource {
  private primarySocket: WebsocketClient | null = null;
  private active: boolean = false;
  private symbols: string[] = [];
  private moduleId: number = null;
  public readonly quotesEvents: EventTarget = new EventTarget();
  public readonly positionsEvents: EventTarget = new EventTarget();
  public readonly socketStatusEvents: EventTarget = new EventTarget();

  get status() {
    return this.primarySocket?.status ?? WebSocket.CLOSED;
  }

  public subscribeToQuotes(symbols: string[], moduleId: number) {
    if (this.active) {
      this.updateConnection(symbols, moduleId);
      return;
    }

    this.active = true;
    this.symbols = symbols;
    this.moduleId = moduleId;

    this.primarySocket = new WebsocketClient({
      worker: null,
      onOpen: this.onQuotesSocketOpen,
      onMessage: this.onSocketMessage,
      onClose: this.onSocketClose,
    });
    this.emitStatusEvent();
  }

  // todo: probably not needed?
  public subscribeToPositions() {
    if (this.active) {
      return;
    }

    this.active = true;
    this.primarySocket = new WebsocketClient({
      worker: null,
      onOpen: this.onPositionsSocketOpen,
      onMessage: this.onSocketMessage,
      onClose: this.onSocketClose,
    });
    this.emitStatusEvent();
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

  public updateConnection(symbols: string[], moduleId: number) {
    this.symbols = symbols;
    this.moduleId = moduleId;
    if (!this.active) {
      return;
    }

    this.onQuotesSocketOpen();
  }

  private onSocketMessage = async (msg: TIncomeEvent) => {
    switch (msg.event) {
      case 'quote':
        this.emitQuoteEvent(msg.data);
        break;

      case 'position':
        this.emitPositionEvent(msg.data);
        break;

      case 'status':
        this.emitStatusEvent();
        break;
    }
  }

  private onQuotesSocketOpen = () => {
    this.emitStatusEvent();
    this.primarySocket?.send<SubscribeEventDto>({
      event: 'subscribe',
      data: {
        symbols: this.symbols,
        moduleId: this.moduleId,
      },
    });
  }

  private onPositionsSocketOpen = () => {
    this.emitStatusEvent();
    this.primarySocket?.send<SubscribeEventDto>({
      event: 'subscribe',
      data: {
        symbols: [],
        moduleId: 4001,
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
      `position:${position.id}`,
      {
        detail: position,
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
