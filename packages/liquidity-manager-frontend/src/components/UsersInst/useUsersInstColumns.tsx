import { Link, useIntl } from "@umijs/max";
import { ProColumns } from "@ant-design/pro-components";
import {
  DclAction, EcnCommissionLotsMode,
  EcnCommissionType,
  EcnModule,
  UsersGroupsInst,
  UsersInst,
  UsersInstCompany
} from "@@api/generated";
import { EditOutlined } from "@ant-design/icons";
import { useAccess } from "umi";
import { Tag } from "antd";
import apiClient from '@@api/apiClient';
import { useLiquidityManagerContext } from "../../tools/liquidityManagerContext";
import { useEffect, useState } from "react";
import { dropTrailZeroes, NumberSwitch, Password, RelationSelect } from "@jifeon/boar-pack-common-frontend";

type TOptions = { text: string, value: number | string }[];

export const useUsersInstColumns = (): ProColumns<UsersInst>[] => {
  const intl = useIntl();
  const { canManageLiquidity } = useAccess() || {};
  const { worker } = useLiquidityManagerContext();
  const [userGroups, setUserGroups] = useState<TOptions>([]);
  const [modules, setModules] = useState<TOptions>([]);
  const [marginModules, setMarginModules] = useState<TOptions>([]);

  useEffect(() => {
    if (worker) {
      Promise.all([
        apiClient.usersGroupsInst.getManyBaseUsersGroupsInstControllerUsersGroupsInst({ worker }),
        apiClient.ecnModules.getManyBaseEcnModulesControllerEcnModule({
          worker,
          join: ['type'],
        }),
      ]).then(([groups, modules]) => {
        setUserGroups(groups.data.map(group => ({ text: group.name, value: group.id })));
        setModules(modules.data
          .filter(module => module.type.name !== 'MARGIN MODULE')
          .map(module => ({ text: module.name, value: module.id })));
        setMarginModules(modules.data
          .filter(module => module.type.name === 'MARGIN MODULE')
          .map(module => ({ text: module.name, value: module.id })));
      });
    }
  }, [worker]);


  const columns: ProColumns<UsersInst>[] = [
    {
      title: intl.formatMessage({ id: 'pages.usersInst.id' }),
      dataIndex: 'id',
      sorter: true,
      editable: false,
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
      fixed: 'left',
      width: '80px',
      copyable: true,
      hideInDescriptions: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.usersInst.name' }),
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
      // link to user page
      render(text, record) {
        return <Link to={`/liquidity/users-inst/${record.id}`}>{text}</Link>;
      }
    },
    {
      title: intl.formatMessage({ id: 'pages.usersInst.group' }),
      dataIndex: 'group',
      sorter: true,
      filters: userGroups,
      filterSearch: true,
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
      render(text, record) {
        return record.group?.name ?? '-';
      },
      renderFormItem(schema, config) {
        return worker && <RelationSelect<UsersGroupsInst>
          selectedItem={config.record?.group}
          fetchItems={filter => apiClient.usersGroupsInst.getManyBaseUsersGroupsInstControllerUsersGroupsInst({
            filter,
            worker,
          })}
        /> || null;
      }
    },
    {
      title: intl.formatMessage({ id: 'pages.usersInst.action' }),
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
      renderFormItem: (schema, config) => {
        return worker && <RelationSelect<DclAction>
          selectedItem={config.record?.action}
          fetchItems={filter => apiClient.dclActions.getManyBaseGenericLiquidityControllerDclAction({
            filter,
            worker,
          })}
        /> || null;
      }
    },
    {
      title: intl.formatMessage({ id: 'pages.usersInst.userComment' }),
      dataIndex: 'userComment',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.usersInst.password' }),
      dataIndex: 'password',
      sorter: true,
      valueType: 'password',
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
        return <Password />;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.usersInst.enabled' }),
      dataIndex: 'enabled',
      sorter: true,
      filters: [
        {
          text: 'Enabled',
          value: 1,
        },
        {
          text: 'Disabled',
          value: 0,
        }
      ],
      formItemProps: {
        rules: [
          {
            required: true,
          }
        ]
      },
      renderFormItem() {
        return (
          <NumberSwitch />
        );
      },
      render(text, record) {
        return <Tag color={record.enabled ? 'green' : 'red'}>{record.enabled ? 'Enabled' : 'Disabled'}</Tag>;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.usersInst.leverage' }),
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
      title: intl.formatMessage({ id: 'pages.usersInst.balance' }),
      dataIndex: 'balance',
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
        stringMode: true,
        autoComplete: 'one-time-code', // disable browser autocomplete
        min: -Infinity,
      },
      render(text, record) {
        return dropTrailZeroes(record.balance);
      }
    },
    {
      title: intl.formatMessage({ id: 'pages.usersInst.credit' }),
      dataIndex: 'credit',
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
        min: -Infinity,
        stringMode: true,
      },
      render(text, record) {
        return dropTrailZeroes(record.credit);
      }
    },
    {
      title: 'Margin',
      dataIndex: 'margin_group', // hack to make it work with columns visibility settings
      children: [
        {
          title: intl.formatMessage({ id: 'pages.usersInst.margin' }),
          key: 'margin',
          dataIndex: 'margin',
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
            min: -Infinity,
            stringMode: true,
          },
          render(text, record) {
            return dropTrailZeroes(record.margin);
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.usersInst.freeMargin' }),
          key: 'freeMargin',
          dataIndex: 'freeMargin',
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
            min: -Infinity,
            stringMode: true,
          },
          render(text, record) {
            return dropTrailZeroes(record.freeMargin);
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.usersInst.marginLevel' }),
          key: 'marginLevel',
          dataIndex: 'marginLevel',
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
            min: -Infinity,
            stringMode: true,
          },
          render(text, record) {
            return dropTrailZeroes(record.marginLevel);
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.usersInst.marginWithLimits' }),
          key: 'marginWithLimits',
          valueType: 'digit',
          dataIndex: 'marginWithLimits',
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
            min: -Infinity,
            stringMode: true,
          },
          render(text, record) {
            return dropTrailZeroes(record.marginWithLimits);
          }
        },
      ]
    },
    {
      title: intl.formatMessage({ id: 'pages.usersInst.profitloss' }),
      dataIndex: 'profitloss',
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
        min: -Infinity,
        stringMode: true,
      },
      render(text, record) {
        return dropTrailZeroes(record.profitloss);
      }
    },
    {
      title: intl.formatMessage({ id: 'pages.usersInst.swap' }),
      dataIndex: 'swap',
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
        min: -Infinity,
        stringMode: true,
      },
      render(text, record) {
        return dropTrailZeroes(record.swap);
      }
    },
    {
      title: 'Stopout',
      dataIndex: 'stopout_group', // hack to make it work with columns visibility settings
      children: [
        {
          title: intl.formatMessage({ id: 'pages.usersInst.stopoutHash' }),
          dataIndex: 'stopoutHash',
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
            stringMode: true,
          },
        },
        {
          title: intl.formatMessage({ id: 'pages.usersInst.stopoutName' }),
          dataIndex: 'stopoutName',
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
          title: intl.formatMessage({ id: 'pages.usersInst.stopoutEnabled' }),
          dataIndex: 'stopoutEnabled',
          sorter: true,
          formItemProps: {
            rules: [
              {
                required: true,
              }
            ]
          },
          renderFormItem() {
            return (
              <NumberSwitch />
            );
          },
          render(text, record) {
            return <Tag
              color={record.stopoutEnabled ? 'green' : 'red'}>{record.stopoutEnabled ? 'Enabled' : 'Disabled'}</Tag>;
          },
        },
        {
          title: intl.formatMessage({ id: 'pages.usersInst.stopoutSuppressTime' }),
          dataIndex: 'stopoutSuppressTime',
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
            stringMode: true,
          },
        },
        {
          title: intl.formatMessage({ id: 'pages.usersInst.stopoutGenerationTime' }),
          valueType: 'digit',
          dataIndex: 'stopoutGenerationTime',
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
            stringMode: true,
          },
        },
      ]
    },
    {
      title: intl.formatMessage({ id: 'pages.usersInst.module' }),
      dataIndex: 'module',
      sorter: true,
      filters: modules,
      filterSearch: true,
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
      render(text, record) {
        return record.module?.name ?? '-';
      },
      renderFormItem(schema, config) {
        return worker && <RelationSelect<EcnModule>
          selectedItem={config.record?.module}
          fetchItems={filter => apiClient.ecnModules.getManyBaseEcnModulesControllerEcnModule({
            filter,
            worker,
          })}
        /> || null;
      }
    },
    {
      title: intl.formatMessage({ id: 'pages.usersInst.marginModule' }),
      dataIndex: 'marginModule',
      sorter: true,
      filters: marginModules,
      filterSearch: true,
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
      render(text, record) {
        return record.marginModule?.name ?? '-';
      },
      renderFormItem(schema, config) {
        return worker && <RelationSelect<EcnModule>
          selectedItem={config.record?.marginModule}
          fetchItems={filter => apiClient.ecnModules.getManyBaseEcnModulesControllerEcnModule({
            filter,
            worker,
          })}
        /> || null;
      }
    },
    {
      title: 'Commission',
      dataIndex: 'commission_group', // hack to make it work with columns visibility settings
      children: [
        {
          title: intl.formatMessage({ id: 'pages.usersInst.commission' }),
          dataIndex: 'commission',
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
            min: -Infinity,
            stringMode: true,
          },
          render(text, record) {
            return dropTrailZeroes(record.commission);
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.usersInst.commissionValue' }),
          dataIndex: 'commissionValue',
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
            min: -Infinity,
            stringMode: true,
          },
          render(text, record) {
            return dropTrailZeroes(record.commissionValue);
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.usersInst.commissionType' }),
          dataIndex: 'commissionType',
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
          // relation
          render(text, record) {
            return record.commissionType?.name ?? '-';
          },
          renderFormItem(schema, config) {
            return worker && <RelationSelect<EcnCommissionType>
              selectedItem={config.record?.commissionType}
              fetchItems={filter => apiClient.ecnCommissionTypes.getManyBaseGenericLiquidityControllerEcnCommissionType({
                filter,
                worker,
              })}
            /> || null;
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.usersInst.commissionLotsMode' }),
          dataIndex: 'commissionLotsMode',
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
          // relation
          render(text, record) {
            return record.commissionLotsMode?.name ?? '-';
          },
          renderFormItem(schema, config) {
            return worker && <RelationSelect<EcnCommissionLotsMode>
              selectedItem={config.record?.commissionLotsMode}
              fetchItems={filter => apiClient.ecnCommissionLotsModes.getManyBaseGenericLiquidityControllerEcnCommissionLotsMode({
                filter,
                worker,
              })}
            /> || null;
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.usersInst.commissionTurnover' }),
          dataIndex: 'commissionTurnover',
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
            min: -Infinity,
            stringMode: true,
          },
          render(text, record) {
            return dropTrailZeroes(record.commissionTurnover);
          }
        },
      ],
    },
    {
      title: intl.formatMessage({ id: 'pages.usersInst.rolloverTime' }),
      valueType: 'digit',
      dataIndex: 'rolloverTime',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
        stringMode: true,
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.usersInst.company' }),
      dataIndex: 'company',
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
      render: (text, record) => record.company?.name,
      renderFormItem: (schema, config, _, action) => {
        return worker && <RelationSelect<UsersInstCompany>
          selectedItem={config.record?.company}
          fetchItems={filter => apiClient.usersInstCompanies.getManyBaseGenericLiquidityControllerUsersInstCompany({
            filter,
            worker,
          })}
        /> || null;
      }
    },
    {
      title: intl.formatMessage({ id: 'pages.usersInst.trId' }),
      dataIndex: 'trId',
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
      title: intl.formatMessage({ id: 'pages.usersInst.fixTradingEnabled' }),
      dataIndex: 'fixTradingEnabled',
      sorter: true,
      formItemProps: {
        rules: [
          {
            required: true,
          }
        ]
      },
      renderFormItem() {
        return (
          <NumberSwitch />
        );
      },
      render(text, record) {
        return <Tag color={record.fixTradingEnabled ? 'green' : 'red'}>{record.fixTradingEnabled ? 'Enabled' : 'Disabled'}</Tag>;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.usersInst.fixUserinfoRequestsEnabled' }),
      dataIndex: 'fixUserinfoRequestsEnabled',
      sorter: true,
      formItemProps: {
        rules: [
          {
            required: true,
          }
        ]
      },
      renderFormItem() {
        return (
          <NumberSwitch />
        );
      },
      render(text, record) {
        return <Tag color={record.fixUserinfoRequestsEnabled ? 'green' : 'red'}>{record.fixUserinfoRequestsEnabled ? 'Enabled' : 'Disabled'}</Tag>;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.usersInst.alwaysBookA' }),
      dataIndex: 'alwaysBookA',
      sorter: true,
      formItemProps: {
        rules: [
          {
            required: true,
          }
        ]
      },
      renderFormItem() {
        return (
          <NumberSwitch />
        );
      },
      render(text, record) {
        return <Tag color={record.alwaysBookA ? 'green' : 'red'}>{record.alwaysBookA ? 'Enabled' : 'Disabled'}</Tag>;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.usersInst.hedgeFactor' }),
      dataIndex: 'hedgeFactor',
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
        min: -Infinity,
        stringMode: true,
      },
      render(text, record) {
        return dropTrailZeroes(record.hedgeFactor);
      }
    },
    {
      title: intl.formatMessage({ id: 'pages.usersInst.ts' }),
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
      title: intl.formatMessage({ id: 'pages.usersInst.tsMs' }),
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
      width: '50px',
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
