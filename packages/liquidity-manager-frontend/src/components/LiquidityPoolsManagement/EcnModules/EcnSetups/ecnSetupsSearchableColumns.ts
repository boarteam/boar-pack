import { Operators } from "@/components/Table/tableTools";

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
