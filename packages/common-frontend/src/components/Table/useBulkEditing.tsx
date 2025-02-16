import { message, Popover, Space } from "antd";
import { QuestionCircleTwoTone } from "@ant-design/icons";
import _ from "lodash";
import BulkEditButton from "./BulkEditButton";
import { ActionType, ProTableProps } from "@ant-design/pro-table";
import BulkDeleteButton from "./BulkDeleteButton";
import { MutableRefObject, useState } from "react";
import { TGetAllParams } from "./tableTypes";

export function useBulkEditing<Entity, TPathParams, UpdateDto, U>({
  actionRef,
  columns,
  idColumnName,
  onDeleteMany,
  onUpdateMany,
  entityToUpdateDto,
  pathParams,
}: {
  actionRef?: MutableRefObject<ActionType | undefined>;
  columns: ProTableProps<Entity, U>['columns'],
  idColumnName?: string & keyof Entity | (string & keyof Entity)[];
  onDeleteMany: ({}: Partial<Entity> & {
    requestBody: { records: Entity[] }
  } & TPathParams) => Promise<void>,
  onUpdateMany: ({}: Partial<Entity> & {
    requestBody: { updateValues: Partial<UpdateDto>[], records: Entity[] }
  } & TPathParams) => Promise<void>,
  entityToUpdateDto: (entity: Entity) => UpdateDto;
  pathParams: TPathParams,
}) {
  const [allSelected, setAllSelected] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<Entity[]>([]);
  const [lastRequest, setLastRequest] = useState<[TGetAllParams & TPathParams, any] | []>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const bulkEditButton = <BulkEditButton<Entity, TPathParams>
    selectedRecords={selectedRecords}
    lastRequest={lastRequest}
    allSelected={allSelected}
    columns={columns}
    idColumnName={idColumnName}
    // @ts-ignore
    onSubmit={values => onUpdateMany({
      ...pathParams,
      ...lastRequest[0],
      requestBody: {
        updateValues: _.pickBy(
          // @ts-ignore
          entityToUpdateDto({
            ...pathParams,
            ...values,
          }),
          (value, key) => _.has(values, key),
        ),
        records: allSelected ? [] : selectedRecords,
      },
    }).then(() => {
      messageApi.open({
        type: 'success',
        content: 'Operation Successful',
      });
      actionRef?.current?.reload();
    })}
  />;

  const bulkDeleteButton = <BulkDeleteButton<Entity, TPathParams>
    selectedRecords={selectedRecords}
    lastRequest={lastRequest}
    allSelected={allSelected}
    // @ts-ignore
    onDelete={() => onDeleteMany({
      ...pathParams,
      ...lastRequest[0],
      requestBody: {
        records: allSelected ? [] : selectedRecords,
      },
    }).then(() => {
      messageApi.open({
        type: 'success',
        content: 'Operation Successful',
      });
      actionRef?.current?.reload();
    })}
  />;

  const rowSelection: ProTableProps<Entity, U>['rowSelection'] = {
    selectedRowKeys: selectedRecords.map(record => Array.isArray(idColumnName) ? idColumnName.map(colName => record[colName]).join('-') : record[idColumnName]),
    selections: [
      {
        key: 'all',
        text: (
          <Space>
            Select ALL
            <Popover
              content={(
                <div style={{ width: '100%' }}>
                  This includes records from ALL pages of the table.
                </div>
              )}
              title={'Select All'}
              trigger={['hover', 'click']}
              zIndex={1080}
            >
              <QuestionCircleTwoTone />
            </Popover>
          </Space>
        ),
        onSelect: () => {
          setSelectedRecords(lastRequest[1].data);
          setAllSelected(true);
        },
      },
    ],
    onChange: (rowKeys, records) => {
      setSelectedRecords(records);
      allSelected && setAllSelected(false);
    },
  };

  return {
    rowSelection,
    setSelectedRecords,
    setLastRequest,
    messagesContext: contextHolder,
    bulkEditButton,
    bulkDeleteButton,
  }
}
