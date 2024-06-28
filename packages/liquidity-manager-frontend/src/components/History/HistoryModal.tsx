import { useState } from "react";
import { Modal, Button, Badge, Popconfirm, Checkbox, Descriptions, Table } from "antd";
import { ArrowRightOutlined, UndoOutlined } from "@ant-design/icons";
import { useIntl } from "react-intl";
import { createStyles } from "antd-style";
import ProTable from "@ant-design/pro-table";
import { DatePicker, Typography } from 'antd';

const { Text } = Typography;

type HAction = 'Created' | 'Updated' | 'Deleted';

const actionColors = {
  'Created': 'lightgreen',
  'Updated': 'yellow',
  'Deleted': 'red',
} as const;

const useStyles = createStyles(({ token }) => {
  return {
    table: {
      '.ant-table-tbody': {
        verticalAlign: 'top',
      },
    },
    modal: {
      '.ant-modal-content': {
        marginTop: 40,
        marginBottom: 40,
      },
    }
  };
});

const Content = <Entity extends Record<string | symbol, any>>({
  entityName,
  haction,
  newEntity,
  oldEntity,
}: {
  entityName: string,
  haction: HAction,
  newEntity: Entity,
  oldEntity: Entity,
}) => {
  const intl = useIntl();
  let dataItems: { key: string, label: string, children: any }[] = [];

  if (haction === 'Created') {
    dataItems = Object.entries(newEntity).map(([key, value]) => ({
      key,
      label: intl.formatMessage({ id: `pages.${entityName}.${key}` }),
      children: value,
    }));
  } else if (haction === 'Deleted') {
    dataItems = Object.entries(oldEntity).map(([key, value]) => ({
      key,
      label: intl.formatMessage({ id: `pages.${entityName}.${key}` }),
      children: value,
    }));
  } else {
    dataItems = Object.entries(newEntity).filter(([key, value]) => newEntity[key] !== oldEntity[key]).map(([key, value]) => ({
      key,
      label: intl.formatMessage({ id: `pages.${entityName}.${key}` }),
      children: <>{oldEntity[key]} <ArrowRightOutlined style={{ margin: '0 10px' }} /> {value}</>,
    }));
  }


  return (<Descriptions
    items={dataItems}
    column={3}
    size={'small'}
    bordered={true}
    labelStyle={{
      width: '0',
      whiteSpace: 'nowrap',
  }}
  />);
}

const FirstLine = <Entity extends Record<string | symbol, any>>({
  entityName,
  haction,
  newEntity,
  oldEntity,
}: {
  entityName: string,
  haction: HAction,
  newEntity: Entity,
  oldEntity: Entity,
}) => {
  const intl = useIntl();

  if (haction === 'Created') {
    const keys = Object.keys(newEntity);
    const othersEl = keys.length > 1 ? ` and ${keys.length - 1} other fields` : '';
    return (
      <Text ellipsis={true}>
        Created with <Text type={'secondary'}>{intl.formatMessage({ id: `pages.${entityName}.${keys[0]}` })}:</Text>&nbsp;
        {newEntity[keys[0]]} {othersEl}
      </Text>
    )
  } else if (haction === 'Deleted') {
    const keys = Object.keys(oldEntity);
    const othersEl = keys.length > 1 ? ` and ${keys.length - 1} other fields` : '';
    return (
      <Text ellipsis={true}>
        Deleted with <Text type={'secondary'}>{intl.formatMessage({ id: `pages.${entityName}.${keys[0]}` })}:</Text>&nbsp;
        {oldEntity[keys[0]]} {othersEl}
      </Text>
    )
  } else {
    const changedFields = Object.keys(newEntity).filter(key => newEntity[key] !== oldEntity[key]);
    const othersEl = changedFields.length > 1 ? ` and ${changedFields.length - 1} other fields` : '';
    return (
      <Text ellipsis={true}>
        Updated <Text type={'secondary'}>{intl.formatMessage({ id: `pages.${entityName}.${changedFields[0]}` })}:</Text>&nbsp;
        {oldEntity[changedFields[0]]} <ArrowRightOutlined style={{ margin: '0 10px' }} /> {newEntity[changedFields[0]]} {othersEl}
      </Text>
    )
  }
}

type ExtraParams = {
  hts: [number | undefined, number | undefined] | [],
  ids: string[],
  hactions: HAction[],
  search: string,
}

const sortOrderMap = {
  'ascend': 'ASC',
  'descend': 'DESC',
}

