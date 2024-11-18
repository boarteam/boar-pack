import React from "react";
import { EventLog } from "@@api/generated";
import { Card, Tag, Typography } from "antd";
import {
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  UserOutlined,
  WarningOutlined
} from "@ant-design/icons";
import { UserAgentDisplay } from "@jifeon/boar-pack-users-frontend";

const { Paragraph, Title } = Typography;

function renderUserAgentText(userAgent: string | null): React.ReactNode {
  return userAgent
    ? <>using <UserAgentDisplay userAgent={userAgent} /> with User-Agent header:
      <pre>{userAgent}</pre>
    </>
    : 'without User-Agent header';
}

export const AuditLogExplanation: React.FC<{ record: EventLog }> = ({ record }) => {
  let logLevelEl = <Tag color={'warning'} icon={<WarningOutlined />}>{record.logLevel}</Tag>;
  if (record.logLevel === EventLog.logLevel.INFO) {
    logLevelEl = <Tag color={'blue'} icon={<InfoCircleOutlined />}>{record.logLevel}</Tag>;
  } else if (record.logLevel === EventLog.logLevel.ERROR) {
    logLevelEl = <Tag color={'red'} icon={<ExclamationCircleOutlined />}>{record.logLevel}</Tag>;
  }

  return <Card
    title={<>
      <Tag icon={<UserOutlined />}>Audit Log</Tag> captured at <Tag icon={<ClockCircleOutlined />}>{record.createdAt}</Tag>with log
      level {logLevelEl}
    </>}
  >
    <Paragraph>
      <Title level={5}>Client</Title>
      Request was done from IP address <Tag>{record.ipAddress}</Tag><br />
      {renderUserAgentText(record.userAgent)}
    </Paragraph>
  </Card>;
}
