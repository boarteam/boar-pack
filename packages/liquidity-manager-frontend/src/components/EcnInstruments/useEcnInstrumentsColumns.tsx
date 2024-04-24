import { Link, useIntl } from "@umijs/max";
import { ProColumns } from "@ant-design/pro-components";
import {
  EcnCommissionLotsMode,
  EcnCommissionType,
  EcnInstrument,
  EcnInstrumentsGroup,
  EcnMarginCalcMode,
  EcnProfitCalcMode,
  EcnSwapType,
  EcnWeekDay,
} from "../../../tools/api";
import { EditOutlined } from "@ant-design/icons";
import { useAccess } from "umi";
import { NumberSwitch } from "../../Inputs/NumberSwitcher";
import { Tag } from "antd";
import { dropTrailZeroes } from "@/tools/numberTools";
import { RelationSelect } from "../../Inputs/RelationSelect";
import apiClient from "../../../tools/client/apiClient";
import { useLiquidityManagerContext } from "../../tools/liquidityManagerContext";
import { useEffect, useState } from "react";
import { dividerToMargin, MarginInput } from "./MarginInput";

export const useEcnInstrumentsColumns = (): (ProColumns<EcnInstrument>)[] => {
  const intl = useIntl();
  const { canManageLiquidity } = useAccess() || {};
  const { worker } = useLiquidityManagerContext();
  const [instrumentGroups, setInstrumentGroups] = useState<{ text: string, value: number }[]>([]);

  useEffect(() => {
    if (worker) {
      apiClient.ecnInstrumentsGroups.getManyBaseEcnInstrumentsGroupsControllerEcnInstrumentsGroup({
        worker,
        sort: ['name,ASC'],
      }).then((groups) => {
        setInstrumentGroups(groups.data.map((item) => ({ text: item.name, value: item.id })));
      });
    }
  }, [worker]);


  const columns: ProColumns<EcnInstrument>[] = [
    {
      title: intl.formatMessage({ id: 'pages.ecnInstruments.instrumentHash' }),
      dataIndex: 'instrumentHash',
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
      copyable: true,
      hideInDescriptions: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnInstruments.name' }),
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
      fixed: 'left',
      width: '100px',
      render: (text, record) => <Link to={`/liquidity/ecn-instruments/${record.instrumentHash}`}>{text}</Link>
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnInstruments.descr' }),
      dataIndex: 'descr',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnInstruments.instrumentGroup' }),
      dataIndex: 'instrumentGroup',
      sorter: true,
      formItemProps: {
        rules: [
          {
            required: true,
          }
        ]
      },
      filters: instrumentGroups,
      filterSearch: true,
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
      render(text, record) {
        return record.instrumentGroup?.name ?? '-';
      },
      renderFormItem(schema, config) {
        return worker && <RelationSelect<EcnInstrumentsGroup>
          selectedItem={config.record?.instrumentGroup}
          fetchItems={filter => apiClient.ecnInstrumentsGroups.getManyBaseEcnInstrumentsGroupsControllerEcnInstrumentsGroup({
            filter,
            worker,
          })}
        /> || null;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnInstruments.currency' }),
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
    },
    {
      title: 'Price',
      dataIndex: 'price_group', // hack to make it work with columns visibility settings
      children: [
        {
          title: intl.formatMessage({ id: 'pages.ecnInstruments.priceDigits.short' }),
          key: 'priceDigits',
          dataIndex: 'priceDigits',
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
          title: intl.formatMessage({ id: 'pages.ecnInstruments.priceLiquidityLimit.short' }),
          key: 'priceLiquidityLimit',
          dataIndex: 'priceLiquidityLimit',
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
            return dropTrailZeroes(record.priceLiquidityLimit);
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.ecnInstruments.tsPriceLiquidityLimit' }),
          dataIndex: 'tsPriceLiquidityLimit',
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
            return dropTrailZeroes(record.tsPriceLiquidityLimit);
          }
        },
      ]
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnInstruments.maxQuoteDeviation' }),
      dataIndex: 'maxQuoteDeviation',
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
      title: intl.formatMessage({ id: 'pages.ecnInstruments.maxQuoteTimeDeviation' }),
      dataIndex: 'maxQuoteTimeDeviation',
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
      title: intl.formatMessage({ id: 'pages.ecnInstruments.contractSize' }),
      dataIndex: 'contractSize',
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
    },
    {
      title: 'Swap',
      dataIndex: 'swap_group', // hack to make it work with columns visibility settings
      children: [
        {
          title: intl.formatMessage({ id: 'pages.ecnInstruments.swapEnable.short' }),
          dataIndex: 'swapEnable',
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
            return <Tag color={record.swapEnable ? 'green' : 'red'}>{record.swapEnable ? 'Enabled' : 'Disabled'}</Tag>;
          },
        },
        {
          title: intl.formatMessage({ id: 'pages.ecnInstruments.swapType.short' }),
          dataIndex: 'swapType',
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
          render(text, record) {
            return record.swapType?.name ?? '-';
          },
          renderFormItem(schema, config) {
            return worker && <RelationSelect<EcnSwapType>
              selectedItem={config.record?.swapType}
              fetchItems={filter => apiClient.ecnSwapTypes.getManyBaseGenericLiquidityControllerEcnSwapType({
                worker,
                filter,
              })}
            /> || null;
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.ecnInstruments.swapRollover3Days.short' }),
          dataIndex: 'swapRollover3Days',
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
            return record.swapRollover3Days?.name ?? '-';
          },
          renderFormItem(schema, config) {
            return worker && <RelationSelect<EcnWeekDay>
              selectedItem={config.record?.swapRollover3Days}
              fetchItems={filter => apiClient.ecnWeekDays.getManyBaseGenericLiquidityControllerEcnWeekDay({
                filter,
                worker,
              })}
            /> || null;
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.ecnInstruments.swapLong.short' }),
          dataIndex: 'swapLong',
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
            return dropTrailZeroes(record.swapLong);
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.ecnInstruments.swapShort.short' }),
          dataIndex: 'swapShort',
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
            return dropTrailZeroes(record.swapShort);
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.ecnInstruments.swapLimit.short' }),
          dataIndex: 'swapLimit',
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
            return dropTrailZeroes(record.swapLimit);
          }
        },
      ],
    },
    {
      title: 'Tick',
      dataIndex: 'tick_group', // hack to make it work with columns visibility settings
      children: [
        {
          title: intl.formatMessage({ id: 'pages.ecnInstruments.tickPrice.short' }),
          dataIndex: 'tickPrice',
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
            return dropTrailZeroes(record.tickPrice);
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.ecnInstruments.tickSize.short' }),
          dataIndex: 'tickSize',
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
            return dropTrailZeroes(record.tickSize);
          }
        },
      ],
    },
    {
      title: 'Commission',
      dataIndex: 'commission_group', // hack to make it work with columns visibility settings
      children: [
        {
          title: intl.formatMessage({ id: 'pages.ecnInstruments.commission' }),
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
          title: intl.formatMessage({ id: 'pages.ecnInstruments.commissionType.short' }),
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
          title: intl.formatMessage({ id: 'pages.ecnInstruments.commissionLotsMode.short' }),
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
          title: intl.formatMessage({ id: 'pages.ecnInstruments.commissionAgent.short' }),
          dataIndex: 'commissionAgent',
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
            return dropTrailZeroes(record.commissionAgent);
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.ecnInstruments.commissionAgentType.short' }),
          dataIndex: 'commissionAgentType',
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
          render(text, record) {
            return record.commissionAgentType?.name ?? '-';
          },
          renderFormItem(schema, config) {
            return worker && <RelationSelect<EcnCommissionType>
              selectedItem={config.record?.commissionAgentType}
              fetchItems={filter => apiClient.ecnCommissionTypes.getManyBaseGenericLiquidityControllerEcnCommissionType({
                filter,
                worker,
              })}
            /> || null;
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.ecnInstruments.commissionAgentLotsMode.short' }),
          dataIndex: 'commissionAgentLotsMode',
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
          render(text, record) {
            return record.commissionAgentLotsMode?.name ?? '-';
          },
          renderFormItem(schema, config) {
            return worker && <RelationSelect<EcnCommissionLotsMode>
              selectedItem={config.record?.commissionAgentLotsMode}
              fetchItems={filter => apiClient.ecnCommissionLotsModes.getManyBaseGenericLiquidityControllerEcnCommissionLotsMode({
                filter,
                worker,
              })}
            /> || null;
          }
        },
      ],
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnInstruments.profitMode' }),
      dataIndex: 'profitMode',
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
      render(text, record) {
        return record.profitMode?.name ?? '-';
      },
      renderFormItem(schema, config) {
        return worker && <RelationSelect<EcnProfitCalcMode>
          selectedItem={config.record?.profitMode}
          fetchItems={filter => apiClient.ecnProfitCalcModes.getManyBaseGenericLiquidityControllerEcnProfitCalcMode({
            filter,
            worker,
          })}
        /> || null;
      }
    },
    {
      title: 'Margin',
      dataIndex: 'margin_group', // hack to make it work with columns visibility settings
      children: [
        {
          title: intl.formatMessage({ id: 'pages.ecnInstruments.marginMode.short' }),
          dataIndex: 'marginMode',
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
          render(text, record) {
            return record.marginMode?.name ?? '-';
          },
          renderFormItem(schema, config) {
            return worker && <RelationSelect<EcnMarginCalcMode>
              selectedItem={config.record?.marginMode}
              fetchItems={filter => apiClient.ecnMarginCalcModes.getManyBaseGenericLiquidityControllerEcnMarginCalcMode({
                filter,
                worker,
              })}
            /> || null;
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.ecnInstruments.marginInitial.short' }),
          dataIndex: 'marginInitial',
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
            return dropTrailZeroes(record.marginInitial);
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.ecnInstruments.marginMaintenance.short' }),
          dataIndex: 'marginMaintenance',
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
            return dropTrailZeroes(record.marginMaintenance);
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.ecnInstruments.marginHedged.short' }),
          dataIndex: 'marginHedged',
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
            return dropTrailZeroes(record.marginHedged);
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.ecnInstruments.marginDivider.short' }),
          dataIndex: 'marginDivider',
          valueType: 'digit',
          sorter: true,
          formItemProps: {
            rules: [
              {
                required: true,
              }
            ],
          },
          fieldProps: {
            autoComplete: 'one-time-code', // disable browser autocomplete
            stringMode: true,
            formatter: (value: string) => {
              return value + '%';
            },
            parser: (value: string) => value?.replace('%', ''),
          },
          render(text, record) {
            const percent = dividerToMargin(record);
            return dropTrailZeroes(percent.toFixed(2)) + '%';
          },
          renderFormItem(_, config) {
            return config.record && <MarginInput
             instrument={config.record}
            /> || null;
          }
        },
        {
          title: intl.formatMessage({ id: 'pages.ecnInstruments.marginCurrency.short' }),
          dataIndex: 'marginCurrency',
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
      ],
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnInstruments.startExpirationDatetime' }),
      dataIndex: 'startExpirationDatetime',
      sorter: true,
      valueType: 'dateTime',
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
      title: intl.formatMessage({ id: 'pages.ecnInstruments.expirationDatetime' }),
      dataIndex: 'expirationDatetime',
      sorter: true,
      valueType: 'dateTime',
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
      title: intl.formatMessage({ id: 'pages.ecnInstruments.basis' }),
      dataIndex: 'basis',
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
      title: intl.formatMessage({ id: 'pages.ecnInstruments.delBandOnAbookNos' }),
      dataIndex: 'delBandOnAbookNos',
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
          color={record.delBandOnAbookNos ? 'green' : 'red'}>{record.delBandOnAbookNos ? 'Enabled' : 'Disabled'}</Tag>;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnInstruments.delBandOnBbookNos' }),
      dataIndex: 'delBandOnBbookNos',
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
          color={record.delBandOnBbookNos ? 'green' : 'red'}>{record.delBandOnBbookNos ? 'Enabled' : 'Disabled'}</Tag>;
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
            action?.startEditable?.(record.instrumentHash);
          }}
        >
          <EditOutlined />
        </a>,
      ],
    });
  }

  return columns;
};
