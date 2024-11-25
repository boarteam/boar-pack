import { Operators, TSearchableColumn } from "@jifeon/boar-pack-common-frontend";

export const eventLogsSearchableColumns: TSearchableColumn[] = [
  {
    field: 'logType',
    searchField: null,
    operator: Operators.equals,
    filterOperator: Operators.in,
  },
  {
    field: 'serviceId',
    operator: Operators.containsLow,
  },
  {
    field: 'userRole',
    searchField: null,
    operator: Operators.equals,
    filterOperator: Operators.in,
  },
  {
    field: 'method',
    operator: Operators.containsLow,
    filterOperator: Operators.in,
  },
  {
    field: 'logLevel',
    searchField: null,
    operator: Operators.equals,
    filterOperator: Operators.in,
  },
  {
    field: 'service',
    operator: Operators.containsLow,
    filterOperator: Operators.in,
  },
  {
    field: 'user',
    searchField: 'user.name',
    filterField: 'user.id',
    operator: Operators.containsLow,
    filterOperator: Operators.in,
  },
  {
    field: 'externalUserId',
    operator: Operators.containsLow,
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
    field: 'url',
    operator: Operators.containsLow,
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
    field: 'duration',
    operator: Operators.equals,
    numeric: true,
  },
  {
    field: 'statusCode',
    operator: Operators.equals,
    numeric: true,
  },
  {
    field: 'createdAt',
    searchField: null,
    operator: Operators.equals,
    filterOperator: Operators.between,
  }
];
