import { QuoteDto, QuoteEventDto, SubscribeEventDto, WebsocketsErrorEventDto, } from "@@api/generated";
import { useMemo } from "react";
import { WebsocketClient } from "@jifeon/boar-pack-common-frontend";

export type TIncomeEvent =
  | { event: 'error' } & WebsocketsErrorEventDto
  | { event: 'quote' } & QuoteEventDto;

export type TOutputEvent =
  | { event: 'subscribe' } & SubscribeEventDto;


export class QuotesDataSource {
  private primarySocket: WebsocketClient | null = null;
  private active: boolean = false;
  private symbols: string[] = [];
  public readonly quotesEvents: EventTarget = new EventTarget();

  private static quotesDataSource: QuotesDataSource;

  static create() {
    if (!QuotesDataSource.quotesDataSource) {
      QuotesDataSource.quotesDataSource = new QuotesDataSource();
    }

    return QuotesDataSource.quotesDataSource;
  }

  public subscribe(symbols: string[]) {
    if (this.active) {
      this.updateConnection(symbols);
      return;
    }

    this.active = true;
    this.symbols = symbols;

    this.primarySocket = new WebsocketClient({
      worker: null,
      onOpen: this.onSocketOpen,
      onMessage: this.onSocketMessage,
      onClose: this.onSocketClose,
    });
  }

  private onSocketClose = () => {
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

  public updateConnection(symbols: string[]) {
    this.symbols = symbols;
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
    }
  }

  private onSocketOpen = () => {
    this.primarySocket?.send<SubscribeEventDto>({
      event: 'subscribe',
      data: {
        symbols: this.symbols,
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

export function useQuotes() {
  const quotesDataSource = useMemo(() => {
    return QuotesDataSource.create();
  }, []);

  return {
    quotesDataSource,
  };
}
