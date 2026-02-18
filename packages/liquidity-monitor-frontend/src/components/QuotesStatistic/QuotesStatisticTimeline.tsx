import React, { useEffect, useState } from 'react';
import { PageLoading } from "@ant-design/pro-layout";
import { QuotesStatisticDto, QuotesStatisticQueryDto } from "../../tools/api-client";
import { Column, ColumnConfig } from "@ant-design/plots";
import moment from "moment";
import { useApiClient } from "../ApiClientContext";
import { TStatisticProvider } from "./index";
// @ts-ignore
import { useModel } from "umi";
import { Empty } from "antd";

type TQuotesStatisticTimelineProps = QuotesStatisticQueryDto & {
  onDateRangeChange: (start: string | undefined, end: string | undefined) => void;
  providers: {
    [key: string]: TStatisticProvider
  },
}

export const QuotesStatisticTimeline: React.FC<TQuotesStatisticTimelineProps> = ({
  startTime,
  endTime,
  onDateRangeChange,
  providers,
}) => {
  const apiClient = useApiClient();
  const [data, setData] = useState<QuotesStatisticDto[] | null>(null);

  const { initialState } = useModel('@@initialState');
  const { navTheme } = initialState?.settings || {};

  useEffect(() => {
    apiClient.quotesStatistics.getTimeline({
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
    colorField: (record: QuotesStatisticDto) => {
      return providers[record.providerName]?.name || record.providerName;
    },
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
        palette: 'rainbow'
      },
    },
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
