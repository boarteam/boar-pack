import apiClient from "@@api/apiClient";
import { Table } from "@jifeon/boar-pack-common-frontend";
import { auditLogsSearchableColumns } from "./auditLogsSearchableColumns";
import { createStyles } from "antd-style";
import { ConfigProvider } from "antd";
import { EventLog } from "../../tools/api-client";
import { EventLogTimelineQueryDto } from "@jifeon/boar-pack-users-frontend/src/tools/api-client";
import { useAuditLogsColumns } from "./useAuditLogsColumns";
import { AuditLogExplanation } from "./AuditLogExplanation";

const useStyles = createStyles(({ token }) => {
  return {
    table: {
      '.ant-pro-table-list-toolbar-left': {
        flex: '0 0 auto',
      },
    },
  };
});

const AuditLogsTable = ({
  startTime,
  endTime,
  onDateRangeChange,
}: EventLogTimelineQueryDto & {
  onDateRangeChange: (start: string | undefined, end: string | undefined) => void;
}) => {
  const columns = useAuditLogsColumns({
    startTime,
    endTime,
    onDateRangeChange,
  });
  const { styles } = useStyles();

  return (
    <ConfigProvider
      theme={{
        components: {
          Collapse: {
            contentPadding: '0',
            headerPadding: '0',
          },
        }
      }}
    >
      <Table<EventLog>
        className={styles.table}
        getAll={params => apiClient.myAuditLogs.getManyBaseMyAuditLogsControllerEventLog(params)}
        columns={columns}
        idColumnName='id'
        pathParams={{}}
        defaultSort={['createdAt', 'DESC']}
        params={{
          join: [{
            field: 'user',
            select: ['id', 'name'],
          }],
          baseFilters: {
            ...startTime && endTime && { createdAt: [startTime, endTime] },
          }
        }}
        expandable={{
          expandedRowRender: record => {
            return <AuditLogExplanation record={record} />;
          },
          fixed: 'left',
        }}
        viewOnly={true}
        scroll={{
          x: 'max-content',
        }}
        searchableColumns={auditLogsSearchableColumns}
        search={{
          filterType: 'light',
        }}
        ghost={true}
      ></Table>
    </ConfigProvider>
  );
}

export default AuditLogsTable;
