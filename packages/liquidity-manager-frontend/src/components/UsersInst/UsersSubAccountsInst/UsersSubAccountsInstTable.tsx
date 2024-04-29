import { Table, TColumnsSet, useColumnsSets } from "@jifeon/boar-pack-common-frontend";
import apiClient from '@api/apiClient';
import {
  SubloginSettings,
  UsersSubAccountInst,
  UsersSubAccountInstCreateDto,
  UsersSubAccountInstUpdateDto
} from "@api/generated";
import { useUsersSubAccountsInstColumns } from "./useUsersSubAccountsInstColumns";
import pick from "lodash/pick";
import { useAccess } from "umi";
import { Operators } from "@jifeon/boar-pack-common-frontend";
import React from "react";
import SubloginsSettingsTable
  from "../SubloginsSettings/SubloginsSettingsTable";
import { useSubloginsSettingsColumns } from "../SubloginsSettings/useSubloginsSettingsColumns";
import s from './UsersSubaccountsInst.less';
import { useLiquidityManagerContext } from "../../../tools/liquidityManagerContext";
import { PageLoading } from "@ant-design/pro-components";

function userSubAccountToDto<T extends Partial<UsersSubAccountInst>,
  R extends UsersSubAccountInstCreateDto | UsersSubAccountInstUpdateDto>(entity: T): R {
  return {
    ...pick(entity, [
      'subAccountId',
      'descr',
      'userId',
    ]),
  } as R;
}

const columnsSets: TColumnsSet<SubloginSettings>[] = [
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
      'markupBid',
      'markupAsk',
    ],
  },
  {
    name: 'Spread Limit Columns',
    columns: [
      'instrumentRel',
      'spreadLimit',
      'spreadLimitOnRollover',
      // @ts-ignore-next-line
      'instrumentRel,priceDigits',
    ],
  },
  {
    name: 'Aliases',
    columns: [
      'instrumentRel',
      'alias',
    ],
  },
  {
    name: 'Hedge Columns',
    columns: [
      'instrumentRel',
      // @ts-ignore-next-line
      'hedge_group',
      'hedgeAmount',
      'hedgeStep',
      'hedgeCurrency',
      'hedgeMultiplier',
    ],
  },
  {
    name: 'All Columns',
    columns: [
      'instrumentRel',
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
  userId: string;
}

const UsersSubAccountsInstTable: React.FC<TUsersSubAccountsInstTableProps> = ({
  userId,
}) => {
  const columns = useUsersSubAccountsInstColumns();
  const settingsColumns = useSubloginsSettingsColumns();
  const { canManageLiquidity } = useAccess() || {};
  const { worker } = useLiquidityManagerContext();

  const {
    columnsSetSelect,
    columnsState,
  } = useColumnsSets<SubloginSettings>({
    columns: settingsColumns,
    columnsSets,
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
      viewOnly={!canManageLiquidity}
      expandable={{
        expandedRowClassName: () => s.expandableRow,
        expandedRowRender: (record) => {
          return <SubloginsSettingsTable
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
    ></Table>
  );
}

export default UsersSubAccountsInstTable;
