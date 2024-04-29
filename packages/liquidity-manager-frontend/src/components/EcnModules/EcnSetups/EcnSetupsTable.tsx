import apiClient from '@api/apiClient';
import { EcnConnectSchemaSetupLabel, EcnConnectSchemaSetupLabelCreateDto, EcnConnectSchemaSetupLabelUpdateDto } from "@api/generated";
import pick from "lodash/pick";
import { isRecordNew, Table, withNumericId } from "@jifeon/boar-pack-common-frontend";
import { useEcnSetupsColumns } from "./useEcnSetupsColumns";
import { useAccess } from "@umijs/max";
import { TTableProps } from "@jifeon/boar-pack-common-frontend";
import { ecnSetupsSearchableColumns } from "./ecnSetupsSearchableColumns";
import { useLiquidityManagerContext } from "../../../tools/liquidityManagerContext";
import { PageLoading } from "@ant-design/pro-layout";

export const createNewDefaultParams = {
  label: '',
  modules: [],
};

export function entityToDto(entity: EcnConnectSchemaSetupLabel) {
  return {
      ...pick(entity, [
      'label',
      'modules',
    ]),
    id: isRecordNew(entity) ? undefined : entity.id,
  };
}

const EcnSetupsTable = (props: Partial<TTableProps<EcnConnectSchemaSetupLabel, EcnConnectSchemaSetupLabelCreateDto, EcnConnectSchemaSetupLabelUpdateDto, {}, {worker: string}>>) => {
  let { canManageLiquidity } = useAccess() || {};
  if (props.viewOnly !== undefined) {
    canManageLiquidity = !props.viewOnly;
  }
  const columns = useEcnSetupsColumns(canManageLiquidity ?? false);
  const { worker } = useLiquidityManagerContext();

  if (!worker) return <PageLoading />;

  return (
    <Table<EcnConnectSchemaSetupLabel, EcnConnectSchemaSetupLabelCreateDto, EcnConnectSchemaSetupLabelUpdateDto, {}, { worker: string }, number>
      getAll={params => apiClient.ecnConnectSchemaSetupLabels.getManyBaseEcnConnectSchemaSetupLabelsControllerEcnConnectSchemaSetupLabel(params)}
      onCreate={params => apiClient.ecnConnectSchemaSetupLabels.createOneBaseEcnConnectSchemaSetupLabelsControllerEcnConnectSchemaSetupLabel(params)}
      onUpdate={params => apiClient.ecnConnectSchemaSetupLabels.updateOneBaseEcnConnectSchemaSetupLabelsControllerEcnConnectSchemaSetupLabel(withNumericId(params))}
      onDelete={params => apiClient.ecnConnectSchemaSetupLabels.deleteOneBaseEcnConnectSchemaSetupLabelsControllerEcnConnectSchemaSetupLabel(withNumericId(params))}
      entityToCreateDto={entityToDto}
      entityToUpdateDto={entityToDto}
      params={{
        join: [
          {
            field: 'modules',
            select: ['name'],
          },
        ],
      }}
      columns={columns}
      idColumnName='id'
      pathParams={{
        worker,
      }}
      createNewDefaultParams={createNewDefaultParams}
      defaultSort={['label', 'ASC']}
      searchableColumns={ecnSetupsSearchableColumns}
      viewOnly={!canManageLiquidity}
      {...props}
    ></Table>
  );
}

export default EcnSetupsTable;
