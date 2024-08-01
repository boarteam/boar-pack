import { ProColumns } from "@ant-design/pro-table";
import React, { useEffect, useState } from "react";
import { Button, Checkbox, Modal, Popover, Space } from "antd";
import { QuestionCircleTwoTone } from "@ant-design/icons";
import { columnsToDescriptionItemProps } from "../Descriptions";
import { useForm } from "antd/lib/form/Form";
import { ProDescriptions } from "@ant-design/pro-components";
import { TGetAllParams } from "./tableTypes";

type TBulkEditConfig<Entity> = { type: 'records', value: Entity[], count: number } | { type: 'query', value: Record<string, any>, count: number } | null;

const BulkEditDialog =  <Entity extends Record<string | symbol, any>>(
  {
    columns,
    idColumnName,
    config,
    onClose,
    onSubmit,
  }: {
    idColumnName: string & keyof Entity | (string & keyof Entity)[],
    columns: ProColumns<Entity>[],
    config: TBulkEditConfig<Entity>,
    onClose: () => void,
    onSubmit: (value: Partial<Entity>) => Promise<void>
  }) => {
  const sections = columnsToDescriptionItemProps(columns, 'General');

  const [editableKeys, setEditableKeys] = useState<Set<string>>(new Set);

  const [form] = useForm();
  useEffect(() => {
    setEditableKeys(new Set);
    form.resetFields();
  }, [config]);

  const handleCheckboxChange = (dataIndex: string, checked: boolean) => {
    setEditableKeys(prev => {
      const next = new Set(prev);
      checked ? next.add(dataIndex) : next.delete(dataIndex);
      return next;
    });
  };

  const handleUpdate = async () => {
    await form.validateFields();
    await onSubmit(form.getFieldsValue());
    onClose();
  };

  return (
    <Modal
      title={`Updating ${config?.count} entities...`}
      open={config !== null}
      onCancel={onClose}
      width='80%'
      footer={[
        <Button key='submit' type="primary" onClick={handleUpdate}>Update {config?.count} entities</Button>
      ]}
    >
      {sections.map((section) => {
        return (
          <ProDescriptions<Entity>
            key={Array.isArray(idColumnName) ? idColumnName.join('-') : idColumnName}
            title={section.title as React.ReactNode}
            size={"small"}
            bordered
            column={2}
            style={{ marginBottom: 20 }}
            labelStyle={{ width: '15%' }}
            contentStyle={{ width: '25%' }}
            editable={{
              form,
              editableKeys: [...editableKeys],
              actionRender: () => [],
            }}
            columns={section.columns.filter(column => column?.editable === undefined).map(column => ({
              ...column,
              render: (...params) => !editableKeys.has(column.dataIndex) ? '(This field will not be changed)' : column.render(...params),
              editable: false,
              title: (
                <Checkbox
                  checked={editableKeys.has(column.dataIndex)}
                  onChange={e => handleCheckboxChange(column.dataIndex, e.target.checked)}
                >
                  {column.title}
                </Checkbox>
              ),
            }))}
          />
        )
      })}
    </Modal>
  );
}

const BulkEditButton = <Entity extends Record<string | symbol, any>>(
  {
    selectedRecords,
    lastQueryParamsAndCount,
    columns,
    idColumnName,
    onSubmit,
  } : {
    selectedRecords: Entity[],
    lastQueryParamsAndCount: [TGetAllParams & Record<string, string | number>, number] | [],
    idColumnName: string & keyof Entity | (string & keyof Entity)[],
    columns: ProColumns<Entity>[],
    onSubmit: (value: Partial<Entity>) => Promise<void>
  }) => {
  const [bulkEditConfig, setBulkEditConfig] = useState<TBulkEditConfig<Entity>>(null);

  return (<>
    <Button
      onClick={() => setBulkEditConfig(
        selectedRecords.length
          ? { type: 'records', value: selectedRecords, count: selectedRecords.length }
          : { type: 'query', value: lastQueryParamsAndCount[0], count: lastQueryParamsAndCount[1] }
      )}
    >
    {
      selectedRecords.length
        ? `Bulk Edit ${selectedRecords.length}`
        : (
          <Space>
            Bulk Edit
            {lastQueryParamsAndCount[1]}
            <Popover
              content={(
                <div style={{ width: '100%' }}>
                  This includes entries from ALL pages of the table.
                </div>
              )}
              title={'Bulk Edit All'}
              trigger={['hover', 'click']}
              zIndex={1080}
            >
              <QuestionCircleTwoTone />
            </Popover>
          </Space>
        )
      }
    </Button>
    <BulkEditDialog<Entity>
      config={bulkEditConfig}
      onClose={() => setBulkEditConfig(null)}
      columns={columns}
      idColumnName={idColumnName}
      onSubmit={onSubmit}
    />
  </>);
};

export default BulkEditButton;
