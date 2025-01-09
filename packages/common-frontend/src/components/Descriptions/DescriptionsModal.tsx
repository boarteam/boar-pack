import { useEffect, useMemo } from "react";
import { Button, Modal, Tabs } from "antd";
import { TDescriptionsCreateModalProps } from "./descriptionTypes";
import { ProDescriptions } from "@ant-design/pro-components";
import { columnsToDescriptionItemProps } from "./useDescriptionColumns";
import { useForm } from "antd/es/form/Form";
import { buildFieldsFromColumnsForDescriptionsDisplay } from "../Table";

export enum DESCRIPTIONS_VIEW_MODE_TYPE {
    TABS = 'tabs',
    GENERAL = 'general'
}

export enum DESCRIPTIONS_MODAL_TYPE {
    CREATE = 'create',
    UPDATE = 'update',
}

const DescriptionsModal = <Entity extends Record<string | symbol, any>>({
  idColumnName,
  columns,
  data,
  onClose,
  onSubmit,
  type = DESCRIPTIONS_MODAL_TYPE.CREATE,
  viewMode = DESCRIPTIONS_VIEW_MODE_TYPE.TABS,
  ...rest
}: TDescriptionsCreateModalProps<Entity>) => {
  const sections = columnsToDescriptionItemProps(columns, 'General');
  const [form] = useForm();

  const editableKeys = useMemo(() => {
    return [
      ...buildFieldsFromColumnsForDescriptionsDisplay(
        columns,
        idColumnName,
      ),
    ];
  }, [columns, idColumnName]);

  useEffect(() => {
    data ? form.setFieldsValue(data) : form.resetFields();
  }, [data]);

    const descriptionProps = {
        size: 'small' as const,
        bordered: true,
        column: 2,
        style: { marginBottom: 20 },
        labelStyle: { width: '15%' },
        contentStyle: { width: '25%' },
        editable: {
            form,
            editableKeys,
            actionRender: () => [],
        },
        ...rest,
    };

    const getKey = (index: number) =>
        index + (Array.isArray(idColumnName) ? idColumnName.join('-') : idColumnName);

    const descriptionSections = sections.map((section, index) => (
        <ProDescriptions<Entity>
            key={getKey(index)}
            title={section.title as React.ReactNode}
            columns={section.columns}
            {...descriptionProps}
        />
    ));

  return (
    <Modal
      open={data !== undefined}
      onCancel={onClose}
      width='80%'
      footer={[
        <Button key='submit' type="primary" onClick={async () => form.validateFields().then(onSubmit)}>
          {type === DESCRIPTIONS_MODAL_TYPE.CREATE ? 'Create' : 'Save'}
        </Button>
      ]}
    >
        {viewMode === DESCRIPTIONS_VIEW_MODE_TYPE.TABS ? (
            <Tabs defaultActiveKey="1">
                {sections.map((section, index) => (
                    <Tabs.TabPane
                        tab={section.title as React.ReactNode}
                        key={getKey(index)}
                    >
                        {descriptionSections[index]}
                    </Tabs.TabPane>
                ))}
            </Tabs>
        ) : (
            descriptionSections
        )}
    </Modal>
  );
};

export default DescriptionsModal;
