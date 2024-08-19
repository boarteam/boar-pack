import { EcnConnectSchema, EcnConnectSchemaCreateDto, EcnConnectSchemaUpdateDto } from "@@api/generated";
import { useAccess } from "@umijs/max";
import { Table, TTableProps, withNumericId } from "@jifeon/boar-pack-common-frontend";
import { useEcnConnectSchemasColumns } from "./useEcnConnectSchemasColumns";
import { ecnConnectSchemaJoinFields, ecnConnectSchemaToDto } from "../EcnModules/EcnConnectSchemaDrawer";
import { ecnConnectSchemaSearchableColumns } from "./ecnConnectSchemaSearchableColumns";
import { useLiquidityManagerContext } from "../../tools/liquidityManagerContext";
import { PageLoading } from "@ant-design/pro-layout";
import apiClient from '@@api/apiClient';

const EcnConnectSchemaTable = (props: Partial<TTableProps<EcnConnectSchema, EcnConnectSchemaCreateDto, EcnConnectSchemaUpdateDto, {}, {worker: string}>>) => {
  const { worker, liquidityManager } = useLiquidityManagerContext();
  let { canManageLiquidity } = useAccess() || {};
  const viewOnly = props.viewOnly ?? !canManageLiquidity(liquidityManager);
  const columns = useEcnConnectSchemasColumns(!viewOnly);

  if (!worker) return <PageLoading />;

  return (
    <Table<EcnConnectSchema, EcnConnectSchemaCreateDto, EcnConnectSchemaUpdateDto, {}, { worker: string }, number>
      getAll={params => apiClient.ecnConnectSchemas.getManyBaseEcnConnectSchemaControllerEcnConnectSchema(params)}
      onUpdate={params => apiClient.ecnConnectSchemas.updateOneBaseEcnConnectSchemaControllerEcnConnectSchema(withNumericId(params))}
      onDelete={params => apiClient.ecnConnectSchemas.deleteOneBaseEcnConnectSchemaControllerEcnConnectSchema(withNumericId(params))}
      entityToCreateDto={ecnConnectSchemaToDto}
      entityToUpdateDto={ecnConnectSchemaToDto}
      columns={columns}
      pathParams={{
        worker,
      }}
      params={{
        join: ecnConnectSchemaJoinFields,
      }}
      defaultSort={['id', 'DESC']}
      searchableColumns={ecnConnectSchemaSearchableColumns}
      viewOnly={viewOnly}
      {...props}
    ></Table>
  );
}

export default EcnConnectSchemaTable;
