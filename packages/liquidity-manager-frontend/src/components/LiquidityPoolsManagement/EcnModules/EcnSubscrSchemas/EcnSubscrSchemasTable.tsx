import Table from "../../../Table/Table";
import apiClient from "../../../../tools/client/apiClient";
import { EcnSubscrSchema, EcnSubscrSchemaCreateDto, EcnSubscrSchemaUpdateDto } from "../../../../tools/api";
import pick from "lodash/pick";
import React, { useMemo } from "react";
import { getDefaultColumnsState, Operators } from "../../../Table/tableTools";
import { ecnSubscrSchemaJoinFields } from "./ecnSubscrSchemaJoinFields";
import { useEcnSubscrSchemaColumns } from "./useEcnSubscrSchemaColumns";
import useFullscreen from "../../../../tools/useFullscreen";

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

type TEcnSubscriptionSchemaFilterParams = {
  'connectSchema.id': number;
  descr?: string,
}

const defaultDisplayedColumns = new Set<keyof EcnSubscrSchema>([
  'instrument',
  'enabled',
  'tradeEnabled'
]);

type TEcnSubscrSchemasTableProps = {
  connectSchemaId: number;
}

const EcnSubscrSchemasTable: React.FC<TEcnSubscrSchemasTableProps> = ({
  connectSchemaId,
}) => {
  const columns = useEcnSubscrSchemaColumns();
  const defaultColumnsState = useMemo(() => getDefaultColumnsState<EcnSubscrSchema>(columns, defaultDisplayedColumns), [columns]);
  const { isFullscreen } = useFullscreen();

  return (
    <Table<EcnSubscrSchema, EcnSubscrSchemaCreateDto, EcnSubscrSchemaUpdateDto, TEcnSubscriptionSchemaFilterParams, {}, number>
      getAll={params => apiClient.ecnSubscrSchemas.getManyBaseEcnSubscrSchemaControllerEcnSubscrSchema(params)}
      onUpdate={params => apiClient.ecnSubscrSchemas.updateOneBaseEcnSubscrSchemaControllerEcnSubscrSchema(params)}
      onDelete={params => apiClient.ecnSubscrSchemas.deleteOneBaseEcnSubscrSchemaControllerEcnSubscrSchema(params)}
      entityToCreateDto={ecnSubscriptionSchemaToDto}
      entityToUpdateDto={ecnSubscriptionSchemaToDto}
      columns={columns}
      idColumnName="instrumentHash"
      columnsState={{
        defaultValue: defaultColumnsState,
      }}
      scroll={{
        x: 'max-content',
      }}
      pathParams={{}}
      params={{
        join: ecnSubscrSchemaJoinFields,
        'connectSchema.id': connectSchemaId,
      }}
      defaultSort={['instrument.name', 'ASC']}
      searchableColumns={[
        {
          field: 'connectSchema.id',
          operator: Operators.equals,
        },
        {
          field: 'descr',
          operator: Operators.containsLow,
        },
      ]}
      viewOnly
      ghost={!isFullscreen}
    />
  );
}

export default EcnSubscrSchemasTable;
