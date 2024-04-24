import { Operators } from "@/components/Table/tableTools";

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
    field: 'usersSubAccountInstId',
    operator: Operators.equals,
  },
]
