import { ProColumns } from "@ant-design/pro-components";
import { Typography } from "antd";
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
      title: 'IP Address',
      dataIndex: 'ipAddress',
      hideInSearch: true,
      hideInTable: true,
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
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'Type',
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
