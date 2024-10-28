import { Table, TColumnsSet, useColumnsSets, TTableProps } from "@jifeon/boar-pack-common-frontend";
import apiClient from '@@api/apiClient';
import {
  SubloginSettings,
  UsersSubAccountInst,
  UsersSubAccountInstCreateDto,
  UsersSubAccountInstUpdateDto
} from "@@api/generated";
import { useUsersSubAccountsInstColumns } from "./useUsersSubAccountsInstColumns";
import pick from "lodash/pick";
import { useAccess } from "umi";
import { Operators } from "@jifeon/boar-pack-common-frontend";
import React from "react";
import SubloginsSettingsTable
  from "../SubloginsSettings/SubloginsSettingsTable";
import { useSubloginsSettingsColumns } from "../SubloginsSettings/useSubloginsSettingsColumns";
import { useLiquidityManagerContext } from "../../../tools";
import { PageLoading } from "@ant-design/pro-components";

export function userSubAccountToDto<T extends Partial<UsersSubAccountInst>,
  R extends UsersSubAccountInstCreateDto | UsersSubAccountInstUpdateDto>(entity: T): R {
  return {
    ...pick(entity, [
      'subAccountId',
      'descr',
      'userId',
    ]),
  } as R;
}

export const columnsSets: TColumnsSet<SubloginSettings>[] = [
  {
    name: 'Default Columns',
    columns: [
      'instrumentRel',
      'spreadLimit',
      'spreadLimitOnRollover',
      // @ts-ignore-next-line
      'instrumentRel,priceDigits',
      'markupBid',
      'markupAsk',
      'alias',
    ],
  },
  {
    name: 'Markup Columns',
    columns: [
      'instrumentRel',
      // @ts-ignore-next-line
      'instrumentRel,instrumentGroup',
      // @ts-ignore-next-line
      'instrumentRel,priceDigits',
      'markupBid',
      'markupAsk',
    ],
  },
  {
    name: 'Spread Limit Columns',
    columns: [
      'instrumentRel',
      // @ts-ignore-next-line
      'instrumentRel,instrumentGroup',
      // @ts-ignore-next-line
      'instrumentRel,priceDigits',
      'spreadLimit',
      'spreadLimitOnRollover',
    ],
  },
  {
    name: 'Aliases',
    columns: [
      'instrumentRel',
      'alias',
      // @ts-ignore-next-line
      'instrumentRel,instrumentGroup',
      // @ts-ignore-next-line
      'instrumentRel,priceDigits',
    ],
  },
  {
    name: 'Hedge Columns',
    columns: [
      'instrumentRel',
      // @ts-ignore-next-line
      'instrumentRel,instrumentGroup',
      // @ts-ignore-next-line
      'instrumentRel,priceDigits',
      // @ts-ignore-next-line
      'hedge_group',
      // 'hedgeAmount',
      // 'hedgeStep',
      // 'hedgeCurrency',
      'hedgeMultiplier',
      'instrumentPriorityFlag',
      'minVolumeForABook',
    ],
  },
  {
    name: 'All Columns',
    columns: [
      'instrumentRel',
      // @ts-ignore-next-line
      'instrumentRel,instrumentGroup',
      'spreadLimit',
      'minVolumeForABook',
      'spreadLimitOnRollover',
      // @ts-ignore-next-line
      'instrumentRel,priceDigits',
      'instrumentPriorityFlag',
      'markupBid',
      'markupAsk',
      'alias',
      'demi',
      'dema',
      // @ts-ignore-next-line
      'hedge_group',
      'hedgeAmount',
      'hedgeStep',
      'hedgeCurrency',
      'hedgeMultiplier',
    ],
  },
];

type TUsersSubAccountsInstTableProps = {
  canManage?: boolean;
  userId: string;
  defaultColumnState?: string;
} & Partial<TTableProps<UsersSubAccountInst, UsersSubAccountInstCreateDto, UsersSubAccountInstUpdateDto, {}, { worker: string}>>

const UsersSubAccountsInstTable: React.FC<TUsersSubAccountsInstTableProps> = ({
  canManage,
  userId,
  defaultColumnState,
  ...restProps
}) => {
  const { worker, liquidityManager } = useLiquidityManagerContext();
  const { canManageLiquidity } = useAccess() || {};
  const canEdit = canManageLiquidity(liquidityManager) || canManage;
  const columns = useUsersSubAccountsInstColumns(canEdit);
  const settingsColumns = useSubloginsSettingsColumns(canEdit);

  const {
    columnsSetSelect,
    columnsState,
  } = useColumnsSets<SubloginSettings>({
    columns: settingsColumns,
    columnsSets,
    defaultColumnState,
  });

  if (!worker) return <PageLoading />;

  return (
    <Table<UsersSubAccountInst, UsersSubAccountInstCreateDto, UsersSubAccountInstUpdateDto, {}, {
      worker: string,
    }, number>
      getAll={params => apiClient.usersSubAccountsInst.getManyBaseUsersSubAccountsInstControllerUsersSubAccountInst(params)}
      onCreate={params => apiClient.usersSubAccountsInst.createOneBaseUsersSubAccountsInstControllerUsersSubAccountInst(params)}
      onUpdate={params => apiClient.usersSubAccountsInst.updateOneBaseUsersSubAccountsInstControllerUsersSubAccountInst(params)}
      onDelete={params => apiClient.usersSubAccountsInst.deleteOneBaseUsersSubAccountsInstControllerUsersSubAccountInst(params)}
      entityToCreateDto={userSubAccountToDto}
      entityToUpdateDto={userSubAccountToDto}
      idColumnName='id'
      scroll={{
        x: 'max-content',
      }}
      columns={columns}
      pathParams={{
        worker,
      }}
      createNewDefaultParams={{
        userId,
      }}
      params={{
        baseFilters: {
          userId,
        }
      }}
      defaultSort={['subAccountId', 'ASC']}
      searchableColumns={[
        {
          field: 'descr',
          operator: Operators.containsLow,
        },
        {
          field: 'userId',
          operator: Operators.equals,
        }
      ]}
      viewOnly={!canEdit}
      expandable={{
        expandedRowRender: (record) => {
          return <SubloginsSettingsTable
            userId={userId}
            usersSubAccountInstId={record.id}
            columns={settingsColumns}
            columnsSetSelect={columnsSetSelect}
            columnsState={columnsState}
          />;
        }
      }}
      options={{
        setting: false,
      }}
      {...restProps}
    ></Table>
  );
}

export default UsersSubAccountsInstTable;
