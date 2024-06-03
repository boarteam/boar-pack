import { ObjectLiteral } from "typeorm";

export class HistoryData<T extends ObjectLiteral> {
  haction: 1 | 2 | 3;
  ts: number;
  hid: number;
  new: T;
  old: T;
}

export class GetHistoryResponse<T extends ObjectLiteral> {
  data: HistoryData<T>[];
  total: number;
}
