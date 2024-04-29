import { Table, TColumnsSet } from "@jifeon/boar-pack-common-frontend";
import apiClient from '@api/apiClient';
import { EcnInstrument, EcnInstrumentCreateDto, EcnInstrumentUpdateDto } from "@api/generated";
import { useEcnInstrumentsColumns } from "./useEcnInstrumentsColumns";
import pick from "lodash/pick";
import { ecnInstrumentJoinFields } from "./ecnInstrumentJoinFields";
import { useAccess } from "@umijs/max";
import { ecnInstrumentSearchableColumns } from "./ecnInstrumentSearchableColumns";
import { useLiquidityManagerContext } from "../../tools/liquidityManagerContext";
import { PageLoading } from "@ant-design/pro-layout";

export function ecnInstrumentToDto<
  T extends Partial<EcnInstrument>,
  R extends EcnInstrumentCreateDto | EcnInstrumentUpdateDto
>(entity: T): R {
  return {
    ...pick(entity, [
      'instrumentHash',
      'name',
      'descr',
      'priceDigits',
      'priceLiquidityLimit',
      'maxQuoteDeviation',
      'maxQuoteTimeDeviation',
      'contractSize',
      'swapEnable',
      'swapType',
      'swapRollover3Days',
      'swapLong',
      'swapShort',
      'swapLimit',
      'tickPrice',
      'tickSize',
      'commission',
      'commissionType',
      'commissionLotsMode',
      'commissionAgent',
      'commissionAgentType',
      'commissionAgentLotsMode',
      'profitMode',
      'marginMode',
      'marginInitial',
      'marginMaintenance',
      'marginHedged',
      'marginDivider',
      'marginCurrency',
      'tsPriceLiquidityLimit',
      'currency',
      'startExpirationDatetime',
      'expirationDatetime',
      'basis',
      'delBandOnAbookNos',
      'delBandOnBbookNos',
    ]),
    instrumentGroup: entity.instrumentGroup?.id,
    swapType: entity.swapType?.id,
    swapRollover3Days: entity.swapRollover3Days?.id,
    commissionType: entity.commissionType?.id,
    commissionLotsMode: entity.commissionLotsMode?.id,
    commissionAgentType: entity.commissionAgentType?.id,
    commissionAgentLotsMode: entity.commissionAgentLotsMode?.id,
    profitMode: entity.profitMode?.id,
    marginMode: entity.marginMode?.id,
  } as R;
}

const columnsSets: TColumnsSet<EcnInstrument>[] = [
  {
    name: 'Default Columns',
    columns: [
      'name',
      'descr',
      // @ts-ignore-next-line
      'price_group',
      'priceDigits',
      'priceLiquidityLimit',
      // @ts-ignore-next-line
      'swap_group',
      'swapLong',
      'swapShort',
      // @ts-ignore-next-line
      'margin_group',
      'marginDivider',
      'marginCurrency',
      'currency',
      'instrumentGroup',
    ],
  },
  {
    name: 'Swap Columns',
    columns: [
      'name',
      // @ts-ignore-next-line
      'swap_group',
      'swapEnable',
      'swapType',
      'swapRollover3Days',
      'swapLong',
      'swapShort',
      'swapLimit',
    ],
  },
  {
    name: 'Spread Limits',
    columns: [
      'name',
      'priceDigits',
      // @ts-ignore-next-line
      'price_group',
      'priceLiquidityLimit',
      'tsPriceLiquidityLimit'
    ],
  },
  {
    name: 'Margin',
    columns: [
      'name',
      // @ts-ignore-next-line
      'margin_group',
      'marginDivider',
      'marginMode',
      'marginHedged',
      'marginCurrency',
    ],
  }
];

const EcnInstrumentsTable = () => {
  const columns = useEcnInstrumentsColumns();
  const { canManageLiquidity } = useAccess() || {};
  const { worker } = useLiquidityManagerContext();

  if (!worker) return <PageLoading />;

  return (
    <Table<EcnInstrument, EcnInstrumentCreateDto, EcnInstrumentUpdateDto, {}, { worker: string }, number>
      getAll={params => apiClient.ecnInstruments.getManyBaseEcnInstrumentsControllerEcnInstrument(params)}
      onCreate={params => apiClient.ecnInstruments.createOneBaseEcnInstrumentsControllerEcnInstrument(params)}
      onUpdate={params => apiClient.ecnInstruments.updateOneBaseEcnInstrumentsControllerEcnInstrument(params)}
      onDelete={params => apiClient.ecnInstruments.deleteOneBaseEcnInstrumentsControllerEcnInstrument(params)}
      entityToCreateDto={ecnInstrumentToDto}
      entityToUpdateDto={ecnInstrumentToDto}
      columns={columns}
      idColumnName="instrumentHash"
      columnsSets={columnsSets}
      scroll={{
        x: 'max-content',
      }}
      createNewDefaultParams={{
        name: '',
        descr: undefined,
        priceDigits: 5,
        priceLiquidityLimit: '0',
        maxQuoteDeviation: 0,
        maxQuoteTimeDeviation: 0,
        contractSize: undefined,
        swapEnable: 0,
        swapType: undefined,
        swapRollover3Days: undefined,
        swapLong: '0',
        swapShort: '0',
        tickPrice: '0',
        tickSize: '0',
        commission: '0',
        commissionType: undefined,
        commissionLotsMode: undefined,
        commissionAgent: '0',
        commissionAgentType: undefined,
        commissionAgentLotsMode: undefined,
        profitMode: undefined,
        marginMode: undefined,
        marginInitial: '0',
        marginMaintenance: '0',
        marginHedged: '0',
        marginDivider: '0',
        marginCurrency: undefined,
        swapLimit: '0',
        tsPriceLiquidityLimit: '0',
        currency: undefined,
        startExpirationDatetime: undefined,
        expirationDatetime: undefined,
        basis: undefined,
        delBandOnAbookNos: 0,
        delBandOnBbookNos: 0,
      }}
      pathParams={{
        worker,
      }}
      params={{
        join: ecnInstrumentJoinFields,
      }}
      defaultSort={['name', 'ASC']}
      searchableColumns={ecnInstrumentSearchableColumns}
      viewOnly={!canManageLiquidity}
      popupCreation
    />
  );
}

export default EcnInstrumentsTable;
