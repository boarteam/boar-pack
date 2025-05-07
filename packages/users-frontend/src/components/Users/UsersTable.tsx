import { Table, isRecordNew, Operators } from "@boarteam/boar-pack-common-frontend";
import apiClient from "@@api/apiClient";
import { User, UserCreateDto, UserUpdateDto } from "@@api/generated";
import { useUsersColumns } from "./useUsersColumns";
import pick from "lodash/pick";
import { PermissionsConfig, PermissionsList } from "./PermissionsList";
import { useAccess, useModel } from "umi";

function entityToDto(entity: User) {
  return pick(entity, [
    'name',
    'email',
    'role',
    'pass'
  ]);
}

type TUserFilterParams = {
  name?: string,
  email?: string,
  role?: string,
}

export const UsersTable = ({
  permissionsConfig = [],
}: {
  permissionsConfig?: PermissionsConfig;
}) => {
  const columns = useUsersColumns();
  const { canManageAll } = useAccess() || {};
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  return (
    <Table<User, UserCreateDto, UserUpdateDto, TUserFilterParams>
      getAll={params => {
        const fields = params.fields?.[0] || '';
        params.fields = [[fields, 'permissions'].join(',')];
        return apiClient.users.getManyBaseUsersControllerUser(params);
      }}
      onCreate={params => apiClient.users.createOneBaseUsersControllerUser(params)}
      onUpdate={params => apiClient.users.updateOneBaseUsersControllerUser(params)}
      onDelete={params => apiClient.users.deleteOneBaseUsersControllerUser(params)}
      entityToCreateDto={entityToDto}
      entityToUpdateDto={entityToDto}
      pathParams={{}}
      columns={columns}
      idColumnName='id'
      searchableColumns={[
        {
          field: 'name',
          operator: Operators.containsLow,
        },
        {
          field: 'email',
          operator: Operators.containsLow,
        },
        {
          field: 'role',
          operator: Operators.containsLow,
        }
      ]}
      expandable={{
        // hide expandable icon for new records which are not saved yet, since you can't set permissions for them
        rowExpandable: record => !isRecordNew(record),
        expandedRowRender: record => <PermissionsList
          user={record}
          permissionsConfig={permissionsConfig}
        />,
      }}
      viewOnly={!canManageAll}
      editable={{
        actionRender: (row, config, dom) => {
          if (row.id === currentUser?.id) {
            return [dom.save, dom.cancel];
          }

          return [dom.save, dom.delete, dom.cancel];
        }
      }}
    ></Table>
  );
}
