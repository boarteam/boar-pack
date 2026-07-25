import { describe, expect, it } from 'vitest';
import { CondOperator } from '@nestjsx/crud-request';
import {
  applyKeywordToSearch,
  buildFieldsFromColumns,
  buildJoinFields,
  collectFieldsFromColumns,
  getFiltersSearch,
  Operators,
  withNumericId,
} from './tableTools';
import { TSearchableColumn } from './tableTypes';

const VALID_UUID = '3f8a7e2a-9c4b-4e5d-8f6a-1b2c3d4e5f6a';

describe('Operators', () => {
  it('maps to @nestjsx/crud-request CondOperator values', () => {
    expect(Operators).toEqual({
      containsLow: '$contL',
      contains: '$cont',
      equals: '$eq',
      in: '$in',
      inLow: '$inL',
      between: '$between',
      greaterOrEquals: '$gte',
      lowerOrEquals: '$lte',
      isNull: '$isnull',
      notNull: '$notnull',
      starts: '$starts',
    });
  });

  it('stays in sync with the CondOperator enum', () => {
    expect(Operators.containsLow).toBe(CondOperator.CONTAINS_LOW);
    expect(Operators.contains).toBe(CondOperator.CONTAINS);
    expect(Operators.equals).toBe(CondOperator.EQUALS);
    expect(Operators.in).toBe(CondOperator.IN);
    expect(Operators.inLow).toBe(CondOperator.IN_LOW);
    expect(Operators.between).toBe(CondOperator.BETWEEN);
    expect(Operators.greaterOrEquals).toBe(CondOperator.GREATER_THAN_EQUALS);
    expect(Operators.lowerOrEquals).toBe(CondOperator.LOWER_THAN_EQUALS);
    expect(Operators.isNull).toBe(CondOperator.IS_NULL);
    expect(Operators.notNull).toBe(CondOperator.NOT_NULL);
    expect(Operators.starts).toBe(CondOperator.STARTS);
  });
});

