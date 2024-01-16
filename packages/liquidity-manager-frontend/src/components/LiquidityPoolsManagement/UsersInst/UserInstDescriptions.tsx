import apiClient from "../../../tools/client/apiClient";
import Descriptions from "../../Descriptions/Descriptions";
import React from "react";
import { useUsersInstColumns } from "./useUsersInstColumns";
import { UsersInst, UsersInstCreateDto, UsersInstUpdateDto } from "@/tools/api";
import { usersInstJoinFields } from "./usersInstJoinFields";
import { usersInstToDto } from "./UsersInstTable";

type TUserInstProps = {
  id: string,
};

const UserInstDescriptions: React.FC<TUserInstProps> = ({
  id,
}) => {
  const columns = useUsersInstColumns();

  return (<Descriptions<UsersInst, UsersInstCreateDto, UsersInstUpdateDto, {
    id: string,
  }, number>
    mainTitle="General"
    pathParams={{
      id,
    }}
    getOne={params => apiClient.usersInst.getOneBaseUsersInstControllerUsersInst(params)}
    onUpdate={params => apiClient.usersInst.updateOneBaseUsersInstControllerUsersInst(params)}
    onDelete={params => apiClient.usersInst.deleteOneBaseUsersInstControllerUsersInst(params)}
    entityToCreateDto={usersInstToDto}
    entityToUpdateDto={usersInstToDto}
    columns={columns}
    params={{
      join: usersInstJoinFields,
    }}
  />);
}

export default UserInstDescriptions;
