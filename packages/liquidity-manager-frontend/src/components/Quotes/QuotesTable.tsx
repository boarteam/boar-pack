import { Quote, useQuotesColumns } from "./useQuotesColumns";
import { Operators, Table, TGetAllParams } from "@jifeon/boar-pack-common-frontend";
import apiClient from "@@api/apiClient";
import { useLiquidityManagerContext } from "../../tools";
import { PageLoading } from "@ant-design/pro-layout";
import { useQuotes } from "./QuotesDataSource";

type TQuoteFilterParams = {
  symbol?: string,
}

type TQuotesPathParams = {
  worker: string,
}

const QuotesTable = () => {
  const columns = useQuotesColumns();
  const { worker } = useLiquidityManagerContext();
  const { quotesDataSource } = useQuotes();

  if (!worker) return <PageLoading />;

  const getAll = async (params: TGetAllParams & TQuotesPathParams) => {
    params.fields = ['name'];
    params.join = ['instrumentGroup||name'];
    params.sort = params.sort.map(sort => sort.replace('symbol', 'name'));

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
          operator: Operators.containsLow,
        },
      ]}
      viewOnly={true}
    ></Table>
  );
}

export default QuotesTable;
