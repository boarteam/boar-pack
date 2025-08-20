import { ProColumns } from "@ant-design/pro-components";
import { TDiffResult } from "../Table/useImportExport";
import ProTable from "@ant-design/pro-table";

function NewRecordsTab<Entity>({
                                 created,
                                 createdRecordsColumnsConfig,
                               }: {
  created: TDiffResult<Entity>['created'],
  createdRecordsColumnsConfig: ProColumns<Entity>[],
}) {

  return [
    <h3 key='new-records-header'>New Records (Local Comparing)</h3>,
    <ProTable<Entity>
      key='new-records-data'
      dataSource={created}
      columns={createdRecordsColumnsConfig}
      rowKey={(record, index) => index}
      search={false}
      toolBarRender={false}
    />,
  ];
}

export default NewRecordsTab;
