import { Subject } from "rxjs";

export class QuoteDto {
  symbol: string;
  bid: number | null;
  ask: number | null;
  timestamp: number;
}

export interface EventDto {
  event: string;
  data: object;
}

export class SubscribeEventDto implements EventDto {
  event: 'subscribe';
  data: {
    symbols: QuoteDto['symbol'][];
  }
}

export type MessageEventDto = QuoteEventDto;
export type MessagesStream = Subject<MessageEventDto>;

export class QuoteEventDto implements EventDto {
  event: 'quote';
  data: QuoteDto;
}
