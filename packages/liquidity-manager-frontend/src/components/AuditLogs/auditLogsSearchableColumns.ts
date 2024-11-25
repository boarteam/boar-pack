import { Operators, TSearchableColumn } from "@jifeon/boar-pack-common-frontend";

export const auditLogsSearchableColumns: TSearchableColumn[] = [
  {
    field: 'logLevel',
    searchField: null,
    operator: Operators.equals,
    filterOperator: Operators.in,
  },
  {
    field: 'action',
    operator: Operators.containsLow,
  },
  {
    field: 'entity',
    operator: Operators.containsLow,
  },
  {
    field: 'entityId',
    operator: Operators.equals,
  },
  {
    field: 'ipAddress',
    operator: Operators.containsLow,
  },
  {
    field: 'userAgent',
    operator: Operators.containsLow,
  },
  {
    field: 'createdAt',
    searchField: null,
    operator: Operators.equals,
    filterOperator: Operators.between,
  }
];
