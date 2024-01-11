import Table, { isRecordNew } from "../../../Table/Table";
import apiClient from "../../../../tools/client/apiClient";
import { EcnConnectSchemaSetupLabel, EcnConnectSchemaSetupLabelCreateDto, EcnConnectSchemaSetupLabelUpdateDto } from "../../../../tools/api";
import pick from "lodash/pick";
import { Operators, withNumericId } from "../../../Table/tableTools";
import { useEcnSetupsColumns } from "./useEcnSetupsColumns";
import { useAccess } from "@umijs/max";

function entityToDto(entity: EcnConnectSchemaSetupLabel) {
  console.log(entity)
  return {
      ...pick(entity, [
      'label',
      'modules',
    ]),
    id: isRecordNew(entity) ? undefined : entity.id,
  };
}

const EcnSetupsTable = () => {
  const columns = useEcnSetupsColumns();
  const { canManageLiquidity } = useAccess() || {};
  
  return (
    <Table<EcnConnectSchemaSetupLabel, EcnConnectSchemaSetupLabelCreateDto, EcnConnectSchemaSetupLabelUpdateDto, {}, {}, number>
      getAll={params => apiClient.ecnConnectSchemaSetupLabels.getManyBaseEcnConnectSchemaSetupLabelsControllerEcnConnectSchemaSetupLabel(params)}
      onCreate={params => apiClient.ecnConnectSchemaSetupLabels.createOneBaseEcnConnectSchemaSetupLabelsControllerEcnConnectSchemaSetupLabel(params)}
      onUpdate={params => apiClient.ecnConnectSchemaSetupLabels.updateOneBaseEcnConnectSchemaSetupLabelsControllerEcnConnectSchemaSetupLabel(withNumericId(params))}
      onDelete={params => apiClient.ecnConnectSchemaSetupLabels.deleteOneBaseEcnConnectSchemaSetupLabelsControllerEcnConnectSchemaSetupLabel(withNumericId(params))}
      entityToCreateDto={entityToDto}
      entityToUpdateDto={entityToDto}
      columns={columns}
      idColumnName='id'
      pathParams={{}}
      params={{
        join: [{
          field: 'modules',
          select: ['name'],
        }],
      }}
      createNewDefaultParams={{
        label: '',
        modules: [],
      }}
      defaultSort={['label', 'ASC']}
      searchableColumns={[
        {
          field: 'label',
          operator: Operators.containsLow,
        }
      ]}
      viewOnly={!canManageLiquidity}
    ></Table>
  );
}

export default EcnSetupsTable;
