import { ProColumns } from "@ant-design/pro-components";
import { PositionDto } from "../../tools/api-client";

export const usePositionsColumns = (): ProColumns<PositionDto>[] => {
  return [
    {
      title: 'ID',
      dataIndex: 'id',
      copyable: true,
      ellipsis: true,
    },
    {
      title: 'Instrument',
      dataIndex: 'instrument',
    },
    {
      title: 'Side',
      dataIndex: 'side',
      valueType: 'select',
      valueEnum: {
        buy: { text: 'Buy' },
        sell: { text: 'Sell' },
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      valueType: 'digit',
    },
    {
      title: 'Open Price',
      dataIndex: 'openPrice',
      valueType: 'digit',
    },
    {
      title: 'Margin',
      dataIndex: 'margin',
      valueType: 'digit',
    },
    {
      title: 'Profit',
      dataIndex: 'profit',
      valueType: 'digit',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      // render: (_, record) => <Ticker
      //   symbol={record.symbol}
      //   positionParam='timestamp'
      //   // DD/MM/YYYY, HH:mm:ss.SSS
      //   format={(value) => dayjs(value).format('DD/MM/YYYY, HH:mm:ss.SSS')}
      // />,
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      // render: (_, record) => <Ticker
      //   symbol={record.symbol}
      //   positionParam='timestamp'
      //   // DD/MM/YYYY, HH:mm:ss.SSS
      //   format={(value) => dayjs(value).format('DD/MM/YYYY, HH:mm:ss.SSS')}
      // />,
    },
  ];
};
