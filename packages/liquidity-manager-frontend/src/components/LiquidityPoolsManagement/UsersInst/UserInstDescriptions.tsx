import apiClient from "../../../tools/client/apiClient";
import Descriptions from "../../Descriptions/Descriptions";
import React from "react";
import { useUsersInstColumns } from "./useUsersInstColumns";
import { UsersInst, UsersInstCreateDto, UsersInstUpdateDto } from "@/tools/api";
import { usersInstJoinFields } from "./usersInstJoinFields";
import { usersInstToDto } from "./UsersInstTable";
import { useAccess } from "@umijs/max";
import { useLiquidityManagerContext } from "../liquidityManagerContext";
import { PageLoading } from "@ant-design/pro-layout";

type TUserInstProps = {
  id: string,
};

const UserInstDescriptions: React.FC<TUserInstProps> = ({
  id,
}) => {
  const columns = useUsersInstColumns();
  const { canManageLiquidity } = useAccess() || {};
  const { worker } = useLiquidityManagerContext();

  if (!worker) return <PageLoading />;

  return (<Descriptions<UsersInst, UsersInstCreateDto, UsersInstUpdateDto, {
    id: string,
    worker: string,
  }, number>
    mainTitle="General"
    pathParams={{
      id,
      worker,
    }}
    getOne={params => apiClient.usersInst.getOneBaseUsersInstControllerUsersInst(params)}
    onUpdate={params => apiClient.usersInst.updateOneBaseUsersInstControllerUsersInst(params)}
    onDelete={params => apiClient.usersInst.deleteOneBaseUsersInstControllerUsersInst(params)}
    entityToUpdateDto={usersInstToDto}
    canEdit={canManageLiquidity}
    columns={columns}
    params={{
      join: usersInstJoinFields,
    }}
  />);
}

export default UserInstDescriptions;
