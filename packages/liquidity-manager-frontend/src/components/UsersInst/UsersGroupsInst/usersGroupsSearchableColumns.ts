import { Operators } from "@jifeon/boar-pack-common-frontend";

export const usersGroupsSearchableColumns = [
  'name',
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