describe('getFiltersSearch', () => {
  const nameColumn: TSearchableColumn = { field: 'name', operator: Operators.containsLow };
  const emailColumn: TSearchableColumn = { field: 'email', operator: Operators.containsLow };

  it('returns an empty $and when there are no filters', () => {
    expect(getFiltersSearch({ searchableColumns: [nameColumn, emailColumn] })).toEqual({
      $and: [],
    });
  });

  it('builds a condition per filtered column using the column operator', () => {
    const search = getFiltersSearch({
      filters: { name: 'alice', email: 'a@b.c' },
      searchableColumns: [nameColumn, emailColumn],
    });

    expect(search).toEqual({
      $and: [{ name: { $contL: 'alice' } }, { email: { $contL: 'a@b.c' } }],
    });
  });

  it('skips columns whose value is empty string or undefined', () => {
    const search = getFiltersSearch({
      filters: { name: '' },
      searchableColumns: [nameColumn, emailColumn],
    });

    expect(search).toEqual({ $and: [] });
  });

  it('prefers filters over baseFilters for the same field', () => {
    const search = getFiltersSearch({
      baseFilters: { name: 'base' },
      filters: { name: 'override' },
      searchableColumns: [nameColumn],
    });

    expect(search).toEqual({ $and: [{ name: { $contL: 'override' } }] });
  });

  it('joins array fields with a dot and honors filterField/filterOperator overrides', () => {
    const search = getFiltersSearch({
      filters: { 'user.name': 'bob', name: 'x' },
      searchableColumns: [
        { field: ['user', 'name'], operator: Operators.containsLow },
        {
          field: 'name',
          filterField: 'profile.name',
          filterOperator: Operators.equals,
          operator: Operators.containsLow,
        },
      ],
    });

    expect(search).toEqual({
      $and: [{ 'user.name': { $contL: 'bob' } }, { 'profile.name': { $eq: 'x' } }],
    });
  });

  it('drops numeric columns with non-numeric values and keeps numeric ones', () => {
    const numericColumn: TSearchableColumn = {
      field: 'age',
      operator: Operators.equals,
      numeric: true,
    };

    expect(
      getFiltersSearch({ filters: { age: 'abc' }, searchableColumns: [numericColumn] }),
    ).toEqual({ $and: [] });
    expect(
      getFiltersSearch({ filters: { age: '42' }, searchableColumns: [numericColumn] }),
    ).toEqual({ $and: [{ age: { $eq: '42' } }] });
  });

  it('drops a numeric filter with value 0 (current behavior: falsy filter values are ignored)', () => {
    // `filters[key] || baseFilters[key]` treats 0/false as absent, so filtering by 0 is impossible.
    const numericColumn: TSearchableColumn = {
      field: 'age',
      operator: Operators.equals,
      numeric: true,
    };

    expect(getFiltersSearch({ filters: { age: 0 }, searchableColumns: [numericColumn] })).toEqual({
      $and: [],
    });
  });

  it('validates uuid columns', () => {
    const uuidColumn: TSearchableColumn = {
      field: 'ownerId',
      operator: Operators.equals,
      uuid: true,
    };

    expect(
      getFiltersSearch({ filters: { ownerId: 'not-a-uuid' }, searchableColumns: [uuidColumn] }),
    ).toEqual({ $and: [] });
    expect(
      getFiltersSearch({ filters: { ownerId: 123 }, searchableColumns: [uuidColumn] }),
    ).toEqual({ $and: [] });
    expect(
      getFiltersSearch({ filters: { ownerId: VALID_UUID }, searchableColumns: [uuidColumn] }),
    ).toEqual({ $and: [{ ownerId: { $eq: VALID_UUID } }] });
  });

  describe('between operator', () => {
    const betweenColumn: TSearchableColumn = { field: 'amount', operator: Operators.between };

    it('keeps $between when both bounds are set', () => {
      expect(
        getFiltersSearch({ filters: { amount: [3, 9] }, searchableColumns: [betweenColumn] }),
      ).toEqual({ $and: [{ amount: { $between: [3, 9] } }] });
    });

    it('degrades to $lte when the lower bound is missing', () => {
      expect(
        getFiltersSearch({
          filters: { amount: [undefined as any, 9] },
          searchableColumns: [betweenColumn],
        }),
      ).toEqual({ $and: [{ amount: { $lte: 9 } }] });
    });

    it('degrades to $gte when the upper bound is missing', () => {
      expect(
        getFiltersSearch({
          filters: { amount: [3, undefined as any] },
          searchableColumns: [betweenColumn],
        }),
      ).toEqual({ $and: [{ amount: { $gte: 3 } }] });
    });

    it('drops a numeric between column even with two valid bounds (current behavior)', () => {
      // The numeric guard runs Number([3, 9]) -> NaN before the between handling,
      // so a numeric+between column can never receive a two-bound range.
      const numericBetween: TSearchableColumn = {
        field: 'amount',
        operator: Operators.between,
        numeric: true,
      };

      expect(
        getFiltersSearch({ filters: { amount: [3, 9] }, searchableColumns: [numericBetween] }),
      ).toEqual({ $and: [] });
    });
  });

  describe('null-ish operators', () => {
    it('unwraps arrays for $isnull and flips to $notnull when the value is not true', () => {
      const column: TSearchableColumn = { field: 'archivedAt', operator: Operators.isNull };

      expect(
        getFiltersSearch({ filters: { archivedAt: [true] }, searchableColumns: [column] }),
      ).toEqual({ $and: [{ archivedAt: { $isnull: true } }] });
      expect(
        getFiltersSearch({ filters: { archivedAt: [false] }, searchableColumns: [column] }),
      ).toEqual({ $and: [{ archivedAt: { $notnull: true } }] });
    });

    it('flips $notnull to $isnull when the value is not true', () => {
      const column: TSearchableColumn = { field: 'deletedAt', operator: Operators.notNull };

      expect(
        getFiltersSearch({ filters: { deletedAt: [true] }, searchableColumns: [column] }),
      ).toEqual({ $and: [{ deletedAt: { $notnull: true } }] });
      expect(
        getFiltersSearch({ filters: { deletedAt: [false] }, searchableColumns: [column] }),
      ).toEqual({ $and: [{ deletedAt: { $isnull: true } }] });
    });

    it('turns a single-null $in selection into $isnull', () => {
      const column: TSearchableColumn = { field: 'tag', operator: Operators.in };

      expect(
        getFiltersSearch({ filters: { tag: ['a', 'b'] }, searchableColumns: [column] }),
      ).toEqual({ $and: [{ tag: { $in: ['a', 'b'] } }] });
      expect(getFiltersSearch({ filters: { tag: [null] }, searchableColumns: [column] })).toEqual({
        $and: [{ tag: { $isnull: true } }],
      });
    });

    it('turns an equals filter for null into $isnull', () => {
      const column: TSearchableColumn = { field: 'role', operator: Operators.equals };

      expect(getFiltersSearch({ filters: { role: [null] }, searchableColumns: [column] })).toEqual({
        $and: [{ role: { $isnull: true } }],
      });
      // null in filters is falsy and falls back to baseFilters
      expect(
        getFiltersSearch({ baseFilters: { role: null }, searchableColumns: [column] }),
      ).toEqual({ $and: [{ role: { $isnull: true } }] });
    });
  });

  it('throws when a filter key has no matching searchable column', () => {
    expect(() =>
      getFiltersSearch({
        filters: { rogue: 'x' },
        searchableColumns: [nameColumn],
      }),
    ).toThrow('Some filters are not defined in searchableColumns: rogue');
  });

  it('throws for unknown baseFilters keys too', () => {
    expect(() =>
      getFiltersSearch({
        baseFilters: { hidden: 1 },
        searchableColumns: [],
      }),
    ).toThrow('Some filters are not defined in searchableColumns: hidden');
  });
});

