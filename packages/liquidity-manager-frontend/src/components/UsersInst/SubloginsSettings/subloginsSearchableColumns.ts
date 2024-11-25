import { Operators } from "@jifeon/boar-pack-common-frontend";

export const subloginsSearchableColumns = [
  ...[
    'hedgeMultiplier',
    'spreadLimit',
    'minVolumeForABook',
    'spreadLimitOnRollover',
    'instrumentPriorityFlag',
    'markupBid',
    'markupAsk',
    'alias',
    'demi',
    'dema',
    'hedgeAmount',
    'hedgeStep',
    ['instrumentRel', 'name'],
    ['instrumentRel', 'priceDigits'],
    ['hedgeCurrency', 'name'],
  ].map(field => ({
    field,
    operator: Operators.containsLow,
  })),
  {
    field: 'instrumentRel,instrumentGroup',
    searchField: 'instrumentRel.instrumentGroup.name',
    filterField: 'instrumentRel.instrumentGroup.id',
    operator: Operators.containsLow,
    filterOperator: Operators.in,
  },
  {
    field: 'usersSubAccountInstId',
    operator: Operators.equals,
  },
]
