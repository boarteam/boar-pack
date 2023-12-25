import { useIntl } from "@umijs/max";
import { ProColumns } from "@ant-design/pro-components";
import { EcnConnectSchema } from "../../../tools/api";
import { EditOutlined } from "@ant-design/icons";
import { useAccess } from "umi";
import { NumberSwitch } from "../../Inputs/NumberSwitcher";
import { Tag } from "antd";

export const useEcnConnectSchemasColumns = (): ProColumns<EcnConnectSchema>[] => {
  const intl = useIntl();
  const { canManageLiquidity } = useAccess() || {};

  const columns: ProColumns<EcnConnectSchema>[] = [
    {
      title: intl.formatMessage({ id: 'pages.ecnConnectSchemas.id' }),
      dataIndex: 'id',
      sorter: true,
      search: false,
      valueType: 'digit',
      copyable: true,
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
      editable: false,
      render: (text) => text,
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnConnectSchemas.descr' }),
      dataIndex: 'descr',
      width: '30%',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnConnectSchemas.fromModule' }),
      dataIndex: 'fromModule',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
      editable: false,
      render(text, record) {
        return record.fromModule?.name ?? '-';
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnConnectSchemas.toModule' }),
      dataIndex: 'toModule',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
      editable: false,
      render(text, record) {
        return record.toModule?.name ?? '-';
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnConnectSchemas.enabled' }),
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
