import { Tag } from "antd";
import { ProColumns } from "@ant-design/pro-components";
import { useAccess, useIntl, Link } from "@umijs/max";
import { EcnExecutionMode, EcnInstrument, EcnSubscrSchema } from "@api/generated";
import apiClient from '@api/apiClient';
import { EditOutlined } from "@ant-design/icons";
import { useLiquidityManagerContext } from "../../../tools/liquidityManagerContext";
import { NumberSwitch, RelationSelect } from "@jifeon/boar-pack-common-frontend";

export const useEcnSubscrSchemaColumns = (): ProColumns<EcnSubscrSchema>[] => {
  const intl = useIntl();
  const { canManageLiquidity } = useAccess() || {};
  const { worker } = useLiquidityManagerContext();

  const columns: ProColumns<EcnSubscrSchema>[] = [
    {
      title: intl.formatMessage({ id: 'pages.ecnSubscrSchema.instrument' }),
      dataIndex: 'instrument',
      sorter: true,
      fixed: 'left',
      width: '100px',
      formItemProps: {
        rules: [{ required: true }]
      },
      render(text, record) {
        // link to subscr schema page
        return <Link to={`/liquidity/ecn-connect-schemas/${record.connectSchemaId}/subscription-schemas/${record.instrumentHash}`}>{record.instrument?.name ?? '-'}</Link>;
      },
      renderFormItem(schema, config) {
        return worker && <RelationSelect<EcnInstrument>
          selectedItem={config.record?.instrument}
          fetchItems={filter => apiClient.ecnInstruments.getManyBaseEcnInstrumentsControllerEcnInstrument({
            filter,
            worker,
          })}
        /> || null;
      }
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSubscrSchema.enabled' }),
      dataIndex: 'enabled',
      sorter: true,
      formItemProps: {
        rules: [{ required: true }]
      },
      renderFormItem() {
        return <NumberSwitch />;
      },
      render(text, record) {
        return <Tag color={record.enabled ? 'green' : 'red'}>{record.enabled ? 'Enabled' : 'Disabled'}</Tag>;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSubscrSchema.markupBid' }),
      dataIndex: 'markupBid',
      valueType: 'digit',
      sorter: true,
      formItemProps: {
        rules: [{ required: true }]
      },
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
        min: -Infinity,
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSubscrSchema.defaultMarkupBid' }),
      dataIndex: 'defaultMarkupBid',
      valueType: 'digit',
      sorter: true,
      formItemProps: {
        rules: [{ required: true }]
      },
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
        min: -Infinity,
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSubscrSchema.markupAsk' }),
      dataIndex: 'markupAsk',
      valueType: 'digit',
      sorter: true,
      formItemProps: {
        rules: [{ required: true }]
      },
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
        min: -Infinity,
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSubscrSchema.defaultMarkupAsk' }),
      dataIndex: 'defaultMarkupAsk',
      valueType: 'digit',
      sorter: true,
      formItemProps: {
        rules: [{ required: true }]
      },
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
        min: -Infinity,
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSubscrSchema.minVolume' }),
      dataIndex: 'minVolume',
      sorter: true,
      formItemProps: {
        rules: [{ required: true }]
      },
      fieldProps: {
        stringMode: true,
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSubscrSchema.maxVolume' }),
      dataIndex: 'maxVolume',
      sorter: true,
      formItemProps: {
        rules: [{ required: true }]
      },
      fieldProps: {
        stringMode: true,
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSubscrSchema.volumeStep' }),
      dataIndex: 'volumeStep',
      sorter: true,
      formItemProps: {
        rules: [{ required: true }]
      },
      fieldProps: {
        stringMode: true,
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSubscrSchema.instrumentWeight' }),
      dataIndex: 'instrumentWeight',
      valueType: 'digit',
      sorter: true,
      formItemProps: {
        rules: [{ required: true }]
      },
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
        min: -Infinity,
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSubscrSchema.executionMode' }),
      dataIndex: 'executionMode',
      sorter: true,
      formItemProps: {
        rules: [{ required: true }]
      },
      renderFormItem(schema, config) {
        return worker && <RelationSelect<EcnExecutionMode>
          selectedItem={config.record?.executionMode}
          fetchItems={filter => apiClient.ecnExecutionModes.getManyBaseGenericLiquidityControllerEcnExecutionMode({
            filter,
            worker,
          })}
        /> || null;
      },
      render(text, record) {
        return record.executionMode?.name ?? '-';
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSubscrSchema.descr' }),
      dataIndex: 'descr',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSubscrSchema.tradeEnabled' }),
      dataIndex: 'tradeEnabled',
      sorter: true,
      formItemProps: {
        rules: [{ required: true }]
      },
      renderFormItem() {
        return <NumberSwitch />;
      },
      render(text, record) {
        return <Tag color={record.tradeEnabled ? 'green' : 'red'}>{record.tradeEnabled ? 'Enabled' : 'Disabled'}</Tag>;
      },
    }
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
