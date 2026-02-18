import { Tag } from "antd";
import { ProColumns } from "@ant-design/pro-components";
import { TDiffResult, TUpdatedDiffResult } from "../Table/useImportExport";
import ProTable from "@ant-design/pro-table";

function ChangesTab<Entity> ({ updated, changedRecordsColumnsConfig }: {
  updated: TDiffResult<Entity>['tableData'],
  changedRecordsColumnsConfig: ProColumns<Entity>[]
}) {
  if (!updated.length) {
    return <>
      No changes found.
    </>
  }

  const updateColumns: ProColumns<TUpdatedDiffResult>[] = [
    ...(changedRecordsColumnsConfig as unknown as ProColumns<TUpdatedDiffResult>[]),
    {
      title: "Changes",
      dataIndex: "diff",
      key: "diff",
      render: (_dom, entity) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {entity.diff.map((change, index) => {
            const c = change as { path?: any[]; lhs?: any; rhs?: any };
            return (
              <div key={index} style={{ display: "flex", alignItems: "center" }}>
                <Tag color="blue">{c.path?.join(".")}</Tag>
                {c.lhs ? `${c.lhs.toString()} →` : "- →"} {c.rhs ? c.rhs : c.rhs === false ? 'false' : '-'}
              </div>
            );
          })}
        </div>
      ),
    },
  ];

  return [
    <h3 key='changes-header'>Changed Values (Local Comparing)</h3>,
    <ProTable<TUpdatedDiffResult>
      key='changes-data'
      dataSource={updated}
      columns={updateColumns}
      rowKey='id'
      search={false}
      toolBarRender={false}
    />
  ]
}

export default ChangesTab;
