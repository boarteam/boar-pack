import { TFilterParams, TFilters, TGetAllParams, TSearchableColumn, TSort } from "./tableTypes";
import { applyKeywordToSearch, buildJoinFields, collectFieldsFromColumns, getFiltersSearch } from "./tableTools";
import { QuerySortArr } from "@nestjsx/crud-request";
import { ProColumns } from "@ant-design/pro-components";
import { ColumnStateType } from "@ant-design/pro-table/es/typing";

export function getTableDataQueryParams<Entity, TPathParams extends Record<string, string | number> = {}>({
  params,
  sort = {},
  filters = {},
  pathParams,
  defaultSort,
  searchableColumns,
  columns = [],
  idColumnName = 'id',
  columnsState,
}: {
  params: TFilterParams,
  sort?: TSort,
  filters?: TFilters,
  pathParams: TPathParams,
  defaultSort?: QuerySortArr,
  searchableColumns?: TSearchableColumn[],
  columns?: ProColumns<Entity>[],
  idColumnName?: string | string[];
  columnsState?: ColumnStateType;
}): TGetAllParams & TPathParams {
  const {
    current,
    pageSize,
    keyword,
    baseFilters,
    join,
    sortMap,
    ...filtersFromSearchForm
  } = params;

  const queryParams: TGetAllParams & TPathParams = {
    ...pathParams,
    page: current,
    limit: pageSize,
  };

  const sortBy = Object
    .entries(sort)
    .reduce<string[]>(
      (data: string[], [key, direction]) => {
        data.push(`${sortMap?.[key] || key},${direction === 'ascend' ? 'ASC' : 'DESC'}`);
        return data;
      },
      []
    );
  if (!sortBy.length && defaultSort) {
    sortBy.push(defaultSort.join(','));
  }
  queryParams.sort = sortBy;

  let search = getFiltersSearch({
    baseFilters,
    filters: {
      ...filters,
      ...filtersFromSearchForm,
    },
    searchableColumns,
  });
  search = applyKeywordToSearch(search, searchableColumns!, columnsState.value!, keyword);
  queryParams.s = JSON.stringify(search);

  const { joinSelect, joinFields } = buildJoinFields(join);
  queryParams.join = joinSelect;

  queryParams.fields = columns && collectFieldsFromColumns(
    columns,
    idColumnName,
    joinFields,
  ) || [];

  return queryParams;
}
