import { usePositionsColumns } from "./usePositionsColumns";
import { Table, TGetAllParams } from "@jifeon/boar-pack-common-frontend";
import apiClient from "@@api/apiClient";
import { useLiquidityManagerContext } from "../../tools";
import { PageLoading } from "@ant-design/pro-layout";
import React, { useEffect } from "react";
import { Tag } from "antd";
import { useRealTimeData } from "../RealTimeData/RealTimeDataSource";
import { PositionDto, QuoteDto } from "../../tools/api-client";
import { connectionStatuses } from "../RealTimeData/realTimeDataStatuses";
import safetyRun from "@jifeon/boar-pack-common-frontend/src/tools/safetyRun";

type TPositionFilterParams = {
  symbol?: string,
}

type TPositionsPathParams = {
  worker: string,
}

type TPositionsTableProps = {
  userId: number,
}

const PositionsTable: React.FC<TPositionsTableProps> = ({
  userId,
}) => {
  const columns = usePositionsColumns();
  const { worker } = useLiquidityManagerContext();
  const { connectionStatus, realTimeDataSource } = useRealTimeData();
  const [positions, setPositions] = React.useState<PositionDto[]>([]);

  useEffect(() => {
    return () => {
      realTimeDataSource.closeSocketConnections().catch(console.error);
    };
  }, []);

  useEffect(() => {
    if (!worker) return;

    safetyRun(apiClient.positions.getPositions({
      worker,
      userId,
    }).then((positions) => {
      setPositions(positions);
    }));


    const handler = (event: CustomEvent<PositionDto>) => {
      setPositions((positions) => {
        const index = positions.findIndex((position) => position.id === event.detail.id);
        if (index === -1) {
          return positions;
        }

        const newPositions = [...positions];
        newPositions[index] = event.detail;

        return newPositions;
      });
    }

    const eventName = `position:${userId}`;
    realTimeDataSource.positionsEvents.addEventListener(eventName, handler);
    realTimeDataSource.subscribeToPositions(userId);

    return () => {
      realTimeDataSource.positionsEvents.removeEventListener(eventName, handler);
    };
  }, [realTimeDataSource, userId, worker]);


  if (!worker) return <PageLoading />;

  return (
    <Table<PositionDto, {}, {}, TPositionFilterParams, TPositionsPathParams>
      getAll={async () => ({data: []})}
      dataSource={positions}
      columns={columns}
      idColumnName='id'
      pathParams={{
        worker,
      }}
      defaultSort={['symbol', 'ASC']}
      viewOnly={true}
      toolBarRender={() => {
        const status = connectionStatuses[connectionStatus];
        return [<Tag key={'connectionStatus'} color={status.color} icon={status.icon}>{status.text}</Tag>];
      }}
    ></Table>
  );
}

export default PositionsTable;
