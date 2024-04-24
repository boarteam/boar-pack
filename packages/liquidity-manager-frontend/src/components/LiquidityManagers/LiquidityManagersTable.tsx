import Table from "../Table/Table";
import apiClient from "../../tools/client/apiClient";
import { LiquidityManager, LiquidityManagerCreateDto, LiquidityManagerUpdateDto } from "../../tools/api";
import { useLiquidityManagersColumns } from "./useLiquidityManagersColumns";
import pick from "lodash/pick";
import { useAccess } from "umi";
import { Operators } from "../Table/tableTools";

function entityToDto(entity: LiquidityManager) {
  return pick(entity, [
    'name',
    'host',
    'port',
    'user',
    'pass',
    'database',
    'worker',
    'color',
    'enabled',
  ]);
}

const LiquidityManagersTable = () => {
  const columns = useLiquidityManagersColumns();
  const { canManageLiquidity } = useAccess() || {};

  return (
    <Table<LiquidityManager, LiquidityManagerCreateDto, LiquidityManagerUpdateDto>
      getAll={params => apiClient.liquidityManagers.getManyBaseLiquidityManagersControllerLiquidityManager(params)}
      onCreate={params => apiClient.liquidityManagers.createOneBaseLiquidityManagersControllerLiquidityManager(params)}
      onUpdate={params => apiClient.liquidityManagers.updateOneBaseLiquidityManagersControllerLiquidityManager(params)}
      onDelete={params => apiClient.liquidityManagers.deleteOneBaseLiquidityManagersControllerLiquidityManager(params)}
      entityToCreateDto={entityToDto}
      entityToUpdateDto={entityToDto}
      columns={columns}
      idColumnName='id'
      pathParams={{}}
      defaultSort={['name', 'ASC']}
      scroll={{
        x: 'max-content',
      }}
      createNewDefaultParams={{
        name: '',
        host: '',
        pass: '',
        database: '',
        enabled: true,
      }}
      searchableColumns={[
        {
          field: 'name',
          operator: Operators.containsLow,
        },
        {
          field: 'host',
          operator: Operators.containsLow,
        },
        {
          field: 'user',
          operator: Operators.containsLow,
        },
        {
          field: 'database',
          operator: Operators.containsLow,
        },
        {
          field: 'worker',
          operator: Operators.equals,
        },
        {
          field: 'color',
          operator: Operators.equals,
        }
      ]}
      viewOnly={!canManageLiquidity}
    ></Table>
  );
}

export default LiquidityManagersTable;
