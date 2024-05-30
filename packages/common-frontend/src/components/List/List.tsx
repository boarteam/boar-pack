import { ActionType } from "@ant-design/pro-table";
import React, { useEffect, useRef, useState } from "react";
import { Button, Tooltip } from "antd";
import { DeleteOutlined, PlusOutlined, StopOutlined } from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { flushSync } from "react-dom";
import { ProList } from "@ant-design/pro-components";
import { getNewId, KEY_SYMBOL } from "./Table";
import { createStyles } from "antd-style";
import { TListProps } from "./listTypes";
import {
  applyKeywordToSearch,
  buildJoinFields, collectFieldsFromColumns,
  getFiltersSearch,
  TFilterParams,
  TFilters,
  TGetAllParams,
  TSort
} from "../Table";
import DescriptionsCreateModal from "../Descriptions/DescriptionsCreateModal";

const useStyles = createStyles(() => {
  return {
    list: {
      '.ant-pro-list-row-editable .ant-form-item': {
        width: '100%',
      },
      '.ant-pro-checkcard-body': {
        padding: '12px !important',
      }
    }
  }
})

const List = <Entity extends Record<string | symbol, any>,
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
    popupCreation = false,
    toolBarRender,
    metas,
    ...rest
  }: TListProps<Entity,
    CreateDto,
    UpdateDto,
    TEntityParams,
    TPathParams>
) => {
  const actionRefComponent = useRef<ActionType>();
  const actionRef = actionRefProp || actionRefComponent;
  // const [createPopupData, setCreatePopupData] = useState<Partial<Entity> | undefined>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [editableData, setEditableData] = useState<(Entity)[]>([]);
  const intl = useIntl();

  useEffect(() => {
    actionRef?.current?.reload();
  }, [JSON.stringify(pathParams)]);

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
      filters,
      searchableColumns,
    });
    search = applyKeywordToSearch(search, searchableColumns!, null, keyword);
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
      // if (popupCreation) {
      //   setCreatePopupData(createNewDefaultParams);
      // } else {
        const newId = getNewId();
        actionRef?.current?.addEditRecord({
          [idColumnName]: newId,
          [KEY_SYMBOL]: newId,
          ...createNewDefaultParams,
        }, {
          position: 'top',
        });
      // }
    }}
  >
    <PlusOutlined /> <FormattedMessage id={'table.newButton'} />
  </Button>;

  return (<>
    <ProList<Entity>
      className={useStyles().styles.list}
      actionRef={actionRef}
      request={request}
      rowKey={record => record[KEY_SYMBOL] ?? record[idColumnName]}
      bordered
      search={false}
      options={{
        fullScreen: true,
        reload: true,
        search: {},
      }}
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
        !viewOnly && createButton || null,
      ]}
      grid={{ gutter: 16, column: 1 }}
      metas={metas}
      {...rest}
    />
    {/*<DescriptionsCreateModal<Entity>*/}
    {/*  data={createPopupData}*/}
    {/*  onClose={() => setCreatePopupData(undefined)}*/}
    {/*  onSubmit={async (data) => {*/}
    {/*    try {*/}
    {/*      await onCreate?.({*/}
    {/*        ...pathParams,*/}
    {/*        requestBody: entityToCreateDto({*/}
    {/*          ...pathParams,*/}
    {/*          ...data,*/}
    {/*        })*/}
    {/*      });*/}
    {/*      actionRef?.current?.reload();*/}
    {/*      setCreatePopupData(undefined);*/}
    {/*    }*/}
    {/*    catch (e) {*/}
    {/*      console.error(e);*/}
    {/*    }*/}
    {/*  }}*/}
    {/*  idColumnName={idColumnName}*/}
    {/*  columns={columns ?? []}*/}
    {/*/>*/}
  </>);
};

export default List;
