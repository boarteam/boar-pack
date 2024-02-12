import { useIntl } from "@umijs/max";
import { ProColumns } from "@ant-design/pro-components";
import { EcnInstrumentsGroup } from "../../../../tools/api";
import { EditOutlined } from "@ant-design/icons";
import { useAccess } from "umi";

export const useEcnInstrumentsGroupsColumns = (): ProColumns<EcnInstrumentsGroup>[] => {
  const intl = useIntl();
  const { canManageLiquidity } = useAccess() || {};

  const columns: ProColumns<EcnInstrumentsGroup>[] = [
    {
      title: intl.formatMessage({ id: 'pages.ecnInstrumentsGroups.name' }),
      dataIndex: 'name',
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
      title: intl.formatMessage({ id: 'pages.ecnInstrumentsGroups.descr' }),
      dataIndex: 'descr',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
      formItemProps: {
        rules: [
          {
            required: true,
          }
        ]
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
