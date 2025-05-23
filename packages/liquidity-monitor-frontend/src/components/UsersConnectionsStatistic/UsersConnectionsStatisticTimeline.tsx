import React, { useEffect, useState } from 'react';
import { PageLoading } from "@ant-design/pro-layout";
import { UsersConnectionsStatisticDto, UsersConnectionsStatisticQueryDto } from "../../tools/api-client";
import { Column, ColumnConfig } from "@ant-design/plots";
import moment from "moment";
import apiClient from "../../tools/api-client/apiClient";
// @ts-ignore
import { useModel } from "umi";
import { Empty } from "antd";

type TUsersConnectionsStatisticTimelineProps = UsersConnectionsStatisticQueryDto & {
  onDateRangeChange: (start: string | undefined, end: string | undefined) => void;
}

export const UsersConnectionsStatisticTimeline: React.FC<TUsersConnectionsStatisticTimelineProps> = ({
  startTime,
  endTime,
  onDateRangeChange,
}) => {
  const [data, setData] = useState<UsersConnectionsStatisticDto[] | null>(null);

  const { initialState } = useModel('@@initialState');
  const { navTheme } = initialState?.settings || {};

  useEffect(() => {
    apiClient.usersConnectionsStatistic.getTimeline({
      startTime,
      endTime,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).then(setData);
  }, [startTime, endTime]);

  if (!data) {
    return <PageLoading />;
  }

  if (data.length === 0) {
    return <Empty />
  }

  const config: ColumnConfig = {
    data,
    xField: 'time',
    yField: 'records',
    colorField: 'target',
    stack: true,
    height: 300,
    theme: navTheme === 'realDark' ? 'dark' : 'light',
    axis: {
      y: {
        gridLineWidth: 1,
      }
    },
    tooltip: {
      title: {
        field: 'startTime',
        valueFormatter: (value: string) => {
          const date = new Date(value);
          return moment(date).format('DD-MM-YYYY HH:mm');
        }
      }
    },
    scale: {
      color: {
        palette: 'category10'
      },
    },
    transform: [
      {
        type: 'group',
        channels: ['x', 'color'],
      },
    ],
    onReady: ({ chart }) => {
      chart.on('interval:click', (event: any) => {
        const { data } = event?.data || {};
        onDateRangeChange(data?.startTime, data?.endTime);
      });
    }
  };

  return <Column
    {...config}
  />;
}
