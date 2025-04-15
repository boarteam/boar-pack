import React, { useEffect, useMemo, useState } from 'react';
import { PageLoading } from "@ant-design/pro-layout";
import { QuotesStatisticDto, QuotesStatisticQueryDto } from "../../tools/api-client";
import { Column, ColumnConfig } from "@ant-design/plots";
import { Button } from "antd";
import moment from "moment";
import { quotesColors } from "./QuotesColors";
import apiClient from "../../tools/api-client/apiClient";
import { TStatisticProvider } from "./index";
// @ts-ignore
import { useModel } from "umi";

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
  const [data, setData] = useState<QuotesStatisticDto[] | null>(null);
  const sliderPosition = useMemo(() => [0, 1], []);
  const [showFilterButton, setShowFilterButton] = useState(false);

  const { initialState } = useModel('@@initialState');
  const { navTheme } = initialState?.settings || {};

  const chartRef = React.useRef(null);

  useEffect(() => {
    apiClient.quotesStatistics.getTimeline({
      startTime,
      endTime,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).then(setData).then(() => {
      sliderPosition[0] = 0;
      sliderPosition[1] = 1;
      setShowFilterButton(false);
    });
  }, [startTime, endTime]);

  if (!data || !providers) {
    return <PageLoading />;
  }

  const applySliderDates = () => {
    const [start, end] = sliderPosition;
    const startDate = data?.[Math.floor(start * (data.length - 1))]?.startTime;
    const endDate = data?.[Math.floor(end * (data.length - 1))]?.endTime;
    onDateRangeChange(startDate, endDate);
  }

  const config: ColumnConfig = {
    data,
    xField: 'startTime',
    yField: 'records',
    colorField: (record: QuotesStatisticDto) => {
      return providers[record.providerName]?.name
    },
    stack: true,
    height: 300,
    theme: navTheme === 'realDark' ? 'dark' : 'light',
    legend: {},
    axis: {
      x: {
        labelFormatter: (v: string, i: number) => {
          return data[i * Object.values(providers).length]?.time
        },
      },
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
        domain: Object.values(providers).map(p => p.name),
        range: Object.values(quotesColors),
      },
    },
    onReady: ({ chart }) => {
      chart.on('interval:click', (event: any) => {
        const { data } = event?.data || {};
        onDateRangeChange(data?.startTime, data?.endTime);
      });
    }
  };

  return <>
    <Column
      {...config}
      ref={chartRef}
    />
    {
      showFilterButton && <Button onClick={applySliderDates}>Filter dates</Button> || null
    }
  </>
}
