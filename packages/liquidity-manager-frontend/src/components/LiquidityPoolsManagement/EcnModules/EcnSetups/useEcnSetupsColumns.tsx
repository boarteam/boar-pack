import { Link, useAccess, useIntl } from "@umijs/max";
import { ProColumns } from "@ant-design/pro-components";
import { EcnConnectSchemaSetupLabel } from "../../../../tools/api";
import { Tag } from "antd";
import { EcnModulesSelect } from "../EcnModuleSelect";
import { CopyOutlined, EditOutlined } from "@ant-design/icons";
import { KEY_SYMBOL, getNewId } from "@/components/Table/Table";
import { createNewDefaultParams } from "./EcnSetupsTable";

export const useEcnSetupsColumns = (): ProColumns<EcnConnectSchemaSetupLabel>[] => {
  const intl = useIntl();
  const { canManageLiquidity } = useAccess() || {};

  const columns: ProColumns<EcnConnectSchemaSetupLabel>[] = [
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
      render: (text, record) => <Link to={`/liquidity/ecn-setups/${record.id}`}>{text}</Link>,
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
         <a
         key="editable"
         onClick={() => {
           const newId = getNewId();
           const { id, ...rest } = record;
           action?.addEditRecord({
             ...createNewDefaultParams,
             ...rest,
             label: `${record.label} - Copy`,
             [KEY_SYMBOL]: newId,
           }, {
             position: 'top',
           });
         }}
       >
         <CopyOutlined />
       </a>,
      ],
    });
  }

  return columns;
};
