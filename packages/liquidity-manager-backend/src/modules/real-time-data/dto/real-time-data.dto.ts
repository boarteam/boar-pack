import { Subject } from "rxjs";
import { WebsocketsEventDto } from "@jifeon/boar-pack-common-backend";
import { PositionDto } from "../../positions/dto/positions.dto";
import { AccountStateDto } from "../../user-info/dto/user-info.dto";

export class QuoteDto {
  symbol: string;
  bid: number | null;
  ask: number | null;
  timestamp: number;
}

export class BandDto {
  price: number;
  amount: number;
}

export class SnapshotDto {
  symbol: string;
  timestamp: number;
  asks: BandDto[];
  bids: BandDto[];
}

export class SubscribeToQuotesEventDto implements WebsocketsEventDto {
  event: 'subscribeToQuotes';
  data: {
    symbols: QuoteDto['symbol'][];
    moduleId: number;
  }
}

export class SubscribeToSnapshotsEventDto implements WebsocketsEventDto {
  event: 'subscribeToSnapshots';
  data: {
    symbols: SnapshotDto['symbol'][];
    moduleId: number;
  }
}

export class SubscribeToPositionsEventDto implements WebsocketsEventDto {
  event: 'subscribeToPositions';
  data: {
    userId: number;
  }
}

export class SubscribeToUserInfoEventDto implements WebsocketsEventDto {
  event: 'subscribeToUserInfo';
  data: {
    userId: number;
  }
}

export const CLOSED_OBSERVABLE = Symbol('CLOSED_OBSERVABLE');

export type MessageEventDto =
  | QuoteEventDto
  | SnapshotEventDto
  | PositionEventDto
  | StatusEventDto
  | UserInfoEventDto;

export type MessagesStream = Subject<MessageEventDto> & {
  [CLOSED_OBSERVABLE]?: true | undefined;
};

export class QuoteEventDto implements WebsocketsEventDto {
  event: 'quote';
  data: QuoteDto;
}

export class SnapshotEventDto implements WebsocketsEventDto {
  event: 'snapshot';
  data: SnapshotDto;
}

export class PositionEventDto implements WebsocketsEventDto {
  event: 'position';
  data: PositionDto;
}

export class StatusEventDto implements WebsocketsEventDto {
  event: 'status';
  data: {
    status: WebSocket['readyState'],
  };
}

export class UserInfoEventDto implements WebsocketsEventDto {
  event: 'user';
  data: AccountStateDto;
}
