import { PageContainer } from "@ant-design/pro-components";
import React, { useState } from "react";
import EventLogsTable from "../../components/EventLogs/EventLogsTable";
import { EventLogsTimeline } from "../../components/EventLogs/EventLogsTimeline";
import { Card } from "antd";

const EventLogs: React.FC = () => {
  const [startTime, setStartTime] = useState<string | undefined>(undefined);
  const [endTime, setEndTime] = useState<string | undefined>(undefined);

  const handleDateRangeChange = (start: string | undefined, end: string | undefined) => {
    setStartTime(start);
    setEndTime(end);
  };

  return (
    <PageContainer>
      <Card>
        <EventLogsTimeline startTime={startTime} endTime={endTime} onDateRangeChange={handleDateRangeChange} />
        <EventLogsTable startTime={startTime} endTime={endTime} onDateRangeChange={handleDateRangeChange} />
      </Card>
    </PageContainer>
  )
}

export default EventLogs;
