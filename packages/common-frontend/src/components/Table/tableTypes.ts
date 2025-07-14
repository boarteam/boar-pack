import React, { MutableRefObject } from "react";
import { ActionType, ProTableProps } from "@ant-design/pro-table";
import { QueryJoin, QuerySortArr } from "@nestjsx/crud-request";
import { Operators } from "./tableTools";
import { TColumnsSet } from "./useColumnsSets";
import { ColumnStateType } from "@ant-design/pro-table/es/typing";
import { RowEditableConfig } from "@ant-design/pro-utils";
import { ProColumns } from "@ant-design/pro-components";

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
  [key: string]: number | string | boolean | (string | number | boolean)[] | null;
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
  sortMap?: { [key: string]: string };
} & TGetAllRequestParams;
export type TSort = {
  [key: string]: 'ascend' | 'descend' | null,
};
export type TSearchableColumn = {
  field: string | string[],
  searchField?: string | null,
  operator: typeof Operators[keyof typeof Operators],
  filterField?: string,
  filterOperator?: typeof Operators[keyof typeof Operators],
  numeric?: boolean,
  uuid?: boolean,
}

interface BaseProps<Entity,
  CreateDto,
  UpdateDto,
  TEntityParams = {},
  TPathParams = {}> extends ProTableProps<Entity, TEntityParams & TFilterParams> {
  getAll: ({}: TGetAllParams & TPathParams) => Promise<{ data: Entity[] }>;
  pathParams: TPathParams;
  idColumnName?: string & keyof Entity | (string & keyof Entity)[];
  createNewDefaultParams?: Partial<Entity>;
  editableRecord?: Partial<Entity>;
  defaultSort?: QuerySortArr;
  searchableColumns?: TSearchableColumn[];
  viewOnly?: boolean;
  columnsSets?: TColumnsSet<Entity>[];
  popupCreation?: boolean;
  columnsState?: ColumnStateType;
  columnsSetSelect?: () => React.ReactNode;
  editPopupTitle?: string;
  createPopupTitle?: string;
  descriptionsMainTitle?: ProColumns<Entity>['title'] | null;
}

export interface EditableProps<Entity, CreateDto, UpdateDto, TPathParams = {}> {
  actionRef?: MutableRefObject<ActionType | undefined>;
  editable?: RowEditableConfig<Entity>;
  afterSave?: (record: Entity) => Promise<void>;
  onCreate?: ({}: { requestBody: CreateDto } & TPathParams) => Promise<Entity>;
  exportUrl?: string;
  exportParams?: {
    [key: string]: string | number
  };
  onImport?: (event: React.ChangeEvent<HTMLInputElement>) => Promise<any>;
  onUpdate: ({}: Partial<Entity> & {
    requestBody: UpdateDto,
    index?: number,
  } & TPathParams) => Promise<Entity>;
  onDelete: ({}: Partial<Entity> & TPathParams) => Promise<void>;
  entityToCreateDto: (entity: Entity) => CreateDto;
  entityToUpdateDto: (entity: Entity) => UpdateDto;
  onUpdateMany: ({}: Partial<Entity> & { requestBody: { updateValues: Partial<UpdateDto>[], records: Entity[] } } & TPathParams) => Promise<void>,
  onDeleteMany: ({}: Partial<Entity> & { requestBody: { records: Entity[] } } & TPathParams) => Promise<void>,
}

// Conditional type to merge base and editable props conditionally
type ConditionalProps<Entity,
  CreateDto,
  UpdateDto,
  TEntityParams,
  TPathParams> = { viewOnly: true } extends { viewOnly: boolean }
  ? BaseProps<Entity, CreateDto, UpdateDto, TEntityParams, TPathParams> & Partial<EditableProps<Entity, CreateDto, UpdateDto, TPathParams>>
  : BaseProps<Entity, CreateDto, UpdateDto, TEntityParams, TPathParams> & EditableProps<Entity, CreateDto, UpdateDto, TPathParams>;

// Main type
export type TTableProps<Entity,
  CreateDto,
  UpdateDto,
  TEntityParams = {},
  TPathParams = {}> = ConditionalProps<Entity, CreateDto, UpdateDto, TEntityParams, TPathParams>;
