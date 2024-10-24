import { Quote, useQuotesColumns } from "./useQuotesColumns";
import { Operators, Table, TGetAllParams } from "@jifeon/boar-pack-common-frontend";
import apiClient from "@@api/apiClient";
import { useLiquidityManagerContext } from "../../tools";
import { PageLoading } from "@ant-design/pro-layout";
import { useRealTimeData } from "../RealTimeData/RealTimeDataSource";
import React, { useEffect, useState } from "react";
import { Tag } from "antd";
import { connectionStatuses, TConnectionStatus } from "../RealTimeData/realTimeDataStatuses";

type TQuoteFilterParams = {
  symbol?: string,
}

type TQuotesPathParams = {
  worker: string,
}

type TQuotesTableProps = {
  moduleId: number,
  controller: 'myInstruments' | 'ecnInstruments',
}

const QuotesTable: React.FC<TQuotesTableProps> = ({
  moduleId,
  controller,
}) => {
  const columns = useQuotesColumns();
  const { worker } = useLiquidityManagerContext();
  const {
    realTimeDataSource,
    connectionStatus,
  } = useRealTimeData();

  useEffect(() => {
    return () => {
      realTimeDataSource.closeSocketConnections().catch(console.error);
    };
  }, []);

  if (!worker) return <PageLoading />;

  const getAll = async (params: TGetAllParams & TQuotesPathParams) => {
    params.fields = ['name'];
    params.join = ['instrumentGroup||name'];
    params.sort = params.sort.map(sort => sort.replace('symbol', 'name').replace('group', 'instrumentGroup.name'));

    const response = controller === 'myInstruments'
      ? await apiClient.instruments.getManyBaseMyInstrumentsControllerEcnInstrument(params)
      : await apiClient.ecnInstruments.getManyBaseEcnInstrumentsControllerEcnInstrument(params);
    const symbols = response.data.map(instrument => instrument.name);

    realTimeDataSource.subscribeToQuotes(symbols, moduleId);

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
