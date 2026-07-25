import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QuotesStatisticTimeline } from './QuotesStatisticTimeline';
import { ApiClientProvider } from '../ApiClientContext';
import type { ApiClient, QuotesStatisticDto } from '../../tools/api-client/generated';

const captured = vi.hoisted(() => ({
  column: [] as any[],
  navTheme: 'light' as string | undefined,
}));

vi.mock('@ant-design/plots', () => ({
  Line: (props: any) => <div data-testid="line-chart" />,
  Column: (props: any) => {
    captured.column.push(props);
    return <div data-testid="column-chart" />;
  },
}));

vi.mock('umi', () => ({
  useModel: () => ({
    initialState: { settings: { navTheme: captured.navTheme } },
  }),
}));

const makeRow = (providerName: string, time: string, records: number): QuotesStatisticDto => ({
  time,
  records,
  providerName,
  startTime: `2026-07-25T${time}:00.000Z`,
  endTime: `2026-07-25T${time}:59.999Z`,
});

const providersMap = {
  provA: { id: 'provA', name: 'Provider A', enabled: true },
  provB: { id: 'provB', name: 'Provider B', enabled: false },
};

function renderTimeline(
  rows: QuotesStatisticDto[],
  overrides: Partial<{
    startTime: string;
    endTime: string;
    onDateRangeChange: (start?: string, end?: string) => void;
  }> = {},
) {
  const getTimeline = vi.fn().mockResolvedValue(rows);
  const client = { quotesStatistics: { getTimeline } } as unknown as ApiClient;
  const onDateRangeChange = overrides.onDateRangeChange ?? vi.fn();
  const utils = render(
    <ApiClientProvider value={client}>
      <QuotesStatisticTimeline
        startTime={overrides.startTime ?? '2026-07-25T08:00:00.000Z'}
        endTime={overrides.endTime ?? '2026-07-25T10:00:00.000Z'}
        onDateRangeChange={onDateRangeChange}
        providers={providersMap}
      />
    </ApiClientProvider>,
  );
  return { ...utils, getTimeline, onDateRangeChange };
}

beforeEach(() => {
  captured.column.length = 0;
  captured.navTheme = 'light';
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('QuotesStatisticTimeline', () => {
  it('fetches the timeline for the given date range with the browser timezone', async () => {
    const { getTimeline } = renderTimeline([makeRow('provA', '09:00', 4)]);

    await waitFor(() => expect(getTimeline).toHaveBeenCalledTimes(1));
    expect(getTimeline).toHaveBeenCalledWith({
      startTime: '2026-07-25T08:00:00.000Z',
      endTime: '2026-07-25T10:00:00.000Z',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  });

  it('renders a stacked column chart built from the fetched rows', async () => {
    const rows = [
      makeRow('provA', '09:00', 4),
      makeRow('provB', '09:00', 2),
      makeRow('provA', '09:05', 6),
    ];
    renderTimeline(rows);

    await screen.findByTestId('column-chart');
    const config = captured.column[captured.column.length - 1];

    expect(config.data).toEqual(rows);
    expect(config.stack).toBe(true);
    expect(config.xField).toBe('time');
    expect(config.yField).toBe('records');
    expect(config.height).toBe(300);
    expect(config.theme).toBe('light');
    expect(config.scale).toEqual({ color: { palette: 'rainbow' } });
  });

  it('colors series by the provider display name, falling back to the raw name', async () => {
    const rows = [makeRow('provA', '09:00', 4)];
    renderTimeline(rows);

    await screen.findByTestId('column-chart');
    const config = captured.column[captured.column.length - 1];

    expect(typeof config.colorField).toBe('function');
    expect(config.colorField(makeRow('provA', '09:00', 4))).toBe('Provider A');
    expect(config.colorField(makeRow('provB', '09:00', 1))).toBe('Provider B');
    // Providers missing from the map keep their raw provider name.
    expect(config.colorField(makeRow('unknown-provider', '09:00', 1))).toBe('unknown-provider');
  });

  it('uses the dark chart theme when the umi navTheme is realDark', async () => {
    captured.navTheme = 'realDark';
    renderTimeline([makeRow('provA', '09:00', 4)]);

    await screen.findByTestId('column-chart');
    const config = captured.column[captured.column.length - 1];
    expect(config.theme).toBe('dark');
  });

  it('calls onDateRangeChange with the clicked bucket range (drill-down)', async () => {
    const { onDateRangeChange } = renderTimeline([makeRow('provA', '09:00', 4)]);

    await screen.findByTestId('column-chart');
    const config = captured.column[captured.column.length - 1];

    // The component wires the drill-down through onReady -> chart.on('interval:click').
    const chart = { on: vi.fn() };
    config.onReady({ chart });
    expect(chart.on).toHaveBeenCalledWith('interval:click', expect.any(Function));

    const clickHandler = chart.on.mock.calls[0][1];
    clickHandler({
      data: {
        data: {
          startTime: '2026-07-25T09:00:00.000Z',
          endTime: '2026-07-25T09:59:59.999Z',
        },
      },
    });

    expect(onDateRangeChange).toHaveBeenCalledTimes(1);
    expect(onDateRangeChange).toHaveBeenCalledWith(
      '2026-07-25T09:00:00.000Z',
      '2026-07-25T09:59:59.999Z',
    );
  });

  it('drills down safely when the click event carries no data', async () => {
    const { onDateRangeChange } = renderTimeline([makeRow('provA', '09:00', 4)]);

    await screen.findByTestId('column-chart');
    const config = captured.column[captured.column.length - 1];

    const chart = { on: vi.fn() };
    config.onReady({ chart });
    const clickHandler = chart.on.mock.calls[0][1];

    clickHandler({});
    expect(onDateRangeChange).toHaveBeenCalledWith(undefined, undefined);
    clickHandler(undefined);
    expect(onDateRangeChange).toHaveBeenLastCalledWith(undefined, undefined);
  });

  it('formats the tooltip title as DD-MM-YYYY HH:mm', async () => {
    renderTimeline([makeRow('provA', '09:00', 4)]);

    await screen.findByTestId('column-chart');
    const config = captured.column[captured.column.length - 1];

    const formatted = config.tooltip.title.valueFormatter('2026-07-25T09:00:00.000Z');
    expect(formatted).toMatch(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}$/);
    expect(formatted).toContain('-2026 ');
  });

  it('shows a loading indicator until the request resolves', async () => {
    let resolveRequest!: (rows: QuotesStatisticDto[]) => void;
    const getTimeline = vi.fn().mockReturnValue(
      new Promise<QuotesStatisticDto[]>((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const client = { quotesStatistics: { getTimeline } } as unknown as ApiClient;

    const { container } = render(
      <ApiClientProvider value={client}>
        <QuotesStatisticTimeline
          startTime="2026-07-25T08:00:00.000Z"
          endTime="2026-07-25T10:00:00.000Z"
          onDateRangeChange={vi.fn()}
          providers={providersMap}
        />
      </ApiClientProvider>,
    );

    expect(container.querySelector('.ant-spin')).toBeTruthy();
    expect(screen.queryByTestId('column-chart')).not.toBeInTheDocument();

    resolveRequest([makeRow('provA', '09:00', 4)]);
    expect(await screen.findByTestId('column-chart')).toBeInTheDocument();
  });

  it('renders an empty placeholder when the range has no rows', async () => {
    renderTimeline([]);

    expect(await screen.findByText('No data')).toBeInTheDocument();
    expect(screen.queryByTestId('column-chart')).not.toBeInTheDocument();
  });
});
