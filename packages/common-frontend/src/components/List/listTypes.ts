import { MutableRefObject } from "react";
import { ActionType } from "@ant-design/pro-table";
import { QuerySortArr } from "@nestjsx/crud-request";
import { RowEditableConfig } from "@ant-design/pro-utils";
import { ProListProps } from "@ant-design/pro-components";
import { TFilterParams, TGetAllParams, TSearchableColumn } from "../Table";

export interface TListProps<
  Entity,
  CreateDto,
  UpdateDto,
  TEntityParams = {},
  TPathParams = {}
  > extends ProListProps<Entity, TEntityParams & TFilterParams> {
  getAll: ({}: TGetAllParams & TPathParams) => Promise<{ data: Entity[] }>,
  onCreate?: ({}: { requestBody: CreateDto } & TPathParams) => Promise<Entity>,
  onUpdate: ({}: Record<keyof Entity, string> & { requestBody: UpdateDto } & TPathParams) => Promise<Entity>,
  onDelete: ({}: Record<keyof Entity, string> & TPathParams) => Promise<void>,
  pathParams: TPathParams,
  entityToCreateDto: (entity: Entity) => CreateDto,
  entityToUpdateDto: (entity: Entity) => UpdateDto,
  createNewDefaultParams?: Partial<Entity>,
  afterSave?: (record: Entity) => Promise<void>,
  actionRef?: MutableRefObject<ActionType | undefined>,
  editable?: RowEditableConfig<Entity>,
  defaultSort?: QuerySortArr,
  searchableColumns?: TSearchableColumn[],
  popupCreation?: boolean,
  viewOnly?: boolean,
}
