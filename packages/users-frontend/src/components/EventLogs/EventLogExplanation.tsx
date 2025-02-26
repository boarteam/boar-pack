import React from "react";
import { EventLog } from "@@api/generated";
import { Card, Descriptions, Tag, Typography } from "antd";
import {
  ClockCircleOutlined,
  CrownOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  UserOutlined,
  WarningOutlined
} from "@ant-design/icons";
import UserAgentDisplay from "./UserAgentDisplay";

const { Paragraph, Text, Title } = Typography;

function formatJson(s: string): string {
  try {
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch (e) {
    return s;
  }
}

export function getUserRoleIcon(role: string): React.ReactNode {
  switch (role) {
    case EventLog.userRole.ADMIN:
      return <CrownOutlined />;
    case EventLog.userRole.USER:
      return <UserOutlined />;
    case EventLog.userRole.GUEST:
      return <QuestionCircleOutlined />;
    case EventLog.userRole.SYSTEM:
      return <SettingOutlined />;
    default:
      return <QuestionCircleOutlined />;
  }
}

function getLogTypeTag(logType: string): React.ReactNode {
  switch (logType) {
    case EventLog.logType.AUDIT:
      return <Tag icon={<UserOutlined />}>Audit Log</Tag>;
    case EventLog.logType.OPERATIONAL:
      return <Tag icon={<SettingOutlined />}>Operational Log</Tag>;
    case EventLog.logType.APPLICATION:
      return <Tag>Application Log</Tag>;
    default:
      return <Tag>Unknown</Tag>;
  }
}

function renderUserAgentText(userAgent: string | null): React.ReactNode {
  return userAgent
    ? <>using <UserAgentDisplay userAgent={userAgent} /> with User-Agent header:
      <pre>{userAgent}</pre>
    </>
    : 'without User-Agent header';

}

export const EventLogExplanation: React.FC<{ record: EventLog }> = ({ record }) => {
  const duration = record.duration !== null ? <Tag icon={<ClockCircleOutlined />}>{record.duration} ms</Tag> : 'unknown time ';

  let statusCode: React.ReactNode;
  if (record.statusCode === null) {
    statusCode = <Tag>Unknown</Tag>;
  } else if (record.statusCode >= 500) {
    statusCode = <Tag color='red'>{record.statusCode}</Tag>;
  } else if (record.statusCode >= 300) {
    statusCode = <Tag color='orange'>{record.statusCode}</Tag>;
  } else if (record.statusCode >= 200) {
    statusCode = <Tag color='green'>{record.statusCode}</Tag>;
  }

  // get query params form url
  let queryParamsEl: React.ReactNode = <>N/A<br /></>;
  if (record.url) {
    let url: URL;
    try {
      url = new URL(window.location.origin + record.url);
    } catch (e) {
      console.error(e);
      url = new URL(window.location.origin);
    }
    const queryParams = Array.from(url.searchParams.entries());
    if (queryParams.length) {
      queryParamsEl = <Descriptions column={1} size='small' bordered={true} items={
        queryParams.map(([key, value], i) => {
          return {
            key: i,
            label: key,
            children: key !== 's' ? <Text code>{value}</Text> : <pre style={{
              fontSize: '0.8em',
            }}>{formatJson(value)}</pre>
          };
        })
      } />
    }
  }
  const query = <Paragraph>
    <Title level={5}>Query Parameters</Title>
    {queryParamsEl}
  </Paragraph>;

  let payloadEl: React.ReactNode = <>N/A<br /></>;
  if (record.payload) {
    payloadEl = <pre>{JSON.stringify(record.payload, null, 2).replace(/\n/g, '\n')}</pre>;
  }
  const payload = <Paragraph>
    <Title level={5}>Action Payload</Title>
    {payloadEl}
  </Paragraph>;

  let userEl = record.user
    ? <>User <Tag>{record.user.name}</Tag>which had role <Tag
      icon={getUserRoleIcon(record.userRole)}>{record.userRole}</Tag></>
    : <>A <Tag icon={<QuestionCircleOutlined />}>Guest</Tag></>;

  if (record.userRole === EventLog.userRole.SYSTEM) {
    userEl = <Tag icon={<SettingOutlined />}>System</Tag>;
  }

  const actionEl = record.action === 'Access'
    ? <>tried to access <Tag>{record.entity}</Tag>controller</>
    : <>performed <Tag>{record.entity}.{record.action}</Tag>action</>;

  let logLevelEl = <Tag color={'warning'} icon={<WarningOutlined />}>{record.logLevel}</Tag>;
  if (record.logLevel === EventLog.logLevel.INFO) {
    logLevelEl = <Tag color={'blue'} icon={<InfoCircleOutlined />}>{record.logLevel}</Tag>;
  } else if (record.logLevel === EventLog.logLevel.ERROR) {
    logLevelEl = <Tag color={'red'} icon={<ExclamationCircleOutlined />}>{record.logLevel}</Tag>;
  }

  return <Card
    title={<>
      {getLogTypeTag(record.logType)}captured at <Tag icon={<ClockCircleOutlined />}>{record.createdAt}</Tag>with log
      level {logLevelEl}
    </>}
  >
    {record.logType === EventLog.logType.AUDIT && <Paragraph>
      {userEl}{actionEl} as result of the HTTP request<br />
      <pre>
        {record.method} {record.url}<br />
      </pre>
      {query}
      {payload}
      <Title level={5}>Client</Title>
      Request was done from IP address <Tag>{record.ipAddress}</Tag><br />
      {renderUserAgentText(record.userAgent)}
    </Paragraph> || null}
    {record.logType !== EventLog.logType.AUDIT && <><Paragraph>
      {userEl}{actionEl}
    </Paragraph>{payload}</>}
    <Paragraph>
      <Title level={5}>Service</Title>
      The action was handled by service <Tag>{record.service}</Tag>{record.serviceId ? <>with ID <Text code
                                                                                                        copyable>{record.serviceId}</Text></> : ''}
    </Paragraph>
    {(record.duration || record.statusCode) ? <Paragraph>
      <Title level={5}>Response</Title>
      The request took {duration}and returned status code {statusCode}<br />
    </Paragraph> : null}
  </Card>;
}
