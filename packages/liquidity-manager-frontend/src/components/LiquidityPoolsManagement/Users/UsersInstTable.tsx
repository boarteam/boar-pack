import Table from "../../Table/Table";
import apiClient from "../../../tools/client/apiClient";
import { UsersInst, UsersInstCreateDto, UsersInstUpdateDto } from "../../../tools/api";
import { useUsersInstColumns } from "./useUsersInstColumns";
import pick from "lodash/pick";
import { useMemo } from "react";
import { getDefaultColumnsState, Operators } from "../../Table/tableTools";

function entityToDto(entity: UsersInst) {
  return {
    ...pick(entity, [
      'ts',
      'tsMs',
      'id',
      'name',
      'leverage',
      'balance',
      'credit',
      'margin',
      'freeMargin',
      'marginLevel',
      'userComment',
      'enabled',
      'profitloss',
      'marginWithLimits',
      'commission',
      'swap',
      'stopoutHash',
      'stopoutName',
      'userState',
      'stopoutEnabled',
      'stopoutSuppressTime',
      'stopoutGenerationTime',
      'password',
      'commissionValue',
      'rolloverTime',
      'commissionTurnover',
      'trId',
      'fixTradingEnabled',
      'fixUserinfoRequestsEnabled',
      'alwaysBookA',
      'hedgeFactor',
    ]),
    moduleId: entity.module?.id,
    marginModuleId: entity.marginModule?.id,
    group: entity.group?.name,
    company: entity.company?.id,
    action: entity.action.id,
    commissionType: entity.commissionType.id,
    commissionLotsMode: entity.commissionLotsMode.id,
  };
}

type TUsersInstFilterParams = {
  name?: string,
  descr?: string,
}

const defaultDisplayedColumns = new Set<keyof UsersInst>([
  'id',
  'name',
  'group',
  'enabled',
  'balance',
  'credit',
  'margin',
  'freeMargin',
  'userComment',
  'module',
  'commission',
  'commissionValue',
  'commissionTurnover',
  'marginModule',
  'company',
]);

const UsersInstTable = () => {
  const columns = useUsersInstColumns();
  const defaultColumnsState = useMemo(() => getDefaultColumnsState<UsersInst>(columns, defaultDisplayedColumns), [columns])

  return (
    <Table<UsersInst, UsersInstCreateDto, UsersInstUpdateDto, TUsersInstFilterParams, {}, number>
      getAll={params => apiClient.usersInst.getManyBaseUsersInstControllerUsersInst(params)}
      onCreate={params => apiClient.usersInst.createOneBaseUsersInstControllerUsersInst(params)}
      onUpdate={params => apiClient.usersInst.updateOneBaseUsersInstControllerUsersInst(params)}
      onDelete={params => apiClient.usersInst.deleteOneBaseUsersInstControllerUsersInst(params)}
      entityToCreateDto={entityToDto}
      entityToUpdateDto={entityToDto}
      columns={columns}
      idColumnName='id'
      columnsState={{
        defaultValue: defaultColumnsState,
      }}
      pathParams={{}}
      params={{
        join: [
          {
            field: 'module',
            select: ['name'],
          }, {
            field: 'marginModule',
            select: ['name'],
          },
          {
            field: 'group',
            select: ['name'],
          },
          {
            field: 'company',
            select: ['name'],
          },
          {
            field: 'action',
            select: ['name'],
          },
          {
            field: 'commissionType',
            select: ['name'],
          },
          {
            field: 'commissionLotsMode',
            select: ['name'],
          },
        ]
      }}
      scroll={{
        x: 'max-content',
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
      // do not allow creation here
      viewOnly
    />
  );
}

export default UsersInstTable;
