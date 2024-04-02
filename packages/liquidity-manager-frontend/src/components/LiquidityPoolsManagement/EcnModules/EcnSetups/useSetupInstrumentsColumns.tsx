import { Link, useIntl } from "@umijs/max";
import { ProColumns } from "@ant-design/pro-components";
import { EcnConnectSchema, EcnInstrument, EcnSubscrSchema } from "../../../../tools/api";
import { Popover, Table, Tag } from "antd";
import { DataType } from "./SetupInstrumentsTable";
import { useEffect, useState } from "react";
import apiClient from "@/tools/client/apiClient";
import { Entries } from 'type-fest';
import { ColumnsType } from "antd/es/table";
import { useEcnSubscrSchemaColumns } from "../EcnSubscrSchemas/useEcnSubscrSchemaColumns";
import { ColumnType } from "antd/lib/table";

type TDiffTableData = Partial<EcnSubscrSchema & { name: EcnConnectSchema['descr'] }>;

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
  const subscrColumns = useEcnSubscrSchemaColumns();
  const subscrColumnsByDataIndex = subscrColumns.reduce((acc, column) => {
    if (column.dataIndex !== undefined) {
      acc[column.dataIndex] = column;
    }
    return acc;
  }, {} as Record<keyof EcnSubscrSchema, ColumnType<EcnSubscrSchema>>);

  const [tableData, setTableData] = useState<{
    dataSource: TDiffTableData[],
    columns: ColumnsType<TDiffTableData>,
  }>({ dataSource: [], columns: [] });

  useEffect(() => {
    apiClient.ecnSubscrSchemas.getManyBaseEcnSubscrSchemaControllerEcnSubscrSchema({
      s: JSON.stringify({ "$and": [
        { "connectSchemaId": { "$in": [connectSchemaId, compareConnectSchemaId] } }, 
        { "instrumentHash": { "$eq": instrumentHash } }, 
      ]}),
      join: ['connectSchema', 'executionMode||name'],
    })
      .then(({ data }) => {
        const { connectSchemaId: id0, connectSchema: connectSchema0, descr: descr0, ...rest0 } = data[0];
        const { connectSchemaId: id1, connectSchema: connectSchema1, descr: descr1, ...rest1 } = data[1];
        const dataSource: TDiffTableData[] = [{ name: connectSchema0.descr }, { name: connectSchema1.descr }];
        const columns: ColumnsType<TDiffTableData> = [{ dataIndex: 'name', title: 'Connection' }]

        for (const [key, value0] of Object.entries(rest0) as Entries<typeof rest0>) {
          const value1 = rest1[key];
          if (value0 !== value1) {
            dataSource[0][key] = value0;
            dataSource[1][key] = value1;
            columns.push(subscrColumnsByDataIndex[key]);
          }
        }

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

export const useSetupInstrumentsColumns = (connectSchemas: EcnConnectSchema[], compareConnectSchemaId?: EcnConnectSchema['id']): ProColumns<DataType>[] => {
  const intl = useIntl();
  const columns: ProColumns<DataType>[] = [
    {
      title: intl.formatMessage({ id: 'pages.ecnInstruments.name' }),
      dataIndex: 'instrumentName',
      sorter: true,
      fixed: 'left',
      width: '100px',
      render: (text, record) => <Link to={`/liquidity/ecn-instruments/${record.instrumentHash}`}>{text}</Link>
    },
    ...connectSchemas.map(connectSchema => {
      return {
        sorter: false,
        title: connectSchema.descr,
        dataIndex: connectSchema.id,
        render: (text: React.ReactNode, record: DataType) => {
          const value = record[connectSchema.id];
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
          };

          return Component;
        }
      }
    }),
  ]

  return columns;
};
