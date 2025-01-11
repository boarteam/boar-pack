import { useEffect, useMemo } from "react";
import { Button, Tabs } from "antd";
import { ProDescriptions } from "@ant-design/pro-components";
import { columnsToDescriptionItemProps } from "./useDescriptionColumns";
import { useForm } from "antd/es/form/Form";
import { buildFieldsFromColumnsForDescriptionsDisplay } from "../Table";
import { VIEW_MODE_TYPE } from "../Table/ContentViewModeButton";
import { TDescriptionViewProps } from "./descriptionViewTypes";

const DescriptionsView = <Entity extends Record<string | symbol, any>>({
                                                                           idColumnName,
                                                                           columns,
                                                                           data,
                                                                           viewMode = VIEW_MODE_TYPE.TABS,
                                                                           onSubmit,
                                                                           onCancel,
                                                                           ...rest
                                                                       }: TDescriptionViewProps<Entity>) => {
    const sections = columnsToDescriptionItemProps(columns, 'General');
    const [form] = useForm();

    const handleCancel = () => {
        form.resetFields();
        onCancel?.(); // Вызываем onCancel для закрытия модального окна
    };

    const editableKeys = useMemo(() => {
        return [
            ...buildFieldsFromColumnsForDescriptionsDisplay(
                columns,
                idColumnName,
            ),
        ];
    }, [columns, idColumnName]);

    useEffect(() => {
        data ? form.setFieldsValue(data) : form.resetFields();
    }, [data]);

    const descriptionProps = {
        size: 'small' as const,
        bordered: true,
        column: 2,
        style: {marginBottom: 20},
        labelStyle: {width: '15%'},
        contentStyle: {width: '25%'},
        editable: {
            form,
            editableKeys,
            actionRender: () => [],
        },
        ...rest,
    };

    const getKey = (index: number) =>
        index + (Array.isArray(idColumnName) ? idColumnName.join('-') : idColumnName);

    const descriptionSections = sections.map((section, index) => (
        <ProDescriptions<Entity>
            key={getKey(index)}
            title={section.title as React.ReactNode}
            columns={section.columns}
            {...descriptionProps}
        />
    ));

    return (
        <div>
            {
                viewMode === VIEW_MODE_TYPE.TABS ? (
                    <Tabs defaultActiveKey="1">
                        {sections.map((section, index) => (
                            <Tabs.TabPane
                                tab={section.title as React.ReactNode}
                                key={getKey(index)}
                            >
                                {descriptionSections[index]}
                            </Tabs.TabPane>
                        ))}
                    </Tabs>
                ) : (
                    descriptionSections
                )
            }
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {onCancel && (
                    <Button key='cancel' onClick={handleCancel}>
                        Cancel
                    </Button>
                )}
                {onSubmit && (<Button key='submit' type="primary" onClick={() => {
                    form.validateFields().then(onSubmit)
                }}>
                    Save
                </Button>)}
            </div>
        </div>
    )
};

export default DescriptionsView;
