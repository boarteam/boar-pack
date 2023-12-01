import Table, { isRecordNew } from "../../Table/Table";
import apiClient from "../../../tools/client/apiClient";
import { EcnModule, EcnModuleCreateDto, EcnModuleUpdateDto } from "../../../tools/api";
import { useEcnModulesColumns } from "./useEcnModulesColumns";
import pick from "lodash/pick";
import { useAccess } from "umi";
import { Operators, withNumericId } from "../../Table/tableTools";

function entityToDto(entity: EcnModule) {
  return {
    ...pick(entity, [
      'name',
      'descr',
      'enabled'
    ]),
    id: isRecordNew(entity) ? undefined : entity.id,
    type: entity.type?.id,
  };
}

type TEcnModuleFilterParams = {
  name?: string,
  descr?: string,
}

const EcnModulesTable = () => {
  const columns = useEcnModulesColumns();
  const { canManageLiquidity } = useAccess() || {};

  return (
    <Table<EcnModule, EcnModuleCreateDto, EcnModuleUpdateDto, TEcnModuleFilterParams, {}, number>
      getAll={params => apiClient.ecnModules.getManyBaseEcnModulesControllerEcnModule(params)}
      onCreate={params => apiClient.ecnModules.createOneBaseEcnModulesControllerEcnModule(params)}
      onUpdate={params => apiClient.ecnModules.updateOneBaseEcnModulesControllerEcnModule(withNumericId(params))}
      onDelete={params => apiClient.ecnModules.deleteOneBaseEcnModulesControllerEcnModule(withNumericId(params))}
      entityToCreateDto={entityToDto}
      entityToUpdateDto={entityToDto}
      columns={columns}
      idColumnName='id'
      pathParams={{
        join: ['type']
      }}
      createNewDefaultParams={{
        name: '',
        descr: '',
        enabled: 1,
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
      viewOnly={!canManageLiquidity}
    ></Table>
  );
}

export default EcnModulesTable;
