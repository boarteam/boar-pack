import { ObjectLiteral } from "typeorm";

export class HistoryData<T extends ObjectLiteral> {
  haction?: 'Created' | 'Updated' | 'Deleted';
  hts: number;
  hid: number;
  new: T;
  old: T;
}

export class GetHistoryResponse<T extends ObjectLiteral> {
  data: HistoryData<T>[];
  total: number;
}
