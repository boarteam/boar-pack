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
    const operator = col.filterOperator || col.operator;
    const value = filters[colDataIndex] || baseFilters[colDataIndex];
    filterKeys.delete(colDataIndex);
    if (!value || col.numeric && !Number.isFinite(value)) {
      return;
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

    if (!col.numeric || Number.isFinite(keyword)) {
      keywordSearch.$or?.push({ [field]: { [operator]: keyword } });
    }
  });

  if (!Array.isArray(filterSearch.$and)) {
    throw new Error('Bad format of filter search');
  }

  return {
    $and: [...filterSearch.$and, keywordSearch]
  }
}

export type TIndexableRecord = {
  dataIndex?: Key | Key[];
  children?: TIndexableRecord[] | React.ReactNode;
};

export function collectFieldsFromColumns<T>(
  columns: TIndexableRecord[] | undefined,
  idColumnName: string,
  joinFields: Set<string> = new Set,
  fields: Set<string> = new Set
): string[] {
  return [Array.from(buildFieldsFromColumns<T>(columns, idColumnName, joinFields, fields)).join(',')];
}

export function buildFieldsFromColumns<T>(
  columns: TIndexableRecord[] | undefined,
  idColumnName: string,
  joinFields: Set<string> = new Set,
  fields: Set<string> = new Set
): Set<string> {
  columns?.forEach(col => {
    if ('children' in col && Array.isArray(col.children)) {
      buildFieldsFromColumns(col.children, idColumnName, joinFields, fields);
    }

    // skip id column because it is always included by backend
    // and join fields because they are included by join
    if (!col.dataIndex || col.dataIndex === idColumnName || joinFields.has(col.dataIndex as string)) {
      return;
    }

    fields.add(String(Array.isArray(col.dataIndex) ? col.dataIndex[0] : col.dataIndex));
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
