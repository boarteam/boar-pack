import { MutableRefObject } from "react";
import { ActionType } from "@ant-design/pro-table";
import { RowEditableConfig } from "@ant-design/pro-utils";
import { QueryJoin } from "@nestjsx/crud-request";
import { ProColumns } from "@ant-design/pro-components";
import { ProDescriptionsProps } from "@ant-design/pro-descriptions";
import { TDescriptionSection } from "./useDescriptionColumns";

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
export type TDescriptionGetRequestParams = {
  join?: QueryJoin | QueryJoin[];
};
export type TDescriptionsProps<Entity, CreateDto, UpdateDto, TPathParams = object> = {
  mainTitle?: ProColumns<Entity>['title'] | null,
  entity?: Partial<Entity>,
  getOne?: ({}: TGetOneParams & TPathParams) => Promise<Entity | null>,
  onUpdate?: ({}: Partial<Entity> & {
    requestBody: UpdateDto,
    index?: number,
  } & TPathParams) => Promise<Entity>,
  onDelete?: ({}: Partial<Entity> & TPathParams) => Promise<void>,
  pathParams?: TPathParams,
  idColumnName?: string & keyof Entity,
  entityToUpdateDto?: (entity: Entity) => UpdateDto,
  createNewDefaultParams?: Partial<Entity>,
  afterSave?: (record: Entity) => Promise<void>,
  actionRef?: MutableRefObject<ActionType | undefined>,
  editable?: RowEditableConfig<Entity>,
  canEdit?: boolean,
  params?: TDescriptionGetRequestParams,
  columns: ProColumns<Entity>[],
  onEntityChange?: (entity: Entity | null) => void;
  errorsPerTabInitialValue?: Map<TDescriptionSection<Entity>['key'], number>;
}

export type TDescriptionsCreateModalProps<Entity> = Omit<ProDescriptionsProps<Entity>, 'columns'> & {
  modalTitle?: string,
  mainTitle?: ProColumns<Entity>['title'] | null,
  idColumnName: string & keyof Entity | (string & keyof Entity)[],
  columns: ProColumns<Entity>[],
  data: Partial<Entity> | undefined,
  onSubmit: (data: Entity) => Promise<void>,
  onClose: () => void,
}
