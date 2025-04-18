import { EditableProps } from "./tableTypes";
import type { RowEditableConfig } from "@ant-design/pro-utils";
import { flushSync } from "react-dom";
import { Button, Tooltip } from "antd";
import { DeleteOutlined, StopOutlined } from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import React, { useState } from "react";
import { isRecordNew } from "./useCreation";

export function useEditableTable<Entity, CreateDto, UpdateDto, TPathParams = {}>(
  {
    actionRef,
    pathParams,
    onCreate,
    onUpdate,
    onDelete,
    entityToCreateDto,
    entityToUpdateDto,
    afterSave,
    editable,
  }: {
    pathParams: TPathParams,
  } & EditableProps<Entity, CreateDto, UpdateDto, TPathParams>
) {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const intl = useIntl();

  const editableConfig: RowEditableConfig<Entity> = {
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
      if (isRecordNew(row)) return;
      await onDelete({ ...row, ...pathParams });
    },
    deletePopconfirmMessage: intl.formatMessage({ id: 'table.deletePopconfirmMessage' }),
    onlyAddOneLineAlertMessage: intl.formatMessage({ id: 'table.onlyAddOneLineAlertMessage' }),
    cancelText: <Tooltip title={intl.formatMessage({ id: 'table.cancelText' })}><StopOutlined /></Tooltip>,
    deleteText: <Tooltip title={intl.formatMessage({ id: 'table.deleteText' })}><DeleteOutlined /></Tooltip>,
    saveText: <Button size={"small"} type={"primary"}><FormattedMessage id={'table.saveText'} /></Button>,
    ...editable,
  }

  return {
    editableConfig,
  };
}
