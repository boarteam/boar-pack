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
      'currencyName',
      'currencyId',
      'descr',
      'marginCall',
      'marginStopout',
      'type',
      'swapMode',
    ]),
    action: entity.action?.id,
    companyId: entity.company?.id,
  };
}

type TUsersGroupsInstFilterParams = {
  name?: string,
  currencyName?: string,
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
      idColumnName='id'
      scroll={{
        x: 'max-content',
      }}
      columns={columns}
      pathParams={{}}
      createNewDefaultParams={{
        name: '',
        leverage: 0,
        currencyName: '',
        descr: '',
        marginCall: 0,
        marginStopout: 0,
        type: 0,
        companyId: 0,
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
        ],
      }}
      defaultSort={['name', 'ASC']}
      searchableColumns={[
        {
          field: 'name',
          operator: Operators.containsLow,
        },
        {
          field: 'currencyName',
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
