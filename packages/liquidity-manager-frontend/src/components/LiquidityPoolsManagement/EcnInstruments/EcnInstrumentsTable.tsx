import Table from "../../Table/Table";
import apiClient from "../../../tools/client/apiClient";
import { EcnInstrument, EcnInstrumentCreateDto, EcnInstrumentUpdateDto } from "../../../tools/api";
import { useEcnInstrumentsColumns } from "./useEcnInstrumentsColumns";
import pick from "lodash/pick";
import { Operators } from "../../Table/tableTools";
import { ecnInstrumentJoinFields } from "./ecnInstrumentJoinFields";
import { TColumnsSet } from "../../Table/useColumnsSets";

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

type TEcnInstrumentFilterParams = {
  name?: string,
  descr?: string,
}

const columnsSets: TColumnsSet<EcnInstrument>[] = [
  {
    name: 'Default Columns',
    columns: [
      'name',
      'descr',
      'priceDigits',
      'priceLiquidityLimit',
      'swapLong',
      'swapShort',
      'marginCurrency',
      'currency',
      'instrumentGroup',
    ],
  },
  {
    name: 'Swap Columns',
    columns: [
      'name',
      'swapEnable',
      'swapType',
      'swapRollover3Days',
      'swapLong',
      'swapShort',
      'swapLimit',
    ],
  }
];

const EcnInstrumentsTable = () => {
  const columns = useEcnInstrumentsColumns();

  return (
    <Table<EcnInstrument, EcnInstrumentCreateDto, EcnInstrumentUpdateDto, TEcnInstrumentFilterParams, {}, number>
      getAll={params => apiClient.ecnInstruments.getManyBaseEcnInstrumentsControllerEcnInstrument(params)}
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
      pathParams={{}}
      params={{
        join: ecnInstrumentJoinFields,
      }}
      defaultSort={['name', 'ASC']}
      searchableColumns={[
        {
          field: 'name',
          operator: Operators.containsLow,
        },
        {
          field: 'descr',
          operator: Operators.containsLow,
        },
      ]}
      // do not allow creation here
      viewOnly
    />
  );
}

export default EcnInstrumentsTable;
