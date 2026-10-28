import React, { useEffect, useState } from 'react';
import { Column } from '@ant-design/plots';
import { ColumnConfig } from '@ant-design/plots/es/components/column';
import { EventLogTimelineDto, EventLogTimelineQueryDto } from '../../tools/api-client/generated';
import { useApiClient } from '../ApiClientContext';
import { PageLoading } from '@ant-design/pro-layout';
import { useModel } from 'umi';

type TEventLogsTimelineProps = EventLogTimelineQueryDto & {
  onDateRangeChange: (start: string | undefined, end: string | undefined) => void;
};

export const EventLogsTimeline: React.FC<TEventLogsTimelineProps> = ({
  startTime,
  endTime,
  onDateRangeChange,
}) => {
  const apiClient = useApiClient();
  // @ts-ignore
  const { initialState } = useModel('@@initialState');
  // @ts-ignore
  const { navTheme } = initialState?.settings || {};

  const [data, setData] = useState<EventLogTimelineDto[] | null>(null);

  useEffect(() => {
    apiClient.eventLogs
      .getTimeline({
        startTime,
        endTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      .then(setData);
  }, [startTime, endTime, apiClient.eventLogs]);

  if (!data) {
    return <PageLoading />;
  }

  const domain = ['Info', 'Warning', 'Error'];

  const config: ColumnConfig = {
    data,
    xField: 'startTime',
    yField: 'records',
    colorField: 'logLevel',
    stack: true,
    height: 300,
    theme: navTheme === 'realDark' ? 'dark' : 'light',
    legend: {},
    axis: {
      x: {
        labelFormatter: (v: string, i: number) => {
          return data[i * domain.length]?.time;
        },
      },
      y: {
        gridLineWidth: 1,
      },
    },
    scale: {
      color: {
        domain,
        range: ['#1890ff', 'orange', 'red'],
      },
    },
    onReady: ({ chart }) => {
      chart.on('interval:click', (event: any) => {
        const { data } = event?.data || {};
        onDateRangeChange(data?.startTime, data?.endTime);
      });
    },
  };

  return <Column {...config} />;
};
