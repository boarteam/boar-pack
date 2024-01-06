import Table from "../../../Table/Table";
import apiClient from "../../../../tools/client/apiClient";
import { EcnSubscrSchema, EcnSubscrSchemaCreateDto, EcnSubscrSchemaUpdateDto } from "../../../../tools/api";
import pick from "lodash/pick";
import React from "react";
import { ecnSubscrSchemaJoinFields } from "./ecnSubscrSchemaJoinFields";
import { useEcnSubscrSchemaColumns } from "./useEcnSubscrSchemaColumns";
import useFullscreen from "../../../../tools/useFullscreen";
import { ecnSubscrSchemaSearchableColumns } from "./ecnSubscrSchemaSearchableColumns";

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
    instrument: entity.instrument?.instrumentHash,
    executionMode: entity.executionMode?.id,
    connectSchema: entity.connectSchema?.id,
  };
}

type TEcnSubscrSchemasTableProps = {
  connectSchemaId: number;
}

const EcnSubscrSchemasTable: React.FC<TEcnSubscrSchemasTableProps> = ({
  connectSchemaId,
}) => {
  const columns = useEcnSubscrSchemaColumns();
  const { isFullscreen } = useFullscreen();

  return (
    <Table<EcnSubscrSchema, EcnSubscrSchemaCreateDto, EcnSubscrSchemaUpdateDto, {}, TEcnSubscrSchemasTableProps, number>
      getAll={params => apiClient.ecnSubscrSchemas.getManyBaseEcnSubscrSchemaControllerEcnSubscrSchema(params)}
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
        join: ecnSubscrSchemaJoinFields,
      }}
      defaultSort={['instrument.name', 'ASC']}
      searchableColumns={ecnSubscrSchemaSearchableColumns}
      viewOnly
      ghost={!isFullscreen}
    />
  );
}

export default EcnSubscrSchemasTable;
