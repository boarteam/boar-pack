import { ProColumns } from "@ant-design/pro-components";

export interface Quote {
  symbol: string;
  bid?: number;
  ask?: number;
  timestamp?: Date;
  group: string;
}

export const useQuotesColumns = (): ProColumns<Quote>[] => {
  return [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
    },
    {
      title: 'Bid',
      dataIndex: 'bid',
    },
    {
      title: 'Ask',
      dataIndex: 'ask',
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
    },
    {
      title: 'Group',
      dataIndex: 'group',
    }
  ];
};
