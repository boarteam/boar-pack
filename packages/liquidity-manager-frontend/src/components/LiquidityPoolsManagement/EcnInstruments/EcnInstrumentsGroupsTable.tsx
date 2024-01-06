import Table from "../../Table/Table";
import apiClient from "../../../tools/client/apiClient";
import { EcnInstrumentsGroup, EcnInstrumentsGroupCreateDto, EcnInstrumentsGroupUpdateDto } from "../../../tools/api";
import { useEcnInstrumentsGroupsColumns } from "./useEcnInstrumentsGroupsColumns";
import pick from "lodash/pick";
import { useAccess } from "umi";
import { Operators, withNumericId } from "../../Table/tableTools";

function entityToDto(entity: EcnInstrumentsGroup) {
  return pick(entity, [
    'name',
    'descr',
  ]);
}

const EcnInstrumentsGroupsTable = () => {
  const columns = useEcnInstrumentsGroupsColumns();
  const { canManageLiquidity } = useAccess() || {};

  return (
    <Table<EcnInstrumentsGroup, EcnInstrumentsGroupCreateDto, EcnInstrumentsGroupUpdateDto, {}, {}, number>
      getAll={params => apiClient.ecnInstrumentsGroups.getManyBaseEcnInstrumentsGroupsControllerEcnInstrumentsGroup(params)}
      onCreate={params => apiClient.ecnInstrumentsGroups.createOneBaseEcnInstrumentsGroupsControllerEcnInstrumentsGroup(params)}
      onUpdate={params => apiClient.ecnInstrumentsGroups.updateOneBaseEcnInstrumentsGroupsControllerEcnInstrumentsGroup(withNumericId(params))}
      onDelete={params => apiClient.ecnInstrumentsGroups.deleteOneBaseEcnInstrumentsGroupsControllerEcnInstrumentsGroup(withNumericId(params))}
      entityToCreateDto={entityToDto}
      entityToUpdateDto={entityToDto}
      idColumnName='id'
      columns={columns}
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
      viewOnly={!canManageLiquidity}
    ></Table>
  );
}

export default EcnInstrumentsGroupsTable;
