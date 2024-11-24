import { MTInstrument } from "./amts-dc.types";
import { LosslessNumber } from "lossless-json";
import { AccountStateDto } from "../../user-info/dto/user-info.dto";

type LosslessJsonValue<T> = T extends number
  ? LosslessNumber
  : T;

type LosslessJsonResult<T> = {
  [K in keyof T]: LosslessJsonValue<T[K]>;
};

export class MTResponse<T> {
  result: T & ({
    status: true;
  } | {
    status: false;
    description: string;
    code: LosslessNumber;
  });
  version: number = 1;
}

export type MTInstrumentListRequest = {
  method: 'req_instrument_list';
  session_id?: number;
  secret?: string;
  token?: string;
  version?: number;
}

export type MTInstrumentListShortRequest = {
  method: 'req_instrument_list_short';
  session_id?: number;
  secret?: string;
  token?: string;
  version?: number;
}

export type MTInstrumentListResult = LosslessJsonResult<{
  instruments: MTInstrument[];
}>;

export type MTGetPositionsRequest = {
  method: 'get_positions';
  req_id: number;
  user_id: number;
}

export type MTPosition = {
  user_id: number;
  id: number;
  instrument: string;
  side: 'buy' | 'sell';
  amount: number;
  open_price: number;
  margin: number;
  profit: number;
  ts_create: number;
  ts_update: number;
}

export type MTGetPositionsResult = LosslessJsonResult<{
  req_id: number;
  result: MTPosition[];
}>;

export type MTGetUserInfoRequest = {
  method: 'get_user';
  req_id: number;
  user_id: number;
}

export type MTUserInfo = LosslessJsonResult<{
  id: number;
  name: string;
  group_name: string;
  leverage: number;
  currency: string;
  balance: string;
  margin: string;
  profit: string;
}>;

export type MTGetUserInfoResult = {
  req_id: number;
  result: MTUserInfo;
}

export type MTSnapshot = {
  instrument: string;
  ts_msc: number;
  asks: {
    price: number;
    amount: number;
  }[];
  bids: {
    price: number;
    amount: number;
  }[];
};

export type MTSubscribeToQuotesRequest = {
  method: 'subscribe_to_quotes_stream';
  req_id: number;
  session_id?: number;
  secret?: string;
  market_depth?: number;
  token?: string;
  instruments: string[];
  quotes_timeout: number;
  version?: number;
  platform_id?: number;
}

export type MTAttachStreamResult = LosslessJsonResult<{
  req_id: number;
  status: boolean;
}>;

export type MTWSMessage =
  | MTQuoteWSMessage
  | MTSnapshotWSMessage
  | MTPositionsWSMessage
  | MTInstrumentAddMessage
  | MTInstrumentUpdateMessage
  | MTInstrumentDeleteMessage
  | MTUserInfoWSMessage;

export type MTQuoteWSMessage = {
  quote: {
    instrument: string;
    ts_msc: number;
    ask: number;
    bid: number
  }
}

export type MTSnapshotWSMessage = {
  snapshot: MTSnapshot;
}

export type MTPositionsWSMessage = {
  position: MTPosition;
}

export type MTUserInfoWSMessage = {
  account_state: AccountStateDto & {
    user_id: number;
  };
}

export type MTInstrumentAddMessage = {
  symbol_add: MTInstrument;
}

export type MTInstrumentUpdateMessage = {
  symbol_update: MTInstrument;
}

export type MTInstrumentDeleteMessage = {
  symbol_delete: MTInstrument;
}
