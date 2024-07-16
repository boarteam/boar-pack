import { Quote, useQuotesColumns } from "./useQuotesColumns";
import { Operators, Table, TGetAllParams } from "@jifeon/boar-pack-common-frontend";
import apiClient from "@@api/apiClient";
import { useLiquidityManagerContext } from "../../tools";
import { PageLoading } from "@ant-design/pro-layout";
import { useQuotes } from "./QuotesDataSource";
import React, { useEffect, useState } from "react";
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from "@ant-design/icons";
import { Tag } from "antd";

type TQuoteFilterParams = {
  symbol?: string,
}

type TQuotesPathParams = {
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

type TQuotesTableProps = {
  moduleId: number,
}

const QuotesTable: React.FC<TQuotesTableProps> = ({
  moduleId,
}) => {
  const columns = useQuotesColumns();
  const { worker } = useLiquidityManagerContext();
  const { quotesDataSource } = useQuotes(moduleId);
  const [connectionStatus, setConnectionStatus] = useState<WebSocket['readyState']>(WebSocket.CLOSED);

  useEffect(() => {
    quotesDataSource.socketStatusEvents.addEventListener('status', (evt: CustomEvent<WebSocket['readyState'] | undefined>) => {
      setConnectionStatus(evt.detail ?? WebSocket.CLOSED);
    });
  }, [quotesDataSource]);

  if (!worker) return <PageLoading />;

  const getAll = async (params: TGetAllParams & TQuotesPathParams) => {
    params.fields = ['name'];
    params.join = ['instrumentGroup||name'];
    params.sort = params.sort.map(sort => sort.replace('symbol', 'name').replace('group', 'instrumentGroup.name'));

    const response = await apiClient.ecnInstruments.getManyBaseEcnInstrumentsControllerEcnInstrument(params);
    const symbols = response.data.map(instrument => instrument.name);

    quotesDataSource.subscribe(symbols);

    return {
      ...response,
      data: response.data.map(instrument => ({
        symbol: instrument.name,
        group: instrument.instrumentGroup?.name,
      })),
    }
  }

  return (
    <Table<Quote, {}, {}, TQuoteFilterParams, TQuotesPathParams>
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

export default QuotesTable;
