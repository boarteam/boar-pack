import { useIntl } from "@umijs/max";
import { ProColumns } from "@ant-design/pro-components";
import { DclAction, EcnCurrency, EcnWorkingMode, UsersGroupsInst, UsersInstCompany } from "../../../../tools/api";
import { EditOutlined } from "@ant-design/icons";
import { useAccess } from "umi";
import { RelationSelect } from "../../../Inputs/RelationSelect";
import apiClient from "../../../../tools/client/apiClient";
import { NumberSwitch } from "../../../Inputs/NumberSwitcher";
import { Tag } from "antd";

export const useUsersGroupsInstColumns = (): ProColumns<UsersGroupsInst>[] => {
  const intl = useIntl();
  const { canManageLiquidity } = useAccess() || {};

  const columns: ProColumns<UsersGroupsInst>[] = [
    {
      title: intl.formatMessage({ id: 'pages.usersGroupsInst.name' }),
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
      title: intl.formatMessage({ id: 'pages.usersGroupsInst.workingMode' }),
      dataIndex: 'workingMode',
      valueType: 'digit',
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
      render: (text, record) => {
        return record.workingMode?.name;
      },
      renderFormItem: (schema, config, _, action) => {
        return <RelationSelect<EcnWorkingMode>
          selectedItem={config.record?.workingMode}
          fetchItems={filter => apiClient.ecnWorkingModes.getManyBaseGenericLiquidityControllerEcnWorkingMode({ filter })}
        />;
      }
    },
    {
      title: intl.formatMessage({ id: 'pages.usersGroupsInst.descr' }),
      dataIndex: 'descr',
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
      title: intl.formatMessage({ id: 'pages.usersGroupsInst.company' }),
      dataIndex: 'company',
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
      render: (text, record) => {
        return record.company?.name;
      },
      renderFormItem: (schema, config, _, action) => {
        return <RelationSelect<UsersInstCompany>
          selectedItem={config.record?.company}
          fetchItems={filter => apiClient.usersInstCompanies.getManyBaseGenericLiquidityControllerUsersInstCompany({ filter })}
        />;
      }
    },
    {
      title: intl.formatMessage({ id: 'pages.usersGroupsInst.action' }),
      dataIndex: 'action',
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
      render: (text, record) => {
        return record.action?.name;
      },
      renderFormItem: (schema, config, _, action) => {
        return <RelationSelect<DclAction>
          selectedItem={config.record?.action}
          fetchItems={filter => apiClient.dclActions.getManyBaseGenericLiquidityControllerDclAction({ filter })}
        />;
      }
    },
    {
      title: intl.formatMessage({ id: 'pages.usersGroupsInst.currencyName' }),
      dataIndex: 'currency',
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
      render: (text, record) => {
        return record.currency?.name;
      },
      renderFormItem: (schema, config, _, action) => {
        return <RelationSelect<EcnCurrency>
          selectedItem={config.record?.currency}
          fieldNames={{
            value: 'name',
            label: 'name',
          }}
          fetchItems={filter => apiClient.ecnCurrencies.getManyBaseGenericLiquidityControllerEcnCurrency({ filter })}
        />;
      }
    },
    {
      title: intl.formatMessage({ id: 'pages.usersGroupsInst.leverage' }),
      dataIndex: 'leverage',
      sorter: true,
      valueType: 'digit',
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
      title: intl.formatMessage({ id: 'pages.usersGroupsInst.marginCall' }),
      dataIndex: 'marginCall',
      valueType: 'digit',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.usersGroupsInst.marginStopout' }),
      dataIndex: 'marginStopout',
      valueType: 'digit',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.usersGroupsInst.swapEnabled' }),
      dataIndex: 'swapEnabled',
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
      renderFormItem() {
        return (
          <NumberSwitch
            checkedChildren={'On'}
            unCheckedChildren={'Off'}
          />
        );
      },
      render(text, record) {
        return <Tag color={record.swapEnabled ? 'green' : 'red'}>{record.swapEnabled ? 'On' : 'Off'}</Tag>;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.usersGroupsInst.ts' }),
      dataIndex: 'ts',
      valueType: 'digit',
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
      title: intl.formatMessage({ id: 'pages.usersGroupsInst.tsMs' }),
      dataIndex: 'tsMs',
      valueType: 'digit',
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
  ];

  if (canManageLiquidity) {
    columns.push({
      title: intl.formatMessage({ id: 'table.actions' }),
      valueType: 'option',
      width: '3%',
      fixed: 'right',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.name);
          }}
        >
          <EditOutlined />
        </a>,
      ],
    });
  }

  return columns;
};
