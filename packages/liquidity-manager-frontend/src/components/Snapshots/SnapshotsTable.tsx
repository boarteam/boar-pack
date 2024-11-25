import { useLiquidityManagerContext } from "../../tools";
import { PageLoading } from "@ant-design/pro-layout";
import { useRealTimeData } from "../RealTimeData/RealTimeDataSource";
import React, { useEffect, useState } from "react";
import { Table } from "antd";
import { SnapshotDto } from "../../tools/api-client";
import { Band, useSnapshotColumns } from "./useSnapshotColumns";

type TSnapshotsTableProps = {
  moduleId: number,
  symbol: string | undefined,
}

const SnapshotsTable: React.FC<TSnapshotsTableProps> = ({
  moduleId,
  symbol,
}) => {
  const columns = useSnapshotColumns();
  const [snapshot, setSnapshot] = useState<SnapshotDto | null>(null);
  const { worker } = useLiquidityManagerContext();
  const {
    realTimeDataSource,
  } = useRealTimeData();

  useEffect(() => {
    setSnapshot(null);

    if (!symbol) {
      return;
    }

    const handler = (event: CustomEvent<SnapshotDto>) => {
      setSnapshot(event.detail);
    }

    const eventName = `snapshot:${symbol}`;
    realTimeDataSource.snapshotsEvents.addEventListener(eventName, handler);
    realTimeDataSource.subscribeToSnapshots([symbol], moduleId);

    return () => {
      realTimeDataSource.snapshotsEvents.removeEventListener(eventName, handler);
    };
  }, [realTimeDataSource, symbol, moduleId]);

  if (!worker) {
    return <PageLoading />;
  }

  let bands: Band[] = [];

  if (snapshot) {
    bands.push(...snapshot.asks?.map((band, i) => ({
      key: i,
      ask: band.amount,
      price: band.price,
    })));
    const asksLength = snapshot.asks?.length || 0;
    bands.push(...snapshot.bids?.map((band, i) => ({
      key: asksLength + i,
      bid: band.amount,
      price: band.price,
    })));
  }

  return (
    <Table<Band>
      dataSource={bands}
      columns={columns}
      size={'small'}
      bordered={true}
      pagination={false}
      scroll={{
        x: 'max-content',
      }}
    />
  );
}

export default SnapshotsTable;
