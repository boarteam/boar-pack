import { ProColumns, ProDescriptionsProps } from "@ant-design/pro-components";
import { VIEW_MODE_TYPE } from "../Table/ContentViewModeButton";

export type TDescriptionViewProps<Entity> = Omit<ProDescriptionsProps<Entity>, 'columns'> & {
  idColumnName: string & keyof Entity | (string & keyof Entity)[],
  columns: ProColumns<Entity>[],
  data: Partial<Entity> | undefined,
  viewMode?: VIEW_MODE_TYPE,
  onSubmit?: (data: Entity) => Promise<void>,
  onCancel?: () => void,
}
