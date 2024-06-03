// @ts-nocheck

import React, { useState } from "react";
import { Modal, Tooltip, Button, Badge } from "antd";
import { ArrowRightOutlined, HistoryOutlined, UndoOutlined } from "@ant-design/icons";
import Table from "@jifeon/boar-pack-common-frontend/src/components/Table/Table";
import { useIntl } from "react-intl";
import { Table as AntdTable, Popconfirm } from 'antd'
import { createStyles } from "antd-style";
import moment from "moment";
// import apiClient from "@@api/apiClient";
import { ColumnsType } from "antd/es/table";
import { TGetAllParams } from "@jifeon/boar-pack-common-frontend";

type HAction = 1 | 2 | 3;

const actions = {
  1: {
    color: 'lightgreen',
    name: 'Create',
  },
  2: {
    color: 'yellow',
    name: 'Update',
  },
  3: {
    color: 'red',
    name: 'Delete',
  },
} as const;

const useStyles = createStyles(({ token }) => {
  return {
    innerTable: {
      '.ant-table': {
        marginBlock: '-16px !important',
        borderRadius: '0px !important',
        marginInline: '0px !important',
        borderRight: '5px white solid !important',
        'td': {
          textAlign: 'center',
        },
        '.ant-table-cell': {
          textAlign: 'center',
        },
      },
    },
    created: {
      '.ant-table': {
        borderColor: 'lightgreen !important',
      },
    },
    updated: {
      '.ant-table': {
        borderColor: 'yellow !important',
      },
    },
    deleted: {
      '.ant-table': {
        borderColor: 'red !important',
      },
    },
  };
});

const Content = <Entity extends Record<string | symbol, any>>({
  haction,
  newEntity,
  oldEntity,
}: {
  haction: HAction,
  newEntity: Entity,
  oldEntity: Entity,
}) => {
  const { styles, cx } = useStyles();
  const columns: ColumnsType<Entity>['key'][] = [];
  const dataRow: Partial<Entity> = {};
  const intl = useIntl();

  for (const [key, value0] of Object.entries(oldEntity)) {
    const value1 = newEntity[key];
    if ((haction === 3 || value0 !== value1) && key !== 'id') {
      columns.push(key as keyof Entity);
      dataRow[key as keyof Entity] = [value0, value1];
    }
  }

  const className = cx(
    styles.innerTable,
    ({ 1: styles.created, 2: styles.updated, 3: styles.deleted }[haction]),
  );

  return (
      <AntdTable
        className={className}
        pagination={false}
        size='small'
        dataSource={[dataRow]}
        columns={columns.map(key => ({
          // todo: fix for general names
          title: intl.formatMessage({ id: `pages.ecnInstrumentsGroups.${key}` }),
          dataIndex: key,
          render: (_, record) => {
            if (haction === 1) {
              return record[key][1]
            }

            if (haction === 3) {
              return record[key][0]
            }

            return (<>
              {record[key][0]}
              <ArrowRightOutlined style={{ margin: '0 20px' }} />
              {record[key][1]}
            </>);
          }
        }))}
      />
  )
}

export function HistoryModal<Entity, CreateDto, UpdateDto, TEntityParams = {}, TPathParams = {}>({
  getAll,
  onCreate,
  onUpdate,
  onDelete,
  pathParams,
}: {
  getAll: ({}: TGetAllParams & TPathParams) => Promise<{ data: Entity[] }>,
  onCreate?: ({}: { requestBody: CreateDto } & TPathParams) => Promise<Entity>,
  onUpdate?: ({}: Record<keyof Entity, string> & { requestBody: UpdateDto } & TPathParams) => Promise<Entity>,
  onDelete?: ({}: Record<keyof Entity, string> & TPathParams) => Promise<void>,
  pathParams: TPathParams,
}) {
  const [open, setOpen] = useState<boolean>(false);
  const intl = useIntl();

  return (
    <>
      <HistoryOutlined onClick={() => setOpen(prev => !prev)} />,
      <Modal
        onCancel={() => setOpen(false)}
        open={open}
        centered
        footer={null}
        width='90%'
      >
        <Table<Entity, CreateDto, UpdateDto, TEntityParams, TPathParams>
          pathParams={pathParams}
          pagination={{
            defaultPageSize: 6,
          }}
          getAll={getAll}
          idColumnName='hid'
          columns={[
            {
              title: 'Id',
              dataIndex: 'new.id',
              width: '40px',
              copyable: true,
              render: (_, record) => record.new.id,
            },
            {
              title: 'Time',
              dataIndex: 'ts',
              width: '200px',
              copyable: true,
              render(_, record) {
                const date = new Date(record.ts * 1000);
                return <Tooltip title={date.toLocaleString()}>
                  <Button type={'link'}>{moment(date).fromNow()}</Button>
                </Tooltip>;
              },
            },
            {
              title: 'Change',
              render: (_, record) => <Content haction={record.haction} newEntity={record.new} oldEntity={record.old} />
            },
            {
              title: 'Action',
              dataIndex: 'haction',
              width: '100px',
              render(_, record) {
                const action = actions[record.haction];
                return <Badge color={action.color} text={action.name} />;
              }
            },
            {
              title: intl.formatMessage({ id: 'table.actions' }),
              valueType: 'option',
              width: '100px',
              render: (text, record, _, action) => [
                <Popconfirm
                  title="Undo this action?"
                  description="Do you want to undo this action?"
                  // onConfirm={
                  // }
                  okText="OK"
                  cancelText="Cancel"
                >
                  <Button type="link" icon={<UndoOutlined />}>Revert</Button>
                </Popconfirm>
              ],
            },
          ]}
          defaultSort={['ts', 'DESC']}
          viewOnly
        />
      </Modal>
    </>
  )
}
