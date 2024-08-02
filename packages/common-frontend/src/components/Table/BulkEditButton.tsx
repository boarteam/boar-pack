import { ProColumns } from "@ant-design/pro-table";
import React, { useEffect, useState } from "react";
import { Button, Checkbox, Modal, Popconfirm, Popover } from "antd";
import { LoadingOutlined, QuestionCircleTwoTone } from "@ant-design/icons";
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
  const recordsCount = selectedRecords.length ? selectedRecords.length : lastQueryParamsAndCount[1];

  return (<>
    <Button
      onClick={() => setBulkEditConfig(
        selectedRecords.length
          ? { type: 'records', value: selectedRecords, count: selectedRecords.length }
          : { type: 'query', value: lastQueryParamsAndCount[0], count: lastQueryParamsAndCount[1] }
      )}
    >
    {`Edit ${recordsCount} ${recordsCount === 1 ? 'Record' : 'Records'}`}
    </Button>
    <Popover
      content={(
        <div style={{ width: '100%' }}>
          This includes records from ALL pages of the table.
        </div>
      )}
      title={'Edit All Records'}
      trigger={['hover', 'click']}
      zIndex={1080}
    >
      <QuestionCircleTwoTone />
    </Popover>
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
