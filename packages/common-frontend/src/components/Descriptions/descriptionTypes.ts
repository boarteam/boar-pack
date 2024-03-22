import { MutableRefObject } from "react";
import { ActionType } from "@ant-design/pro-table";
import { RowEditableConfig } from "@ant-design/pro-utils";
import { QueryJoin } from "@nestjsx/crud-request";
import { ProColumns, ProDescriptionsProps } from "@ant-design/pro-components";

export type TGetOneParams = {
  /**
   * Selects resource fields. <a href="https://github.com/nestjsx/crud/wiki/Requests#select" target="_blank">Docs</a>
   */
  fields?: Array<string>,
  /**
   * Adds relational resources. <a href="https://github.com/nestjsx/crud/wiki/Requests#join" target="_blank">Docs</a>
   */
  join?: Array<string>,
  /**
   * Reset cache (if was enabled). <a href="https://github.com/nestjsx/crud/wiki/Requests#cache" target="_blank">Docs</a>
   */
  cache?: number,
}
export type TGetRequestParams = {
  join?: QueryJoin | QueryJoin[];
};
export type TDescriptionsProps<Entity, CreateDto, UpdateDto, TPathParams = {}> = {
  mainTitle?: ProColumns<Entity>['title'] | null,
  getOne: ({}: TGetOneParams & TPathParams) => Promise<Entity | null>,
  // onCreate: ({}: { requestBody: CreateDto } & TPathParams) => Promise<Entity>,
  onUpdate: ({}: Record<keyof Entity, string> & { requestBody: UpdateDto } & TPathParams) => Promise<Entity>,
  onDelete?: ({}: Record<keyof Entity, string> & TPathParams) => Promise<void>,
  pathParams: TPathParams,
  idColumnName?: string & keyof Entity,
  // entityToCreateDto: (entity: Entity) => CreateDto,
  entityToUpdateDto: (entity: Partial<Entity>) => UpdateDto,
  createNewDefaultParams?: Partial<Entity>,
  afterSave?: (record: Entity) => Promise<void>,
  actionRef?: MutableRefObject<ActionType | undefined>,
  editable?: RowEditableConfig<Entity>,
  canEdit?: boolean,
  params?: TGetRequestParams,
  columns: ProColumns<Entity>[],
  record?: Entity,
}

export type TDescriptionsCreateModalProps<Entity> = Omit<ProDescriptionsProps<Entity>, 'columns'> & {
  idColumnName: string & keyof Entity,
  columns: ProColumns<Entity>[],
  data: Partial<Entity> | undefined,
  onSubmit: (data: Entity) => Promise<void>,
  onClose: () => void,
}
