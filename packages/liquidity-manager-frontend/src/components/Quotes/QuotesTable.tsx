import { Quote, useQuotesColumns } from "./useQuotesColumns";
import { Operators, Table, TGetAllParams } from "@jifeon/boar-pack-common-frontend";
import apiClient from "@@api/apiClient";
import { useLiquidityManagerContext } from "../../tools";
import { PageLoading } from "@ant-design/pro-layout";

type TQuoteFilterParams = {
  symbol?: string,
}

type TQuotesPathParams = {
  worker: string,
}

async function getAll(params: TGetAllParams & TQuotesPathParams) {
  params.fields  = ['name'];
  params.join = ['instrumentGroup||name'];
  params.sort = params.sort.map(sort => sort.replace('symbol', 'name'));

  console.log(params);

  const response = await apiClient.ecnInstruments.getManyBaseEcnInstrumentsControllerEcnInstrument(params);

  return {
    ...response,
    data: response.data.map(instrument => ({
      symbol: instrument.name,
      group: instrument.instrumentGroup?.name,
    })),
  }
}

const QuotesTable = () => {
  const columns = useQuotesColumns();
  const { worker } = useLiquidityManagerContext();

  if (!worker) return <PageLoading />;

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
