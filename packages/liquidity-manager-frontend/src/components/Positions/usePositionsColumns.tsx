import { ProColumns } from "@ant-design/pro-components";
import { PositionDto } from "../../tools/api-client";

export const usePositionsColumns = (): ProColumns<PositionDto>[] => {
  return [
    {
      title: 'Instrument',
      dataIndex: 'instrument',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      valueType: 'digit',
      render: (_, entity) => {
        switch (entity.side) {
          case PositionDto.side.BUY: return 0.5;
          case PositionDto.side.SELL: return -0.5;
          default: return null;
        }
      },
    },
    {
      title: 'Open Price',
      dataIndex: 'openPrice',
      valueType: 'digit',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      valueType: 'digit',
    },
    {
      title: 'Margin',
      dataIndex: 'margin',
      valueType: 'digit',
    },
    {
      title: 'Profit & Loss',
      dataIndex: 'profit',
      valueType: 'digit',
    },
  ];
};
