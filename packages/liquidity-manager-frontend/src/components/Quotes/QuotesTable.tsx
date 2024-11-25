import { Quote, useQuotesColumns } from "./useQuotesColumns";
import { Operators, Table, TGetAllParams } from "@jifeon/boar-pack-common-frontend";
import apiClient from "@@api/apiClient";
import { useLiquidityManagerContext } from "../../tools";
import { PageLoading } from "@ant-design/pro-layout";
import { useRealTimeData } from "../RealTimeData/RealTimeDataSource";
import React, { useEffect, useState } from "react";
import { Tag } from "antd";
import { connectionStatuses, TConnectionStatus } from "../RealTimeData/realTimeDataStatuses";
import { createStyles } from "antd-style";

type TQuoteFilterParams = {
  symbol?: string,
}

type TQuotesPathParams = {
  worker: string,
}

type TQuotesTableProps = {
  moduleId: number,
  controller: 'myInstruments' | 'ecnInstruments',
  onSymbolClick?: (instrument: string) => void,
}

const useStyles = createStyles(({ token }) => {
  return {
    table: {
      '.ant-table-row': {
        cursor: 'pointer'
      },
      '.ant-table-row-selected': {
        '.ant-table-cell': {
          background: token.colorPrimary + ' !important',
        }
      }
    },
  };
});

const QuotesTable: React.FC<TQuotesTableProps> = ({
  moduleId,
  controller,
  onSymbolClick,
}) => {
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const columns = useQuotesColumns();
  const { styles } = useStyles();
  const { worker } = useLiquidityManagerContext();
  const {
    realTimeDataSource,
    connectionStatus,
  } = useRealTimeData();

  const handleRowClick = (record: Quote) => {
    setSelectedRowKey(record.symbol);
    onSymbolClick?.(record.symbol);
  }

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
      className={styles.table}
      getAll={getAll}
      onLoad={(data) => {
        if (data.length > 0) {
          handleRowClick(data[0]);
        }
      }}
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
      onRow={(record) => {
        return {
          onClick: () => {
            handleRowClick(record)
          }
        }
      }}
      rowClassName={(record) => selectedRowKey === record.symbol ? 'ant-table-row-selected' : ''}
      scroll={{
        x: 'max-content',
      }}
    ></Table>
  );
}

export default QuotesTable;
