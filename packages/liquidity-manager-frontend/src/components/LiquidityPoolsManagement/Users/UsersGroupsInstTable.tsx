import Table from "../../Table/Table";
import apiClient from "../../../tools/client/apiClient";
import { UsersGroupsInst, UsersGroupsInstCreateDto, UsersGroupsInstUpdateDto } from "../../../tools/api";
import { useUsersGroupsInstColumns } from "./useUsersGroupsInstColumns";
import pick from "lodash/pick";
import { useAccess } from "umi";
import { Operators } from "../../Table/tableTools";

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

type TUsersGroupsInstFilterParams = {
  name?: string,
  descr?: string,
}

const UsersGroupsInstTable = () => {
  const columns = useUsersGroupsInstColumns();
  const { canManageLiquidity } = useAccess() || {};

  return (
    <Table<UsersGroupsInst, UsersGroupsInstCreateDto, UsersGroupsInstUpdateDto, TUsersGroupsInstFilterParams, {}, number>
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
        join: [
          {
            field: 'action',
            select: ['name'],
          },
          {
            field: 'company',
            select: ['name'],
          },
          {
            field: 'workingMode',
            select: ['name'],
          },
          {
            field: 'currency',
            select: ['id'],
          },
        ],
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
    ></Table>
  );
}

export default UsersGroupsInstTable;
