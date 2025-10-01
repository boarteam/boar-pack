import { ProColumns } from "@ant-design/pro-components";
import { TDiffResult } from "../Table/useImportExport";
import ProTable from "@ant-design/pro-table";
import useColumnsSets, { TColumnsSet } from "../Table/useColumnsSets";

export type TCreatedRecordsColumnsConfig<Entity> = {
  columnsSets?: TColumnsSet<Entity>[],
  columns: ProColumns<Entity>[],
}

function NewRecordsTab<Entity>({
                                 created,
                                 createdRecordsColumnsConfig,
                               }: {
  created: TDiffResult<Entity>['created'],
  createdRecordsColumnsConfig: TCreatedRecordsColumnsConfig<Entity>,
}) {
  const { columns, columnsSets } = createdRecordsColumnsConfig;

  const {
    columnsSetSelect,
    columnsState,
  } = useColumnsSets<Entity>({
    columns,
    columnsSets,
  });

  if (!created.length) {
    return <p>No new records found.</p>
  }

  return [
    <h3 key='new-records-header'>New Records (Local Comparing)</h3>,
    <ProTable<Entity>
      key='new-records-data'
      dataSource={created}
      columns={columns}
      columnsState={columnsState}
      toolBarRender={(...args) => [
        columnsSetSelect?.() || null,
      ]}
      rowKey={(record, index) => index}
      search={false}
    />,
  ];
}

export default NewRecordsTab;
