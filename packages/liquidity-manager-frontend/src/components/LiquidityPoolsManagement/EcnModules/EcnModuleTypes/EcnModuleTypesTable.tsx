import Table from "../../../Table/Table";
import apiClient from "../../../../tools/client/apiClient";
import { EcnModuleType, EcnModuleTypeCreateDto, EcnModuleTypeUpdateDto } from "../../../../tools/api";
import { useEcnModuleTypesColumns } from "./useEcnModuleTypesColumns";
import pick from "lodash/pick";
import { Operators, withNumericId } from "../../../Table/tableTools";

function entityToDto(entity: EcnModuleType) {
  return pick(entity, [
    'name',
    'descr',
  ]);
}

type TEcnModuleTypeFilterParams = {
  name?: string,
  descr?: string,
}

const EcnModuleTypesTable = () => {
  const columns = useEcnModuleTypesColumns();

  return (
    <Table<EcnModuleType, EcnModuleTypeCreateDto, EcnModuleTypeUpdateDto, TEcnModuleTypeFilterParams, {}, number>
      getAll={params => apiClient.ecnModuleTypes.getManyBaseEcnModuleTypesControllerEcnModuleType(params)}
      onCreate={params => apiClient.ecnModuleTypes.createOneBaseEcnModuleTypesControllerEcnModuleType(params)}
      onUpdate={params => apiClient.ecnModuleTypes.updateOneBaseEcnModuleTypesControllerEcnModuleType(withNumericId(params))}
      onDelete={params => apiClient.ecnModuleTypes.deleteOneBaseEcnModuleTypesControllerEcnModuleType(withNumericId(params))}
      entityToCreateDto={entityToDto}
      entityToUpdateDto={entityToDto}
      columns={columns}
      idColumnName='id'
      pathParams={{}}
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
