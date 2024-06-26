import React from "react";
import { ecnSubscrSchemaJoinFields } from "./ecnSubscrSchemaJoinFields";
import EcnSubscrSchemasTable from "./EcnSubscrSchemasTable";
import { EcnConnectSchema } from "@@api/generated";
import { useLiquidityManagerContext } from "../../tools/liquidityManagerContext";
import { PageLoading } from "@ant-design/pro-layout";
import { useEcnSubscrSchemaColumns } from "./useEcnSubscrSchemaColumns";

type TEcnSubscrSchemasOnConnectionTableTableProps = {
  connectSchemaId: number;
}

const EcnSubscrSchemasOnConnectionTable: React.FC<TEcnSubscrSchemasOnConnectionTableTableProps> = ({
  connectSchemaId,
}) => {
  const { worker } = useLiquidityManagerContext();
  const columns = useEcnSubscrSchemaColumns();

  if (!worker) return <PageLoading />;

  return (
    <EcnSubscrSchemasTable<{ connectSchemaId: EcnConnectSchema['id'] }>
      params={{
        baseFilters: {
          connectSchemaId,
        },
        join: ecnSubscrSchemaJoinFields,
      }}
      createNewDefaultParams={{
        connectSchemaId,
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
        connectSchemaId,
      }}
      columns={columns.filter(column => column.dataIndex !== 'connectSchemaId')}
    />
  )
}

export default EcnSubscrSchemasOnConnectionTable;
