import apiClient from "@@api/apiClient";
import pick from "lodash/pick";
import { useEcnSetupsColumns } from "./useEcnSetupsColumns";
import { useAccess } from "@umijs/max";
import { ecnSetupsSearchableColumns } from "./ecnSetupsSearchableColumns";
import { PageLoading } from "@ant-design/pro-layout";
import { useLiquidityManagerContext } from "../../tools";
import { EcnConnectSchemaSetupLabel, EcnConnectSchemaSetupLabelCreateDto, EcnConnectSchemaSetupLabelUpdateDto } from "@@api/generated";
import { isRecordNew, Table, TTableProps, withNumericId } from "@jifeon/boar-pack-common-frontend";

export const createNewDefaultParams: Pick<EcnConnectSchemaSetupLabel, 'label' | 'modules'> = {
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

const EcnSetupsTableBase = (props: Partial<TTableProps<EcnConnectSchemaSetupLabel, EcnConnectSchemaSetupLabelCreateDto, EcnConnectSchemaSetupLabelUpdateDto, {}, {worker: string}>>) => {
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
            select: ['name,type'],
          },
          {
            field: 'modules.type',
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

export default EcnSetupsTableBase;
