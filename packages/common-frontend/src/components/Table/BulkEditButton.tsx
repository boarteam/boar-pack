import { ProColumns } from "@ant-design/pro-table";
import React, { useEffect, useState } from "react";
import { Button, Checkbox, Modal, Popconfirm } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { columnsToDescriptionItemProps } from "../Descriptions";
import { useForm } from "antd/lib/form/Form";
import { ProDescriptions } from "@ant-design/pro-components";
import { TGetAllParams } from "./tableTypes";
import { createStyles } from "antd-style";

type TBulkEditConfig<Entity> = { type: 'records', value: Entity[], count: number } | { type: 'query', value: Record<string, any>, count: number } | null;

const useStyles = createStyles(() => {
  return {
    popconfirm: {
      '.ant-popconfirm-description': {
        marginTop: '0 !important',
      },
    }
  }
})

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
  const [loading, setLoading] = useState(false);
  const sections = columnsToDescriptionItemProps(columns, 'General');
  const { styles } = useStyles();

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
    setLoading(true);
    await onSubmit(form.getFieldsValue()).finally(() => setLoading(false));
    onClose();
  };

  return (
    <Modal
      title={`Updating ${config?.count} ${config?.count === 1 ? 'record' : 'records'}...`}
      open={config !== null}
      onCancel={onClose}
      width='80%'
      footer={[
        <Popconfirm
          overlayClassName={styles.popconfirm}
          title={false}
          description={`Are you sure you want to update ${config?.count} ${config?.count === 1 ? 'record' : 'records'}?`}
          onConfirm={() => handleUpdate()}
          okText="Yes"
          cancelText="No"
        >
          <Button key='submit' type="primary">Update {loading && <LoadingOutlined />}</Button>
        </Popconfirm>
      ]}
    >
      {sections.map((section) => {
        return (
          <ProDescriptions<Entity>
            extra={'Click on the field first and then type a new desired value.'}
            key={Array.isArray(idColumnName) ? idColumnName.join('-') : idColumnName}
            title={section.title as React.ReactNode}
            size={"small"}
            bordered
            column={3}
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
    lastRequest,
    allSelected,
    columns,
    idColumnName,
    onSubmit,
  } : {
    selectedRecords: Entity[],
    lastRequest: [TGetAllParams & Record<string, string | number>, any] | [],
    idColumnName: string & keyof Entity | (string & keyof Entity)[],
    allSelected: boolean,
    columns: ProColumns<Entity>[],
    onSubmit: (value: Partial<Entity>) => Promise<void>
  }) => {
  const [bulkEditConfig, setBulkEditConfig] = useState<TBulkEditConfig<Entity>>(null);
  const recordsCount = allSelected ? lastRequest[1].total : selectedRecords.length;

  return (<>
    <Button
      disabled={recordsCount === 0}
      onClick={() => setBulkEditConfig(
        !allSelected
          ? { type: 'records', value: selectedRecords, count: selectedRecords.length }
          : { type: 'query', value: lastRequest[0], count: lastRequest[1].total }
      )}
    >
      {recordsCount > 0 ? `Edit ${recordsCount} ${recordsCount === 1 ? 'Record' : 'Records'}` : 'Bulk Edit'}
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
