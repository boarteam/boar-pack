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
    field: 'usersSubAccountInstId',
    operator: Operators.equals,
  },
]