describe('applyKeywordToSearch', () => {
  const columns: TSearchableColumn[] = [
    { field: 'name', operator: Operators.containsLow },
    { field: 'email', operator: Operators.contains },
  ];

  it('returns the original search when there is no keyword', () => {
    const search = { $and: [] };
    expect(applyKeywordToSearch(search, columns)).toBe(search);
    expect(applyKeywordToSearch(search, columns, undefined, '')).toBe(search);
  });

  it('adds an $or across searchable columns and keeps existing conditions', () => {
    const search = { $and: [{ name: { $contL: 'x' } }] };

    expect(applyKeywordToSearch(search, columns, undefined, 'joe')).toEqual({
      $and: [
        { name: { $contL: 'x' } },
        {
          $or: [{ name: { $contL: 'joe' } }, { email: { $cont: 'joe' } }],
        },
      ],
    });
  });

  it('adds one $or group per word of the keyword', () => {
    const result = applyKeywordToSearch({ $and: [] }, columns, undefined, 'foo bar');

    expect(result).toEqual({
      $and: [
        { $or: [{ name: { $contL: 'foo' } }, { email: { $cont: 'foo' } }] },
        { $or: [{ name: { $contL: 'bar' } }, { email: { $cont: 'bar' } }] },
      ],
    });
  });

  it('skips columns with searchField === null and honors searchField overrides', () => {
    const result = applyKeywordToSearch(
      { $and: [] },
      [
        { field: 'internal', searchField: null, operator: Operators.containsLow },
        { field: 'name', searchField: 'displayName', operator: Operators.containsLow },
      ],
      undefined,
      'joe',
    );

    expect(result).toEqual({
      $and: [{ $or: [{ displayName: { $contL: 'joe' } }] }],
    });
  });

  it('joins array fields with a dot in the search condition', () => {
    const result = applyKeywordToSearch(
      { $and: [] },
      [{ field: ['user', 'name'], operator: Operators.containsLow }],
      undefined,
      'joe',
    );

    expect(result).toEqual({
      $and: [{ $or: [{ 'user.name': { $contL: 'joe' } }] }],
    });
  });

  it('skips columns hidden by columnsState (keyed by comma-joined field)', () => {
    const result = applyKeywordToSearch(
      { $and: [] },
      [
        { field: 'name', operator: Operators.containsLow },
        { field: ['user', 'name'], operator: Operators.containsLow },
      ],
      {
        name: { show: false },
        'user,name': { show: true },
      },
      'joe',
    );

    expect(result).toEqual({
      $and: [{ $or: [{ 'user.name': { $contL: 'joe' } }] }],
    });
  });

  it('applies numeric and uuid guards per word', () => {
    const guardedColumns: TSearchableColumn[] = [
      { field: 'name', operator: Operators.containsLow },
      { field: 'age', operator: Operators.equals, numeric: true },
      { field: 'ownerId', operator: Operators.equals, uuid: true },
    ];

    expect(applyKeywordToSearch({ $and: [] }, guardedColumns, undefined, 'joe')).toEqual({
      $and: [{ $or: [{ name: { $contL: 'joe' } }] }],
    });
    expect(applyKeywordToSearch({ $and: [] }, guardedColumns, undefined, '42')).toEqual({
      $and: [
        {
          $or: [{ name: { $contL: '42' } }, { age: { $eq: '42' } }],
        },
      ],
    });
    expect(applyKeywordToSearch({ $and: [] }, guardedColumns, undefined, VALID_UUID)).toEqual({
      $and: [
        {
          $or: [{ name: { $contL: VALID_UUID } }, { ownerId: { $eq: VALID_UUID } }],
        },
      ],
    });
  });

  it('throws when the filter search has no $and array', () => {
    expect(() => applyKeywordToSearch({} as any, columns, undefined, 'joe')).toThrow(
      'Bad format of filter search',
    );
  });
});

