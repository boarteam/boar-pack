import { Table, useFullscreen } from "@jifeon/boar-pack-common-frontend";
import apiClient from '@@api/apiClient';
import { EcnSubscrSchema, EcnSubscrSchemaCreateDto, EcnSubscrSchemaUpdateDto } from "@@api/generated";
import pick from "lodash/pick";
import React from "react";
import { ecnSubscrSchemaJoinFields } from "./ecnSubscrSchemaJoinFields";
import { useEcnSubscrSchemaColumns } from "./useEcnSubscrSchemaColumns";
import { ecnSubscrSchemaSearchableColumns } from "./ecnSubscrSchemaSearchableColumns";
import { useLiquidityManagerContext } from "../../../tools/liquidityManagerContext";
import { PageLoading } from "@ant-design/pro-layout";

export function ecnSubscriptionSchemaToDto<T extends Partial<EcnSubscrSchema>,
  R extends (EcnSubscrSchemaCreateDto | EcnSubscrSchemaUpdateDto)>(entity: T): R {
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
  } as R;
}

type TEcnSubscrSchemasTableProps = {
  connectSchemaId: number;
}

const EcnSubscrSchemasTable: React.FC<TEcnSubscrSchemasTableProps> = ({
  connectSchemaId,
}) => {
  const columns = useEcnSubscrSchemaColumns();
  const { isFullscreen } = useFullscreen();
  const { worker } = useLiquidityManagerContext();

  if (!worker) return <PageLoading />;

  return (
    <Table<EcnSubscrSchema, EcnSubscrSchemaCreateDto, EcnSubscrSchemaUpdateDto, {}, {
      connectSchemaId: number,
      worker: string,
    }, number>
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
        worker,
      }}
      params={{
        baseFilters: {
          connectSchemaId,
        },
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
