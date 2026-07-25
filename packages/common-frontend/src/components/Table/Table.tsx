import ProTable, { ActionType } from '@ant-design/pro-table';
import { useEffect, useRef, useState } from 'react';
import { Modal } from 'antd';
import { TFilterParams, TFilters, TSort, TTableProps } from './tableTypes';
import useColumnsSets from './useColumnsSets';
import { createStyles } from 'antd-style';
import { Descriptions } from '../Descriptions';
import { KEY_SYMBOL, useCreation } from './useCreation';
import { getTableDataQueryParams } from './getTableDataQueryParams';
import { useEditableTable } from './useEditableTable';
import { useBulkEditing } from './useBulkEditing';
import { useImportExport } from './useImportExport';
import { ChangesModal } from '../ChangesModal';
import { ProColumns } from '@ant-design/pro-components';

const useStyles = createStyles(() => {
  return {
    table: {
      '.ant-pro-table-alert': {
        display: 'none',
      },
    },
  };
});

const Table = <
  Entity extends Record<string | symbol, any>,
  CreateDto = Entity,
  UpdateDto = Entity,
  TEntityParams = {},
  TPathParams extends Record<string, string | number> = {},
  TImportRequest extends {} = {
    // TODO: Add to Table types
    new?: Array<Entity>;
    modified?: Array<Entity>;
  },
>({
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
}: TTableProps<Entity, CreateDto, UpdateDto, TEntityParams, TPathParams>) => {
  const actionRefComponent = useRef<ActionType>();
  const actionRef = actionRefProp || actionRefComponent;
  const [updatePopupData, setUpdatePopupData] = useState<Partial<Entity> | undefined>();
  const { styles } = useStyles();
  const flatColumns: ProColumns<Entity>[] = [];
  columns.forEach((column) => {
    if (column.children && column.children.length > 0) {
      flatColumns.push(...column.children);
    } else {
      flatColumns.push(column);
    }
  });

  // TTableProps marks the editable callbacks as optional (they may be omitted for viewOnly
  // tables), but the corresponding UI is hidden in that case, so the hooks never invoke them.
  const { editableConfig } = useEditableTable<Entity, CreateDto, UpdateDto, TPathParams>({
    actionRef,
    pathParams,
    onCreate,
    onUpdate: onUpdate!,
    onDelete: onDelete!,
    entityToCreateDto: entityToCreateDto!,
    entityToUpdateDto: entityToUpdateDto!,
    afterSave,
    editable,
    onDeleteMany: onDeleteMany!,
    onUpdateMany: onUpdateMany!,
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
    onDeleteMany: onDeleteMany!,
    onUpdateMany: onUpdateMany!,
    entityToUpdateDto: entityToUpdateDto!,
    pathParams,
  });

  const { creationModal, createButton } = useCreation<Entity, CreateDto, TPathParams>({
    title: createPopupTitle,
    mainTitle: descriptionsMainTitle,
    columns: columns,
    idColumnName: idColumnName,
    onCreate,
    pathParams,
    entityToCreateDto: entityToCreateDto!,
    actionRef,
    createButtonSize: rest.size,
    popupCreation,
    createNewDefaultParams,
  });

  const { exportButton, importButton, setLastQueryParams, diffResult, setDiffResult } =
    useImportExport<Entity, TPathParams>({
      columns: flatColumns,
      exportUrl,
      exportParams,
      changedRecordsColumnsConfig: importConfig?.changedRecordsColumnsConfig,
      relationalFields: importConfig?.relationalFields,
    });

  useEffect(() => {
    setUpdatePopupData(editableRecord);
    actionRef?.current?.reload();
  }, [editableRecord, JSON.stringify(pathParams), JSON.stringify(params)]);

  const { columnsSetSelect: localColumnsSetSelect, columnsState: localColumnsState } =
    useColumnsSets<Entity>({
      columns,
      columnsSets,
    });

  const columnsState = managedColumnsState ?? localColumnsState;
  const columnsSetSelect = managedColumnsSetSelect ?? localColumnsSetSelect;

  const request = async (params: TFilterParams, sort: TSort = {}, filters: TFilters = {}) => {
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
    setLastRequest([queryParams, result]);
    setLastQueryParams(queryParams);
    return result;
  };

  return (
    <>
      <ProTable<Entity, TEntityParams & TFilterParams>
        actionRef={actionRef}
        className={styles.table}
        request={request}
        rowKey={(record) =>
          record[KEY_SYMBOL] ??
          (Array.isArray(idColumnName)
            ? idColumnName.map((colName) => record[colName]).join('-')
            : record[idColumnName])
        }
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
        toolBarRender={
          toolBarRender === false
            ? false
            : (...args) => [
                columnsSetSelect?.() || null,
                !viewOnly && onUpdateMany ? bulkEditButton : null,
                !viewOnly && onDeleteMany ? bulkDeleteButton : null,
                (!viewOnly && createButton) || null,
                (!viewOnly && importConfig?.onImport && importButton) || null,
                (exportUrl && exportButton) || null,
                ...((toolBarRender && toolBarRender(...args)) || []),
              ]
        }
        columns={columns}
        defaultSize="small"
        columnsState={columnsState}
        params={params}
        {...(!viewOnly && (onUpdateMany || onDeleteMany) ? { rowSelection } : {})}
        {...rest}
      />

      {creationModal}

      <Modal
        title={editPopupTitle}
        open={updatePopupData !== undefined}
        width="80%"
        closeIcon={true}
        footer={null}
        onCancel={() => {
          actionRef?.current?.reload();
          setUpdatePopupData(undefined);
        }}
      >
        <Descriptions<Entity, CreateDto, UpdateDto, TPathParams>
          mainTitle={descriptionsMainTitle}
          columns={columns ?? []}
          entity={updatePopupData}
          canEdit={true}
          onUpdate={onUpdate}
          entityToUpdateDto={entityToUpdateDto}
        />
      </Modal>
      {/* The modal only renders content once diffResult is set, which requires a completed
          import — and the import UI is only shown when importConfig is provided, so the
          assertions below are type-only; the fallback object keeps the runtime prop
          values (undefined) identical when importConfig is absent. */}
      <ChangesModal<Entity, TImportRequest>
        {...(diffResult && { changes: diffResult })}
        onCommit={(importConfig ?? ({} as NonNullable<typeof importConfig>)).onImport!}
        onClose={() => {
          actionRef.current?.reload();
          setDiffResult(undefined);
        }}
        originRecordsColumnsConfig={flatColumns}
        changedRecordsColumnsConfig={
          (importConfig ?? ({} as NonNullable<typeof importConfig>)).changedRecordsColumnsConfig!
        }
        createdRecordsColumnsConfig={{
          columnsSets,
          columns: (importConfig ?? ({} as NonNullable<typeof importConfig>))
            .createdRecordsColumnsConfig!,
        }}
        relationalFields={importConfig?.relationalFields}
      />
      {messagesContext}
    </>
  );
};

export default Table;
