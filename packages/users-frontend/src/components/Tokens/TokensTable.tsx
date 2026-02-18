import { useTokensColumns } from "./useTokensColumns";
import pick from "lodash/pick";
import { useAccess } from "umi";
import { Token, TokenUpdateDto } from "../../tools/api-client";
import { Operators, Table } from "@boarteam/boar-pack-common-frontend";
import { useApiClient } from "../ApiClientContext";

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
  const apiClient = useApiClient();
  const columns = useTokensColumns();
  const { canManageTokens } = useAccess() || {};

  return (
    <Table<Token, {}, TokenUpdateDto, TTokenFilterParams>
      getAll={params => apiClient.tokens.getManyBaseTokensControllerToken(params)}
      onUpdate={params => apiClient.tokens.updateOneBaseTokensControllerToken(params as any)}
      onDelete={params => apiClient.tokens.deleteOneBaseTokensControllerToken(params as any)}
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
