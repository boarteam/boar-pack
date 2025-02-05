import { useTokensColumns } from "./useTokensColumns";
import pick from "lodash/pick";
import { useAccess } from "umi";
import { Token, TokenUpdateDto } from "../../tools/api-client";
import { Operators, Table } from "@boarteam/boar-pack-common-frontend";
import apiClient from "@@api/apiClient";

function entityToDto(entity: Token) {
  return pick(entity, [
    'name',
  ]);
}

type TTokenFilterParams = {
  name?: string,
  userId: string,
}

export const TokensTable = ({ userId }: {
  userId: string,
}) => {
  const columns = useTokensColumns();
  const { canManageTokens } = useAccess() || {};

  return (
    <Table<Token, {}, TokenUpdateDto, TTokenFilterParams>
      getAll={params => apiClient.tokens.getManyBaseTokensControllerToken(params)}
      onUpdate={params => apiClient.tokens.updateOneBaseTokensControllerToken(params)}
      onDelete={params => apiClient.tokens.deleteOneBaseTokensControllerToken(params)}
      entityToCreateDto={entityToDto}
      entityToUpdateDto={entityToDto}
      columns={columns}
      idColumnName='id'
      params={{ userId }}
      pathParams={{}}
      defaultSort={['name', 'ASC']}
      createNewDefaultParams={{
        name: '',
      }}
      searchableColumns={[
        {
          field: 'name',
          operator: Operators.containsLow,
        },
        {
          field: 'userId',
          operator: Operators.equals,
        }
      ]}
      viewOnly={!canManageTokens}
      ghost={true}
    ></Table>
  );
}
