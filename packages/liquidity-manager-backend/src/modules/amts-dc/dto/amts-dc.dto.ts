import { MTInstrument } from "./amts-dc.types";
import { LosslessNumber } from "lossless-json";

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
  user_id: number;
  positions: {position: MTPosition}[];
}>;

export type MTAttachStreamRequest = {
  method: 'attach_stream';
  req_id: number;
  session_id?: number;
  secret?: string;
  market_depth?: number;
  token?: string;
  subscribe_quotes: string[];
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
  | MTPositionsWSMessage
  | MTInstrumentAddMessage
  | MTInstrumentUpdateMessage
  | MTInstrumentDeleteMessage;

export type MTQuoteWSMessage = {
  quote: {
    instrument: string;
    ts_msc: number;
    ask: number;
    bid: number
  }
}

export type MTPositionsWSMessage = {
  position: MTPosition;
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
