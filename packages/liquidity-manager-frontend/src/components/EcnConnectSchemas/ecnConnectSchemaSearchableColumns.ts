import { Operators } from "@jifeon/boar-pack-common-frontend";

export const ecnConnectSchemaSearchableColumns = [
  {
    field: 'id',
    operator: Operators.containsLow,
  },
  {
    field: 'descr',
    operator: Operators.containsLow,
  },
  {
    field: ['fromModule', 'name'],
    operator: Operators.containsLow,
  },
  {
    field: ['toModule', 'name'],
    operator: Operators.containsLow,
  },
];
