import { Operators } from "@jifeon/boar-pack-common-frontend";

export const usersInstSearchableColumns = [
  { field: 'name', operator: Operators.containsLow, },
  {
    field: 'group',
    searchField: 'group.name',
    filterField: 'group.id',
    operator: Operators.containsLow,
    filterOperator: Operators.in,
  },
  { field: ['action', 'name'], operator: Operators.containsLow, },
  { field: 'userComment', operator: Operators.containsLow, },
  { field: 'leverage', operator: Operators.containsLow, },
  { field: 'balance', operator: Operators.containsLow, },
  { field: 'credit', operator: Operators.containsLow, },
  { field: 'margin', operator: Operators.containsLow, },
  { field: 'freeMargin', operator: Operators.containsLow, },
  { field: 'marginLevel', operator: Operators.containsLow, },
  { field: 'marginWithLimits', operator: Operators.containsLow, },
  { field: 'profitloss', operator: Operators.containsLow, },
  { field: 'swap', operator: Operators.containsLow, },
  { field: 'stopoutHash', operator: Operators.containsLow, },
  { field: 'stopoutName', operator: Operators.containsLow, },
  { field: 'stopoutSuppressTime', operator: Operators.containsLow, },
  { field: 'stopoutGenerationTime', operator: Operators.containsLow, },
  {
    field: 'module',
    searchField: 'module.name',
    filterField: 'module.id',
    operator: Operators.containsLow,
    filterOperator: Operators.in,
  },
  {
    field: 'marginModule',
    searchField: 'marginModule.name',
    filterField: 'marginModule.id',
    operator: Operators.containsLow,
    filterOperator: Operators.in,
  },
  { field: 'commission', operator: Operators.containsLow, },
  { field: 'commissionValue', operator: Operators.containsLow, },
  { field: ['commissionType', 'name'], operator: Operators.containsLow, },
  { field: ['commissionLotsMode', 'name'], operator: Operators.containsLow, },
  { field: 'commissionTurnover', operator: Operators.containsLow, },
  { field: 'rolloverTime', operator: Operators.containsLow, },
  { field: ['company', 'name'], operator: Operators.containsLow, },
  { field: 'trId', operator: Operators.containsLow, },
  { field: 'hedgeFactor', operator: Operators.containsLow, },
  {
    field: 'enabled',
    operator: Operators.equals,
  },
  { field: 'ts', operator: Operators.containsLow, },
  { field: 'tsMs', operator: Operators.containsLow, },
];
