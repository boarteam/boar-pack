import Table from "../../Table/Table";
import apiClient from "../../../tools/client/apiClient";
import { EcnConnectSchema, EcnConnectSchemaCreateDto, EcnConnectSchemaUpdateDto } from "../../../tools/api";
import { useAccess } from "@umijs/max";
import { TTableProps } from "@/components/Table/tableTypes";
import { useEcnConnectSchemasColumns } from "./useEcnConnectSchemasColumns";
import { ecnConnectSchemaJoinFields, ecnConnectSchemaToDto } from "../EcnModules/EcnConnectSchemaDrawer";
import { withNumericId } from "../../Table/tableTools";
import { ecnConnectSchemaSearchableColumns } from "./ecnConnectSchemaSearchableColumns";

const EcnConnectSchemaTable = (props: Partial<TTableProps<EcnConnectSchema, EcnConnectSchemaCreateDto, EcnConnectSchemaUpdateDto, {}, {}>>) => {
  let { canManageLiquidity } = useAccess() || {};
  if (props.viewOnly !== undefined) {
    canManageLiquidity = !props.viewOnly;
  }
  const columns = useEcnConnectSchemasColumns(canManageLiquidity ?? false);

  return (
    <Table<EcnConnectSchema, EcnConnectSchemaCreateDto, EcnConnectSchemaUpdateDto, {}, {}, number>
      getAll={params => apiClient.ecnConnectSchemas.getManyBaseEcnConnectSchemaControllerEcnConnectSchema(params)}
      onUpdate={params => apiClient.ecnConnectSchemas.updateOneBaseEcnConnectSchemaControllerEcnConnectSchema(withNumericId(params))}
      onDelete={params => apiClient.ecnConnectSchemas.deleteOneBaseEcnConnectSchemaControllerEcnConnectSchema(withNumericId(params))}
      entityToCreateDto={ecnConnectSchemaToDto}
      entityToUpdateDto={ecnConnectSchemaToDto}
      columns={columns}
      pathParams={{}}
      params={{
        join: ecnConnectSchemaJoinFields,
      }}
      defaultSort={['id', 'DESC']}
      searchableColumns={ecnConnectSchemaSearchableColumns}
      viewOnly={!canManageLiquidity}
      {...props}
    ></Table>
  );
}

export default EcnConnectSchemaTable;
