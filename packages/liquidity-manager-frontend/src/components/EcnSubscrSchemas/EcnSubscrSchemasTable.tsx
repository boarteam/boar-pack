import { TTableProps, Table, useFullscreen } from "@jifeon/boar-pack-common-frontend";
import apiClient from '@@api/apiClient';
import { EcnSubscrSchema, EcnSubscrSchemaCreateDto, EcnSubscrSchemaUpdateDto } from "@@api/generated";
import pick from "lodash/pick";
import { ecnSubscrSchemaJoinFields } from "./ecnSubscrSchemaJoinFields";
import { useEcnSubscrSchemaColumns } from "./useEcnSubscrSchemaColumns";
import { ecnSubscrSchemaSearchableColumns } from "./ecnSubscrSchemaSearchableColumns";
import { useLiquidityManagerContext } from "../../tools/liquidityManagerContext";
import { PageLoading } from "@ant-design/pro-layout";
import { useAccess } from "umi";

export function ecnSubscriptionSchemaToDto<T extends Partial<EcnSubscrSchema>,
  R extends (EcnSubscrSchemaCreateDto | EcnSubscrSchemaUpdateDto)>(entity: T): R {
  return {
    ...pick(entity, [
      'markupBid',
      'markupAsk',
      'defaultMarkupBid',
      'defaultMarkupAsk',
      'minVolume',
      'maxVolume',
      'volumeStep',
      'instrumentWeight',
      'descr',
    ]),
    enabled: 'enabled' in entity ? entity.enabled ?? 0 : undefined,
    tradeEnabled: 'tradeEnabled' in entity ? entity.tradeEnabled ?? 0 : undefined,
    instrumentHash: entity.instrument?.instrumentHash,
    executionMode: entity.executionMode?.id,
    connectSchemaId: entity.connectSchema?.id,
  } as R;
}

export type TEcnSubscrSchemasTableProps<T> = Partial<TTableProps<EcnSubscrSchema, EcnSubscrSchemaCreateDto, EcnSubscrSchemaUpdateDto, {}, { worker: string } & T>>

function EcnSubscrSchemasTable<T = {}>(params: TEcnSubscrSchemasTableProps<T>) {
  const columns = useEcnSubscrSchemaColumns();
  const { isFullscreen } = useFullscreen();
  const { worker, liquidityManager } = useLiquidityManagerContext();
  const { canManageLiquidity } = useAccess() || {};

  if (!worker) return <PageLoading />;

  return (
    <Table<EcnSubscrSchema, EcnSubscrSchemaCreateDto, EcnSubscrSchemaUpdateDto, {}, { worker: string }>
      getAll={params => apiClient.ecnSubscrSchemas.getManyBaseEcnSubscrSchemaControllerEcnSubscrSchema(params)}
      onCreate={params => apiClient.ecnSubscrSchemas.createOneBaseEcnSubscrSchemaControllerEcnSubscrSchema(params)}
      onUpdate={params => apiClient.ecnSubscrSchemas.updateOneBaseEcnSubscrSchemaControllerEcnSubscrSchema({
        ...params,
        instrumentHash: params.requestBody.instrumentHash,
        connectSchemaId: params.requestBody.connectSchemaId,
      })}
      // @ts-ignore
      onUpdateMany={params => apiClient.ecnSubscrSchemas.updateMany(params)}
      // @ts-ignore
      onDeleteMany={params => apiClient.ecnSubscrSchemas.deleteMany(params)}
      onDelete={params => apiClient.ecnSubscrSchemas.deleteOneBaseEcnSubscrSchemaControllerEcnSubscrSchema({
        ...params,
        instrumentHash: params.instrumentHash,
        connectSchemaId: Number(params.connectSchemaId),
      })}
      entityToCreateDto={ecnSubscriptionSchemaToDto}
      entityToUpdateDto={ecnSubscriptionSchemaToDto}
      columns={columns}
      idColumnName={["instrumentHash", 'connectSchemaId']}
      scroll={{
        x: 'max-content',
      }}
      pathParams={{
        worker,
      }}
      params={{
        join: ecnSubscrSchemaJoinFields,
        sortMap: { executionMode: 'executionMode.name' },
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
      viewOnly={!canManageLiquidity(liquidityManager)}
      {...params}
    />
  );
}

export default EcnSubscrSchemasTable;
