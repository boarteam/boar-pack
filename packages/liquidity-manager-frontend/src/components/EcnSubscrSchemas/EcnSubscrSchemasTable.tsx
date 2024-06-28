import { TTableProps, Table, useFullscreen } from "@jifeon/boar-pack-common-frontend";
import apiClient from '@@api/apiClient';
import { EcnSubscrSchema, EcnSubscrSchemaCreateDto, EcnSubscrSchemaUpdateDto } from "@@api/generated";
import pick from "lodash/pick";
import React from "react";
import { ecnSubscrSchemaJoinFields } from "./ecnSubscrSchemaJoinFields";
import { useEcnSubscrSchemaColumns } from "./useEcnSubscrSchemaColumns";
import { ecnSubscrSchemaSearchableColumns } from "./ecnSubscrSchemaSearchableColumns";
import { useLiquidityManagerContext } from "../../tools/liquidityManagerContext";
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

type TEcnSubscrSchemasTableProps<T> = Partial<TTableProps<EcnSubscrSchema, EcnSubscrSchemaCreateDto, EcnSubscrSchemaUpdateDto, {}, { worker: string } & T>>

function EcnSubscrSchemasTable<T = {}>(params: TEcnSubscrSchemasTableProps<T>) {
  const columns = useEcnSubscrSchemaColumns();
  const { isFullscreen } = useFullscreen();
  const { worker } = useLiquidityManagerContext();

  if (!worker) return <PageLoading />;

  return (
    <Table<EcnSubscrSchema, EcnSubscrSchemaCreateDto, EcnSubscrSchemaUpdateDto, {}, { worker: string }>
      getAll={params => apiClient.ecnSubscrSchemas.getManyBaseEcnSubscrSchemaControllerEcnSubscrSchema(params)}
      onCreate={params => apiClient.ecnSubscrSchemas.createOneBaseEcnSubscrSchemaControllerEcnSubscrSchema(params)}
      // @ts-ignore-next-line
      onUpdate={params => apiClient.ecnSubscrSchemas.updateOneBaseEcnSubscrSchemaControllerEcnSubscrSchema(params)}
      // @ts-ignore-next-line
      onDelete={params => apiClient.ecnSubscrSchemas.deleteOneBaseEcnSubscrSchemaControllerEcnSubscrSchema(params)}
      entityToCreateDto={ecnSubscriptionSchemaToDto}
      entityToUpdateDto={ecnSubscriptionSchemaToDto}
      columns={columns}
      // idColumnName="instrumentHash"
      rowKey={(record) => `${record.instrumentHash}-${record.connectSchemaId}`}
      scroll={{
        x: 'max-content',
      }}
      pathParams={{
        worker,
      }}
      params={{
        join: ecnSubscrSchemaJoinFields,
      }}
      createNewDefaultParams={{
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
      ghost={!isFullscreen}
      {...params}
    />
  );
}

export default EcnSubscrSchemasTable;
