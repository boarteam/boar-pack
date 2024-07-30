import { Position, usePositionsColumns } from "./usePositionsColumns";
import { Operators, Table, TGetAllParams } from "@jifeon/boar-pack-common-frontend";
import apiClient from "@@api/apiClient";
import { useLiquidityManagerContext } from "../../tools";
import { PageLoading } from "@ant-design/pro-layout";
import React, { useEffect, useState } from "react";
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from "@ant-design/icons";
import { Tag } from "antd";

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
  moduleId: number,
}

const PositionsTable: React.FC<TPositionsTableProps> = ({
  moduleId,
}) => {
  const columns = usePositionsColumns();
  const { worker } = useLiquidityManagerContext();
  const { positionsDataSource } = usePositions();
  const [connectionStatus, setConnectionStatus] = useState<WebSocket['readyState']>(WebSocket.CLOSED);

  useEffect(() => {
    const handler = (evt: CustomEvent<WebSocket['readyState'] | undefined>) => {
      setConnectionStatus(evt.detail ?? WebSocket.CLOSED);
    };

    positionsDataSource?.socketStatusEvents.addEventListener('status', handler);

    return () => {
      positionsDataSource?.socketStatusEvents.removeEventListener('status', handler);
    }
  }, [positionsDataSource]);

  if (!worker) return <PageLoading />;

  const getAll = async (params: TGetAllParams & TPositionsPathParams) => {
    params.fields = ['name'];
    params.join = ['instrumentGroup||name'];
    params.sort = params.sort.map(sort => sort.replace('symbol', 'name').replace('group', 'instrumentGroup.name'));

    const response = await apiClient.ecnInstruments.getManyBaseEcnInstrumentsControllerEcnInstrument(params);
    const symbols = response.data.map(instrument => instrument.name);

    positionsDataSource.subscribe(symbols, moduleId);

    return {
      ...response,
      data: response.data.map(instrument => ({
        symbol: instrument.name,
        group: instrument.instrumentGroup?.name,
      })),
    }
  }

  return (
    <Table<Position, {}, {}, TPositionFilterParams, TPositionsPathParams>
      getAll={getAll}
      columns={columns}
      idColumnName='symbol'
      pathParams={{
        worker,
      }}
      defaultSort={['symbol', 'ASC']}
      searchableColumns={[
        {
          field: 'symbol',
          searchField: 'name',
          filterField: 'name',
          operator: Operators.containsLow,
        },
        {
          field: 'group',
          searchField: 'instrumentGroup.name',
          filterField: 'instrumentGroup.id',
          operator: Operators.containsLow,
          filterOperator: Operators.in,
        },
      ]}
      viewOnly={true}
      toolBarRender={() => {
        const status = connectionStatuses[connectionStatus];
        return [<Tag key={'connectionStatus'} color={status.color} icon={status.icon}>{status.text}</Tag>];
      }}
    ></Table>
  );
}

export default PositionsTable;
