import { ActionType } from '@ant-design/pro-table';
import React, { Key, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Badge, Button, Result, Tabs, TabsProps, Tooltip } from 'antd';
import { DeleteOutlined, StopOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  DescriptionsRefType,
  FieldsEdit,
  TDescriptionsProps,
  TGetOneParams,
} from './descriptionTypes';
import { PageLoading, ProDescriptions } from '@ant-design/pro-components';
import { columnsToDescriptionItemProps, TDescriptionSection } from './useDescriptionColumns';
import pick from 'lodash/pick';
import safetyRun from '../../tools/safetyRun';
import {
  buildFieldsFromColumnsForDescriptionsDisplay,
  buildJoinFields,
  collectFieldsFromColumns,
} from '../Table';
import { RowEditableConfig } from '@ant-design/pro-utils';
import { useForm } from 'antd/es/form/Form';
import useContentViewMode, { VIEW_MODE_TYPE } from './useContentViewMode';
import { createStyles } from 'antd-style';
import { debounce } from 'lodash';
import { NamePath } from 'antd/lib/form/interface';
import { FieldData } from 'rc-field-form/lib/interface';

const useStyles = createStyles(({ css }) => {
  return {
    antDescriptionsStyles: css`
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
    `,
  };
});

const DescriptionsComponent = <
  Entity extends Record<string | symbol, any>,
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
    fieldsEditType = FieldsEdit.Single,
    columns,
    params,
    onEntityChange,
    contentViewMode: contentViewModeProp,
    ...rest
  }: TDescriptionsProps<Entity, CreateDto, UpdateDto, TPathParams>,
  ref: React.Ref<DescriptionsRefType<Entity>>,
) => {
  const { styles } = useStyles();

  const [ownForm] = useForm<Entity>();
  // Callers may bring their own form instance; otherwise the component supplies one.
  const editableConfig = editable?.form ? editable : { ...editable, form: ownForm };
  // the expression above guarantees form is set
  const form = editableConfig.form!;

  const actionRefComponent = useRef<ActionType>();
  const actionRef = actionRefProp || actionRefComponent;
  const intl = useIntl();
  const [data, setData] = useState<Partial<Entity> | undefined>(entity);
  const [loading, setLoading] = useState(false);

  const sections = columnsToDescriptionItemProps(columns, mainTitle);

  const columnDataIndexToSection = sections.reduce((acc, section) => {
    section.columns.forEach((column) => {
      if (Array.isArray(column.dataIndex)) {
        throw new Error('We only support simple dataIndex for now');
      }

      acc.set(column.dataIndex, section);
    });
    return acc;
  }, new Map<Key | undefined, TDescriptionSection<Entity>>());

  const { contentViewModeButton, contentViewMode } = useContentViewMode({
    mode:
      contentViewModeProp || (sections.length > 1 ? VIEW_MODE_TYPE.TABS : VIEW_MODE_TYPE.GENERAL),
  });
  const [errorsPerSection, setErrorsPerSection] = useState<
    Map<TDescriptionSection<Entity>['key'], number>
  >(new Map(sections.map((section) => [section.key, 0])));

  const handleSubmit = async () => {
    if (!onCreate) {
      // Submitting is a create flow (e.g. CreateEntityModal); without a handler there is
      // nothing to submit to. Fail outside of the try below so the wiring mistake is not
      // reported as a validation failure.
      throw new Error('Descriptions: submit() needs an onCreate handler to send the data to');
    }

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
      setErrorsPerSection(new Map(sections.map((section) => [section.key, 0])));
      form.resetFields();
    },
    submit: () => handleSubmit(),
    setFieldErrors: (fields: FieldData<Entity>[]) => {
      form.setFields(fields);
    },
  }));

  const onValuesChange = debounce((changedValues, allValues) => {
    let key = Object.keys(changedValues)[0];

    // changedValues = {} if we clear select value
    if (!key) {
      const previousValues = form.getFieldsValue(true);
      key = Object.keys(previousValues).find((field) => !(field in allValues))!;
    }

    form.validateFields([key]).finally(() => {
      // every editable field belongs to a column registered in the map above
      const section = columnDataIndexToSection.get(key)!;
      const dataIndexes = section.columns.map((column) => {
        return Array.isArray(column.dataIndex) ? column.dataIndex.join('.') : column.dataIndex;
      });

      const errorsNumber = form
        .getFieldsError(dataIndexes as NamePath<Entity>[])
        .reduce((acc, field) => acc + field.errors.length, 0);
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
      ...(pathParams ?? ({} as TPathParams)),
    } as TGetOneParams & TPathParams;

    const { joinSelect, joinFields } = buildJoinFields(join);
    queryParams.join = joinSelect;
    queryParams.fields = collectFieldsFromColumns(columns, idColumnName, joinFields);

    return queryParams;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callers rebuild `columns` on every render, so listing it (and idColumnName, which travels with it) would recompute the memo on every render; the requested fields only have to follow the request params
  }, [params, pathParams]);

  const getKey = (index: number) => index + String(pathParams?.[idColumnName as keyof TPathParams]);

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
  };

  const onSave: RowEditableConfig<Entity>['onSave'] = async (propName, record) => {
    try {
      await form.validateFields();
      if (onUpdate && entityToUpdateDto) {
        await onUpdate({
          ...queryParams,
          ...({} as Partial<Entity>),
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
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- requestData raises the loading flag before awaiting getOne; that flag is what renders the spinner for the initial load
    safetyRun(requestData());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- requestData is rebuilt on every render, so depending on it would re-fetch the entity in a loop; this fetch is meant to run once on mount
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the entity prop is the source of truth for a freshly opened record, but it is only a seed: onSave and the initial fetch overwrite `data` afterwards, so it cannot be derived during render
    setData(entity);
    // antd tolerates undefined at runtime; keep passing it through unchanged
    form.setFieldsValue(entity as Partial<Entity>);
  }, [entity, form]);

  if (loading) {
    return <PageLoading />;
  }

  if (!data) {
    return <Result status="404" title="404" subTitle="The entity is not found." />;
  }

  const formProps =
    contentViewMode === VIEW_MODE_TYPE.TABS
      ? {
          onValuesChange,
        }
      : undefined;

  const contentViewSwitcher = sections.length > 1 ? contentViewModeButton : undefined;
  const descriptions = sections.map((section, index) => {
    return (
      <ProDescriptions<Entity>
        key={getKey(index)}
        title={section.title as React.ReactNode}
        actionRef={actionRef}
        size={'small'}
        bordered
        loading={loading}
        style={{ marginBottom: 20 }}
        labelStyle={{ width: '15%' }}
        dataSource={data as Entity}
        className={styles.antDescriptionsStyles}
        editable={
          canEdit
            ? {
                type: 'multiple',
                onSave,
                deletePopconfirmMessage: intl.formatMessage({
                  id: 'table.deletePopconfirmMessage',
                }),
                onlyAddOneLineAlertMessage: intl.formatMessage({
                  id: 'table.onlyAddOneLineAlertMessage',
                }),
                cancelText: (
                  <Tooltip title={intl.formatMessage({ id: 'table.cancelText' })}>
                    <StopOutlined />
                  </Tooltip>
                ),
                deleteText: (
                  <Tooltip title={intl.formatMessage({ id: 'table.deleteText' })}>
                    <DeleteOutlined />
                  </Tooltip>
                ),
                saveText: (
                  <Button size={'small'} type={'primary'}>
                    <FormattedMessage id={'table.saveText'} />
                  </Button>
                ),
                ...(fieldsEditType === FieldsEdit.All && {
                  editableKeys: [
                    ...buildFieldsFromColumnsForDescriptionsDisplay(columns, idColumnName),
                  ],
                  actionRender: () => [],
                }),
                ...editableConfig,
              }
            : undefined
        }
        columns={section.columns}
        extra={
          contentViewMode === VIEW_MODE_TYPE.GENERAL && index === 0
            ? contentViewSwitcher
            : undefined
        }
        formProps={formProps}
        {...rest}
      />
    );
  });

  if (contentViewMode === VIEW_MODE_TYPE.GENERAL) {
    return descriptions;
  }

  const tabsItems: TabsProps['items'] = sections.map((section, index) => {
    return {
      key: getKey(index),
      label: (
        <Badge size="small" overflowCount={5} count={errorsPerSection.get(section.key)}>
          {section.title as React.ReactNode}
        </Badge>
      ),
      forceRender: true,
      children: descriptions[index],
    };
  });

  return <Tabs defaultActiveKey="0" items={tabsItems} tabBarExtraContent={contentViewModeButton} />;
};

const Descriptions = React.forwardRef(DescriptionsComponent) as <
  Entity extends Record<string | symbol, any>,
  CreateDto = Entity,
  UpdateDto = Entity,
  TPathParams = object,
>(
  props: TDescriptionsProps<Entity, CreateDto, UpdateDto, TPathParams>,
) => React.ReactElement;

export default Descriptions;
