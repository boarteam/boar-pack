import { useIntl } from "@umijs/max";
import { ProColumns } from "@ant-design/pro-components";
import { EcnModule, EcnModuleType } from "../../../tools/api";
import { EditOutlined } from "@ant-design/icons";
import { useAccess } from "umi";
import { NumberSwitch } from "../../Inputs/NumberSwitcher";
import { Tag } from "antd";
import { RelationSelect } from "../../Inputs/RelationSelect";
import apiClient from "../../../tools/client/apiClient";
import { NumberInputHandlingNewRecord } from "../../Inputs/NumberInputHandlingNewRecord";

export const useEcnModulesColumns = (): ProColumns<EcnModule>[] => {
  const intl = useIntl();
  const { canManageLiquidity } = useAccess() || {};

  const columns: ProColumns<EcnModule>[] = [
    {
      title: intl.formatMessage({ id: 'pages.ecnModules.id' }),
      dataIndex: 'id',
      sorter: true,
      search: false,
      valueType: 'digit',
      copyable: true,
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
      // if id is set to new record, then it will render input with empty value
      renderFormItem() {
        return <NumberInputHandlingNewRecord />
      }
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnModules.name' }),
      dataIndex: 'name',
      width: '30%',
      sorter: true,
      formItemProps: {
        rules: [
          {
            required: true,
          }
        ]
      },
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnModules.descr' }),
      dataIndex: 'descr',
      width: '30%',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnModules.type' }),
      dataIndex: 'type',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
      render(text, record) {
        return record.type?.name ?? '-';
      },
      renderFormItem(schema, config) {
        return (<RelationSelect<EcnModuleType>
          selectedItem={config.record?.type}
          fetchItems={filter => apiClient.ecnModuleTypes.getManyBaseEcnModuleTypesControllerEcnModuleType({
            filter,
          })}
        />);
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnModules.enabled' }),
      dataIndex: 'enabled',
      sorter: true,
      renderFormItem() {
        return (
          <NumberSwitch />
        );
      },
      render(text, record) {
        return <Tag color={record.enabled ? 'green' : 'red'}>{record.enabled ? 'Enabled' : 'Disabled'}</Tag>;
      },
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
    },
  ];

  if (canManageLiquidity) {
    columns.push({
      title: intl.formatMessage({ id: 'table.actions' }),
      valueType: 'option',
      width: '3%',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          <EditOutlined />
        </a>,
      ],
    });
  }

  return columns;
};
