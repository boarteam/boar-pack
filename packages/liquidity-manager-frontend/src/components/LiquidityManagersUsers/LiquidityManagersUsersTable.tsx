import apiClient from "@@api/apiClient";
import { LiquidityManagersUser, LiquidityManagersUserCreateDto, LiquidityManagersUserUpdateDto } from "@@api/generated";
import { useLiquidityManagersUsersColumns } from "./useLiquidityManagersUsersColumns";
import pick from "lodash/pick";
import { useAccess } from "umi";
import { Operators, Table } from "@jifeon/boar-pack-common-frontend";
import React from "react";

function entityToDto(entity: LiquidityManagersUser) {
  return {
    ...pick(entity, [
      'role',
      'liquidityManagerId',
    ]),
    userId: entity.user.id,
  };
}

type TLiquidityManagersUserFilterParams = {
  name?: string,
}

type TLiquidityManagersUsersTableProps = {
  liquidityManagerId: string,
}

const LiquidityManagersUsersTable: React.FC<TLiquidityManagersUsersTableProps> = ({
  liquidityManagerId,
}) => {
  const columns = useLiquidityManagersUsersColumns();
  const { canManageLiquidityManagersSettings } = useAccess() || {};

  return (
    <Table<LiquidityManagersUser, LiquidityManagersUserCreateDto, LiquidityManagersUserUpdateDto, TLiquidityManagersUserFilterParams>
      getAll={params => apiClient.liquidityManagersUsers.getManyBaseLiquidityManagersUsersControllerLiquidityManagersUser(params)}
      onCreate={params => apiClient.liquidityManagersUsers.createOneBaseLiquidityManagersUsersControllerLiquidityManagersUser(params)}
      onUpdate={params => apiClient.liquidityManagersUsers.updateOneBaseLiquidityManagersUsersControllerLiquidityManagersUser(params)}
      onDelete={params => apiClient.liquidityManagersUsers.deleteOneBaseLiquidityManagersUsersControllerLiquidityManagersUser(params)}
      entityToCreateDto={entityToDto}
      entityToUpdateDto={entityToDto}
      columns={columns}
      idColumnName='id'
      params={{
        join: [{
          field: 'user',
          select: ['id', 'name'],
        }],
        baseFilters: {
          liquidityManagerId,
        },
      }}
      pathParams={{}}
      defaultSort={['user.name', 'ASC']}
      createNewDefaultParams={{
        liquidityManagerId,
      }}
      searchableColumns={[
        {
          field: 'liquidityManagerId',
          operator: Operators.equals,
        },
      ]}
      viewOnly={!canManageLiquidityManagersSettings}
    ></Table>
  );
}

export default LiquidityManagersUsersTable;
