import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { UsersConnectionsStatisticTimeline } from './UsersConnectionsStatisticTimeline';
import { ApiClientProvider } from '../ApiClientContext';
import {
  ApiClient,
  UsersConnectionsStatisticDto,
} from '../../tools/api-client/generated';

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

const makeRow = (
  target: UsersConnectionsStatisticDto.target,
  time: string,
  records: number,
): UsersConnectionsStatisticDto => ({
  time,
  records,
  userId: 'u1',
  targetId: `${target}-id`,
  target,
  startTime: `2026-07-25T${time}:00.000Z`,
  endTime: `2026-07-25T${time}:59.999Z`,
});

function renderTimeline(rows: UsersConnectionsStatisticDto[]) {
  const getTimeline = vi.fn().mockResolvedValue(rows);
  const client = { usersConnectionsStatistic: { getTimeline } } as unknown as ApiClient;
  const onDateRangeChange = vi.fn();
  const utils = render(
    <ApiClientProvider value={client}>
      <UsersConnectionsStatisticTimeline
        startTime="2026-07-25T08:00:00.000Z"
        endTime="2026-07-25T10:00:00.000Z"
        onDateRangeChange={onDateRangeChange}
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

describe('UsersConnectionsStatisticTimeline', () => {
  it('fetches the users connections timeline for the given range', async () => {
    const { getTimeline } = renderTimeline([
      makeRow(UsersConnectionsStatisticDto.target.FIX_SERVER, '09:00', 4),
    ]);

    await waitFor(() => expect(getTimeline).toHaveBeenCalledTimes(1));
    expect(getTimeline).toHaveBeenCalledWith({
      startTime: '2026-07-25T08:00:00.000Z',
      endTime: '2026-07-25T10:00:00.000Z',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  });

  it('renders a stacked column chart grouped and colored by target', async () => {
    const rows = [
      makeRow(UsersConnectionsStatisticDto.target.FIX_SERVER, '09:00', 4),
      makeRow(UsersConnectionsStatisticDto.target.WEBSOCKET_SERVER, '09:00', 2),
      makeRow(UsersConnectionsStatisticDto.target.FIX_SERVER, '09:05', 6),
    ];
    renderTimeline(rows);

    await screen.findByTestId('column-chart');
    const config = captured.column[captured.column.length - 1];

    expect(config.data).toEqual(rows);
    expect(config.stack).toBe(true);
    expect(config.xField).toBe('time');
    expect(config.yField).toBe('records');
    expect(config.colorField).toBe('target');
    expect(config.height).toBe(300);
    expect(config.theme).toBe('light');
    expect(config.scale).toEqual({ color: { palette: 'category10' } });
    // Bars are grouped per x/color pair.
    expect(config.transform).toEqual([{ type: 'group', channels: ['x', 'color'] }]);
  });

  it('uses the dark chart theme when the umi navTheme is realDark', async () => {
    captured.navTheme = 'realDark';
    renderTimeline([makeRow(UsersConnectionsStatisticDto.target.TOKEN, '09:00', 1)]);

    await screen.findByTestId('column-chart');
    expect(captured.column[captured.column.length - 1].theme).toBe('dark');
  });

  it('calls onDateRangeChange with the clicked bucket range (drill-down)', async () => {
    const { onDateRangeChange } = renderTimeline([
      makeRow(UsersConnectionsStatisticDto.target.FIX_SERVER, '09:00', 4),
    ]);

    await screen.findByTestId('column-chart');
    const config = captured.column[captured.column.length - 1];

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

    // A click without data falls back to an undefined range.
    clickHandler({});
    expect(onDateRangeChange).toHaveBeenLastCalledWith(undefined, undefined);
  });

  it('formats the tooltip title from the bucket startTime as DD-MM-YYYY HH:mm', async () => {
    renderTimeline([makeRow(UsersConnectionsStatisticDto.target.FIX_SERVER, '09:00', 4)]);

    await screen.findByTestId('column-chart');
    const config = captured.column[captured.column.length - 1];

    expect(config.tooltip.title.field).toBe('startTime');
    const formatted = config.tooltip.title.valueFormatter('2026-07-25T09:00:00.000Z');
    expect(formatted).toMatch(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}$/);
  });

  it('shows a loading indicator until the request resolves', async () => {
    let resolveRequest!: (rows: UsersConnectionsStatisticDto[]) => void;
    const getTimeline = vi.fn().mockReturnValue(
      new Promise<UsersConnectionsStatisticDto[]>((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const client = { usersConnectionsStatistic: { getTimeline } } as unknown as ApiClient;

    const { container } = render(
      <ApiClientProvider value={client}>
        <UsersConnectionsStatisticTimeline
          startTime="2026-07-25T08:00:00.000Z"
          endTime="2026-07-25T10:00:00.000Z"
          onDateRangeChange={vi.fn()}
        />
      </ApiClientProvider>,
    );

    expect(container.querySelector('.ant-spin')).toBeTruthy();
    expect(screen.queryByTestId('column-chart')).not.toBeInTheDocument();

    resolveRequest([makeRow(UsersConnectionsStatisticDto.target.ACCOUNT, '09:00', 2)]);
    expect(await screen.findByTestId('column-chart')).toBeInTheDocument();
  });

  it('renders an empty placeholder when the range has no rows', async () => {
    renderTimeline([]);

    expect(await screen.findByText('No data')).toBeInTheDocument();
    expect(screen.queryByTestId('column-chart')).not.toBeInTheDocument();
  });
});
