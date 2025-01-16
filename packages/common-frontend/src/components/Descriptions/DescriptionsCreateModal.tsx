import React, { useEffect, useMemo } from "react";
import { Button, Modal, Tabs } from "antd";
import { TDescriptionsCreateModalProps } from "./descriptionTypes";
import { ProDescriptions } from "@ant-design/pro-components";
import { columnsToDescriptionItemProps } from "./useDescriptionColumns";
import { useForm } from "antd/es/form/Form";
import { buildFieldsFromColumnsForDescriptionsDisplay } from "../Table";
import { VIEW_MODE_TYPE } from "../Table/ContentViewModeButton";

const DescriptionsCreateModal = <Entity extends Record<string | symbol, any>>({
  idColumnName,
  columns,
  data,
  onClose,
  onSubmit,
  viewMode = VIEW_MODE_TYPE.GENERAL,
  ...rest
}: TDescriptionsCreateModalProps<Entity>) => {
  const sections = columnsToDescriptionItemProps(columns, 'General');
  const [form] = useForm();

  const getKey = (index: number) =>
    index + (Array.isArray(idColumnName) ? idColumnName.join('-') : idColumnName)

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

  const descriptions = sections.map((section, index) => {
    // In the general view mode we need to render extra elements only ones for the top one section
    if (viewMode === VIEW_MODE_TYPE.GENERAL && rest.extra && index !== 0)  {
      rest.extra = null;
    }

    return <ProDescriptions<Entity>
      key={getKey(index)}
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
  })

  return (
    <Modal
      open={data !== undefined}
      onCancel={onClose}
      width='80%'
      footer={[
        <Button key='submit' type="primary" onClick={async () => form.validateFields().then(onSubmit)}>Create</Button>
      ]}
      closeIcon={false}
    >
      {
        viewMode === VIEW_MODE_TYPE.TABS ?
          (<Tabs defaultActiveKey="0">
            {
              descriptions.map((description, index) => (
                <Tabs.TabPane
                  tab={description.props.title as React.ReactNode}
                  key={getKey(index)}
                >
                  {description}
                </Tabs.TabPane>
              ))
            }
          </Tabs>)
          : descriptions
      }
    </Modal>
  );
};

export default DescriptionsCreateModal;
