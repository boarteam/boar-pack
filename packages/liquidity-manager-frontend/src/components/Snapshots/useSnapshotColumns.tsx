import { ColumnsType } from "antd/es/table";

export interface Band {
  key: number;
  bid?: number;
  price: number;
  ask?: number;
}

export const useSnapshotColumns = (): ColumnsType<Band> => {
  return [
    {
      title: 'Bid',
      dataIndex: 'bid',
    },
    {
      title: 'Price',
      dataIndex: 'price',
    },
    {
      title: 'Ask',
      dataIndex: 'ask',
    },
  ];
};
