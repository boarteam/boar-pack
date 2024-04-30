import { useIntl } from "@umijs/max";
import { ProColumns } from "@ant-design/pro-components";
import { EcnConnectSchema } from "@@api/generated";
import { EditOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import { NumberSwitch } from "@jifeon/boar-pack-common-frontend";

export const useEcnConnectSchemasColumns = (canManageConnectSchemas: boolean): ProColumns<EcnConnectSchema>[] => {
  const intl = useIntl();

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
      dataIndex: 'fromModule.name',
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
      dataIndex: 'toModule.name',
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

  if (canManageConnectSchemas) {
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