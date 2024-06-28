import { useState } from "react";
import { Modal, Button, Badge, Popconfirm, Checkbox } from "antd";
import { ArrowRightOutlined, UndoOutlined } from "@ant-design/icons";
import { useIntl } from "react-intl";
import { createStyles } from "antd-style";
import ProTable from "@ant-design/pro-table";
import { DatePicker } from 'antd';

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
  const [open, setOpen] = useState(false);

  const maxEntries = open ? Infinity : 3;
  const tableData = [];

  let currentIndex = 0;
  if (haction === 'Created') {
    for (const [key, newValue] of Object.entries(newEntity)) {
      if (currentIndex >= maxEntries) break;
      tableData.push(
        <tr key={key}>
          <td style={{ width: 150 }}>{intl.formatMessage({ id: `pages.${entityName}.${key}` })}:</td>
          <td>{newValue}</td>
        </tr>
      )
      currentIndex++;
    }
  }
  else if (haction === 'Deleted') {
    for (const [key, oldValue] of Object.entries(oldEntity)) {
      if (currentIndex >= maxEntries) break;
      tableData.push(
        <tr key={key}>
          <td style={{ width: 150 }}>{intl.formatMessage({ id: `pages.${entityName}.${key}` })}:</td>
          <td>{oldValue}</td>
        </tr>
      )
      currentIndex++;
    }
  }
  else {
    for (const [key, oldValue] of Object.entries(oldEntity)) {
      if (currentIndex >= maxEntries) break;
      const newValue = newEntity[key];
      if (oldValue !== newValue) {
        tableData.push(
          <tr key={key}>
            <td style={{ width: 150 }}>{intl.formatMessage({ id: `pages.${entityName}.${key}` })}:</td>
            <td>{oldValue} <ArrowRightOutlined style={{ margin: '0 20px' }} /> {newValue}</td>
          </tr>
        )
        currentIndex++;
      }
    }
  }


  return (
    <>
      <table style={{ lineHeight: 1 }}>{tableData}</table>
      <Button style={{ padding: 0 }} onClick={() => setOpen(prev => !prev)} type='link'>{open ? 'Show less' : 'Show more'}</Button>
    </>
  );
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
      tableClassName={styles.table}
      tableLayout="fixed"
      search={false}
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
        {
          title: 'Change',
          render: (_, record) => <Content entityName={entityName} haction={record.haction} newEntity={record.new} oldEntity={record.old} />
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
