import { Operators } from "@jifeon/boar-pack-common-frontend";
import { TSearchableColumn } from "@jifeon/boar-pack-common-frontend";

export const ecnInstrumentSearchableColumns: TSearchableColumn[] = [
  { field: 'name', operator: Operators.containsLow, },
  { field: 'descr', operator: Operators.containsLow, },
  { field: ['marginMode', 'name'], operator: Operators.containsLow, },
  { field: 'basis', operator: Operators.containsLow, },
  { field: 'commission', operator: Operators.containsLow, },
  { field: 'commissionAgent', operator: Operators.containsLow, },
  { field: ['commissionAgentLotsMode', 'name'], operator: Operators.containsLow, },
  { field: ['commissionAgentType', 'name'], operator: Operators.containsLow, },
  { field: ['commissionLotsMode', 'name'], operator: Operators.containsLow, },
  { field: ['commissionType', 'name'], operator: Operators.containsLow, },
  { field: 'contractSize', operator: Operators.containsLow, },
  { field: 'currency', operator: Operators.containsLow, },
  { field: 'expirationDatetime', operator: Operators.containsLow, },
  {
    field: 'instrumentGroup',
    searchField: 'instrumentGroup.name',
    filterField: 'instrumentGroup.id',
    operator: Operators.containsLow,
    filterOperator: Operators.in,
  },
  { field: 'instrumentHash', operator: Operators.containsLow, },
  { field: 'marginCurrency', operator: Operators.containsLow, },
  { field: 'marginDivider', operator: Operators.containsLow, },
  { field: 'marginHedged', operator: Operators.containsLow, },
  { field: 'marginInitial', operator: Operators.containsLow, },
  { field: 'marginMaintenance', operator: Operators.containsLow, },
  { field: 'maxQuoteDeviation', operator: Operators.containsLow, },
  { field: 'maxQuoteTimeDeviation', operator: Operators.containsLow, },
  { field: 'priceDigits', operator: Operators.containsLow, },
  { field: 'priceLiquidityLimit', operator: Operators.containsLow, },
  { field: ['profitMode', 'name'], operator: Operators.containsLow, },
  { field: 'startExpirationDatetime', operator: Operators.containsLow, },
  { field: 'swapEnable', operator: Operators.containsLow, },
  { field: 'swapLimit', operator: Operators.containsLow, },
  { field: 'swapLong', operator: Operators.containsLow, },
  { field: ['swapRollover3Days', 'name'], operator: Operators.containsLow, },
  { field: 'swapShort', operator: Operators.containsLow, },
  { field: ['swapType', 'name'], operator: Operators.containsLow, },
  { field: 'tickPrice', operator: Operators.containsLow, },
  { field: 'tickSize', operator: Operators.containsLow, },
  { field: 'tsPriceLiquidityLimit', operator: Operators.containsLow, },
];