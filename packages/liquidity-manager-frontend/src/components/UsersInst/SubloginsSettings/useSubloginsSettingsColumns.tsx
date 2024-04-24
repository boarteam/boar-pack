import { ProColumns } from "@ant-design/pro-components";
import { useAccess, useIntl, Link } from "@umijs/max";
import { EcnCurrency, EcnInstrument, SubloginSettings } from "../../../../tools/api";
import { EditOutlined } from "@ant-design/icons";
import { dropTrailZeroes } from "../../../../tools/numberTools";
import { RelationSelect } from "../../../Inputs/RelationSelect";
import apiClient from "../../../../tools/client/apiClient";
import { NumberSwitch } from "../../../Inputs/NumberSwitcher";
import { Tag } from "antd";
import { useLiquidityManagerContext } from "../../../tools/liquidityManagerContext";

export const useSubloginsSettingsColumns = (): ProColumns<SubloginSettings>[] => {
  const intl = useIntl();
  const { canManageLiquidity } = useAccess() || {};
  const { worker } = useLiquidityManagerContext();

  const columns: ProColumns<SubloginSettings>[] = [
    {
      title: intl.formatMessage({ id: 'pages.usersSubloginInstrumentsSetting.instrument' }),
      dataIndex: 'instrumentRel',
      sorter: true,
      fixed: 'left',
      width: '100px',
      editable: false,
      formItemProps: {
        rules: [
          {
            required: true,
          }
        ]
      },
      fieldProps: {
        autoComplete: 'one-time-code',
      },
      render: (text, record) => {
        return <Link to={`/liquidity/ecn-instruments/${record.instrumentRel?.instrumentHash}`}>{record.instrumentRel?.name}</Link>;
      },
      renderFormItem: (schema, config) => {
        return worker && <RelationSelect<EcnInstrument>
          selectedItem={config.record?.instrumentRel}
          fieldNames={{
            value: 'name',
            label: 'name',
          }}
          fetchItems={filter => apiClient.ecnInstruments.getManyBaseEcnInstrumentsControllerEcnInstrument({
            filter,
            worker,
          })}
        /> || null;
      }
    },
    {
      title: intl.formatMessage({ id: 'pages.usersSubloginInstrumentsSetting.spreadLimit' }),
      dataIndex: 'spreadLimit',
      valueType: 'digit',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code',
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.usersSubloginInstrumentsSetting.minVolumeForABook' }),
      dataIndex: 'minVolumeForABook',
      valueType: 'digit',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code',
        stringMode: true,
      },
      render(text, record) {
        return dropTrailZeroes(record.minVolumeForABook);
      }
    },
    {
      title: intl.formatMessage({ id: 'pages.usersSubloginInstrumentsSetting.spreadLimitOnRollover' }),
      dataIndex: 'spreadLimitOnRollover',
      valueType: 'digit',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code',
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.usersSubloginInstrumentsSetting.digits' }),
      dataIndex: ['instrumentRel', 'priceDigits'],
      valueType: 'digit',
      sorter: true,
      editable: false,
      hideInDescriptions: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.usersSubloginInstrumentsSetting.instrumentPriorityFlag' }),
      dataIndex: 'instrumentPriorityFlag',
      valueType: 'digit',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code',
      },
      renderFormItem() {
        return <NumberSwitch />;
      },
      render(text, record) {
        return <Tag color={record.instrumentPriorityFlag ? 'green' : 'red'}>{record.instrumentPriorityFlag ? 'Enabled' : 'Disabled'}</Tag>;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.usersSubloginInstrumentsSetting.markupBid' }),
      dataIndex: 'markupBid',
      valueType: 'digit',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code',
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.usersSubloginInstrumentsSetting.markupAsk' }),
      dataIndex: 'markupAsk',
      valueType: 'digit',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code',
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.usersSubloginInstrumentsSetting.alias' }),
      dataIndex: 'alias',
      sorter: true,
      formItemProps: {
        rules: [
          {
            required: true,
          }
        ]
      },
      fieldProps: {
        autoComplete: 'one-time-code',
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.usersSubloginInstrumentsSetting.demi' }),
      dataIndex: 'demi',
      valueType: 'digit',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code',
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.usersSubloginInstrumentsSetting.dema' }),
      dataIndex: 'dema',
      valueType: 'digit',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code',
      },
    },
    {
      title: 'Hedge',
      dataIndex: 'hedge_group',
      children: [
        {
          title: intl.formatMessage({ id: 'pages.usersSubloginInstrumentsSetting.hedgeMultiplier.short' }),
          dataIndex: 'hedgeMultiplier',
          valueType: 'digit',
          sorter: true,
          fieldProps: {
            autoComplete: 'one-time-code',
            stringMode: true,
          },
          render(text, record) {
            return dropTrailZeroes(record.hedgeMultiplier);
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.usersSubloginInstrumentsSetting.hedgeAmount.short' }),
          dataIndex: 'hedgeAmount',
          valueType: 'digit',
          sorter: true,
          fieldProps: {
            autoComplete: 'one-time-code',
            stringMode: true,
          },
          render(text, record) {
            return dropTrailZeroes(record.hedgeAmount);
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.usersSubloginInstrumentsSetting.hedgeStep.short' }),
          dataIndex: 'hedgeStep',
          valueType: 'digit',
          sorter: true,
          fieldProps: {
            autoComplete: 'one-time-code',
            stringMode: true,
          },
          render(text, record) {
            return dropTrailZeroes(record.hedgeStep);
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.usersSubloginInstrumentsSetting.hedgeCurrency.short' }),
          dataIndex: 'hedgeCurrency',
          sorter: true,
          fieldProps: {
            autoComplete: 'one-time-code',
          },
          render(text, record) {
            return record.hedgeCurrency?.name;
          },
          renderFormItem: (schema, config) => {
            return worker && <RelationSelect<EcnCurrency>
              selectedItem={config.record?.hedgeCurrency}
              fieldNames={{
                value: 'name',
                label: 'name',
              }}
              fetchItems={filter => apiClient.ecnCurrencies.getManyBaseGenericLiquidityControllerEcnCurrency({
                filter,
                worker,
              })}
            /> || null;
          }
        },
      ]
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
            action?.startEditable?.(record.instrument);
          }}
        >
          <EditOutlined />
        </a>,
      ],
    });
  }

  return columns;
};
