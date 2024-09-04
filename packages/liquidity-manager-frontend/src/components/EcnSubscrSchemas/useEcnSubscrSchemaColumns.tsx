import { Tag } from "antd";
import { ProColumns } from "@ant-design/pro-components";
import { useAccess, useIntl, Link } from "@umijs/max";
import { EcnConnectSchema, EcnExecutionMode, EcnInstrument, EcnInstrumentsGroup, EcnSubscrSchema } from "@@api/generated";
import apiClient from '@@api/apiClient';
import { EditOutlined } from "@ant-design/icons";
import { useLiquidityManagerContext } from "../../tools/liquidityManagerContext";
import { 
  DynamicOptionsFilterDropdown,
  NumberRangeFilterDropdown, 
  NumberSwitch, 
  RelationSelect, 
  SearchSelect, 
  StringFilterDropdown, 
  booleanFilters,
} from "@jifeon/boar-pack-common-frontend";

export const useEcnSubscrSchemaColumns = (): ProColumns<EcnSubscrSchema>[] => {
  const intl = useIntl();
  const { worker, liquidityManager } = useLiquidityManagerContext();
  const { canManageLiquidity } = useAccess() || {};
  const canEdit = canManageLiquidity(liquidityManager);

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
      editable: (value) => value === undefined,
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
      },
      filterDropdown: ({
        confirm, 
        clearFilters,
        selectedKeys,
        setSelectedKeys,
      }) => (
        <DynamicOptionsFilterDropdown confirm={confirm} clearFilters={clearFilters}>
          <SearchSelect<EcnInstrument>
            selectedKeys={selectedKeys}
            setSelectedKeys={setSelectedKeys}
            fetchItems={(filter, limit) => apiClient.ecnInstruments.getManyBaseEcnInstrumentsControllerEcnInstrument({
              filter,
              limit,
              worker,
              fields: ['name'],
            })}
            fieldNames={{
              value: 'instrumentHash',
              label: 'name',
            }}
          />
        </DynamicOptionsFilterDropdown>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSubscrSchema.instrumentGroup' }),
      dataIndex: 'instrument.instrumentGroup.name',
      sorter: true,
      width: 130,
      render: (value, record) => record.instrument?.instrumentGroup?.name,
      editable: false,
      filterDropdown: ({
        confirm, 
        clearFilters,
        selectedKeys,
        setSelectedKeys,
      }) => (
        <DynamicOptionsFilterDropdown confirm={confirm} clearFilters={clearFilters}>
          <SearchSelect<EcnInstrumentsGroup>
            selectedKeys={selectedKeys}
            setSelectedKeys={setSelectedKeys}
            fetchItems={(filter, limit) => apiClient.ecnInstrumentsGroups.getManyBaseEcnInstrumentsGroupsControllerEcnInstrumentsGroup({
              filter,
              limit,
              worker,
              fields: ['name'],
            })}
            fieldNames={{
              value: 'id',
              label: 'name',
            }}
          />
        </DynamicOptionsFilterDropdown>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSubscrSchema.connectSchemaId' }),
      dataIndex: 'connectSchema',
      sorter: true,
      width: 30,
      formItemProps: {
        rules: [{ required: true }]
      },
      editable: (value) => value === undefined,
      render: (value, record) => record.connectSchemaId ?? record.connectSchema?.id ?? '-',
      renderFormItem(schema, config) {
        return worker && <RelationSelect<EcnConnectSchema>
          selectedItem={config.record?.connectSchema}
          fieldNames={{
            value: 'id',
            label: 'id',
          }}
          fetchItems={filter => apiClient.ecnConnectSchemas.getManyBaseEcnConnectSchemaControllerEcnConnectSchema({
            filter,
            worker,
          })}
        /> || null;
      },
      filterDropdown: ({
        confirm, 
        clearFilters,
        selectedKeys,
        setSelectedKeys,
      }) => (
        <DynamicOptionsFilterDropdown confirm={confirm} clearFilters={clearFilters}>
          <SearchSelect<EcnConnectSchema>
            selectedKeys={selectedKeys}
            setSelectedKeys={setSelectedKeys}
            fetchItems={(filter, limit) => apiClient.ecnConnectSchemas.getManyBaseEcnConnectSchemaControllerEcnConnectSchema({
              filter,
              limit,
              worker,
            })}
            fieldNames={{
              value: 'id',
              label: 'id',
            }}
          />
        </DynamicOptionsFilterDropdown>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSubscrSchema.connectSchemaDescr' }),
      dataIndex: 'connectSchema.descr',
      sorter: true,
      width: 230,
      render: (value, record) => record.connectSchema?.descr,
      editable: false,
      filterDropdown: (props) => <StringFilterDropdown {...props} />,
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSubscrSchema.enabled' }),
      dataIndex: 'enabled',
      sorter: true,
      renderFormItem() {
        return <NumberSwitch />;
      },
      render(text, record) {
        return record.enabled === undefined ? '-' :  <Tag color={record.enabled ? 'green' : 'red'}>{record.enabled ? 'Enabled' : 'Disabled'}</Tag>;
      },
      filters: booleanFilters,
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSubscrSchema.tradeEnabled' }),
      dataIndex: 'tradeEnabled',
      sorter: true,
      renderFormItem() {
        return <NumberSwitch />;
      },
      render(text, record) {
        return record.tradeEnabled === undefined ? '-' : <Tag color={record.tradeEnabled ? 'green' : 'red'}>{record.tradeEnabled ? 'Enabled' : 'Disabled'}</Tag>;
      },
      filters: booleanFilters,
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
      filterDropdown: (props) => <NumberRangeFilterDropdown {...props} />,
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
      filterDropdown: (props) => <NumberRangeFilterDropdown {...props} />,
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
      filterDropdown: (props) => <NumberRangeFilterDropdown {...props} />,
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
      filterDropdown: (props) => <NumberRangeFilterDropdown {...props} />,
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSubscrSchema.minVolume' }),
      dataIndex: 'minVolume',
      valueType: 'digit',
      sorter: true,
      formItemProps: {
        rules: [{ required: true }]
      },
      filterDropdown: (props) => <NumberRangeFilterDropdown {...props} />,
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSubscrSchema.maxVolume' }),
      dataIndex: 'maxVolume',
      valueType: 'digit',
      sorter: true,
      formItemProps: {
        rules: [{ required: true }]
      },
      filterDropdown: (props) => <NumberRangeFilterDropdown {...props} />,
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSubscrSchema.volumeStep' }),
      dataIndex: 'volumeStep',
      valueType: 'digit',
      sorter: true,
      formItemProps: {
        rules: [{ required: true }]
      },
      filterDropdown: (props) => <NumberRangeFilterDropdown {...props} />,
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
      filterDropdown: (props) => <NumberRangeFilterDropdown {...props} />,
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
      filterDropdown: ({
        confirm, 
        clearFilters,
        selectedKeys,
        setSelectedKeys,
      }) => (
        <DynamicOptionsFilterDropdown confirm={confirm} clearFilters={clearFilters}>
          <SearchSelect<EcnExecutionMode>
            selectedKeys={selectedKeys}
            setSelectedKeys={setSelectedKeys}
            fetchItems={(filter, limit) => apiClient.ecnExecutionModes.getManyBaseGenericLiquidityControllerEcnExecutionMode({
              filter,
              limit,
              worker,
            })}
            fieldNames={{
              value: 'id',
              label: 'name',
            }}
          />
        </DynamicOptionsFilterDropdown>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.ecnSubscrSchema.descr' }),
      dataIndex: 'descr',
      sorter: true,
      fieldProps: {
        autoComplete: 'one-time-code', // disable browser autocomplete
      },
    },
  ];


  if (canEdit) {
    columns.push({
      title: intl.formatMessage({ id: 'table.actions' }),
      valueType: 'option',
      width: '50px',
      fixed: 'right',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(`${record.instrumentHash}-${record.connectSchemaId}`);
          }}
        >
          <EditOutlined />
        </a>,
      ],
    });
  }

  return columns;
};
