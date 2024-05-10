import { Table } from "@jifeon/boar-pack-common-frontend";
import apiClient from '@@api/apiClient';
import { UsersGroupsInst, UsersGroupsInstCreateDto, UsersGroupsInstUpdateDto } from "@@api/generated";
import { useUsersGroupsInstColumns } from "./useUsersGroupsInstColumns";
import pick from "lodash/pick";
import { useAccess } from "umi";
import { usersGroupsJoinFields } from "./usersGroupsJoinFields";
import { usersGroupsSearchableColumns } from "./usersGroupsSearchableColumns";
import { useLiquidityManagerContext } from "../../../tools/liquidityManagerContext";
import { PageLoading } from "@ant-design/pro-layout";

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
    company: entity.company?.id,
    currency: entity.currency?.name,
    workingMode: entity.workingMode?.id,
  };
}

const UsersGroupsInstTable = () => {
  const columns = useUsersGroupsInstColumns();
  const { canManageLiquidity } = useAccess() || {};
  const { worker } = useLiquidityManagerContext();

  if (!worker) return <PageLoading />;

  return (
    <Table<UsersGroupsInst, UsersGroupsInstCreateDto, UsersGroupsInstUpdateDto, {}, { worker: string }, number>
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
      pathParams={{
        worker,
      }}
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
        sortMap: {
          action: 'action.name',
          company: 'company.name',
          workingMode: 'workingMode.name',
          currency: 'currency.name',
        }
      }}
      defaultSort={['name', 'ASC']}
      searchableColumns={usersGroupsSearchableColumns}
      viewOnly={!canManageLiquidity}
    ></Table>
  );
}

export default UsersGroupsInstTable;
