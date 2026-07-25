import { describe, expect, it, vi } from 'vitest';

// The published dist of common-frontend deep-requires antd/es/form/Form, which
// Node cannot load natively (require(esm) with directory imports); redirect the
// package to its sources so vite processes the whole chain.
vi.mock('@boarteam/boar-pack-common-frontend', () => import('../../../../common-frontend/src'));

import { Operators } from '@boarteam/boar-pack-common-frontend';
import { eventLogsSearchableColumns } from './eventLogsSearchableColumns';

const byField = new Map(eventLogsSearchableColumns.map((col) => [col.field, col]));

describe('eventLogsSearchableColumns', () => {
  it('covers exactly the searchable event log fields', () => {
    expect(eventLogsSearchableColumns.map((col) => col.field)).toEqual([
      'logType',
      'serviceId',
      'userRole',
      'method',
      'logLevel',
      'service',
      'user',
      'externalUserId',
      'action',
      'entity',
      'entityId',
      'url',
      'ipAddress',
      'userAgent',
      'duration',
      'statusCode',
      'createdAt',
    ]);
  });

  it('excludes enum-like fields from keyword search via searchField null', () => {
    for (const field of ['logType', 'userRole', 'logLevel', 'createdAt']) {
      expect(byField.get(field)?.searchField, field).toBeNull();
    }
  });

  it('filters enum-like fields with the "in" operator', () => {
    for (const field of ['logType', 'userRole', 'logLevel', 'method', 'service', 'user']) {
      expect(byField.get(field)?.filterOperator, field).toBe(Operators.in);
    }
  });

  it('searches the joined user by name but filters it by id', () => {
    expect(byField.get('user')).toEqual({
      field: 'user',
      searchField: 'user.name',
      filterField: 'user.id',
      operator: Operators.containsLow,
      filterOperator: Operators.in,
    });
  });

  it('marks numeric fields so keyword search skips non-numbers', () => {
    expect(byField.get('duration')).toEqual({
      field: 'duration',
      operator: Operators.equals,
      numeric: true,
    });
    expect(byField.get('statusCode')).toEqual({
      field: 'statusCode',
      operator: Operators.equals,
      numeric: true,
    });
  });

  it('filters createdAt with a between range', () => {
    expect(byField.get('createdAt')).toEqual({
      field: 'createdAt',
      searchField: null,
      operator: Operators.equals,
      filterOperator: Operators.between,
    });
  });

  it('uses case-insensitive contains for free-text fields', () => {
    for (const field of [
      'serviceId',
      'method',
      'service',
      'externalUserId',
      'action',
      'entity',
      'url',
      'ipAddress',
      'userAgent',
    ]) {
      expect(byField.get(field)?.operator, field).toBe(Operators.containsLow);
    }
    expect(byField.get('entityId')?.operator).toBe(Operators.equals);
  });
});