describe('buildFieldsFromColumns / collectFieldsFromColumns', () => {
  it('collects string dataIndexes, skipping the id column, join fields and non-strings', () => {
    const columns = [
      { dataIndex: 'name' },
      { dataIndex: 'id' },
      { dataIndex: ['profile', 'age'] },
      { dataIndex: undefined },
      { dataIndex: 'user' },
      { dataIndex: 42 as any },
    ];

    const fields = buildFieldsFromColumns(columns, 'id', new Set(['user']));

    expect(Array.from(fields)).toEqual(['name', 'profile']);
  });

  it('recurses into children columns and keeps a parent dataIndex too', () => {
    const columns = [
      {
        dataIndex: 'group',
        children: [{ dataIndex: 'child1' }, { dataIndex: 'child2' }],
      },
      { dataIndex: 'plain' },
    ];

    const fields = buildFieldsFromColumns(columns, 'id');

    expect(Array.from(fields)).toEqual(['child1', 'child2', 'group', 'plain']);
  });

  it('supports composite id columns given as an array', () => {
    const columns = [{ dataIndex: 'id' }, { dataIndex: 'version' }, { dataIndex: 'name' }];

    const fields = buildFieldsFromColumns(columns, ['id', 'version']);

    expect(Array.from(fields)).toEqual(['name']);
  });

  it('collectFieldsFromColumns returns a single comma-joined entry', () => {
    const columns = [{ dataIndex: 'name' }, { dataIndex: 'email' }, { dataIndex: 'id' }];

    expect(collectFieldsFromColumns(columns, 'id')).toEqual(['name,email']);
  });

  it('collectFieldsFromColumns handles undefined columns', () => {
    expect(collectFieldsFromColumns(undefined, 'id')).toEqual(['']);
  });
});

describe('buildJoinFields', () => {
  it('returns empty results without a join', () => {
    expect(buildJoinFields()).toEqual({ joinSelect: [], joinFields: new Set() });
  });

  it('normalizes a single join object and appends selected fields', () => {
    const { joinSelect, joinFields } = buildJoinFields({
      field: 'user',
      select: ['name', 'email'],
    });

    expect(joinSelect).toEqual(['user||name,email']);
    expect(joinFields).toEqual(new Set(['user']));
  });

  it('handles an array of joins with and without select', () => {
    const { joinSelect, joinFields } = buildJoinFields([
      { field: 'account' },
      { field: 'profile', select: ['age'] },
    ]);

    expect(joinSelect).toEqual(['account', 'profile||age']);
    expect(joinFields).toEqual(new Set(['account', 'profile']));
  });
});

describe('withNumericId', () => {
  it('converts a string id to a number and keeps other props', () => {
    const entity = { id: '42', name: 'answer' };

    expect(withNumericId(entity)).toEqual({ id: 42, name: 'answer' });
  });

  it('does not mutate the original entity', () => {
    const entity = { id: '7' };
    const result = withNumericId(entity);

    expect(entity.id).toBe('7');
    expect(result).not.toBe(entity);
  });
});
