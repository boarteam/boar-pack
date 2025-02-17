import { CondOperator, QueryJoin, SCondition } from "@nestjsx/crud-request";
import { IWithId, TFilters, TSearchableColumn } from "./tableTypes";
import React, { Key } from "react";
import { TColumnsStates } from "./useColumnsSets";

export function getFiltersSearch({
  baseFilters = {},
  filters = {},
  searchableColumns,
}: {
  baseFilters?: TFilters,
  filters?: TFilters,
  searchableColumns: TSearchableColumn[],
}): SCondition {
  const filterKeys = new Set(Object.keys(filters).concat(Object.keys(baseFilters)));
  const search: SCondition = { '$and': [] };
  searchableColumns.forEach((col) => {
    const colDataIndex = Array.isArray(col.field) ? col.field.join('.') : col.field;
    const field = col.filterField || colDataIndex;
    let operator = col.filterOperator || col.operator;
    let value = filters[colDataIndex] || baseFilters[colDataIndex];
    filterKeys.delete(colDataIndex);
    if (value === '' || value === undefined || col.numeric && !Number.isFinite(Number(value))) {
      return;
    }

    switch (operator) {
      case Operators.between:
        if (Array.isArray(value)) {
          if (value?.[0] === undefined) {
            operator = Operators.lowerOrEquals;
            value = value?.[1];
          } else if (value?.[1] === undefined) {
            operator = Operators.greaterOrEquals;
            value = value?.[0];
          }
        }
        break;

      case Operators.isNull:
        if (Array.isArray(value)) {
          value = value[0];
        }

        if (value !== true) {
          operator = Operators.notNull;
          value = true;
        }
        break;

      case Operators.notNull:
        if (Array.isArray(value)) {
          value = value[0];
        }

        if (value !== true) {
          operator = Operators.isNull;
          value = true;
        }
        break;
    }

    search.$and?.push({ [field]: { [operator]: value } });
  });

  if (filterKeys.size) {
    throw new Error(`Some filters are not defined in searchableColumns: ${Array.from(filterKeys).join(', ')}`);
  }

  return search;
}

export const Operators = {
  containsLow: CondOperator.CONTAINS_LOW,
  contains: CondOperator.CONTAINS,
  equals: CondOperator.EQUALS,
  in: CondOperator.IN,
  inLow: CondOperator.IN_LOW,
  between: CondOperator.BETWEEN,
  greaterOrEquals: CondOperator.GREATER_THAN_EQUALS,
  lowerOrEquals: CondOperator.LOWER_THAN_EQUALS,
  isNull: CondOperator.IS_NULL,
  notNull: CondOperator.NOT_NULL,
} as const;

export function applyKeywordToSearch(
  filterSearch: SCondition,
  searchableColumns: TSearchableColumn[],
  columnsState?: TColumnsStates,
  keyword?: string,
): SCondition {
  if (!keyword) {
    return filterSearch;
  }

  const keywordSearches: SCondition[] = [];
  keyword.split(' ').forEach((word) => {
    const keywordSearch: SCondition = { $or: [] };
    searchableColumns!.forEach((col) => {
      if (col.searchField === null) {
        return;
      }

      const dataIndex = Array.isArray(col.field) ? col.field.join(',') : col.field;
      if (columnsState?.[dataIndex] && !columnsState[dataIndex].show) {
        return;
      }

      const field = col.searchField || (Array.isArray(col.field) ? col.field.join('.') : col.field);
      const operator = col.operator;

      if (!col.numeric || Number.isFinite(Number(word))) {
        keywordSearch.$or.push({ [field]: { [operator]: word } });
      }
    });

    keywordSearches.push(keywordSearch);
  });

  if (!Array.isArray(filterSearch.$and)) {
    throw new Error('Bad format of filter search');
  }

  return {
    $and: [...filterSearch.$and, ...keywordSearches]
  }
}

export type TIndexableRecord = {
  dataIndex?: Key | Key[];
  children?: TIndexableRecord[] | React.ReactNode;
};

export function collectFieldsFromColumns<T>(
  columns: TIndexableRecord[] | undefined,
  idColumnName: string | string[],
  joinFields: Set<string> = new Set,
  fields: Set<string> = new Set
): string[] {
  return [Array.from(buildFieldsFromColumns<T>(columns, idColumnName, joinFields, fields)).join(',')];
}

export function buildFieldsFromColumnsForDescriptionsDisplay<T>(
  columns: TIndexableRecord[] | undefined,
  idColumnName: string | string[],
  fields: Set<string> = new Set,
): Set<string> {
  columns?.forEach(col => {
    if ('children' in col && Array.isArray(col.children)) {
      buildFieldsFromColumnsForDescriptionsDisplay(col.children, idColumnName, fields);
    }
    fields.add(String(Array.isArray(col.dataIndex) ? col.dataIndex[0] : col.dataIndex));
  });

  return fields;
}

export function buildFieldsFromColumns<T>(
  columns: TIndexableRecord[] | undefined,
  idColumnName: string | string[],
  joinFields: Set<string> = new Set,
  fields: Set<string> = new Set
): Set<string> {
  columns?.forEach(col => {
    if ('children' in col && Array.isArray(col.children)) {
      buildFieldsFromColumns(col.children, idColumnName, joinFields, fields);
    }

    // skip id column because it is always included by backend
    // and join fields because they are included by join

    const dataIndex = String(Array.isArray(col.dataIndex) ? col.dataIndex[0] : col.dataIndex);
    if (!dataIndex || (Array.isArray(idColumnName) ? idColumnName.includes(dataIndex) : dataIndex === idColumnName) || joinFields.has(dataIndex)) {
      return;
    }

    fields.add(dataIndex);
  });

  return fields;
}

export function withNumericId<T extends IWithId>(entity: T): T & { id: number } {
  return {
    ...entity,
    id: Number(entity.id),
  };
}

export function buildJoinFields(join?: QueryJoin | QueryJoin[]) {
  const joinFields = new Set<string>();
  let joinSelect: string[] = [];
  if (join) {
    let joinArr = join;
    if (!Array.isArray(joinArr)) {
      joinArr = [joinArr];
    }
    joinSelect = joinArr.map(relation => {
      joinFields.add(relation.field);
      let res = relation.field;
      if (relation.select) {
        res += `||${relation.select.join(',')}`;
      }
      return res;
    });
  }
  return {
    joinSelect,
    joinFields,
  };
}
