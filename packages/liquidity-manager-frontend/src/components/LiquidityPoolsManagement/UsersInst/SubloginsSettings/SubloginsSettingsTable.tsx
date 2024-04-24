import Table from "../../../Table/Table";
import apiClient from "../../../../tools/client/apiClient";
import { SubloginSettings, SubloginSettingsCreateDto, SubloginSettingsUpdateDto } from "../../../../tools/api";
import React from "react";
import useFullscreen from "../../../../tools/useFullscreen";
import { subloginsSettingsJoinFields } from "./subloginsSettingsJoinFields";
import { ProColumns } from "@ant-design/pro-components";
import { ColumnStateType } from "@ant-design/pro-table/es/typing";
import { useAccess } from "umi";
import { subloginsSearchableColumns } from "./subloginsSearchableColumns";
import { useLiquidityManagerContext } from "../../liquidityManagerContext";
import { PageLoading } from "@ant-design/pro-layout";

function toCreateDto(entity: SubloginSettings): SubloginSettingsCreateDto {
  return {
    ...entity,
    hedgeCurrency: entity.hedgeCurrency?.name,
    instrument: entity.instrumentRel.name,
  };
}

function toUpdateDto(entity: SubloginSettings): SubloginSettingsUpdateDto {
  return {
    ...entity,
    hedgeCurrency: entity.hedgeCurrency?.name,
  };
}

type TSubloginSettingsTableProps = {
  usersSubAccountInstId: string;
  columns: ProColumns<SubloginSettings>[];
  columnsState?: ColumnStateType,
  columnsSetSelect?: () => React.ReactNode,
}

const SubloginsSettingsTable: React.FC<TSubloginSettingsTableProps> = ({
  usersSubAccountInstId,
  columns,
  columnsState,
  columnsSetSelect,
}) => {
  const { isFullscreen } = useFullscreen();
  const { canManageLiquidity } = useAccess() || {};
  const { worker } = useLiquidityManagerContext();

  if (!worker) {
    return <PageLoading />;
  }

  return (
    <Table<SubloginSettings, SubloginSettingsCreateDto, SubloginSettingsUpdateDto, {}, {
      usersSubAccountInstId: string,
      worker: string
    }, number>
      getAll={params => apiClient.subloginSettings.getManyBaseSubloginsSettingsControllerSubloginSettings(params)}
      onCreate={params => apiClient.subloginSettings.createOneBaseSubloginsSettingsControllerSubloginSettings(params)}
      onUpdate={params => apiClient.subloginSettings.updateOneBaseSubloginsSettingsControllerSubloginSettings(params)}
      onDelete={params => apiClient.subloginSettings.deleteOneBaseSubloginsSettingsControllerSubloginSettings(params)}
      entityToCreateDto={toCreateDto}
      entityToUpdateDto={toUpdateDto}
      columns={columns}
      columnsState={columnsState}
      columnsSetSelect={columnsSetSelect}
      idColumnName="instrument"
      scroll={{
        x: 'max-content',
      }}
      pathParams={{
        usersSubAccountInstId,
        worker,
      }}
      params={{
        join: subloginsSettingsJoinFields,
        baseFilters: {
          usersSubAccountInstId,
        },
      }}
      defaultSort={['instrument', 'ASC']}
      searchableColumns={subloginsSearchableColumns}
      createNewDefaultParams={{
        usersSubAccountInstId,
        spreadLimit: 0,
        minVolumeForABook: '0',
        spreadLimitOnRollover: 0,
        instrumentPriorityFlag: 0,
        markupBid: 0,
        markupAsk: 0,
        alias: '',
        demi: 0,
        dema: 0,
        hedgeAmount: '0',
        hedgeStep: '0',
        hedgeCurrency: null,
      }}
      viewOnly={!canManageLiquidity}
      ghost={!isFullscreen}
      popupCreation
    />
  );
}

export default SubloginsSettingsTable;
