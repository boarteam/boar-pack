import apiClient from '@@api/apiClient';
import React from "react";
import { useUsersInstColumns } from "./useUsersInstColumns";
import { UsersInst, UsersInstCreateDto, UsersInstUpdateDto } from "@@api/generated";
import { usersInstJoinFields } from "./usersInstJoinFields";
import { usersInstToDto } from "./UsersInstTable";
import { useAccess } from "umi";
import { useLiquidityManagerContext } from "../../tools";
import { PageLoading } from "@ant-design/pro-layout";
import { Descriptions } from "@jifeon/boar-pack-common-frontend";

type TUserInstProps = {
  id: string,
};

const UserInstDescriptions: React.FC<TUserInstProps> = ({
  id,
}) => {
  const columns = useUsersInstColumns();
  const { worker, liquidityManager } = useLiquidityManagerContext();
  const { canManageLiquidity } = useAccess() || {};
  const canEdit = canManageLiquidity(liquidityManager);

  if (!worker) return <PageLoading />;

  return (<Descriptions<UsersInst, UsersInstCreateDto, UsersInstUpdateDto, {
    id: string,
    worker: string,
  }>
    mainTitle="General"
    pathParams={{
      id,
      worker,
    }}
    getOne={params => apiClient.usersInst.getOneBaseUsersInstControllerUsersInst(params)}
    onUpdate={params => apiClient.usersInst.updateOneBaseUsersInstControllerUsersInst(params)}
    onDelete={params => apiClient.usersInst.deleteOneBaseUsersInstControllerUsersInst(params)}
    entityToUpdateDto={usersInstToDto}
    canEdit={canEdit}
    columns={columns}
    params={{
      join: usersInstJoinFields,
    }}
  />);
}

export default UserInstDescriptions;
