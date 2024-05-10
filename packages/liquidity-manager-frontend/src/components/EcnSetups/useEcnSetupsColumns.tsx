import { Link, useIntl } from "@umijs/max";
import { ProColumns } from "@ant-design/pro-components";
import { EcnConnectSchemaSetupLabel } from "@@api/generated";
import { Tag } from "antd";
import { EcnModulesSelect } from "../EcnModules/EcnModuleSelect";
import { CopyOutlined, EditOutlined } from "@ant-design/icons";
import { createNewDefaultParams } from "./EcnSetupsTableBase";
import { getNewId, KEY_SYMBOL } from "@jifeon/boar-pack-common-frontend";

export const useEcnSetupsColumns = (canManageEcnSetupsColumns: boolean): ProColumns<EcnConnectSchemaSetupLabel>[] => {
  const intl = useIntl();

  const columns: ProColumns<EcnConnectSchemaSetupLabel>[] = [
    {
      title: intl.formatMessage({ id: 'pages.ecnSetups.label' }),
      dataIndex: 'label',
      sorter: true,
      width: 200,
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
      sorter: false,
      render: (_, record) =>
        record.modules.map(({ id, name }) => <Tag style={{ margin: 2 }} key={id}>{name}</Tag>),
      renderFormItem: () => <EcnModulesSelect />,
    },
  ];

  if (canManageEcnSetupsColumns) {
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
           // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
