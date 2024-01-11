import { Link, useAccess, useIntl } from "@umijs/max";
import { ProColumns } from "@ant-design/pro-components";
import { EcnConnectSchemaSetupLabel } from "../../../../tools/api";
import { NumberInputHandlingNewRecord } from "@/components/Inputs/NumberInputHandlingNewRecord";
import { Tag } from "antd";
import { EcnModulesSelect } from "../EcnModuleSelect";
import { EditOutlined } from "@ant-design/icons";

export const useEcnSetupsColumns = (): ProColumns<EcnConnectSchemaSetupLabel>[] => {
  const intl = useIntl();
  const { canManageLiquidity } = useAccess() || {};

  const columns: ProColumns<EcnConnectSchemaSetupLabel>[] = [
    {
      title: intl.formatMessage({ id: 'pages.ecnSetups.id' }),
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
      },
      render(text) {
        return text;
      }
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSetups.label' }),
      dataIndex: 'label',
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
      render: (text, record) => <Link to={`/liquidity/modules-graph?setupId=${record.id}`}>{text}</Link>,
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSetups.modules' }),
      dataIndex: 'modules',
      sorter: true,
      render: (_, record) =>
        record.modules.map(({ id, name }) => <Tag style={{ margin: 2 }} key={id}>{name}</Tag>),
      renderFormItem: () => <EcnModulesSelect />,
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
