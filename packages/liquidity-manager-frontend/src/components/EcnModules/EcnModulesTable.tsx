import Table, { isRecordNew } from "../../Table/Table";
import apiClient from "../../../tools/client/apiClient";
import { EcnModule, EcnModuleCreateDto, EcnModuleUpdateDto } from "../../../tools/api";
import { useEcnModulesColumns } from "./useEcnModulesColumns";
import pick from "lodash/pick";
import { useAccess } from "umi";
import { withNumericId } from "../../Table/tableTools";
import { ecnModuleJoinFields } from "./ecnModuleJoinFields";
import { ecnModuleSearchableColumns } from "./ecnModuleSearchableColumns";
import { TTableProps } from "@/components/Table/tableTypes";
import { useLiquidityManagerContext } from "../../tools/liquidityManagerContext";
import { PageLoading } from "@ant-design/pro-layout";

export function ecnModuleToDto<
  T extends Partial<EcnModule>,
  R extends (EcnModuleCreateDto | EcnModuleUpdateDto)
>(entity: T): R {
  return {
    ...pick(entity, [
      'name',
      'descr',
      'enabled'
    ]),
    id: isRecordNew(entity) ? undefined : entity.id,
    type: entity.type?.id,
  } as R;
}

const EcnModulesTable = (props: Partial<TTableProps<EcnModule, EcnModuleCreateDto, EcnModuleUpdateDto, {}, {worker: string}>>) => {
  let { canManageLiquidity } = useAccess() || {};
  if (props.viewOnly !== undefined) {
    canManageLiquidity = !props.viewOnly;
  }
  const columns = useEcnModulesColumns(canManageLiquidity ?? false);
  const { worker } = useLiquidityManagerContext();

  if (!worker) return <PageLoading />;

  return (
    <Table<EcnModule, EcnModuleCreateDto, EcnModuleUpdateDto, {}, { worker: string }, number>
      getAll={params => apiClient.ecnModules.getManyBaseEcnModulesControllerEcnModule(params)}
      onCreate={params => apiClient.ecnModules.createOneBaseEcnModulesControllerEcnModule(params)}
      onUpdate={params => apiClient.ecnModules.updateOneBaseEcnModulesControllerEcnModule(withNumericId(params))}
      onDelete={params => apiClient.ecnModules.deleteOneBaseEcnModulesControllerEcnModule(withNumericId(params))}
      entityToCreateDto={ecnModuleToDto}
      entityToUpdateDto={ecnModuleToDto}
      params={{
        join: ecnModuleJoinFields,
        sortMap: { type: 'type.name' },
      }}
      columns={columns}
      idColumnName='id'
      pathParams={{
        worker,
      }}
      createNewDefaultParams={{
        name: '',
        descr: '',
        enabled: 1,
      }}
      defaultSort={['name', 'ASC']}
      searchableColumns={ecnModuleSearchableColumns}
      viewOnly={!canManageLiquidity}
      {...props}
    ></Table>
  );
}

export default EcnModulesTable;
