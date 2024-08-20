import { usePositionsColumns } from "./usePositionsColumns";
import { Table, TGetAllParams } from "@jifeon/boar-pack-common-frontend";
import apiClient from "@@api/apiClient";
import { useLiquidityManagerContext } from "../../tools";
import { PageLoading } from "@ant-design/pro-layout";
import React, { useEffect, useState } from "react";
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import { useRealTimeData } from "../RealTimeData/RealTimeDataSource";
import { PositionDto } from "../../tools/api-client";

type TPositionFilterParams = {
  symbol?: string,
}

type TPositionsPathParams = {
  worker: string,
}

const connectionStatuses = {
  [WebSocket.CLOSED]: {
    text: 'Connection Closed',
    color: 'error',
    icon: <CloseCircleOutlined />,
  },
  [WebSocket.CLOSING]: {
    text: 'Connection Closing',
    color: 'error',
    icon: <CloseCircleOutlined />,
  },
  [WebSocket.CONNECTING]: {
    text: 'Connecting',
    color: 'processing',
    icon: <SyncOutlined spin />,
  },
  [WebSocket.OPEN]: {
    text: 'Connected',
    color: 'success',
    icon: <CheckCircleOutlined />,
  },
};

type TPositionsTableProps = {
  userId: number,
}

const PositionsTable: React.FC<TPositionsTableProps> = ({
  userId,
}) => {
  const columns = usePositionsColumns();
  const { worker } = useLiquidityManagerContext();
  const { realTimeDataSource } = useRealTimeData();

  const [connectionStatus, setConnectionStatus] = useState<WebSocket['readyState']>(WebSocket.CLOSED);

  useEffect(() => {
    const handler = (evt: CustomEvent<WebSocket['readyState'] | undefined>) => {
      setConnectionStatus(evt.detail ?? WebSocket.CLOSED);
    };

    realTimeDataSource?.socketStatusEvents.addEventListener('status', handler);

    return () => {
      realTimeDataSource?.socketStatusEvents.removeEventListener('status', handler);
    }
  }, [realTimeDataSource]);

  if (!worker) return <PageLoading />;

  const getAll = async (params: TGetAllParams & TPositionsPathParams) => {
    const positions = await apiClient.positions.getPositions({
      worker,
      userId,
    })
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
