import React, { useEffect, useMemo, useState } from 'react';
import { Column } from '@ant-design/plots';
import { ColumnConfig } from "@ant-design/plots/es/components/column";
import { EventLogTimelineDto, EventLogTimelineQueryDto } from "@@api/generated";
import apiClient from "@@api/apiClient";
import { Button } from "antd";
import { PageLoading } from "@ant-design/pro-layout";
import { useModel } from "umi";

type TEventLogsTimelineProps = EventLogTimelineQueryDto & {
  onDateRangeChange: (start: string | undefined, end: string | undefined) => void;
}

export const EventLogsTimeline: React.FC<TEventLogsTimelineProps> = ({
  startTime,
  endTime,
  onDateRangeChange,
}) => {
    // @ts-ignore
    const { initialState } = useModel('@@initialState');
    // @ts-ignore
    const { navTheme } = initialState?.settings || {};

    const [data, setData] = useState<EventLogTimelineDto[] | null>(null);
    const sliderPosition = useMemo(() => [0, 1], []);
    const [showFilterButton, setShowFilterButton] = useState(false);

    const chartRef = React.useRef(null);

    useEffect(() => {
        apiClient.eventLogs.getTimeline({
            startTime,
            endTime,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }).then(setData).then(() => {
            sliderPosition[0] = 0;
            sliderPosition[1] = 1;
            setShowFilterButton(false);
        });
    }, [startTime, endTime]);

    if (!data) {
        return <PageLoading/>;
    }

    const applySliderDates = () => {
        const [start, end] = sliderPosition;
        const startDate = data?.[Math.floor(start * (data.length - 1))]?.startTime;
        const endDate = data?.[Math.floor(end * (data.length - 1))]?.endTime;
        onDateRangeChange(startDate, endDate);
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
        // slider: {
        //   x: {
        //     values: sliderPosition,
        //     onChange(values: [number, number]) {
        //       sliderPosition[0] = values[0];
        //       sliderPosition[1] = values[1];
        //       if (!showFilterButton) {
        //         setShowFilterButton(true);
        //       }
        //     }
        //   },
        // },
        axis: {
            x: {
                labelFormatter: (v: string, i: number) => {
                    return data[i * domain.length]?.time
                },
            },
            y: {
                gridLineWidth: 1,
            }
        },
        scale: {
            color: {
                domain,
                range: ['#1890ff', 'orange', 'red'],
            },
        },
        onReady: ({chart}) => {
            chart.on('interval:click', (event: any) => {
                const {data} = event?.data || {};
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
