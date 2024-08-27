import { usePositionsColumns } from "./usePositionsColumns";
import { Table, TGetAllParams } from "@jifeon/boar-pack-common-frontend";
import apiClient from "@@api/apiClient";
import { useLiquidityManagerContext } from "../../tools";
import { PageLoading } from "@ant-design/pro-layout";
import React from "react";
import { Tag } from "antd";
import { useRealTimeData } from "../RealTimeData/RealTimeDataSource";
import { PositionDto } from "../../tools/api-client";
import { connectionStatuses } from "../RealTimeData/realTimeDataStatuses";

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

  if (!worker) return <PageLoading />;

  const getAll = async (params: TGetAllParams & TPositionsPathParams) => {
    const positions = await apiClient.positions.getPositions({
      worker,
      userId,
    });

    realTimeDataSource.subscribeToPositions(userId);

    return {
      data: positions,
    }
  }

  return (
    <Table<PositionDto, {}, {}, TPositionFilterParams, TPositionsPathParams>
      getAll={getAll}
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
