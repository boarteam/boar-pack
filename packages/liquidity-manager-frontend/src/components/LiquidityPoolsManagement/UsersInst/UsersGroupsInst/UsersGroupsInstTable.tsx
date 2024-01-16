import Table from "../../../Table/Table";
import apiClient from "../../../../tools/client/apiClient";
import { UsersGroupsInst, UsersGroupsInstCreateDto, UsersGroupsInstUpdateDto } from "../../../../tools/api";
import { useUsersGroupsInstColumns } from "./useUsersGroupsInstColumns";
import pick from "lodash/pick";
import { useAccess } from "umi";
import { usersGroupsJoinFields } from "./usersGroupsJoinFields";
import { usersGroupsSearchableColumns } from "./usersGroupsSearchableColumns";

function entityToDto(entity: UsersGroupsInst) {
  return {
    ...pick(entity, [
      'ts',
      'tsMs',
      'name',
      'leverage',
      'descr',
      'marginCall',
      'marginStopout',
      'swapEnabled',
    ]),
    action: entity.action?.id,
    companyId: entity.company?.id,
    currency: entity.currency?.name,
    workingMode: entity.workingMode?.id,
  };
}

const UsersGroupsInstTable = () => {
  const columns = useUsersGroupsInstColumns();
  const { canManageLiquidity } = useAccess() || {};

  return (
    <Table<UsersGroupsInst, UsersGroupsInstCreateDto, UsersGroupsInstUpdateDto, {}, {}, number>
      getAll={params => apiClient.usersGroupsInst.getManyBaseUsersGroupsInstControllerUsersGroupsInst(params)}
      onCreate={params => apiClient.usersGroupsInst.createOneBaseUsersGroupsInstControllerUsersGroupsInst(params)}
      onUpdate={params => apiClient.usersGroupsInst.updateOneBaseUsersGroupsInstControllerUsersGroupsInst(params)}
      onDelete={params => apiClient.usersGroupsInst.deleteOneBaseUsersGroupsInstControllerUsersGroupsInst(params)}
      // todo: uncomment once proper relational objects are returned
      // @ts-ignore
      entityToCreateDto={entityToDto}
      // @ts-ignore
      entityToUpdateDto={entityToDto}
      idColumnName='name'
      scroll={{
        x: 'max-content',
      }}
      columns={columns}
      pathParams={{}}
      createNewDefaultParams={{
        name: '',
        leverage: 0,
        currency: undefined,
        descr: '',
        marginCall: 0,
        marginStopout: 0,
        swapEnabled: 1,
        company: undefined,
        ts: 0,
        tsMs: 0,
      }}
      params={{
        join: usersGroupsJoinFields,
      }}
      defaultSort={['name', 'ASC']}
      searchableColumns={usersGroupsSearchableColumns}
      viewOnly={!canManageLiquidity}
    ></Table>
  );
}

export default UsersGroupsInstTable;
