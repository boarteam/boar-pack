import { useIntl } from "@umijs/max";
import { ProColumns } from "@ant-design/pro-components";
import { InstrumentsGroup, LiquidityManager } from "../../tools/api";
import { EditOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import { CheckLiquidityManagerConnection } from "./CheckLiquidityManagerConnection";
import { useAccess } from "umi";
import React from "react";

type TWorkersEnum = {
  [key in LiquidityManager.worker]: {
    text: string;
  }
}

const workersEnum: TWorkersEnum = Object.values(LiquidityManager.worker).reduce((acc, value, i) => {
  acc[value] = {
    text: `Worker ${i + 1}`,
  };

  return acc;
}, {} as TWorkersEnum);

type TColorsEnum = {
  [key in InstrumentsGroup.color]: { text: React.ReactElement, color: InstrumentsGroup.color };
}
const colorsEnum: TColorsEnum = {} as TColorsEnum;
Object.values(InstrumentsGroup.color).forEach((color) => {
  colorsEnum[color] = {
    text: <Tag color={color}>{color}</Tag>,
    color,
  };
});

export const useLiquidityManagersColumns = (): ProColumns<LiquidityManager>[] => {
  const intl = useIntl();
  const { canManageLiquidity } = useAccess() || {};

  const columns: ProColumns<LiquidityManager>[] = [
    {
      title: intl.formatMessage({ id: 'pages.liquidityManagers.name' }),
      dataIndex: 'name',
      fixed: 'left',
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
      title: intl.formatMessage({ id: 'pages.liquidityManagers.host' }),
      dataIndex: 'host',
      width: '10%',
      valueType: 'text',
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
      title: intl.formatMessage({ id: 'pages.liquidityManagers.port' }),
      dataIndex: 'port',
      width: '10%',
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
      title: intl.formatMessage({ id: 'pages.liquidityManagers.user' }),
      dataIndex: 'user',
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
      title: intl.formatMessage({ id: 'pages.liquidityManagers.password' }),
      dataIndex: 'pass',
      valueType: 'password',
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.liquidityManagers.database' }),
      dataIndex: 'database',
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
      title: intl.formatMessage({ id: 'pages.liquidityManagers.worker' }),
      dataIndex: 'worker',
      valueType: 'select',
      valueEnum: workersEnum,
    },
    {
      title: intl.formatMessage({ id: 'pages.liquidityManagers.color' }),
      dataIndex: 'color',
      valueType: 'select',
      valueEnum: colorsEnum,
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
      title: intl.formatMessage({ id: 'pages.liquidityManagers.checkConnection' }),
      width: '100px',
      render: (
        text,
        record
      ) => {
        return <CheckLiquidityManagerConnection liquidityManager={record}/>;
      },
      renderFormItem: (schema, { record }) => {
        if (!record) {
          return null;
        }

        return <CheckLiquidityManagerConnection liquidityManager={record} />;
      }
    },
    {
      title: intl.formatMessage({ id: 'pages.liquidityManagers.enabled' }),
      dataIndex: 'enabled',
      valueType: 'switch',
      width: '3%',
      render: (text, record) => {
        return <Tag color={record.enabled ? 'green' : 'red'}>{record.enabled ? 'Enabled' : 'Disabled'}</Tag>;
      }
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
