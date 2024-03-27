import { Operators } from "@/components/Table/tableTools";

export const ecnModuleSearchableColumns = [
  {
    field: 'id',
    operator: Operators.containsLow,
  },
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
