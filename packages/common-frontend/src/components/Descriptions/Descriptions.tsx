import { ActionType } from "@ant-design/pro-table";
import React, { Key, useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Result, Tabs, TabsProps, Tooltip } from "antd";
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
import ContentViewModeButton, { VIEW_MODE_TYPE } from "../Table/ContentViewModeButton";
import { createStyles } from "antd-style";
import { debounce } from "lodash";
import { NamePath } from "antd/lib/form/interface";

const useStyles = createStyles(() => {
  return {
    antDescriptionsStyles: {
      '.anticon-edit': {
        opacity: 0,
        transition: 'opacity 200ms'
      },
      '.ant-descriptions-item-content': {
        width: '20%',
      },
      '.ant-descriptions-item-content:hover': {
        '.anticon-edit': {
          opacity: 1
        },
      }
    }
  }
})

const Descriptions = <Entity extends Record<string | symbol, any>,
  CreateDto = Entity,
  UpdateDto = Entity,
  TPathParams = object,
  >(
  {
    descriptionsDefaultTitle = 'General',
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
    errorsPerTabInitialValue,
    ...rest
  }: TDescriptionsProps<Entity,
    CreateDto,
    UpdateDto,
    TPathParams> & Omit<ProDescriptionsProps<Entity>, 'columns'>
) => {
  const { styles } = useStyles();

  if (!editable?.form) {
    editable = {
      ...editable,
      form: useForm<Entity>()[0],
    }
  }

  const form = editable.form;

  const actionRefComponent = useRef<ActionType>();
  const actionRef = actionRefProp || actionRefComponent;
  const intl = useIntl();
  const [data, setData] = useState<Partial<Entity> | undefined>(entity);
  const [loading, setLoading] = useState(false);
  const sections = useMemo(() => columnsToDescriptionItemProps(columns, descriptionsDefaultTitle), []);
  const fieldsToSectionsMap = useMemo(() => sections.reduce((acc, section, index) => {
    section.columns.forEach(column => {
      acc.set(column.dataIndex, index);
    })
    return acc;
  }, new Map<Key | Key[], number>), []);
  const fieldsToSectionsArray = useMemo(() => sections.map((section) => {
    return section.columns.map(column => column.dataIndex)
  }), []);
  const [descriptionsModalViewMode, setDescriptionsModalViewMode] = useState<VIEW_MODE_TYPE>(sections.length > 1 ? VIEW_MODE_TYPE.TABS : VIEW_MODE_TYPE.GENERAL);
  const [errorsPerTab, setErrorsPerTab] = useState<number[]>(errorsPerTabInitialValue ?? sections.map(() => 0));

  const onValuesChange = useMemo(
    () =>
      debounce((changedValues, allValues) => {
        let key = Object.keys(changedValues)[0];

        // changedValues = {} if we clear select value
        if (!key) {
          const previousValues = form.getFieldsValue(true);
          key = Object.keys(previousValues).find((field) => !(field in allValues));
        }

        form.validateFields([key])
          .finally(() => {
            const sectionIndex = fieldsToSectionsMap.get(key);
            const keys = fieldsToSectionsArray[sectionIndex];

            const errorsNumber = form.getFieldsError(keys.flat() as NamePath[]).reduce((acc, field) => acc + field.errors.length, 0);

            setErrorsPerTab((prev) => {
              const updated = [...prev];
              updated[sectionIndex] = errorsNumber;
              return updated;
            });
          });
      }, 500),
    []
  );

  if (sections.length > 1) {
    rest.extra = (
      <ContentViewModeButton
        contentViewMode={descriptionsModalViewMode}
        setContentViewMode={setDescriptionsModalViewMode}
      />
    )
  }

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

  useEffect(() => {
    if (errorsPerTabInitialValue) {
      setErrorsPerTab(errorsPerTabInitialValue);
    }
  }, [errorsPerTabInitialValue]);

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
    if (descriptionsModalViewMode === VIEW_MODE_TYPE.GENERAL && rest.extra && index !== 0)  {
      rest.extra = null;
    }

    // In the tabs view mode we should also handle fields update and show number of validated errors
    if (descriptionsModalViewMode === VIEW_MODE_TYPE.TABS) {
      rest.formProps = {
        onValuesChange,
      }
    }

    return <ProDescriptions<Entity>
      key={getKey(index)}
      title={section.title as React.ReactNode}
      actionRef={actionRef}
      size={"small"}
      bordered
      loading={loading}
      style={{ marginBottom: 20 }}
      labelStyle={{ width: '15%' }}
      dataSource={data as Entity}
      className={styles.antDescriptionsStyles}
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

  const tabsItems: TabsProps['items'] = descriptions.map((description, index) => ({
    key: getKey(index),
    label: (
      <Badge
        size='small'
        overflowCount={5}
        count={errorsPerTab[index]}
      >
        { description.props.title }
      </Badge>
    ),
    forceRender: true,
    children: description,
  }));

  return (
    <>
      {
        descriptionsModalViewMode === VIEW_MODE_TYPE.TABS ?
          (<Tabs defaultActiveKey="0" items={tabsItems} />)
          : descriptions
      }
    </>
  );
};

export default Descriptions;
