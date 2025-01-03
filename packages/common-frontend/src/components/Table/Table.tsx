import ProTable, { ActionType } from "@ant-design/pro-table";
import React, { useEffect, useRef, useState } from "react";
import { Button, Popover, Space, Tooltip, message } from "antd";
import { DeleteOutlined, PlusOutlined, QuestionCircleTwoTone, StopOutlined } from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { flushSync } from "react-dom";
import { applyKeywordToSearch, buildJoinFields, collectFieldsFromColumns, getFiltersSearch } from "./tableTools";
import { TFilterParams, TFilters, TGetAllParams, TSort, TTableProps } from "./tableTypes";
import useColumnsSets from "./useColumnsSets";
import DescriptionsCreateModal from "../Descriptions/DescriptionsCreateModal";
import BulkEditButton from "./BulkEditButton";
import _ from "lodash";
import BulkDeleteButton from "./BulkDeleteButton";
import { createStyles } from "antd-style";

let creatingRecordsCount = 0;

export const KEY_SYMBOL = Symbol('key');
const NEW_RECORD = 'NEW_RECORD';

export function getNewId(): string {
  return NEW_RECORD + creatingRecordsCount++;
}

export function isRecordNew(record: Record<string | symbol, any>): boolean {
  return record[KEY_SYMBOL]?.startsWith?.(NEW_RECORD) || record.id?.startsWith?.(NEW_RECORD) || false;
}

const useStyles = createStyles(() => {
  return {
    table: {
      '.ant-pro-table-alert': {
        display: 'none',
      },
    }
  }
})

