import { Operators } from "@/components/Table/tableTools";

export const ecnModuleSearchableColumns = [
  {
    field: 'name',
    operator: Operators.containsLow,
  },
  {
    field: 'descr',
    operator: Operators.containsLow,
  },
  {
    field: ['type', 'name'],
    operator: Operators.containsLow,
  },
];
