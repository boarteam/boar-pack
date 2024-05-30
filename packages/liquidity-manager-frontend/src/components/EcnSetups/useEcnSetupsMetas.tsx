import { Link, useIntl } from "@umijs/max";
import { EcnConnectSchemaSetupLabel, EcnModule, EcnModuleType } from "@@api/generated";
import { Tag } from "antd";
import { EcnModulesSelect } from "../EcnModules/EcnModuleSelect";
import { CopyOutlined, EditOutlined } from "@ant-design/icons";
import { createNewDefaultParams } from "./EcnSetupsListBase";
import { getNewId, KEY_SYMBOL } from "@jifeon/boar-pack-common-frontend";
import { ProListMetas } from "@ant-design/pro-list";
import { createStyles } from "antd-style";

const useStyles = createStyles(({ token }) => {
  return {
    table: {
      padding: 'initial',
      width: '100%',
      'tr:nth-child(odd)': {
        backgroundColor: token.colorFillAlter,
      },
    },
  }
});

// always shown, in order
export const defaultTypesIds = [16, 5, 4, 2, 1, 12];

const getTypeRow = ({ name, modules }: { name: EcnModuleType['name'], modules: EcnModule[] }) => {
  return (
    <tr>
      <td style={{ width: 180, fontSize: 12, verticalAlign: 'baseline', margin: 2 }}>
          <span>
             {name} ({modules.length}):
          </span>
      </td>
      <td>{modules.map(module => <Tag style={{ margin: 2 }} key={module.id}>{module.name}</Tag>)}</td>
    </tr>
  )
}

export const ModulesTypes = ({ modules, presetModulesTypes }: { modules: EcnModule[], presetModulesTypes: EcnModuleType[] }) => {
  const { styles } = useStyles();

  const typesWithModules: Map<EcnModule['type']['id'], { name: EcnModule['type']['name'], modules: EcnModule[] }> = new Map();
  for (const { id: typeId, name: typeName } of presetModulesTypes) {
    typesWithModules.set(typeId, { name: typeName, modules: [] });
  }

  for (const module of modules) {
    if (!module.type) continue;

    if (!typesWithModules.has(module.type.id)) {
      typesWithModules.set(module.type.id, { name: module.type.name, modules: [] });
    }

    typesWithModules.get(module.type.id)?.modules.push(module);
  }

  const result: JSX.Element[] = [];
  for (const typeId of defaultTypesIds) {
    result.push(getTypeRow(typesWithModules.get(typeId)));
    typesWithModules.delete(typeId);
  }

  for (const typeWithModule of typesWithModules.values()) {
    console.log(typeWithModule)
    result.push(getTypeRow(typeWithModule));
  }

  return (
    <table className={styles.table}>
      {result}
    </table>
  );
}

export const useEcnSetupsMetas = (canManageEcnSetupsColumns: boolean, presetModulesTypes: EcnModuleType[]): ProListMetas<EcnConnectSchemaSetupLabel> => {
  const intl = useIntl();

  const metas: ProListMetas<EcnConnectSchemaSetupLabel> = {
    title: {
      title: intl.formatMessage({id: 'pages.ecnSetups.label'}),
      dataIndex: 'label',
      formItemProps: {
        style: {
          minWidth: 300,
        },
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
    content: {
      title: intl.formatMessage({id: 'pages.ecnSetups.modules'}),
      dataIndex: 'modules',
      render: (_, record) => <ModulesTypes presetModulesTypes={presetModulesTypes} modules={record.modules}/>,
      renderFormItem: () => <EcnModulesSelect/>,
    },
  };

  if (canManageEcnSetupsColumns) {
    metas.actions = {
      title: intl.formatMessage({ id: 'table.actions' }),
      valueType: 'option',
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
    };
  }

  return metas;
};
