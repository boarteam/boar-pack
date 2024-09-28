// antd switch but not for boolean, for numbers 0 and 1
import React from "react";
import dayjs from "dayjs";
import { DatePicker } from "antd";

interface RangePickerProps extends Omit<React.ComponentProps<typeof DatePicker.RangePicker>, 'value' | 'onChange'> {
  value? : [string | null, string | null] | null;
  onChange? : (value?: [string | null, string | null] | null) => void;
}

export const DateRange: React.FC<RangePickerProps> = ({
  value,
  onChange,
  ...props
}) => {
  return (
    <DatePicker.RangePicker
      showTime={{
        showNow: true,
        showHour: true,
        showMinute: true,
        showSecond: true,
        showMillisecond: true,
      }}
      allowEmpty={[true, true]}
      presets={[
        {
          label: 'Today',
          value: [dayjs().startOf('day'), dayjs().endOf('day')],
        },
        {
          label: 'Yesterday',
          value: [dayjs().subtract(1, 'day').startOf('day'), dayjs().subtract(1, 'day').endOf('day')],
        },
        {
          label: 'Last 15 minutes',
          value: [dayjs().subtract(15, 'minute'), dayjs()],
        },
        {
          label: 'Last 30 minutes',
          value: [dayjs().subtract(30, 'minute'), dayjs()],
        },
        {
          label: 'Last 1 hour',
          value: [dayjs().subtract(1, 'hour'), dayjs()],
        },
        {
          label: 'Last 24 hours',
          value: [dayjs().subtract(1, 'day'), dayjs()],
        },
        {
          label: 'Last 7 days',
          value: [dayjs().subtract(7, 'day'), dayjs()],
        },
        {
          label: 'Last 30 days',
          value: [dayjs().subtract(30, 'day'), dayjs()],
        },
        {
          label: 'This month',
          value: [dayjs().startOf('month'), dayjs().endOf('month')],
        },
        {
          label: 'Last month',
          value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')],
        },
      ]}
      value={value?.map(date => dayjs(date)) as [dayjs.Dayjs, dayjs.Dayjs] | undefined}
      onChange={(dates) => {
        onChange?.(dates?.map(date => date?.toISOString() ?? null) as [string | null, string | null] | null);
      }}
      {...props}
    />
  );
}
