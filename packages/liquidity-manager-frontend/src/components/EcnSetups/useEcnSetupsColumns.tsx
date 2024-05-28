import { Link, useIntl } from "@umijs/max";
import { ProColumns } from "@ant-design/pro-components";
import { EcnConnectSchemaSetupLabel, EcnModule } from "@@api/generated";
import { Button, Space, Tag } from "antd";
import { EcnModulesSelect } from "../EcnModules/EcnModuleSelect";
import { CopyOutlined, EditOutlined } from "@ant-design/icons";
import { createNewDefaultParams } from "./EcnSetupsTableBase";
import { getNewId, KEY_SYMBOL } from "@jifeon/boar-pack-common-frontend";
import { useState } from "react";

const ModuleType = ({ name, modules }: { name: EcnModule['type']['name'], modules: EcnModule[] }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button style={{ margin: 2 }} onClick={() => setOpen(prevState => !prevState)}>{name} ({modules.length})</Button>
      {open && modules.map(module => <Tag style={{ margin: 2 }} key={module.id}>{module.name}</Tag> )}
    </>
  );
}

const ModulesTypes = ({ modules }: { modules: EcnModule[] }) => {
  const typesWithModules: Map<EcnModule['type']['id'], { name: EcnModule['type']['name'], modules: EcnModule[] }> = new Map();
  for (const module of modules) {
    if (!typesWithModules.has(module.type.id)) {
      typesWithModules.set(module.type.id, { name: module.type.name, modules: [] });
    }

    typesWithModules.get(module.type.id)?.modules.push(module);
  }

  const result: JSX.Element[] = [];
  for (const { name, modules } of typesWithModules.values()) {
    result.push(<ModuleType name={name} modules={modules} />);
  }

  return result;
}

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
      render: (_, record) => <ModulesTypes modules={record.modules} />,
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
         key="copy"
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
