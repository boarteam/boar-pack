import { ProColumns } from "@ant-design/pro-components";
import { Badge, Collapse, CollapseProps, Typography } from "antd";
import { ExclamationCircleOutlined, InfoCircleTwoTone, WarningOutlined } from "@ant-design/icons";
import { DateRange } from "@jifeon/boar-pack-common-frontend";
import { EventLogTimelineQueryDto } from "@jifeon/boar-pack-users-frontend/src/tools/api-client";
import { UserAgentDisplay } from "@jifeon/boar-pack-users-frontend/src";
import { EventLog } from "../../tools/api-client";

const { Text } = Typography;

const logLevels = {
  [EventLog.logLevel.INFO]: {
    text: 'Info',
    icon: <InfoCircleTwoTone />,
    type: undefined as undefined,
  },
  [EventLog.logLevel.WARNING]: {
    text: 'Warning',
    icon: <WarningOutlined />,
    type: 'warning',
  },
  [EventLog.logLevel.ERROR]: {
    text: 'Error',
    icon: <ExclamationCircleOutlined />,
    type: 'danger',
  },
} as const;

export const useAuditLogsColumns = ({
  startTime,
  endTime,
  onDateRangeChange,
}: EventLogTimelineQueryDto & {
  onDateRangeChange: (start: string | undefined, end: string | undefined) => void;
}): ProColumns<EventLog>[] => {
  return [
    {
      title: 'Time',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      sorter: true,
      renderFormItem: () => <DateRange
        value={startTime && endTime ? [startTime, endTime] : null}
        onChange={(value) => onDateRangeChange(value?.[0] || undefined, value?.[1] || undefined)}
      />,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render(dom, record) {
        // getManyBase -> Get Many
        const action = record.action
          .replace('Base', '')
          .replace(/([a-z])([A-Z])/g, '$1 $2');
        return action[0].toUpperCase() + action.slice(1);
      },
      hideInSearch: true,
    },
    {
      title: 'User Name',
      dataIndex: 'userName',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'Entity',
      dataIndex: 'entity',
      render(dom, record) {
        // EventLogsController -> Event Logs
        return record.entity
          .replace('Controller', '')
          .replace(/([a-z])([A-Z])/g, '$1 $2');
      },
      hideInSearch: true,

    },
    {
      title: 'Entity ID',
      dataIndex: 'entityId',
      copyable: true,
      hideInSearch: true,
    },
    {
      title: 'Method',
      dataIndex: 'method',
      valueEnum: {
        GET: {
          text: 'GET',
        },
        POST: {
          text: 'POST',
        },
        PUT: {
          text: 'PUT',
        },
        PATCH: {
          text: 'PATCH',
        },
        DELETE: {
          text: 'DELETE',
        },
        OPTIONS: {
          text: 'OPTIONS',
        },
        HEAD: {
          text: 'HEAD',
        },
      },
      filters: true,
      hideInSearch: true,
    },
    {
      title: 'URL',
      dataIndex: 'url',
      width: 600,
      render(dom, record) {
        return <Typography.Paragraph
          style={{
            width: 600,
            margin: 0,
          }}
          ellipsis={{
            rows: 1,
            expandable: true,
          }}
          copyable={true}
        >{record.url}</Typography.Paragraph>;
      },
      hideInSearch: true,
    },
    {
      title: 'Payload',
      dataIndex: 'payload',
      render(dom, record) {
        if (record.payload === null) {
          return 'N/A';
        }

        if ('message' in record.payload) {
          const items: CollapseProps['items'] = [
            {
              key: '1',
              label: <pre style={{ margin: 0 }}>{record.payload.message}</pre>,
              children: <pre
                style={{ margin: 0 }}
              >{
                JSON.stringify(record.payload, null, 2).replace(/\n/g, '\n')
              }</pre>,
            },
          ];

          return <Collapse items={items} ghost />;
        }

        return <pre style={{ margin: 0 }}>{JSON.stringify(record.payload)}</pre>;
      },
      hideInSearch: true,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      copyable: true,
      hideInSearch: true,
    },
    {
      title: 'User Agent',
      dataIndex: 'userAgent',
      render(dom, record) {
        if (record.userAgent === null) {
          return 'N/A';
        }

        return <UserAgentDisplay userAgent={record.userAgent} />;
      },
      hideInSearch: true,

    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      render(dom, record) {
        const text = record.duration + ' ms';

        if (record.duration === null) {
          return 'N/A';
        }

        if (record.duration >= 1000) {
          return <Typography.Text type='danger'>{text}</Typography.Text>;
        }

        if (record.duration >= 200) {
          return <Typography.Text type='warning'>{text}</Typography.Text>;
        }

        return text;
      },
      valueType: 'digit',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: 'Status Code',
      dataIndex: 'statusCode',
      render(dom, record) {
        if (record.statusCode === null) {
          return 'N/A';
        }

        if (record.statusCode >= 500) {
          return <Badge color={'red'} text={record.statusCode} />;
        }

        if (record.statusCode >= 300) {
          return <Badge color={'orange'} text={record.statusCode} />;
        }

        return <Badge color={'green'} text={record.statusCode} />;
      },
      hideInSearch: true,
    },
    {
      title: 'Log Level',
      dataIndex: 'logLevel',
      render(dom, record) {
        return <Text
          type={logLevels[record.logLevel].type}>{logLevels[record.logLevel].icon} {logLevels[record.logLevel].text}</Text>;
      },
      valueEnum: Object.fromEntries(
        Object.entries(logLevels).map(([key, value]) => [
          key,
          {
            text: <Text type={value.type}>{value.icon} {value.text}</Text>,
          }
        ])
      ),
      filters: true,
      hideInSearch: true,
    }
  ];
};
