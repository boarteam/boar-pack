import { Table } from "@jifeon/boar-pack-common-frontend";
import apiClient from '@@api/apiClient';
import { EcnModuleType, EcnModuleTypeCreateDto, EcnModuleTypeUpdateDto } from "@@api/generated";
import { useEcnModuleTypesColumns } from "./useEcnModuleTypesColumns";
import pick from "lodash/pick";
import { Operators, withNumericId } from "@jifeon/boar-pack-common-frontend";
import { useLiquidityManagerContext } from "../../../tools/liquidityManagerContext";
import { PageLoading } from "@ant-design/pro-components";

function entityToDto(entity: EcnModuleType) {
  return pick(entity, [
    'name',
    'descr',
  ]);
}

const EcnModuleTypesTable = () => {
  const columns = useEcnModuleTypesColumns();
  const { worker } = useLiquidityManagerContext();

  if (!worker) return <PageLoading />;

  return (
    <Table<EcnModuleType, EcnModuleTypeCreateDto, EcnModuleTypeUpdateDto, {}, { worker: string }, number>
      getAll={params => apiClient.ecnModuleTypes.getManyBaseEcnModuleTypesControllerEcnModuleType(params)}
      onCreate={params => apiClient.ecnModuleTypes.createOneBaseEcnModuleTypesControllerEcnModuleType(params)}
      onUpdate={params => apiClient.ecnModuleTypes.updateOneBaseEcnModuleTypesControllerEcnModuleType(withNumericId(params))}
      onDelete={params => apiClient.ecnModuleTypes.deleteOneBaseEcnModuleTypesControllerEcnModuleType(withNumericId(params))}
      entityToCreateDto={entityToDto}
      entityToUpdateDto={entityToDto}
      columns={columns}
      idColumnName='id'
      pathParams={{
        worker,
      }}
      defaultSort={['name', 'ASC']}
      searchableColumns={[
        {
          field: 'name',
          operator: Operators.containsLow,
        },
        {
          field: 'descr',
          operator: Operators.containsLow,
        },
      ]}
      viewOnly
    ></Table>
  );
}

export default EcnModuleTypesTable;
