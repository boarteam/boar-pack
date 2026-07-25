import { useTokensColumns } from './useTokensColumns';
import pick from 'lodash/pick';
import { useAccess } from 'umi';
import { Token, TokenUpdateDto } from '../../tools/api-client';
import { Operators, Table } from '@boarteam/boar-pack-common-frontend';
import { useApiClient } from '../ApiClientContext';

function entityToDto(entity: Token) {
  return pick(entity, ['name']);
}

type TTokenFilterParams = {
  name?: string;
  userId: string;
};

export const TokensTable = ({ userId }: { userId: string }) => {
  const apiClient = useApiClient();
  const columns = useTokensColumns();
  const { canManageTokens } = useAccess() || {};

  return (
    <Table<Token, {}, TokenUpdateDto, TTokenFilterParams>
      getAll={(params) => apiClient.tokens.getManyBaseTokensControllerToken(params)}
      onUpdate={(params) => apiClient.tokens.updateOneBaseTokensControllerToken(params as any)}
      onDelete={(params) => apiClient.tokens.deleteOneBaseTokensControllerToken(params as any)}
      entityToUpdateDto={entityToDto}
      columns={columns}
      idColumnName="id"
      params={{ userId }}
      pathParams={{}}
      defaultSort={['name', 'ASC']}
      // Tokens cannot be created on behalf of another user: the admin /tokens
      // endpoint exposes no create route, and the only POST (/my/tokens) always
      // persists the *current* user's id. There is therefore no onCreate to wire
      // here, but common-frontend's Table renders its "New" button for every
      // non-viewOnly table, so clear the toolbar actions it produces. This table
      // contributes no other toolbar action (no bulk edit/delete, import or
      // export), and the toolbar's settings controls are unaffected.
      toolbar={{ actions: [] }}
      searchableColumns={[
        {
          field: 'name',
          operator: Operators.containsLow,
        },
        {
          field: 'userId',
          operator: Operators.equals,
        },
      ]}
      viewOnly={!canManageTokens}
      ghost={true}
    ></Table>
  );
};
