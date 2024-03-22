import React, { MutableRefObject } from "react";
import { ActionType, ProTableProps } from "@ant-design/pro-table";
import { RowEditableConfig } from "@ant-design/pro-utils";
import { QueryJoin, QuerySortArr } from "@nestjsx/crud-request";
import { Operators } from "./tableTools";
import { TColumnsSet } from "./useColumnsSets";
import { ColumnStateType } from "@ant-design/pro-table/es/typing";
// import { IntlShape } from "react-intl";

export type IWithId = {
  id: string | number,
}
export type TGetAllParams = {
  /**
   * Selects resource fields. <a href="https://github.com/nestjsx/crud/wiki/Requests#select" target="_blank">Docs</a>
   */
  fields?: Array<string>,
  /**
   * Adds search condition. <a href="https://github.com/nestjsx/crud/wiki/Requests#search" target="_blank">Docs</a>
   */
  s?: string,
  /**
   * Adds filter condition. <a href="https://github.com/nestjsx/crud/wiki/Requests#filter" target="_blank">Docs</a>
   */
  filter?: Array<string>,
  /**
   * Adds OR condition. <a href="https://github.com/nestjsx/crud/wiki/Requests#or" target="_blank">Docs</a>
   */
  or?: Array<string>,
  /**
   * Adds sort by field. <a href="https://github.com/nestjsx/crud/wiki/Requests#sort" target="_blank">Docs</a>
   */
  sort?: Array<string>,
  /**
   * Adds relational resources. <a href="https://github.com/nestjsx/crud/wiki/Requests#join" target="_blank">Docs</a>
   */
  join?: Array<string>,
  /**
   * Limit amount of resources. <a href="https://github.com/nestjsx/crud/wiki/Requests#limit" target="_blank">Docs</a>
   */
  limit?: number,
  /**
   * Offset amount of resources. <a href="https://github.com/nestjsx/crud/wiki/Requests#offset" target="_blank">Docs</a>
   */
  offset?: number,
  /**
   * Page portion of resources. <a href="https://github.com/nestjsx/crud/wiki/Requests#page" target="_blank">Docs</a>
   */
  page?: number,
  /**
   * Reset cache (if was enabled). <a href="https://github.com/nestjsx/crud/wiki/Requests#cache" target="_blank">Docs</a>
   */
  cache?: number,
}
export type TFilters = {
  [key: string]: number | string | boolean;
}
export type TGetRequestParams = {
  baseFilters?: TFilters;
  join?: QueryJoin | QueryJoin[];
};
export type TGetAllRequestParams = TGetRequestParams & {
  keyword?: string;
}
export type TFilterParams = {
  current?: number;
  pageSize?: number;
} & TGetAllRequestParams;
export type TSort = {
  [key: string]: 'ascend' | 'descend' | null,
};
export type TSearchableColumn = {
  field: string | string[],
  operator: typeof Operators[keyof typeof Operators],
}
export interface TTableProps<
  Entity,
  CreateDto,
  UpdateDto,
  TEntityParams = {},
  TPathParams = {}
> extends ProTableProps<Entity, TEntityParams & TFilterParams> {
  getAll: ({}: TGetAllParams & TPathParams) => Promise<{ data: Entity[] }>,
  onCreate?: ({}: { requestBody: CreateDto } & TPathParams) => Promise<Entity>,
  onUpdate: ({}: Record<keyof Entity, string> & { requestBody: UpdateDto } & TPathParams) => Promise<Entity>,
  onDelete: ({}: Record<keyof Entity, string> & TPathParams) => Promise<void>,
  pathParams: TPathParams,
  idColumnName?: string & keyof Entity,
  entityToCreateDto: (entity: Entity) => CreateDto,
  entityToUpdateDto: (entity: Entity) => UpdateDto,
  createNewDefaultParams?: Partial<Entity>,
  afterSave?: (record: Entity) => Promise<void>,
  actionRef?: MutableRefObject<ActionType | undefined>,
  editable?: RowEditableConfig<Entity>,
  defaultSort?: QuerySortArr,
  searchableColumns?: TSearchableColumn[],
  viewOnly?: boolean,
  columnsSets?: TColumnsSet<Entity>[],
  popupCreation?: boolean,
  columnsState?: ColumnStateType,
  columnsSetSelect?: () => React.ReactNode,
  // intl: IntlShape,
}
