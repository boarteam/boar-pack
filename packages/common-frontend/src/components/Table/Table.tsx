import ProTable, { ActionType } from "@ant-design/pro-table";
import { useEffect, useRef, useState } from "react";
import { Button, Modal } from "antd";
import { TFilterParams, TFilters, TSort, TTableProps } from "./tableTypes";
import useColumnsSets from "./useColumnsSets";
import { createStyles } from "antd-style";
import { Descriptions, DescriptionsRefType, FieldsEdit } from "../Descriptions";
import { KEY_SYMBOL, useCreation } from "./useCreation";
import { getTableDataQueryParams } from "./getTableDataQueryParams";
import { useEditableTable } from "./useEditableTable";
import { useBulkEditing } from "./useBulkEditing";
import { useImportExport } from "./useImportExport";
import { ChangesModal } from "../ChangesModal";
import { ProColumns } from "@ant-design/pro-components";

const useStyles = createStyles(() => {
  return {
    table: {
      '.ant-pro-table-alert': {
        display: 'none',
      },
    }
  }
})

const Table = <
  Entity extends Record<string | symbol, any>,
  CreateDto = Entity,
  UpdateDto = Entity,
  TEntityParams = {},
  TPathParams extends Record<string, string | number> = {},
  TImportRequest = { // TODO: Add to Table types
    new?: Array<Entity>,
    modified?: Array<Entity>,
  },
>(
  {
    getAll,
    onCreate,
    onUpdate,
    onUpdateMany,
    onDelete,
    onDeleteMany,
    exportUrl,
    exportParams,
    pathParams,
    idColumnName = 'id',
    entityToCreateDto,
    entityToUpdateDto,
    createNewDefaultParams,
    editableRecord,
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
    editPopupTitle,
    createPopupTitle,
    descriptionsMainTitle,
    importConfig,
    ...rest
  }: TTableProps<Entity,
    CreateDto,
    UpdateDto,
    TEntityParams,
    TPathParams>
) => {
  const actionRefComponent = useRef<ActionType>();
  const actionRef = actionRefProp || actionRefComponent;
  const [updatePopupData, setUpdatePopupData] = useState<Partial<Entity> | undefined>();
  const { styles } = useStyles();
  const ref = useRef<DescriptionsRefType<Entity>>();
  const flatColumns: ProColumns<Entity>[] = [];
  const [isLoading, setIsLoading] = useState(false);

  const editModalCancelHandler = () => {
    actionRef?.current?.reload();
    setUpdatePopupData(undefined);
  }

  columns.forEach((column) => {
    if (column.children && column.children.length > 0) {
      flatColumns.push(...column.children);
    } else {
      flatColumns.push(column);
    }
  });

  const {
    editableConfig,
  } = useEditableTable<Entity, CreateDto, UpdateDto, TPathParams>({
    actionRef,
    pathParams,
    onCreate,
    onUpdate,
    onDelete,
    entityToCreateDto,
    entityToUpdateDto,
    afterSave,
    editable,
    onDeleteMany,
    onUpdateMany,
  });

  const {
    rowSelection,
    setSelectedRecords,
    setLastRequest,
    bulkEditButton,
    bulkDeleteButton,
    messagesContext,
  } = useBulkEditing<Entity, TPathParams, UpdateDto, TEntityParams & TFilterParams>({
    actionRef,
    columns,
    idColumnName,
    onDeleteMany,
    onUpdateMany,
    entityToUpdateDto,
    pathParams,
  });

  const {
    creationModal,
    createButton,
  } = useCreation<Entity, CreateDto, TPathParams>({
    title: createPopupTitle,
    mainTitle: descriptionsMainTitle,
    columns: columns,
    idColumnName: idColumnName,
    onCreate,
    pathParams,
    entityToCreateDto,
    actionRef,
    createButtonSize: rest.size,
    popupCreation,
    createNewDefaultParams,
  });

  const {
    exportButton,
    importButton,
    setLastQueryParams,
    diffResult,
    setDiffResult,
  } = useImportExport<Entity, TPathParams>({
    columns: flatColumns,
    exportUrl,
    exportParams,
    changedRecordsColumnsConfig: importConfig?.changedRecordsColumnsConfig,
    relationalFields: importConfig?.relationalFields,
  })

  useEffect(() => {
    setUpdatePopupData(editableRecord);
    actionRef?.current?.reload();
  }, [editableRecord, JSON.stringify(pathParams), JSON.stringify(params)]);

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
    const queryParams = getTableDataQueryParams({
      params,
      sort,
      filters,
      pathParams,
      defaultSort,
      searchableColumns,
      columns,
      idColumnName,
      columnsState,
    });

    const result = await getAll(queryParams);

    setSelectedRecords([]);
    setLastRequest([
      queryParams,
      result,
    ]);
    setLastQueryParams(queryParams);
    return result;
  }

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
      scroll={{
        x: 'max-content',
      }}
      bordered
      search={false}
      editable={editableConfig}
      toolBarRender={toolBarRender === false ? false : (...args) => [
        columnsSetSelect?.() || null,
        !viewOnly && onUpdateMany
          ? bulkEditButton
          : null,
        !viewOnly && onDeleteMany
          ? bulkDeleteButton
          : null,
        !viewOnly && createButton || null,
        !viewOnly && importConfig?.onImport && importButton || null,
        exportUrl && exportButton || null,
        ...toolBarRender && toolBarRender(...args) || [],
      ]}
      columns={columns}
      defaultSize='small'
      columnsState={columnsState}
      params={params}
      {
        ...(
          !viewOnly && (onUpdateMany || onDeleteMany)
            ? { rowSelection }
            : {}
        )
      }
      {...rest}
    />

    {creationModal}

    <Modal
      title={editPopupTitle}
      open={updatePopupData !== undefined}
      width='80%'
      closeIcon={true}
      footer={rest.fieldsEditType === FieldsEdit.All ? <>
        <Button
          type='primary'
          loading={isLoading}
          onClick={() => {
            setIsLoading(true);
            ref.current?.update()
              .then(() => {
              editModalCancelHandler();
            })
              .finally(() => setIsLoading(false));
          }}>
          Save
        </Button>
        <Button onClick={editModalCancelHandler}>Cancel</Button>
      </> : null}
      onCancel={editModalCancelHandler}
    >
      <Descriptions<Entity, CreateDto, UpdateDto, TPathParams>
        mainTitle={descriptionsMainTitle}
        columns={columns ?? []}
        entity={updatePopupData}
        ref={ref}
        canEdit={true}
        onUpdate={onUpdate}
        entityToUpdateDto={entityToUpdateDto}
        fieldsEditType={rest.fieldsEditType ?? FieldsEdit.Single}
      />
    </Modal>
    <ChangesModal<
        Entity,
        TImportRequest
      >
      {...(diffResult && { changes: diffResult })}
      onCommit={importConfig?.onImport}
      onClose={() => {
        actionRef.current?.reload();
        setDiffResult(undefined);
      }}
      originRecordsColumnsConfig={flatColumns}
      changedRecordsColumnsConfig={importConfig?.changedRecordsColumnsConfig}
      createdRecordsColumnsConfig={{
        columnsSets,
        columns: importConfig?.createdRecordsColumnsConfig
      }}
      relationalFields={importConfig?.relationalFields}
    />
    {messagesContext}
  </>);
};

export default Table;
