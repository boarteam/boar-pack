import apiClient from "@@api/apiClient";
import pick from "lodash/pick";
import { defaultTypesIds, useEcnSetupsMetas } from "./useEcnSetupsMetas";
import { useAccess } from "@umijs/max";
import { ecnSetupsSearchableColumns } from "./ecnSetupsSearchableColumns";
import { PageLoading } from "@ant-design/pro-layout";
import { useLiquidityManagerContext } from "../../tools";
import {
  EcnConnectSchemaSetupLabel,
  EcnConnectSchemaSetupLabelCreateDto,
  EcnConnectSchemaSetupLabelUpdateDto,
  EcnModuleType
} from "@@api/generated";
import { isRecordNew, List, TTableProps, withNumericId } from "@jifeon/boar-pack-common-frontend";
import React, { useEffect, useState } from "react";

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

export const EcnSetupsListBase = (props: Partial<TTableProps<EcnConnectSchemaSetupLabel, EcnConnectSchemaSetupLabelCreateDto, EcnConnectSchemaSetupLabelUpdateDto, {}, {worker: string}>>) => {
  let { canManageLiquidity } = useAccess() || {};
  if (props.viewOnly !== undefined) {
    canManageLiquidity = !props.viewOnly;
  }
  const { worker } = useLiquidityManagerContext();
  if (!worker) return <PageLoading />;

  const [presetModulesTypes, setPresetModulesTypes] = useState<EcnModuleType[]>([]);
  useEffect(() => {
    apiClient.ecnModuleTypes.getManyBaseEcnModuleTypesControllerEcnModuleType({
      worker,
      s: JSON.stringify({
        'id': { in: defaultTypesIds },
      }),
    }).then(types => {
      setPresetModulesTypes(types.data);
    });
  }, []);
  const metas = useEcnSetupsMetas(canManageLiquidity ?? false, presetModulesTypes);

  return (
    // todo: fix ts
    // @ts-ignore
    <List<EcnConnectSchemaSetupLabel, EcnConnectSchemaSetupLabelCreateDto, EcnConnectSchemaSetupLabelUpdateDto, {}, { worker: string }, number>
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
            select: ['name,type,descr'],
          },
          {
            field: 'modules.type',
            select: ['name'],
          },
        ],
      }}
      metas={metas}
      columns={[{ dataIndex: 'label' }, { dataIndex: 'modules' }]}
      idColumnName='id'
      pathParams={{
        worker,
      }}
      createNewDefaultParams={createNewDefaultParams}
      defaultSort={['label', 'ASC']}
      searchableColumns={ecnSetupsSearchableColumns}
      viewOnly={!canManageLiquidity}
      {...props}
    ></List>
  );
}
