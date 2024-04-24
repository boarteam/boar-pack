import Table from "../../../Table/Table";
import apiClient from "../../../../tools/client/apiClient";
import { EcnModuleType, EcnModuleTypeCreateDto, EcnModuleTypeUpdateDto } from "../../../../tools/api";
import { useEcnModuleTypesColumns } from "./useEcnModuleTypesColumns";
import pick from "lodash/pick";
import { Operators, withNumericId } from "../../../Table/tableTools";
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
