import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TestProviders } from '../../../test/testUtils';
import { EventLogTimelineDto } from '../../tools/api-client/generated';

const hoisted = vi.hoisted(() => ({
  chartProps: [] as any[],
  initialState: {} as Record<string, any>,
}));

// Capture what the component feeds into the chart instead of rendering canvas.
vi.mock('@ant-design/plots', async () => {
  const React = await vi.importActual<typeof import('react')>('react');
  return {
    Column: React.forwardRef((props: any, ref: any) => {
      hoisted.chartProps.push(props);
      return React.createElement('div', { 'data-testid': 'column-chart', ref });
    }),
  };
});

vi.mock('umi', () => ({
  useModel: () => ({ initialState: hoisted.initialState }),
}));

import { EventLogsTimeline } from './EventLogsTimeline';

function makeBucket(
  i: number,
  logLevel: EventLogTimelineDto.logLevel,
  records = i,
): EventLogTimelineDto {
  return {
    time: `10:0${i}`,
    records,
    logLevel,
    startTime: `2026-01-15T10:0${i}:00Z`,
    endTime: `2026-01-15T10:0${i}:59Z`,
  };
}

// two time buckets, three levels each -- mirrors the API response layout
const data: EventLogTimelineDto[] = [
  makeBucket(0, EventLogTimelineDto.logLevel.INFO, 5),
  makeBucket(0, EventLogTimelineDto.logLevel.WARNING, 2),
  makeBucket(0, EventLogTimelineDto.logLevel.ERROR, 1),
  makeBucket(3, EventLogTimelineDto.logLevel.INFO, 7),
  makeBucket(3, EventLogTimelineDto.logLevel.WARNING, 0),
  makeBucket(3, EventLogTimelineDto.logLevel.ERROR, 4),
];

function makeClient(timeline: EventLogTimelineDto[] = data) {
  return {
    eventLogs: {
      getTimeline: vi.fn().mockResolvedValue(timeline),
    },
  };
}

const renderTimeline = (
  props: Partial<React.ComponentProps<typeof EventLogsTimeline>> = {},
  client = makeClient(),
) => {
  const onDateRangeChange = vi.fn();
  render(
    <TestProviders client={client}>
      <EventLogsTimeline onDateRangeChange={onDateRangeChange} {...props} />
    </TestProviders>
  );
  return { client, onDateRangeChange };
};

const lastChartProps = () => hoisted.chartProps[hoisted.chartProps.length - 1];

describe('EventLogsTimeline', () => {
  beforeEach(() => {
    hoisted.chartProps = [];
    hoisted.initialState = {};
  });

  it('shows a loader until the timeline arrives, then the chart', async () => {
    renderTimeline();

    expect(screen.queryByTestId('column-chart')).not.toBeInTheDocument();
    expect(await screen.findByTestId('column-chart')).toBeInTheDocument();
  });

  it('queries the timeline with the date range and browser timezone', async () => {
    const { client } = renderTimeline({
      startTime: '2026-01-01T00:00:00Z',
      endTime: '2026-01-31T00:00:00Z',
    });

    await screen.findByTestId('column-chart');
    expect(client.eventLogs.getTimeline).toHaveBeenCalledWith({
      startTime: '2026-01-01T00:00:00Z',
      endTime: '2026-01-31T00:00:00Z',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  });

  it('passes the timeline data and the stacked-column config to the chart', async () => {
    renderTimeline();

    await screen.findByTestId('column-chart');
    const props = lastChartProps();
    expect(props.data).toEqual(data);
    expect(props.xField).toBe('startTime');
    expect(props.yField).toBe('records');
    expect(props.colorField).toBe('logLevel');
    expect(props.stack).toBe(true);
    expect(props.height).toBe(300);
    expect(props.scale.color).toEqual({
      domain: ['Info', 'Warning', 'Error'],
      range: ['#1890ff', 'orange', 'red'],
    });
  });

  it('labels the x axis with the bucket time of every third record', async () => {
    renderTimeline();

    await screen.findByTestId('column-chart');
    const { labelFormatter } = lastChartProps().axis.x;
    // one label per time bucket: index i maps to data[i * 3]
    expect(labelFormatter('ignored', 0)).toBe('10:00');
    expect(labelFormatter('ignored', 1)).toBe('10:03');
    expect(labelFormatter('ignored', 2)).toBeUndefined();
  });

  it('uses the light theme by default and dark for the realDark nav theme', async () => {
    renderTimeline();
    await screen.findByTestId('column-chart');
    expect(lastChartProps().theme).toBe('light');

    hoisted.initialState = { settings: { navTheme: 'realDark' } };
    renderTimeline();
    await waitFor(() => {
      expect(lastChartProps().theme).toBe('dark');
    });
  });

  it('propagates interval clicks as a date range change', async () => {
    const { onDateRangeChange } = renderTimeline();

    await screen.findByTestId('column-chart');
    const chart = { on: vi.fn() };
    lastChartProps().onReady({ chart });

    expect(chart.on).toHaveBeenCalledWith('interval:click', expect.any(Function));
    const handler = chart.on.mock.calls[0][1];

    handler({
      data: {
        data: {
          startTime: '2026-01-15T10:00:00Z',
          endTime: '2026-01-15T10:00:59Z',
        },
      },
    });
    expect(onDateRangeChange).toHaveBeenCalledWith(
      '2026-01-15T10:00:00Z',
      '2026-01-15T10:00:59Z'
    );
  });

  it('handles interval clicks without payload gracefully', async () => {
    const { onDateRangeChange } = renderTimeline();

    await screen.findByTestId('column-chart');
    const chart = { on: vi.fn() };
    lastChartProps().onReady({ chart });
    const handler = chart.on.mock.calls[0][1];

    handler(undefined);
    expect(onDateRangeChange).toHaveBeenCalledWith(undefined, undefined);
  });

  it('refetches when the date range props change', async () => {
    const client = makeClient();
    const onDateRangeChange = vi.fn();
    const { rerender } = render(
      <TestProviders client={client}>
        <EventLogsTimeline onDateRangeChange={onDateRangeChange} />
      </TestProviders>
    );
    await screen.findByTestId('column-chart');
    expect(client.eventLogs.getTimeline).toHaveBeenCalledTimes(1);

    rerender(
      <TestProviders client={client}>
        <EventLogsTimeline
          onDateRangeChange={onDateRangeChange}
          startTime="2026-02-01T00:00:00Z"
          endTime="2026-02-02T00:00:00Z"
        />
      </TestProviders>
    );

    await waitFor(() => {
      expect(client.eventLogs.getTimeline).toHaveBeenCalledTimes(2);
    });
    expect(client.eventLogs.getTimeline).toHaveBeenLastCalledWith({
      startTime: '2026-02-01T00:00:00Z',
      endTime: '2026-02-02T00:00:00Z',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  });
});
