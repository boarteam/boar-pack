import diff from "deep-diff";
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

  const updateColumns = [
    ...changedRecordsColumnsConfig,
    {
      title: "Changes",
      dataIndex: "diff",
      key: "diff",
      render: (diff: diff.Diff<any, any>[]) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {diff.map((change, index) => {
            return (
              <div key={index} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ width: 100 }}>
                  <Tag color="blue">{change.path.join(".")}</Tag>
                </div>
                <div>
                  {change.lhs ? `${change.lhs.toString()} →` : ""} {change.rhs ? change.rhs.toString() : change.rhs === false ? 'false' : '-'}
                </div>
              </div>
            );
          })}
        </div>
      ),
    },
  ];

  return [
    <h3 key='changes-header'>Changed Values (Local Comparing)</h3>,
    <ProTable<TUpdatedDiffResult<Entity>>
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