const Table = <Entity extends Record<string | symbol, any>,
  CreateDto = Entity,
  UpdateDto = Entity,
  TEntityParams = {},
  TPathParams extends Record<string, string | number> = {},
  TKey = string,
  >(
  {
    getAll,
    onCreate,
    onUpdate,
    onUpdateMany,
    onDelete,
    onDeleteMany,
    pathParams,
    idColumnName = 'id',
    entityToCreateDto,
    entityToUpdateDto,
    createNewDefaultParams,
    afterSave,
    actionRef: actionRefProp,
    editable,
    defaultSort = ['createdAt', 'DESC'],
    searchableColumns = [],
    viewOnly = false,
    columns = [],
    columnsSets,
    columnsState: managedColumnsState,
    columnsSetSelect: managedColumnsSetSelect,
    popupCreation = false,
    toolBarRender,
    params,
    popupDataState,
    ...rest
  }: TTableProps<Entity,
    CreateDto,
    UpdateDto,
    TEntityParams,
    TPathParams>
) => {
  const actionRefComponent = useRef<ActionType>();
  const actionRef = actionRefProp || actionRefComponent;
  const [createPopupData, setCreatePopupData] = popupDataState ?? useState<Partial<Entity> | undefined>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<Entity[]>([]);
  const [lastRequest, setLastRequest] = useState<[TGetAllParams & TPathParams, any] | []>([]);
  const [allSelected, setAllSelected] = useState(false);
  const { styles } = useStyles();
  const [messageApi, contextHolder] = message.useMessage();

  const intl = useIntl();

  useEffect(() => {
    actionRef?.current?.reload();
  }, [JSON.stringify(pathParams), JSON.stringify(params)]);

  const {
    columnsSetSelect: localColumnsSetSelect,
    columnsState: localColumnsState,
  } = useColumnsSets<Entity>({
    columns,
    columnsSets,
  });

  const columnsState = managedColumnsState ?? localColumnsState;
  const columnsSetSelect = managedColumnsSetSelect ?? localColumnsSetSelect;

  const request = async (
    params: TFilterParams,
    sort: TSort = {},
    filters: TFilters = {},
  ) => {
    const {
      current,
      pageSize,
      keyword,
      baseFilters,
      join,
      sortMap,
      ...filtersFromSearchForm
    } = params;

    const queryParams: TGetAllParams & TPathParams = {
      ...pathParams,
      page: current,
      limit: pageSize,
    };

    const sortBy = Object
      .entries(sort)
      .reduce<string[]>(
        (data: string[], [key, direction]) => {
          data.push(`${sortMap?.[key] || key},${direction === 'ascend' ? 'ASC' : 'DESC'}`);
          return data;
        },
        []
      );
    if (!sortBy.length && defaultSort) {
      sortBy.push(defaultSort.join(','));
    }
    queryParams.sort = sortBy;

    let search = getFiltersSearch({
      baseFilters,
      filters: {
        ...filters,
        ...filtersFromSearchForm,
      },
      searchableColumns,
    });
    search = applyKeywordToSearch(search, searchableColumns!, columnsState.value!, keyword);
    queryParams.s = JSON.stringify(search);

    const { joinSelect, joinFields } = buildJoinFields(join);
    queryParams.join = joinSelect;

    queryParams.fields = columns && collectFieldsFromColumns(
      columns,
      idColumnName,
      joinFields,
    ) || [];

    const result = await getAll(queryParams);

    setSelectedRecords([]);
    setLastRequest([
      queryParams,
      result,
    ]);
    return result;
  }

  const createButton = <Button
    size={rest.size}
    type="primary"
    key="create"
    onClick={() => {
      if (popupCreation) {
        setCreatePopupData(createNewDefaultParams);
      } else {
        actionRef?.current?.addEditRecord({
          [KEY_SYMBOL]: getNewId(),
          ...createNewDefaultParams,
        }, {
          position: 'top',
        });
      }
    }}
  >
    <PlusOutlined /> <FormattedMessage id={'table.newButton'} />
  </Button>;

  return (<>
    <ProTable<Entity, TEntityParams & TFilterParams>
      actionRef={actionRef}
      className={styles.table}
      request={request}
      rowKey={record => record[KEY_SYMBOL] ?? (Array.isArray(idColumnName) ? idColumnName.map(colName => record[colName]).join('-') : record[idColumnName])}
      options={{
        fullScreen: true,
        reload: true,
        search: {
          allowClear: true,
        },
        density: true,
        setting: {
          draggable: false,
          checkable: true,
          checkedReset: true,
          listsHeight: 500,
        },
      }}
      bordered
      search={false}
      editable={{
        type: 'multiple',
        editableKeys,
        onChange: setEditableRowKeys,
        async onSave(
          id,
          record,
          origin,
          newLine,
        ) {
          if (newLine) {
            await onCreate?.({
              ...pathParams,
              requestBody: entityToCreateDto(record),
            });
          } else {
            await onUpdate({
              ...pathParams,
              ...record,
              requestBody: entityToUpdateDto({
                ...pathParams,
                ...record,
              }),
            })
          }

          if (typeof afterSave === 'function') {
            await afterSave(record);
          }

          flushSync(() => {
            actionRef?.current?.reload();
          });
        },
        async onCancel(
          id,
          record,
          origin,
        ) {
          if (record) {
            Object.assign(record, origin);
          }
        },
        async onDelete(id, row) {
          await onDelete({ ...row, ...pathParams });
        },
        deletePopconfirmMessage: intl.formatMessage({ id: 'table.deletePopconfirmMessage' }),
        onlyAddOneLineAlertMessage: intl.formatMessage({ id: 'table.onlyAddOneLineAlertMessage' }),
        cancelText: <Tooltip title={intl.formatMessage({ id: 'table.cancelText' })}><StopOutlined /></Tooltip>,
        deleteText: <Tooltip title={intl.formatMessage({ id: 'table.deleteText' })}><DeleteOutlined /></Tooltip>,
        saveText: <Button size={"small"} type={"primary"}><FormattedMessage id={'table.saveText'} /></Button>,
        ...editable,
      }}
      toolBarRender={(...args) => [
        ...toolBarRender && toolBarRender(...args) || [],
        columnsSetSelect?.() || null,
        !viewOnly && onUpdateMany
          ? (
            <BulkEditButton
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
                    (value, key) =>  _.has(values, key),
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
            />
          )
          : <></>,
        !viewOnly && onDeleteMany
          ? (
            <BulkDeleteButton
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
            />
          )
          : <></>,
        !viewOnly && createButton || null,
      ]}
      columns={columns}
      defaultSize='small'
      columnsState={columnsState}
      params={params}
      {
        ...(
          !viewOnly && (onUpdateMany || onDeleteMany)
            ? {
              rowSelection: {
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
              }
            }
            : {}
        )
      }
      {...rest}
    />
    <DescriptionsCreateModal<Entity>
      data={createPopupData}
      onClose={() => setCreatePopupData(undefined)}
      onSubmit={async (data) => {
        try {
          await onCreate?.({
            ...pathParams,
            requestBody: entityToCreateDto({
              ...pathParams,
              ...data,
            })
          });
          actionRef?.current?.reload();
          setCreatePopupData(undefined);
        }
        catch (e) {
          console.error(e);
        }
      }}
      idColumnName={idColumnName}
      columns={columns ?? []}
    />
    {contextHolder}
  </>);
};

export default Table;

