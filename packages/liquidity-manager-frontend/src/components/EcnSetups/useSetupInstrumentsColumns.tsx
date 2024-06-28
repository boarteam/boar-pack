import { Link, useIntl } from "@umijs/max";
import { ProColumns } from "@ant-design/pro-components";
import {
  EcnConnectSchema,
  EcnInstrument,
  EcnSubscrSchema,
  GetEcnInstrumentsInConnectionsData
} from "@@api/generated";
import { Popover, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import apiClient from '@@api/apiClient';
import { useEcnSubscrSchemaColumns } from "../EcnSubscrSchemas/useEcnSubscrSchemaColumns";
import { ColumnsType } from "antd/es/table";
import { useLiquidityManagerContext } from "../../tools/liquidityManagerContext";
import { AddSubscrSchemaButton } from "./AddSubscrSchemaButton";
import { EditSubscrSchemaButton } from "./EditSubscrSchemaButton";

const subscrSchemaEnabledColorMap = new Map([
  ['Enabled', 'green'],
  ['Disabled', 'red'],
  ['Changed', 'yellow'],
  [undefined, 'purple'],
]);

const Content = ({
  compareConnectSchemaId,
  connectSchemaId,
  instrumentHash,
}: {
  compareConnectSchemaId: EcnConnectSchema['id'],
  connectSchemaId: EcnConnectSchema['id'],
  instrumentHash: EcnInstrument['instrumentHash'],
}) => {
  const { worker } = useLiquidityManagerContext();
  const subscrColumns = useEcnSubscrSchemaColumns();
  const subscrColumnsByDataIndex = subscrColumns.reduce((acc, column) => {
    if (column.dataIndex !== undefined) {
      acc[column.dataIndex.toString()] = column;
    }
    return acc;
  }, {} as Record<string, ProColumns<EcnSubscrSchema>>);

  const [tableData, setTableData] = useState<{
    dataSource: EcnSubscrSchema[],
    columns: ColumnsType<EcnSubscrSchema>,
  }>({ dataSource: [], columns: [] });

  useEffect(() => {
    if (!worker) {
      return;
    }

    apiClient.ecnSubscrSchemas.getManyBaseEcnSubscrSchemaControllerEcnSubscrSchema({
      worker,
      s: JSON.stringify({ "$and": [
        { "connectSchemaId": { "$in": [connectSchemaId, compareConnectSchemaId] } },
        { "instrumentHash": { "$eq": instrumentHash } },
      ]}),
      join: ['connectSchema', 'executionMode||name'],
    })
      .then(({ data }) => {
        const dataSource = data;
        const columns: ColumnsType<EcnSubscrSchema> = [{
          title: 'Connection',
          dataIndex: ['connectSchema', 'descr'],
        }];

        Object.entries(data[0]).forEach(([key, value0]) => {
          const value1 = data[1][key as keyof EcnSubscrSchema];
          if (value0 !== value1 && subscrColumnsByDataIndex[key]) {
            columns.push(subscrColumnsByDataIndex[key] as ColumnsType<EcnSubscrSchema>[number]);
          }
        });

        setTableData({ dataSource, columns });
      })
  }, []);

  return (
    <Table
      {...tableData}
      pagination={false}
      size="small"
    />
  )
}

type TSubscrState = {
  enabled: boolean,
  referenceEnabled?: boolean,
  equal?: boolean,
}

export const useSetupInstrumentsColumns = (connectSchemas: EcnConnectSchema[], compareConnectSchemaId?: EcnConnectSchema['id']): ProColumns<GetEcnInstrumentsInConnectionsData>[] => {
  const intl = useIntl();
  return [
    {
      title: intl.formatMessage({ id: 'pages.ecnInstruments.name' }),
      dataIndex: 'instrumentName',
      sorter: true,
      fixed: 'left',
      width: '100px',
      render: (text, record) => <Link to={`/liquidity/ecn-instruments/${record.instrumentHash}`}>{text}</Link>
    },
    ...connectSchemas.map<ProColumns<GetEcnInstrumentsInConnectionsData>>(connectSchema => {
      return {
        sorter: false,
        title: connectSchema.descr,
        dataIndex: ['connections', connectSchema.id],
        render: (text, record, _, action) => {
          const subscrState = record.connections[connectSchema.id] as TSubscrState | undefined;
          let value = subscrState === undefined ? undefined : subscrState.enabled ? 'Enabled' : 'Disabled';
          if (value === 'Enabled' && subscrState?.equal === false && subscrState.referenceEnabled) {
            value = 'Changed';
          }
          let Component = <Tag color={subscrSchemaEnabledColorMap.get(value)}>{value ?? 'Missing'}</Tag>;
          if (value === 'Changed' && compareConnectSchemaId !== undefined) {
            Component = (
              <Popover
                content={(
                  <Content
                    compareConnectSchemaId={compareConnectSchemaId}
                    connectSchemaId={connectSchema.id}
                    instrumentHash={record.instrumentHash}
                  />
                )}
              >
                {Component}
              </Popover>
            );
          }

          Component = (
            <>
              {Component}
              {value
                ? (
                  <EditSubscrSchemaButton
                    instrumentHash={record.instrumentHash}
                    connectSchemaId={connectSchema.id}
                    onDelete={async () => action?.reload()}
                    onUpdate={async () => action?.reload()}
                    className={'ant-table-cell_edit-button'}
                  />
                )
                : (
                  <AddSubscrSchemaButton
                    instrumentHash={record.instrumentHash}
                    connectSchemaId={connectSchema.id}
                    onCreate={async () => action?.reload()}
                    className={'ant-table-cell_edit-button'}
                  />
                )
              }
            </>
          );

          return Component;
        }
      }
    }),
  ];
};
