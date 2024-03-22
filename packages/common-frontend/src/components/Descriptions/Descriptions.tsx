import { ActionType } from "@ant-design/pro-table";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Tooltip } from "antd";
import { DeleteOutlined, StopOutlined } from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { TDescriptionsProps, TGetOneParams } from "./descriptionTypes";
import { buildJoinFields, collectFieldsFromColumns } from "../Table/tableTools";
import { ProDescriptionsProps } from "@ant-design/pro-descriptions";
import { ProDescriptions } from "@ant-design/pro-components";
import { columnsToDescriptionItemProps } from "./useDescriptionColumns";
import pick from "lodash/pick";
import safetyRun from "../../tools/safetyRun";

const Descriptions = <Entity extends Record<string | symbol, any>,
  CreateDto = Entity,
  UpdateDto = Entity,
  TPathParams = {},
  TKey = string,
  >(
  {
    mainTitle,
    getOne,
    // onCreate,
    onUpdate,
    onDelete,
    pathParams,
    idColumnName = 'id',
    // entityToCreateDto,
    entityToUpdateDto,
    createNewDefaultParams,
    afterSave,
    actionRef: actionRefProp,
    editable,
    canEdit = false,
    columns,
    params,
    record,
    ...rest
  }: TDescriptionsProps<Entity,
    CreateDto,
    UpdateDto,
    TPathParams> & Omit<ProDescriptionsProps<Entity>, 'columns'>
) => {
  const actionRefComponent = useRef<ActionType>();
  const actionRef = actionRefProp || actionRefComponent;
  const intl = useIntl();
  const [data, setData] = useState<Entity | undefined>(record);
  const [loading, setLoading] = useState(true);

  const sections = columnsToDescriptionItemProps(columns, mainTitle);

  const queryParams = useMemo(() => {
    const join = params?.join;
    const queryParams: TGetOneParams & TPathParams = {
      ...pathParams,
    };

    const { joinSelect, joinFields } = buildJoinFields(join);
    queryParams.join = joinSelect;
    queryParams.fields = collectFieldsFromColumns(
      columns,
      idColumnName,
      joinFields,
    );

    return queryParams;
  }, [params])

  const requestData = async () => {
    setLoading(true);

    try {
      const record = await getOne(queryParams);
      setData(record ?? undefined);
    }
    catch (e) {
      console.error(e);
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!data) {
      safetyRun(requestData());
    }
  }, [])

  return (
    <>
      {sections.map((section, index) => (
        <ProDescriptions<Entity>
          key={index + String(pathParams[idColumnName as keyof TPathParams])}
          title={section.title as React.ReactNode}
          actionRef={actionRef}
          size={"small"}
          bordered
          loading={loading}
          style={{ marginBottom: 20 }}
          labelStyle={{ width: '15%' }}
          contentStyle={{ width: '20%' }}
          dataSource={data}
          editable={canEdit ? {
            type: 'multiple',
            async onSave(
              propName,
              record,
            ) {
              try {
                await onUpdate({
                  ...queryParams,
                  ...{} as Record<keyof Entity, string>, // todo: fix this
                  // @ts-ignore
                  requestBody: entityToUpdateDto(pick(record, [propName])),
                });

                setData(record);
                if (typeof afterSave === 'function') {
                  await afterSave(record);
                }
              }
              catch (e) {
                console.error(e);
              }
            },
            deletePopconfirmMessage: intl.formatMessage({ id: 'table.deletePopconfirmMessage' }),
            onlyAddOneLineAlertMessage: intl.formatMessage({ id: 'table.onlyAddOneLineAlertMessage' }),
            cancelText: <Tooltip title={intl.formatMessage({ id: 'table.cancelText' })}><StopOutlined /></Tooltip>,
            deleteText: <Tooltip title={intl.formatMessage({ id: 'table.deleteText' })}><DeleteOutlined /></Tooltip>,
            saveText: <Button size={"small"} type={"primary"}><FormattedMessage id={'table.saveText'} /></Button>,
            ...editable,
          }: undefined}
          columns={section.columns}
          {...rest}
        />
      ))}
    </>
  );
};

export default Descriptions;
