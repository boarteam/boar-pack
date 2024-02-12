import Table from "../../../Table/Table";
import apiClient from "../../../../tools/client/apiClient";
import { EcnSubscrSchema, EcnSubscrSchemaCreateDto, EcnSubscrSchemaUpdateDto } from "../../../../tools/api";
import pick from "lodash/pick";
import React from "react";
import { ecnSubscrSchemaJoinFields } from "./ecnSubscrSchemaJoinFields";
import { useEcnSubscrSchemaColumns } from "./useEcnSubscrSchemaColumns";
import useFullscreen from "../../../../tools/useFullscreen";
import { ecnSubscrSchemaSearchableColumns } from "./ecnSubscrSchemaSearchableColumns";
import { useAccess } from "@umijs/max";

export function ecnSubscriptionSchemaToDto(entity: EcnSubscrSchema) {
  return {
    ...pick(entity, [
      'enabled',
      'markupBid',
      'markupAsk',
      'defaultMarkupBid',
      'defaultMarkupAsk',
      'tradeEnabled',
      'minVolume',
      'maxVolume',
      'volumeStep',
      'instrumentWeight',
      'descr',
    ]),
    instrumentHash: entity.instrument?.instrumentHash,
    executionMode: entity.executionMode?.id,
    connectSchemaId: entity.connectSchemaId,
  };
}

type TEcnSubscrSchemasTableProps = {
  connectSchemaId: number;
}

const EcnSubscrSchemasTable: React.FC<TEcnSubscrSchemasTableProps> = ({
  connectSchemaId,
}) => {
  const { canManageLiquidity } = useAccess() || {};
  const columns = useEcnSubscrSchemaColumns();
  const { isFullscreen } = useFullscreen();

  return (
    <Table<EcnSubscrSchema, EcnSubscrSchemaCreateDto, EcnSubscrSchemaUpdateDto, { connectSchemaId: number }, TEcnSubscrSchemasTableProps, number>
      getAll={params => apiClient.ecnSubscrSchemas.getManyBaseEcnSubscrSchemaControllerEcnSubscrSchema(params)}
      onCreate={params => apiClient.ecnSubscrSchemas.createOneBaseEcnSubscrSchemaControllerEcnSubscrSchema(params)}
      onUpdate={params => apiClient.ecnSubscrSchemas.updateOneBaseEcnSubscrSchemaControllerEcnSubscrSchema(params)}
      onDelete={params => apiClient.ecnSubscrSchemas.deleteOneBaseEcnSubscrSchemaControllerEcnSubscrSchema(params)}
      entityToCreateDto={ecnSubscriptionSchemaToDto}
      entityToUpdateDto={ecnSubscriptionSchemaToDto}
      columns={columns}
      idColumnName="instrumentHash"
      columnsSets={[
        {
          name: 'Default Columns',
          columns: [
            'instrument',
            'enabled',
            'tradeEnabled'
          ],
        },
      ]}
      scroll={{
        x: 'max-content',
      }}
      pathParams={{
        connectSchemaId,
      }}
      params={{
        connectSchemaId,
        join: ecnSubscrSchemaJoinFields,
      }}
      createNewDefaultParams={{
        connectSchemaId,
        enabled: 1,
        markupBid: 0,
        markupAsk: 0,
        defaultMarkupBid: 0,
        defaultMarkupAsk: 0,
        tradeEnabled: 1,
        reserved: 0,
        instrumentWeight: 1,
      }}
      defaultSort={['instrument.name', 'ASC']}
      searchableColumns={ecnSubscrSchemaSearchableColumns}
      viewOnly
      ghost={!isFullscreen}
    />
  );
}

export default EcnSubscrSchemasTable;
