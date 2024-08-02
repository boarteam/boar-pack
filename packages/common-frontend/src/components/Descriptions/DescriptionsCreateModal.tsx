import { useEffect, useMemo } from "react";
import { Button, Modal } from "antd";
import { TDescriptionsCreateModalProps } from "./descriptionTypes";
import { ProDescriptions } from "@ant-design/pro-components";
import { columnsToDescriptionItemProps } from "./useDescriptionColumns";
import { useForm } from "antd/es/form/Form";
import { buildFieldsFromColumns } from "../Table";

const DescriptionsCreateModal = <Entity extends Record<string | symbol, any>>({
  idColumnName,
  columns,
  data,
  onClose,
  onSubmit,
  ...rest
}: TDescriptionsCreateModalProps<Entity>) => {
  const sections = columnsToDescriptionItemProps(columns, 'General');
  const [form] = useForm();

  const editableKeys = useMemo(() => {
    return [
      ...buildFieldsFromColumns(
        columns,
        idColumnName,
      ),
    ];
  }, [columns, idColumnName]);

  useEffect(() => {
    data ? form.setFieldsValue(data) : form.resetFields();
  }, [data]);

  return (
    <Modal
      open={data !== undefined}
      onCancel={onClose}
      width='80%'
      footer={[
        <Button key='submit' type="primary" onClick={async () => form.validateFields().then(onSubmit)}>Create</Button>
      ]}
    >
      {sections.map((section, index) => (
        <ProDescriptions<Entity>
          key={index + (Array.isArray(idColumnName) ? idColumnName.join('-') : idColumnName)}
          title={section.title as React.ReactNode}
          size={"small"}
          bordered
          column={2}
          style={{ marginBottom: 20 }}
          labelStyle={{ width: '15%' }}
          contentStyle={{ width: '25%' }}
          editable={{
            form,
            editableKeys,
            actionRender: () => [],
          }}
          columns={section.columns}
          {...rest}
        />
      ))}
    </Modal>
  );
};

export default DescriptionsCreateModal;
