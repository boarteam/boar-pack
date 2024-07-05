import { Subject } from "rxjs";
import { WebsocketsEventDto } from "@jifeon/boar-pack-common-backend";

export class QuoteDto {
  symbol: string;
  bid: number | null;
  ask: number | null;
  timestamp: number;
}

export class SubscribeEventDto implements WebsocketsEventDto {
  event: 'subscribe';
  data: {
    symbols: QuoteDto['symbol'][];
  }
}

export type MessageEventDto = QuoteEventDto | StatusEventDto;
export type MessagesStream = Subject<MessageEventDto>;

export class QuoteEventDto implements WebsocketsEventDto {
  event: 'quote';
  data: QuoteDto;
}

export class StatusEventDto implements WebsocketsEventDto {
  event: 'status';
  data: {
    status: WebSocket['readyState'],
  };
}