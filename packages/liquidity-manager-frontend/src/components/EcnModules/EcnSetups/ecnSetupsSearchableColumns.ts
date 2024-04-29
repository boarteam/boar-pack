import { Operators } from "@jifeon/boar-pack-common-frontend";

export const ecnSetupsSearchableColumns = [
  {
    field: 'label',
    operator: Operators.containsLow,
  },
  {
    field: ['modules', 'name'],
    operator: Operators.containsLow,
  }
];
