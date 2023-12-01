import Table from "../../Table/Table";
import apiClient from "../../../tools/client/apiClient";
import { EcnInstrument, EcnInstrumentCreateDto, EcnInstrumentUpdateDto } from "../../../tools/api";
import { useEcnInstrumentsColumns } from "./useEcnInstrumentsColumns";
import pick from "lodash/pick";
import { useMemo } from "react";
import { getDefaultColumnsState, Operators } from "../../Table/tableTools";
import { ecnInstrumentJoinFields } from "./ecnInstrumentJoinFields";

export function ecnInstrumentToDto(entity: Partial<EcnInstrument>) {
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
      'swapLimit',
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
  };
}

type TEcnInstrumentFilterParams = {
  name?: string,
  descr?: string,
}

const defaultDisplayedColumns = new Set<keyof EcnInstrument>([
  'name',
  'descr',
  'priceDigits',
  'priceLiquidityLimit',
  'swapLong',
  'swapShort',
  'marginCurrency',
  'currency',
  'instrumentGroup',
]);


const EcnInstrumentsTable = () => {
  const columns = useEcnInstrumentsColumns();
  const defaultColumnsState = useMemo(() => getDefaultColumnsState<EcnInstrument>(columns, defaultDisplayedColumns), [columns]);

  return (
    <Table<EcnInstrument, EcnInstrumentCreateDto, EcnInstrumentUpdateDto, TEcnInstrumentFilterParams, {}, number>
      getAll={params => apiClient.ecnInstruments.getManyBaseEcnInstrumentsControllerEcnInstrument(params)}
      onUpdate={params => apiClient.ecnInstruments.updateOneBaseEcnInstrumentsControllerEcnInstrument(params)}
      onDelete={params => apiClient.ecnInstruments.deleteOneBaseEcnInstrumentsControllerEcnInstrument(params)}
      // todo: uncomment once proper relational objects are returned
      // @ts-ignore
      entityToCreateDto={ecnInstrumentToDto}
      // @ts-ignore
      entityToUpdateDto={ecnInstrumentToDto}
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
