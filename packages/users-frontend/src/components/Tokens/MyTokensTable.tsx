import pick from "lodash/pick";
import React, { useState } from "react";
import { useAccess } from "umi";
import { Token, TokenCreateDto, TokenUpdateDto } from "../../tools/api-client";
import { Operators, Table } from "@boarteam/boar-pack-common-frontend";
import apiClient from "@@api/apiClient";
import { useMyTokensColumns } from "./useMyTokensColumns";
import { Modal, Typography } from "antd";

const { Text } = Typography;

function entityToDto(entity: Token) {
  return pick(entity, [
    'name',
  ]);
}

type TTokenFilterParams = {
  name?: string,
}

export const MyTokensTable = () => {
  // Track the newly created token
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Table columns config
  const columns = useMyTokensColumns();
  const { canManageMyTokens } = useAccess() || {};

  return (
    <>
      <Table<Token, TokenCreateDto, TokenUpdateDto, TTokenFilterParams>
        getAll={params => apiClient.tokens.getManyBaseMyTokensControllerToken(params)}
        onCreate={async params => {
          const token = await apiClient.tokens.createOneBaseMyTokensControllerToken(params);

          if ('value' in token && token.value) {
            setCreatedToken(token.value);
            setShowModal(true);
          }

          return token as Token;
        }}
        onUpdate={params => apiClient.tokens.updateOneBaseMyTokensControllerToken(params)}
        onDelete={params => apiClient.tokens.deleteOneBaseMyTokensControllerToken(params)}
        entityToCreateDto={entityToDto}
        entityToUpdateDto={entityToDto}
        columns={columns}
        idColumnName='id'
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
        ]}
        viewOnly={!canManageMyTokens}
      />
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        onOk={() => setShowModal(false)}
        title="New Token Created"
      >
        <p className="text-red-500 mb-2">
          This token will only be shown once. Please copy it now.
        </p>
        {createdToken && (
          <Text copyable code>{createdToken}</Text>
        )}
      </Modal>
    </>
  );
};
