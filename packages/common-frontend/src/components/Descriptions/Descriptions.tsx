import { ActionType } from "@ant-design/pro-table";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Result, Tabs, Tooltip } from "antd";
import { DeleteOutlined, StopOutlined } from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { TDescriptionsProps, TGetOneParams } from "./descriptionTypes";
import { ProDescriptionsProps } from "@ant-design/pro-descriptions";
import { PageLoading, ProDescriptions } from "@ant-design/pro-components";
import { columnsToDescriptionItemProps } from "./useDescriptionColumns";
import pick from "lodash/pick";
import safetyRun from "../../tools/safetyRun";
import { buildJoinFields, collectFieldsFromColumns } from "../Table";
import { RowEditableConfig } from "@ant-design/pro-utils";
import { useForm } from "antd/es/form/Form";
import { VIEW_MODE_TYPE } from "../Table/ContentViewModeButton";

const Descriptions = <Entity extends Record<string | symbol, any>,
  CreateDto = Entity,
  UpdateDto = Entity,
  TPathParams = object,
  >(
  {
    mainTitle,
    entity,
    getOne,
    onUpdate,
    pathParams,
    idColumnName = 'id',
    entityToUpdateDto,
    afterSave,
    actionRef: actionRefProp,
    editable,
    canEdit = false,
    columns,
    params,
    onEntityChange,
    viewMode = VIEW_MODE_TYPE.GENERAL,
    ...rest
  }: TDescriptionsProps<Entity,
    CreateDto,
    UpdateDto,
    TPathParams> & Omit<ProDescriptionsProps<Entity>, 'columns'>
) => {
  const [form] = useForm<Entity>();
  const actionRefComponent = useRef<ActionType>();
  const actionRef = actionRefProp || actionRefComponent;
  const intl = useIntl();
  const [data, setData] = useState<Partial<Entity> | undefined>(entity);
  const [loading, setLoading] = useState(false);

  const sections = columnsToDescriptionItemProps(columns, mainTitle);

  const queryParams = useMemo(() => {
    const join = params?.join;
    const queryParams: TGetOneParams & TPathParams = {
      ...(pathParams ?? {} as TPathParams),
    };

    const { joinSelect, joinFields } = buildJoinFields(join);
    queryParams.join = joinSelect;
    queryParams.fields = collectFieldsFromColumns(
      columns,
      idColumnName,
      joinFields,
    );

    return queryParams;
  }, [params, pathParams]);

  const getKey = (index: number) =>
    index + String(pathParams?.[idColumnName as keyof TPathParams])

  const requestData = async () => {
    if (!getOne) {
      return;
    }

    setLoading(true);

    try {
      const record = await getOne(queryParams);
      onEntityChange?.(record);
      setData(record ?? undefined);
    } catch (e) {
      console.error(e);
      setData(undefined);
    } finally {
      setLoading(false);
    }
  }

  const onSave: RowEditableConfig<Entity>['onSave'] = async (propName, record) => {
    try {
      await form.validateFields();
      if (onUpdate && entityToUpdateDto) {
        await onUpdate({
          ...queryParams,
          ...{} as Record<keyof Entity, string>, // todo: fix this
          // @ts-ignore
          requestBody: entityToUpdateDto(pick(record, [propName])),
        });
      }

      setData(record);
      if (typeof afterSave === 'function') {
        await afterSave(record);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    safetyRun(requestData());
  }, [])

  useEffect(() => {
    setData(entity);
    form.setFieldsValue(entity as Entity);
  }, [entity])

  if (loading) {
    return <PageLoading />;
  }

  if (!data) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="The instrument is not found."
        extra={<Button type="primary" href={'/liquidity/ecn-instruments'}>See list of instruments</Button>}
      />
    );
  }

  const descriptions = sections.map((section, index) => {
    // In the general view mode we need to render extra elements only ones for the top one section
    if (viewMode === VIEW_MODE_TYPE.GENERAL && rest.extra && index !== 0)  {
      rest.extra = null;
    }

    return <ProDescriptions<Entity>
      // @ts-ignore-next-line
      form={form}
      key={getKey(index)}
      title={section.title as React.ReactNode}
      actionRef={actionRef}
      size={"small"}
      bordered
      loading={loading}
      style={{ marginBottom: 20 }}
      labelStyle={{ width: '15%' }}
      contentStyle={{ width: '20%' }}
      dataSource={data as Entity}
      editable={canEdit ? {
        type: 'multiple',
        onSave,
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
  })

  return (
    <>
      {
        viewMode === VIEW_MODE_TYPE.TABS ?
          (<Tabs defaultActiveKey="0">
            {
              descriptions.map((description, index) => (
                <Tabs.TabPane
                  tab={description.props.title as React.ReactNode}
                  key={getKey(index)}
                >
                  {description}
                </Tabs.TabPane>
              ))
            }
          </Tabs>)
          : descriptions
      }
    </>
  );
};

export default Descriptions;
