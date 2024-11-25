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
  ghost?: boolean,
}

const PositionsTable: React.FC<TPositionsTableProps> = ({
  userId,
  ghost,
}) => {
  const columns = usePositionsColumns();
  const { worker } = useLiquidityManagerContext();
  const { connectionStatus, realTimeDataSource } = useRealTimeData();
  const [positions, setPositions] = React.useState<PositionDto[] | null>(null);

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
        if (!positions) return [];

        const updatedPosition = event.detail;
        const index = positions.findIndex((position) => position.id === updatedPosition.id);

        const newPositions = [...positions || []];

        if (index === -1) {
          newPositions.push(updatedPosition);
        } else if (Number(updatedPosition.amount) === 0) {
          newPositions.splice(index, 1);
        } else {
          newPositions[index] = event.detail;
        }

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


  if (!worker || positions === null) return <PageLoading />;

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
        return [
          <Tag key={'connectionStatus'} color={status.color} icon={status.icon}>{status.text}</Tag>
        ];
      }}
      ghost={ghost}
      scroll={{
        x: 'max-content',
      }}
    ></Table>
  );
}

export default PositionsTable;
