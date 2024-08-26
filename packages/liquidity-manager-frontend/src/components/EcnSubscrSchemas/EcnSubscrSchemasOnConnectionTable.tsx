import React from "react";
import { ecnSubscrSchemaJoinFields } from "./ecnSubscrSchemaJoinFields";
import EcnSubscrSchemasTable, { TEcnSubscrSchemasTableProps } from "./EcnSubscrSchemasTable";
import { EcnConnectSchema } from "@@api/generated";
import { useLiquidityManagerContext } from "../../tools/liquidityManagerContext";
import { PageLoading } from "@ant-design/pro-layout";
import { useEcnSubscrSchemaColumns } from "./useEcnSubscrSchemaColumns";

type TEcnSubscrSchemasOnConnectionTableTableProps = {
  connectSchema: EcnConnectSchema;
}

const EcnSubscrSchemasOnConnectionTable: React.FC<
  TEcnSubscrSchemasTableProps<TEcnSubscrSchemasOnConnectionTableTableProps> 
  & TEcnSubscrSchemasOnConnectionTableTableProps
> = ({
  connectSchema,
  ...rest
}) => {
  const { worker } = useLiquidityManagerContext();
  const columns = useEcnSubscrSchemaColumns();

  if (!worker) return <PageLoading />;

  return (
    <EcnSubscrSchemasTable<TEcnSubscrSchemasOnConnectionTableTableProps>
      params={{
        baseFilters: {
          'connectSchema': [connectSchema?.id],
        },
        join: ecnSubscrSchemaJoinFields,
        sortMap: { executionMode: 'executionMode.name' },
      }}
      createNewDefaultParams={{
        connectSchema,
        enabled: 1,
        markupBid: 0,
        markupAsk: 0,
        defaultMarkupBid: 0,
        defaultMarkupAsk: 0,
        tradeEnabled: 1,
        reserved: 0,
        instrumentWeight: 1,
      }}
      pathParams={{
        worker,
        connectSchema,
      }}
      columns={columns.filter(column => column.dataIndex !== 'connectSchema' && column.dataIndex !== 'connectSchema.descr')}
      {...rest}
    />
  )
}

export default EcnSubscrSchemasOnConnectionTable;
