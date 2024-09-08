import apiClient from "@@api/apiClient";
import { EventLog, EventLogCreateDto, EventLogTimelineQueryDto, EventLogUpdateDto } from "@@api/generated";
import { useEventLogsColumns } from "./useEventLogsColumns";
import { Table, TColumnsSet } from "@jifeon/boar-pack-common-frontend";
import { eventLogsSearchableColumns } from "./eventLogsSearchableColumns";
import { EventLogExplanation } from "./EventLogExplanation";
import { createStyles } from "antd-style";
import { ConfigProvider } from "antd";

type TEventLogFilterParams = {}

const columnsSets: TColumnsSet<EventLog>[] = [
  {
    name: 'Audit',
    columns: [
      'createdAt',
      'logType',
      'entity',
      'action',
      'entityId',
      'user',
      'logLevel',
    ],
  },
  {
    name: 'Operational',
    columns: [
      'createdAt',
      'logType',
      'entity',
      'entityId',
      'service',
      'serviceId',
      'action',
      'userRole',
      'logLevel',
    ],
  },
  {
    name: 'Application',
    columns: [
      'createdAt',
      'logType',
      'service',
      'serviceId',
      'logLevel',
      'payload',
    ],
  },
  {
    name: 'Requests',
    columns: [
      'service',
      'createdAt',
      'user',
      'method',
      'url',
      'duration',
      'statusCode',
    ],
  },
  {
    name: 'HTTP',
    columns: [
      'createdAt',
      'method',
      'url',
      'ipAddress',
      'userAgent',
    ],
  }
];

const useStyles = createStyles(({ token }) => {
  return {
    table: {
      '.ant-pro-table-list-toolbar-left': {
        flex: '0 0 auto',
      },
    },
  };
});

const EventLogsTable = ({
  startTime,
  endTime,
  onDateRangeChange,
}: EventLogTimelineQueryDto & {
  onDateRangeChange: (start: string | undefined, end: string | undefined) => void;
}) => {
  const columns = useEventLogsColumns({
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
          }
        }
      }}
    >
      <Table<EventLog, EventLogCreateDto, EventLogUpdateDto, TEventLogFilterParams>
        className={styles.table}
        getAll={params => apiClient.eventLogs.getManyBaseEventLogsControllerEventLog(params)}
        columns={columns}
        idColumnName='id'
        pathParams={{}}
        defaultSort={['createdAt', 'DESC']}
        columnsSets={columnsSets}
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
            return <EventLogExplanation record={record} />;
          },
          fixed: 'left',
        }}
        viewOnly={true}
        scroll={{
          x: 'max-content',
        }}
        searchableColumns={eventLogsSearchableColumns}
        search={{
          filterType: 'light',
        }}
        ghost={true}
      ></Table>
    </ConfigProvider>
  );
}

export default EventLogsTable;
