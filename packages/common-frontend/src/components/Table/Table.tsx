import ProTable, { ActionType } from "@ant-design/pro-table";
import React, { useRef, useState } from "react";
import { Button, Tooltip } from "antd";
import { DeleteOutlined, PlusOutlined, StopOutlined } from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { flushSync } from "react-dom";
import { applyKeywordToSearch, buildJoinFields, collectFieldsFromColumns, getFiltersSearch } from "./tableTools";
import { TFilterParams, TGetAllParams, TSort, TTableProps } from "./tableTypes";
import useColumnsSets from "./useColumnsSets";
import DescriptionsCreateModal from "../Descriptions/DescriptionsCreateModal";
import safetyRun from "../../tools/safetyRun";

let creatingRecordsCount = 0;

export const KEY_SYMBOL = Symbol('key');
const NEW_RECORD = 'NEW_RECORD';

export function getNewId(): string {
  return NEW_RECORD + creatingRecordsCount++;
}

export function isRecordNew(record: Record<string | symbol, any>): boolean {
  return record[KEY_SYMBOL]?.startsWith?.(NEW_RECORD) || record.id?.startsWith?.(NEW_RECORD) || false;
}

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
    onDelete,
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
    ...rest
  }: TTableProps<Entity,
    CreateDto,
    UpdateDto,
    TEntityParams,
    TPathParams>
) => {
  const intl = useIntl();
  const actionRefComponent = useRef<ActionType>();
  const actionRef = actionRefProp || actionRefComponent;
  const [createPopupData, setCreatePopupData] = useState<Partial<Entity> | undefined>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [editableData, setEditableData] = useState<(Entity)[]>([]);
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
  ) => {
    const {
      current,
      pageSize,
      keyword,
      baseFilters,
      join,
      ...filter
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
          data.push(`${key},${direction === 'ascend' ? 'ASC' : 'DESC'}`);
          return data;
        },
        []
      );
    if (!sortBy.length && defaultSort) {
      sortBy.push(defaultSort.join(','));
    }
    queryParams.sort = sortBy;

    let search = getFiltersSearch({
      ...baseFilters,
      ...filter,
    }, searchableColumns!, columnsState.value!);
    search = applyKeywordToSearch(search, searchableColumns!, columnsState.value!, keyword);
    queryParams.s = JSON.stringify(search);

    const { joinSelect, joinFields } = buildJoinFields(join);
    queryParams.join = joinSelect;

    queryParams.fields = columns && collectFieldsFromColumns(
      columns,
      idColumnName,
      joinFields,
    ) || [];

    return getAll(queryParams);
  }

  const createButton = <Button
    size={rest.size}
    type="primary"
    key="create"
    onClick={() => {
      if (popupCreation) {
        setCreatePopupData(createNewDefaultParams);
      } else {
        const newId = getNewId();
        actionRef?.current?.addEditRecord({
          [idColumnName]: newId,
          [KEY_SYMBOL]: newId,
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
      request={request}
      rowKey={record => record[KEY_SYMBOL] ?? record[idColumnName]}
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
        onValuesChange(entity, data) {
          setEditableData(data);
        },
        async onSave(
          id,
          record,
          origin,
          newLine,
        ) {
          const data = editableData.find(entity => entity[idColumnName] === id) || record;
          if (newLine) {
            await onCreate?.({
              ...pathParams,
              requestBody: entityToCreateDto(data)
            });
          } else {
            await onUpdate({
              ...pathParams,
              ...{ [idColumnName]: String(id) } as Record<keyof Entity, string>,
              requestBody: entityToUpdateDto({
                ...pathParams,
                ...data,
              }),
            })
          }

          if (typeof afterSave === 'function') {
            await afterSave(data);
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
          editableData.forEach(entity => {
            if (entity[idColumnName] === id) {
              Object.assign(entity, origin);
            }
          })
        },
        async onDelete(id) {
          await onDelete({ ...{ [idColumnName]: String(id) } as Record<keyof Entity, string>, ...pathParams });
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
        !viewOnly && createButton || null,
      ]}
      columns={columns}
      defaultSize='small'
      columnsState={columnsState}
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
          safetyRun(actionRef?.current?.reload());
          setCreatePopupData(undefined);
        }
        catch (e) {
          console.error(e);
        }
      }}
      idColumnName={idColumnName}
      columns={columns ?? []}
    />
  </>);
};

export default Table;
