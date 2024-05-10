import { Operators, TSearchableColumn } from "@jifeon/boar-pack-common-frontend";

export const ecnSetupsSearchableColumns: TSearchableColumn[] = [
  {
    field: 'label',
    operator: Operators.containsLow,
  },
  {
    field: ['modules', 'name'],
    operator: Operators.containsLow,
  }
];
