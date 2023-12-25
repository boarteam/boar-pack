import Table from "../../Table/Table";
import apiClient from "../../../tools/client/apiClient";
import { UsersInst, UsersInstCreateDto, UsersInstUpdateDto } from "../../../tools/api";
import { useUsersInstColumns } from "./useUsersInstColumns";
import pick from "lodash/pick";
import { Operators } from "../../Table/tableTools";
import { TColumnsSet } from "../../Table/useColumnsSets";
import { useAccess } from "@umijs/max";

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
    module: entity.module?.id,
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

const columnsSets: TColumnsSet<UsersInst>[] = [
  {
    name: 'Default Columns',
    columns: [
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
      // @ts-ignore-next-line
      'commission_group',
      'commission',
      'commissionValue',
      'commissionTurnover',
      'marginModule',
      'company',
    ],
  },
  {
    name: 'Margin Columns',
    columns: [
      'id',
      'name',
      'leverage',
      // @ts-ignore-next-line
      'margin_group',
      'margin',
      'freeMargin',
      'marginModule',
      'marginWithLimits',
      'marginLevel',
    ],
  },
  {
    name: 'Commission Columns',
    columns: [
      'id',
      'name',
      // @ts-ignore-next-line
      'commission_group',
      'commission',
      'commissionValue',
      'commissionTurnover',
      'commissionType',
      'commissionLotsMode',
    ],
  },
  {
    name: 'Fix Columns',
    columns: [
      'id',
      'name',
      'fixTradingEnabled',
      'fixUserinfoRequestsEnabled',
    ],
  }
];

const UsersInstTable = () => {
  const columns = useUsersInstColumns();
  const { canManageLiquidity } = useAccess() || {};

  return (
    <Table<UsersInst, UsersInstCreateDto, UsersInstUpdateDto, TUsersInstFilterParams, {}, number>
      getAll={params => apiClient.usersInst.getManyBaseUsersInstControllerUsersInst(params)}
      onCreate={params => apiClient.usersInst.createOneBaseUsersInstControllerUsersInst(params)}
      onUpdate={params => apiClient.usersInst.updateOneBaseUsersInstControllerUsersInst(params)}
      onDelete={params => apiClient.usersInst.deleteOneBaseUsersInstControllerUsersInst(params)}
      entityToCreateDto={entityToDto}
      entityToUpdateDto={entityToDto}
      idColumnName='id'
      columns={columns}
      columnsSets={columnsSets}
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
          {
            field: 'group',
            select: ['id'],
          },
        ]
      }}
      scroll={{
        x: 'max-content',
      }}
      excludeColumnsWhileCreate={new Set<keyof UsersInst>(['id'])}
      createNewDefaultParams={{
        ts: undefined,
        tsMs: 0,
        name: undefined,
        leverage: undefined,
        balance: '0',
        credit: '0',
        margin: '0',
        freeMargin: '0',
        marginLevel: '0',
        userComment: '',
        enabled: 0,
        profitloss: '0',
        marginWithLimits: '0',
        commission: '0',
        swap: '0',
        stopoutHash: '0',
        stopoutName: '0',
        userState: -1,
        stopoutEnabled: 1,
        stopoutSuppressTime: '0',
        stopoutGenerationTime: '0',
        password: undefined,
        commissionValue: '0',
        rolloverTime: '0',
        commissionTurnover: '0',
        trId: 0,
        fixTradingEnabled: 1,
        fixUserinfoRequestsEnabled: 0,
        alwaysBookA: 0,
        hedgeFactor: '1',
        marginModuleId: 0,
        group: undefined,
        module: 0,
        company: 1,
        action: 0,
        commissionType: 1,
        commissionLotsMode: 3,
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
      popupCreation
    />
  );
}

export default UsersInstTable;
