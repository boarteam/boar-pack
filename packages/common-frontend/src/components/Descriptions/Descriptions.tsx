import { ActionType } from "@ant-design/pro-table";
import React, { Key, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Badge, Button, Result, Tabs, TabsProps, Tooltip } from "antd";
import { DeleteOutlined, StopOutlined } from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { DescriptionsRefType, TDescriptionsProps, TGetOneParams } from "./descriptionTypes";
import { PageLoading, ProDescriptions } from "@ant-design/pro-components";
import { columnsToDescriptionItemProps, TDescriptionSection } from "./useDescriptionColumns";
import pick from "lodash/pick";
import safetyRun from "../../tools/safetyRun";
import { buildJoinFields, collectFieldsFromColumns } from "../Table";
import { RowEditableConfig } from "@ant-design/pro-utils";
import { useForm } from "antd/es/form/Form";
import useContentViewMode, { VIEW_MODE_TYPE } from "./useContentViewMode";
import { createStyles } from "antd-style";
import { debounce } from "lodash";
import { NamePath } from "antd/lib/form/interface";

const useStyles = createStyles(({css}) => {
  return {
    antDescriptionsStyles: css`
      .ant-form-item-control-input-content {
          flex: 0 1 auto;
      },
        
      .ant-descriptions-item-content {
        .anticon-edit {
          opacity: 0;
          transition: opacity 200ms;
        }

        &:hover {
          .anticon-edit {
              opacity: 1;
          }
        }
      }
    `
  }
})

const DescriptionsComponent = <Entity extends Record<string | symbol, any>,
  CreateDto = Entity,
  UpdateDto = Entity,
  TPathParams = object,
>(
  {
    mainTitle = 'General',
    entity,
    getOne,
    onUpdate,
    onCreate,
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
    ...rest
  }: TDescriptionsProps<Entity,
    CreateDto,
    UpdateDto,
    TPathParams>,
  ref: React.Ref<DescriptionsRefType>,
) => {
  const { styles } = useStyles();

  let [form] = useForm<Entity>();
  if (!editable?.form) {
    editable = {
      ...editable,
      form,
    }
  }
  form = editable.form;

  const actionRefComponent = useRef<ActionType>();
  const actionRef = actionRefProp || actionRefComponent;
  const intl = useIntl();
  const [data, setData] = useState<Partial<Entity> | undefined>(entity);
  const [loading, setLoading] = useState(false);

  const sections = columnsToDescriptionItemProps(columns, mainTitle);

  const columnDataIndexToSection = sections.reduce((acc, section) => {
    section.columns.forEach(column => {
      if (Array.isArray(column.dataIndex)) {
        throw new Error('We only support simple dataIndex for now');
      }

      acc.set(column.dataIndex, section);
    })
    return acc;
  }, new Map<Key, TDescriptionSection<Entity>>());

  const {
    contentViewModeButton,
    contentViewMode
  } = useContentViewMode({
    mode: sections.length > 1 ? VIEW_MODE_TYPE.TABS : VIEW_MODE_TYPE.GENERAL
  });
  const [errorsPerSection, setErrorsPerSection] = useState<Map<TDescriptionSection<Entity>['key'], number>>(
    new Map(sections.map(section => [section.key, 0]))
  );

  const handleSubmit = async () => {
    try {
      // Validate all fields in the form
      const data = await form.validateFields();
      // Let the parent component handle the submit logic
      await onCreate(data);
    } catch (error) {
      console.error('Validation or submission failed:', error);
    } finally {
      // Recalculate the error count per section (tab) after validation
      const newErrorsPerSection = new Map<string, number>();
      sections.forEach((section) => {
        let errorCount = 0;
        section.columns.forEach((column) => {
          if (form.getFieldError(column.dataIndex as NamePath<Entity>)?.length > 0) {
            errorCount++;
          }
        });
        newErrorsPerSection.set(section.key, errorCount);
      });
      setErrorsPerSection(newErrorsPerSection);
    }
  };

  useImperativeHandle(ref, () => ({
    reset: () => {
      setErrorsPerSection(new Map(sections.map(section => [section.key, 0])));
      form.resetFields();
    },
    submit: () => handleSubmit(),
  }));

  const onValuesChange = debounce((changedValues, allValues) => {
    let key = Object.keys(changedValues)[0];

    // changedValues = {} if we clear select value
    if (!key) {
      const previousValues = form.getFieldsValue(true);
      key = Object.keys(previousValues).find((field) => !(field in allValues));
    }

    form.validateFields([key])
      .finally(() => {
        const section = columnDataIndexToSection.get(key);
        const dataIndexes = section.columns.map(column => {
          return Array.isArray(column.dataIndex) ? column.dataIndex.join('.') : column.dataIndex;
        });

        const errorsNumber = form.getFieldsError(dataIndexes as NamePath<Entity>[]).reduce((acc, field) => acc + field.errors.length, 0);
        setErrorsPerSection((prev) => {
          const updated = new Map(prev);
          updated.set(section.key, errorsNumber);
          return updated;
        });
      });
  }, 500);

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
          ...{} as Partial<Entity>,
          requestBody: entityToUpdateDto(pick(record, [propName as keyof Entity])),
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
    form.setFieldsValue(entity);
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

  const formProps = contentViewMode === VIEW_MODE_TYPE.TABS ? {
    onValuesChange,
  } : undefined;

  const contentViewSwitcher = sections.length > 1 ? contentViewModeButton : undefined;
  const descriptions = sections.map((section, index) => {
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
      } : undefined}
      columns={section.columns}
      extra={contentViewMode === VIEW_MODE_TYPE.GENERAL && index === 0 ? contentViewSwitcher : undefined}
      formProps={formProps}
      {...rest}
    />;
  });

  if (contentViewMode === VIEW_MODE_TYPE.GENERAL) {
    return descriptions;
  }

  const tabsItems: TabsProps['items'] = sections.map((section, index) => {
    return {
      key: getKey(index),
      label: (
        <Badge
          size='small'
          overflowCount={5}
          count={errorsPerSection.get(section.key)}
        >
          {section.title as React.ReactNode}
        </Badge>
      ),
      forceRender: true,
      children: descriptions[index],
    }
  });

  return <Tabs
    defaultActiveKey="0"
    items={tabsItems}
    tabBarExtraContent={contentViewModeButton}
  />;
};

const Descriptions = React.forwardRef(DescriptionsComponent) as <Entity extends Record<string | symbol, any>,
  CreateDto = Entity,
  UpdateDto = Entity,
  TPathParams = object>(
  props: TDescriptionsProps<Entity, CreateDto, UpdateDto, TPathParams>
) => React.ReactElement;

export default Descriptions;
