import { ProColumns } from "@ant-design/pro-components";
import { Button, Form, Modal } from "antd";
import { useState } from "react";
import { columnsToDescriptionItemProps, Descriptions } from "../Descriptions";
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
  onSubmit: (data: any) => Promise<void>;
}

export function CreateEntityModal<Entity>({
  entity,
  open = entity !== undefined,
  title,
  mainTitle,
  columns,
  idColumnName,
  onCancel,
  onSubmit,
}: CreateEntityModalProps<Entity>) {
  const [form] = Form.useForm();
  const [errorsPerTab, setErrorsPerTab] = useState<Map<string, number>>(new Map());

  // Build description sections (grouping of fields) based on the columns
  const sections = columnsToDescriptionItemProps<Entity>(columns, 'Main');

  // Calculate the editable keys from the columns and idColumnName
  const editableKeys = [...buildFieldsFromColumnsForDescriptionsDisplay(columns, idColumnName)];

  const handleSubmit = async () => {
    try {
      // Validate all fields in the form
      const data = await form.validateFields();
      // Let the parent component handle the submit logic
      await onSubmit(data);
    } catch (error) {
      console.error('Validation or submission failed:', error);
    } finally {
      // Recalculate the error count per section (tab) after validation
      const newErrorsPerTab = new Map<string, number>();
      sections.forEach((section) => {
        let errorCount = 0;
        section.columns.forEach((column: any) => {
          if (form.getFieldError(column.dataIndex)?.length > 0) {
            errorCount++;
          }
        });
        newErrorsPerTab.set(section.key, errorCount);
      });
      setErrorsPerTab(newErrorsPerTab);
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      width="80%"
      closeIcon={true}
      footer={[
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Create
        </Button>,
      ]}
      onCancel={() => {
        setErrorsPerTab(new Map(sections.map((s) => [s.key, 0])));
        form.resetFields();
        onCancel();
      }}
    >
      <Descriptions
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
        errorsPerTabInitialValue={errorsPerTab}
        editable={{
          form,
          editableKeys,
          actionRender: () => [],
        }}
      />
    </Modal>
  );
}
