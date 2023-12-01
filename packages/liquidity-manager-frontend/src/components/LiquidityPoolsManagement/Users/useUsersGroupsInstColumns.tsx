import { useIntl } from "@umijs/max";
import { ProColumns } from "@ant-design/pro-components";
import { DclAction, UsersGroupsInst, UsersInstCompany } from "../../../tools/api";
import { EditOutlined } from "@ant-design/icons";
import { useAccess } from "umi";
import { RelationSelect } from "../../Inputs/RelationSelect";
import apiClient from "../../../tools/client/apiClient";
import { NumberSwitch } from "../../Inputs/NumberSwitcher";
import { Tag } from "antd";

export const useUsersGroupsInstColumns = (): ProColumns<UsersGroupsInst>[] => {
  const intl = useIntl();
  const { canManageLiquidity } = useAccess() || {};

  const columns: ProColumns<UsersGroupsInst>[] = [
    {
      title: intl.formatMessage({ id: 'pages.usersGroupsInsts.name' }),
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
      title: intl.formatMessage({ id: 'pages.usersGroupsInsts.type' }),
      dataIndex: 'type',
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
      title: intl.formatMessage({ id: 'pages.usersGroupsInsts.descr' }),
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
      title: intl.formatMessage({ id: 'pages.usersGroupsInsts.company' }),
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
      title: intl.formatMessage({ id: 'pages.usersGroupsInsts.action' }),
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
      title: intl.formatMessage({ id: 'pages.usersGroupsInsts.currencyId' }),
      dataIndex: 'currencyId',
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
      title: intl.formatMessage({ id: 'pages.usersGroupsInsts.currencyName' }),
      dataIndex: 'currencyName',
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
      title: intl.formatMessage({ id: 'pages.usersGroupsInsts.leverage' }),
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
      title: intl.formatMessage({ id: 'pages.usersGroupsInsts.marginCall' }),
      dataIndex: 'marginCall',
      valueType: 'digit',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.usersGroupsInsts.marginStopout' }),
      dataIndex: 'marginStopout',
      valueType: 'digit',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.usersGroupsInsts.swapMode' }),
      dataIndex: 'swapMode',
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
        return <Tag color={record.swapMode ? 'green' : 'red'}>{record.swapMode ? 'On' : 'Off'}</Tag>;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.usersGroupsInsts.ts' }),
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
      title: intl.formatMessage({ id: 'pages.usersGroupsInsts.tsMs' }),
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