function HistoryTable<T, K>({
  entityName,
  getAll,
  onRevert,
}: {
  entityName: string,
  getAll: T,
  onRevert?: K,
}) {
  const [extraParams, setExtraParams] = useState<ExtraParams>({ hts: [], ids: [], hactions: [], search: '' });
  const patchExtraParams = (params: Partial<ExtraParams>) => setExtraParams(prevState => ({ ...prevState, ...params }));
  const { styles } = useStyles();

  return (
    <ProTable
      size={'small'}
      ghost={true}
      rowKey={'hid'}
      request={(params, sort, filter) => {
        const sortParams = Object.entries(sort)[0];
        return getAll({
          limit: params.pageSize,
          offset: params.pageSize * (params.current - 1),
          search: params.search,
          ids: params.ids,
          hts: params.hts,
          hactions: params.hactions,
          ...(
            sortParams
              ? { sort: [sortParams[0], sortOrderMap[sortParams[1]]] }
              : {}
          )
        })
      }}
      params={extraParams}
      toolbar={{
        search: {
          onSearch: (search) => patchExtraParams({ search }),
        }
      }}
      bordered
      tableClassName={styles.table}
      tableLayout="fixed"
      search={false}
      expandable={{
        expandedRowRender: (record) => <Content
          entityName={entityName}
          haction={record.haction}
          newEntity={record.new}
          oldEntity={record.old}
        />,
        rowExpandable(record) {
          if (record.haction === 'Created' || record.haction === 'Deleted') {
            return true;
          }

          const changedFields = Object.keys(record.new).filter(key => record.new[key] !== record.old[key]);
          return changedFields.length > 1;
        }
      }}
      columns={[
        // {
        //   title: 'ID',
        //   dataIndex: 'new.id',
        //   render(value, record) {
        //     return record.new.id ?? record.old.id
        //   },
        //   filterDropdown: (
        //     <MultiStringSelect
        //       value={extraParams.ids}
        //       onChange={ids => patchExtraParams({ ids })}
        //     />
        //   )
        // },
        {
          title: 'Action',
          dataIndex: 'haction',
          width: '90px',
          sorter: true,
          filterDropdown: (
            <Checkbox.Group<HAction>
              style={{ flexDirection: 'column' }}
              options={[
                { label: 'Created', value: 'Created' },
                { label: 'Updated', value: 'Updated' },
                { label: 'Deleted', value: 'Deleted' },
              ]}
              defaultValue={[]}
              onChange={hactions => patchExtraParams({ hactions })}
            />
          ),
          render(value) {
            return <Badge color={actionColors[value]} text={value} />;
          }
        },
        Table.EXPAND_COLUMN,
        {
          title: 'Change',
          render(_, record) {
            return <FirstLine
              entityName={entityName}
              haction={record.haction}
              newEntity={record.new}
              oldEntity={record.old}
            />;
          }
        },
        {
          title: 'Time',
          dataIndex: 'hts',
          width: '200px',
          filterDropdown: (
            <DatePicker.RangePicker
              onChange={value => {
                patchExtraParams({
                  hts: value === null ? [] : [value[0].valueOf(), value[1].valueOf()],
                });
              }}
            />
          ),
          copyable: true,
          sorter: true,
          render(_, record) {
            return new Date(record.hts * 1000).toLocaleString()
          },
        },
        {
          title: 'Actions',
          fixed: 'right',
          width: '90px',
          render: (text, record, _, action) => [
            <Popconfirm
              title="Undo this action?"
              description="Do you want to undo this action?"
              onConfirm={() => onRevert(record.hid)}
              okText="OK"
              cancelText="Cancel"
              placement='bottomLeft'
            >
              <Button type="link" style={{ padding: 0, height: 'auto' }}>Revert <UndoOutlined /></Button>
            </Popconfirm>
          ],
        },
      ]}
    />
  )
}

export function HistoryModal<T, K>({
  entityName,
  getAll,
  onRevert,
}: {
  entityName: string,
  getAll: T,
  onRevert: K,
}) {
  const [open, setOpen] = useState<boolean>(false);
  const { styles } = useStyles();

  return (
    <>
      <Button type='default' onClick={() => setOpen(prev => !prev)}>
        History
      </Button>
      <Modal
        title={`History`}
        onCancel={() => setOpen(false)}
        destroyOnClose
        open={open}
        className={styles.modal}
        footer={null}
        width='90%'
      >
        <HistoryTable
          entityName={entityName}
          getAll={getAll}
          onRevert={onRevert}
        />
      </Modal>
    </>
  )
}
