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
      width: '33%',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      width: '33%',
    },
    {
      title: 'Ask',
      dataIndex: 'ask',
    },
  ];
};
