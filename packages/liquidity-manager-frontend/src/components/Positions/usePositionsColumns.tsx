import { ProColumns } from "@ant-design/pro-components";
import { usePositions } from "./PositionsDataSource";
import React, { useEffect, useState } from "react";
import { PositionDto } from "../../tools/api-client";
import dayjs from "dayjs";
import apiClient from "../../tools/api-client/apiClient";
import { useLiquidityManagerContext } from "../../tools";

export interface Position {
  symbol: string;
  bid?: number;
  ask?: number;
  timestamp?: Date;
  group: string;
}

const Ticker: React.FC<{
  symbol: string,
  positionParam: 'bid' | 'ask' | 'timestamp',
  format?: (value: any) => string,
}> = ({
  symbol,
  positionParam,
  format
}) => {
  const { positionsDataSource } = usePositions();
  const [ position, setPosition ] = useState<PositionDto | null>(null);

  useEffect(() => {
    const handler = (event: CustomEvent<PositionDto>) => {
      setPosition(event.detail);
    }

    positionsDataSource?.positionsEvents.addEventListener(`position:${symbol}`, handler);

    return () => {
      positionsDataSource?.positionsEvents.removeEventListener(`position:${symbol}`, handler);
    };
  }, [positionsDataSource, symbol]);

  const value = position
    ? (format?.(position[positionParam]) || position[positionParam])
    : 'N/A';

  return <span>{value}</span>;
}

export const usePositionsColumns = (): ProColumns<Position>[] => {
  const [instrumentGroups, setInstrumentGroups] = useState<{ text: string, value: number }[]>([]);
  const { worker } = useLiquidityManagerContext();

  useEffect(() => {
    if (worker) {
      apiClient.ecnInstrumentsGroups.getManyBaseEcnInstrumentsGroupsControllerEcnInstrumentsGroup({
        worker,
        sort: ['name,ASC'],
      }).then((groups) => {
        setInstrumentGroups(groups.data.map((item) => ({ text: item.name, value: item.id })));
      });
    }
  }, [worker]);

  return [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      width: '20%',
      sorter: true,
    },
    {
      title: 'Bid',
      dataIndex: 'bid',
      width: '20%',
      render: (_, record) => <Ticker symbol={record.symbol} positionParam='bid' />,
    },
    {
      title: 'Ask',
      dataIndex: 'ask',
      width: '20%',
      render: (_, record) => <Ticker symbol={record.symbol} positionParam='ask' />,
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      valueType: 'dateTime',
      width: '20%',
      render: (_, record) => <Ticker
        symbol={record.symbol}
        positionParam='timestamp'
        // DD/MM/YYYY, HH:mm:ss.SSS
        format={(value) => dayjs(value).format('DD/MM/YYYY, HH:mm:ss.SSS')}
      />,
    },
    {
      title: 'Group',
      dataIndex: 'group',
      width: '20%',
      filters: instrumentGroups,
      filterSearch: true,
      sorter: true,
    }
  ];
};
