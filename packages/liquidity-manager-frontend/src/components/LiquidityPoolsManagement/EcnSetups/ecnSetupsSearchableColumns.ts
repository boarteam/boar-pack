import { Operators } from "@/components/Table/tableTools";
import { TSearchableColumn } from "@/components/Table/tableTypes";

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
