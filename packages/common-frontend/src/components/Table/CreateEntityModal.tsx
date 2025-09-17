import { ProColumns } from "@ant-design/pro-components";
import { Button, Modal } from "antd";
import { MutableRefObject, useRef } from "react";
import { Descriptions, DescriptionsRefType } from "../Descriptions";
import { buildFieldsFromColumnsForDescriptionsDisplay } from "./tableTools";

export interface CreateEntityModalProps<Entity> {
  /** Whether the modal is visible */
  open?: boolean;
  /** The entity (or partial entity) data to edit */
  entity: Partial<Entity> | undefined;
  /** Modal title */
  title: string;
  /** Main title for the Descriptions component */
  mainTitle?: ProColumns<Entity>['title'] | null;
  /** Table columns used to render the fields */
  columns: any[];
  /** Column key (or keys) used as an ID */
  idColumnName: string | string[];
  /** Called when the modal is cancelled (closed) */
  onCancel: () => void;
  /**
   * Called when the form is submitted.
   * Receives the validated form data.
   */
  onSubmit: (data: any, descriptionsRef: MutableRefObject<DescriptionsRefType<Entity>>) => Promise<void>;
}

export function CreateEntityModal<
  Entity,
  CreateDto = Entity,
  UpdateDto = Entity,
  TPathParams = object
>({
  entity,
  open = entity !== undefined,
  title,
  mainTitle,
  columns,
  idColumnName,
  onCancel,
  onSubmit,
}: CreateEntityModalProps<Entity>) {
  const descriptionsRef = useRef<DescriptionsRefType<Entity>>(null);

  // Calculate the editable keys from the columns and idColumnName
  const editableKeys = [...buildFieldsFromColumnsForDescriptionsDisplay(columns, idColumnName)];

  return (
    <Modal
      title={title}
      open={open}
      width="80%"
      closeIcon={true}
      footer={[
        <Button key="submit" type="primary" onClick={() => descriptionsRef.current?.submit()}>
          Create
        </Button>,
      ]}
      onCancel={() => {
        descriptionsRef.current?.reset();
        onCancel();
      }}
    >
      <Descriptions<Entity, CreateDto, UpdateDto, TPathParams>
        ref={descriptionsRef}
        mainTitle={mainTitle}
        columns={columns ?? []}
        entity={entity}
        size="small"
        bordered
        column={2}
        style={{ marginBottom: 20 }}
        labelStyle={{ width: '15%' }}
        contentStyle={{ width: '25%' }}
        canEdit={true}
        onCreate={(data) => onSubmit(data, descriptionsRef)}
        editable={{
          editableKeys,
          actionRender: () => [],
        }}
      />
    </Modal>
  );
}
