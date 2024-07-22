import { QuoteDto, QuoteEventDto, SubscribeEventDto, WebsocketsErrorEventDto, } from "@@api/generated";
import { useEffect, useState } from "react";
import { WebsocketClient } from "@jifeon/boar-pack-common-frontend";

export type TIncomeEvent =
  | { event: 'error' } & WebsocketsErrorEventDto
  | { event: 'quote' } & QuoteEventDto
  | { event: 'status', status: WebSocket['readyState'] };

export type TOutputEvent =
  | { event: 'subscribe' } & SubscribeEventDto;


export class QuotesDataSource {
  private primarySocket: WebsocketClient | null = null;
  private active: boolean = false;
  private symbols: string[] = [];
  private moduleId: number = null;
  public readonly quotesEvents: EventTarget = new EventTarget();
  public readonly socketStatusEvents: EventTarget = new EventTarget();

  get status() {
    return this.primarySocket?.status ?? WebSocket.CLOSED;
  }

  public subscribe(symbols: string[], moduleId: number) {
    if (this.active) {
      this.updateConnection(symbols, moduleId);
      return;
    }

    this.active = true;
    this.symbols = symbols;
    this.moduleId = moduleId;

    this.primarySocket = new WebsocketClient({
      worker: null,
      onOpen: this.onSocketOpen,
      onMessage: this.onSocketMessage,
      onClose: this.onSocketClose,
    });
    this.emitStatusEvent();
  }

  private emitStatusEvent() {
    console.log(`QuotesDataSource: emitStatusEvent: ${this.primarySocket?.status}`);
    this.socketStatusEvents.dispatchEvent(new CustomEvent('status', {
      detail: this.primarySocket?.status,
      bubbles: false,
      cancelable: true
    }));
  }

  private onSocketClose = () => {
    this.emitStatusEvent();
    console.log('QuotesDataSource: onSocketClose: reconnecting in 1s...');
    if (this.active) {
      this.primarySocket?.reconnect(1000);
    }
  }

  public async closeSocketConnections() {
    console.log('QuotesDataSource: closeSocketConnections');
    this.active = false;
    await this.primarySocket?.close();
  }

  public updateConnection(symbols: string[], moduleId: number) {
    this.symbols = symbols;
    this.moduleId = moduleId;
    if (!this.active) {
      return;
    }

    this.onSocketOpen();
  }

  private onSocketMessage = async (msg: TIncomeEvent) => {
    switch (msg.event) {
      case 'quote':
        this.emitQuoteEvent(msg.data);
        break;

      case 'status':
        this.emitStatusEvent();
        break;
    }
  }

  private onSocketOpen = () => {
    this.emitStatusEvent();
    this.primarySocket?.send<SubscribeEventDto>({
      event: 'subscribe',
      data: {
        symbols: this.symbols,
        moduleId: this.moduleId,
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
}

export function useQuotes(): { quotesDataSource: QuotesDataSource | null } {
  const [quotesDataSource, setQuotesDataSource] = useState<QuotesDataSource | null>(null);

  useEffect(() => {
    const quotesDataSource = new QuotesDataSource();
    setQuotesDataSource(quotesDataSource);

    return () => {
      quotesDataSource.closeSocketConnections().catch(console.error);
    };
  }, []);

  return {
    quotesDataSource,
  };
}
