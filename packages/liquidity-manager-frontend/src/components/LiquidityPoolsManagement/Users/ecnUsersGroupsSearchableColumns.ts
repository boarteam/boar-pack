import { Operators } from "@/components/Table/tableTools";

export const ecnUsersGroupsSearchableColumns = [
  'name',
  ['group', 'name'],
  'descr',
  ['company', 'name'],
  ['action', 'name'],
  ['currency', 'name'],
  'leverage',
  'marginCall',
  'marginStopout',
  'ts',
  'tsMs',
].map(field => ({
  field,
  operator: Operators.containsLow,
}));
