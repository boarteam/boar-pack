import { Link, useIntl } from "@umijs/max";
import { ProColumns } from "@ant-design/pro-components";
import { EcnModule, EcnModuleType } from "@api/generated";
import { EditOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import apiClient from '@api/apiClient';
import { useLiquidityManagerContext } from "../../tools/liquidityManagerContext";
import { useEffect, useState } from "react";
import { NumberInputHandlingNewRecord, NumberSwitch, RelationSelect } from "@jifeon/boar-pack-common-frontend";

export const useEcnModulesColumns = (canManageEcnModulesColumns: boolean): ProColumns<EcnModule>[] => {
  const intl = useIntl();
  const { worker } = useLiquidityManagerContext();
  const [moduleTypes, setModuleTypes] = useState<{text: string, value: number}[]>([]);

  useEffect(() => {
    if (worker) {
      apiClient.ecnModuleTypes.getManyBaseEcnModuleTypesControllerEcnModuleType({
        worker,
        sort: ['name,ASC'],
      }).then((types) => {
        setModuleTypes(types.data.map((item) => ({text: item.name, value: item.id})));
      });
    }
  }, [worker]);

  const columns: ProColumns<EcnModule>[] = [
    {
      title: intl.formatMessage({ id: 'pages.ecnModules.id' }),
      dataIndex: 'id',
      sorter: true,
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
      render: (text, record) => <Link to={`/liquidity/ecn-modules/${record.id}`}>{text}</Link>,
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
      filters: moduleTypes,
      filterSearch: true,
      formItemProps(form, config) {
        return {
          rules: [
            {
              required: true,
            }
          ]
        }
      },
      render(text, record) {
        return record.type?.name ?? '-';
      },
      renderFormItem(schema, config) {
        return (worker && <RelationSelect<EcnModuleType>
          selectedItem={config.record?.type}
          fetchItems={filter => apiClient.ecnModuleTypes.getManyBaseEcnModuleTypesControllerEcnModuleType({
            filter,
            worker,
          })}
        /> || null);
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

  if (canManageEcnModulesColumns) {
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
