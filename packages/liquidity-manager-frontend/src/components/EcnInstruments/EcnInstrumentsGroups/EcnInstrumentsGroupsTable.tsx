import { Operators, Table, withNumericId } from "@jifeon/boar-pack-common-frontend";
import apiClient from '@@api/apiClient';
import { EcnInstrumentsGroup, EcnInstrumentsGroupCreateDto, EcnInstrumentsGroupUpdateDto } from "@@api/generated";
import { useEcnInstrumentsGroupsColumns } from "./useEcnInstrumentsGroupsColumns";
import pick from "lodash/pick";
import { useAccess } from "umi";
import { useLiquidityManagerContext } from "../../../tools/liquidityManagerContext";
import { PageLoading } from "@ant-design/pro-layout";
import { HistoryModal } from "../../History/HistoryModal";
import React from "react";

function entityToDto(entity: EcnInstrumentsGroup) {
  return pick(entity, [
    'name',
    'descr',
  ]);
}

const EcnInstrumentsGroupsTable = () => {
  const columns = useEcnInstrumentsGroupsColumns();
  const { canManageLiquidity } = useAccess() || {};
  const { worker } = useLiquidityManagerContext();

  if (!worker) return <PageLoading />;

  return (
    <Table<EcnInstrumentsGroup, EcnInstrumentsGroupCreateDto, EcnInstrumentsGroupUpdateDto, {}, { worker: string }, number, typeof apiClient.ecnInstrumentsGroupsHistory.getMany>
      getAll={params => apiClient.ecnInstrumentsGroups.getManyBaseEcnInstrumentsGroupsControllerEcnInstrumentsGroup(params)}
      onCreate={params => apiClient.ecnInstrumentsGroups.createOneBaseEcnInstrumentsGroupsControllerEcnInstrumentsGroup(params)}
      onUpdate={params => apiClient.ecnInstrumentsGroups.updateOneBaseEcnInstrumentsGroupsControllerEcnInstrumentsGroup(withNumericId(params))}
      onDelete={params => apiClient.ecnInstrumentsGroups.deleteOneBaseEcnInstrumentsGroupsControllerEcnInstrumentsGroup(withNumericId(params))}
      entityToCreateDto={entityToDto}
      entityToUpdateDto={entityToDto}
      idColumnName='id'
      columns={columns}
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
      viewOnly={!canManageLiquidity}
      toolBarRender={() => [
        <HistoryModal<any, EcnInstrumentsGroupCreateDto, EcnInstrumentsGroupUpdateDto, {}, { worker: string }>
          pathParams={{ worker }}
          getAll={params => apiClient.ecnInstrumentsGroupsHistory.getMany(params)}
          onCreate={params => apiClient.ecnInstrumentsGroups.createOneBaseEcnInstrumentsGroupsControllerEcnInstrumentsGroup(params)}
          onUpdate={params => apiClient.ecnInstrumentsGroups.updateOneBaseEcnInstrumentsGroupsControllerEcnInstrumentsGroup(withNumericId(params))}
          onDelete={params => apiClient.ecnInstrumentsGroups.deleteOneBaseEcnInstrumentsGroupsControllerEcnInstrumentsGroup(withNumericId(params))}
        />,
      ]}
    ></Table>
  );
}

export default EcnInstrumentsGroupsTable;
