import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { message } from 'antd';
import { TargetsConnectionsStatisticCards } from './TargetsConnectionsStatisticCards';
import { ApiClientProvider } from '../ApiClientContext';
import { ApiClient, UsersConnectionsStatisticDto } from '../../tools/api-client/generated';

const captured = vi.hoisted(() => ({
  line: [] as any[],
}));

vi.mock('@ant-design/plots', () => ({
  Line: (props: any) => {
    captured.line.push(props);
    return <div data-testid="line-chart" />;
  },
  Column: (props: any) => <div data-testid="column-chart" />,
}));

const makeRow = (
  targetId: string,
  time: string,
  records: number,
): UsersConnectionsStatisticDto => ({
  time,
  records,
  userId: 'u1',
  targetId,
  target: UsersConnectionsStatisticDto.target.FIX_SERVER,
  startTime: '2026-07-25T09:00:00.000Z',
  endTime: '2026-07-25T10:00:00.000Z',
});

const targets = [
  { id: 't1', name: 'Target One' },
  { id: 't2', name: 'Target Two' },
];

function renderCards(
  props: { targets?: { id: string; name: string }[]; updateInterval?: number },
  rows: UsersConnectionsStatisticDto[] = [],
) {
  const getTargetsTimeline = vi.fn().mockResolvedValue(rows);
  const client = { usersConnectionsStatistic: { getTargetsTimeline } } as unknown as ApiClient;
  const utils = render(
    <ApiClientProvider value={client}>
      <TargetsConnectionsStatisticCards
        targets={props.targets}
        updateInterval={props.updateInterval}
      />
    </ApiClientProvider>,
  );
  return { ...utils, getTargetsTimeline };
}

beforeEach(() => {
  captured.line.length = 0;
  vi.spyOn(message, 'error').mockImplementation(() => ({}) as any);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('TargetsConnectionsStatisticCards', () => {
  it('requests the targets timeline with the target ids and the last-hour window', async () => {
    const { getTargetsTimeline } = renderCards({ targets });

    await waitFor(() => expect(getTargetsTimeline).toHaveBeenCalledTimes(1));
    const args = getTargetsTimeline.mock.calls[0][0];

    expect(args).toEqual({
      startTime: expect.any(String),
      endTime: expect.any(String),
      targetIds: ['t1', 't2'],
    });

    const windowMs = new Date(args.endTime).getTime() - new Date(args.startTime).getTime();
    expect(windowMs).toBeGreaterThanOrEqual(60 * 60 * 1000);
    expect(windowMs).toBeLessThan(60 * 60 * 1000 + 5000);
  });

  it('renders one card per target with its rows on the Line chart', async () => {
    const t1Rows = [makeRow('t1', '10:00', 3), makeRow('t1', '10:05', 6)];
    renderCards({ targets }, t1Rows);

    expect(await screen.findByText('Target One')).toBeInTheDocument();
    expect(screen.getByText('Target Two')).toBeInTheDocument();

    // Only t1 has rows; t2 falls back to the empty placeholder.
    expect(screen.getAllByTestId('line-chart')).toHaveLength(1);
    expect(screen.getByText('No user connections statistic')).toBeInTheDocument();

    const t1Chart = captured.line.find((props) => props.data[0].targetId === 't1');
    expect(t1Chart.data).toEqual(t1Rows);
    expect(t1Chart.xField).toBe('time');
    expect(t1Chart.yField).toBe('records');
    expect(t1Chart.colorField).toBe('target');
    expect(t1Chart.height).toBe(200);
  });

  it('shows an empty state instead of a spinner when the targets list is empty', async () => {
    // With no targets there is nothing to request, so the component must not
    // wait on a request that never happens.
    const { getTargetsTimeline, container } = renderCards({ targets: [] });

    await act(async () => {});
    expect(getTargetsTimeline).not.toHaveBeenCalled();
    expect(container.querySelector('.ant-spin')).toBeFalsy();
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('shows an empty state when targets is undefined', async () => {
    const { getTargetsTimeline, container } = renderCards({ targets: undefined });

    await act(async () => {});
    expect(getTargetsTimeline).not.toHaveBeenCalled();
    expect(container.querySelector('.ant-spin')).toBeFalsy();
    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });

  it('surfaces a failed request and leaves the loading state', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const failure = new Error('network down');
    const getTargetsTimeline = vi.fn().mockRejectedValue(failure);
    const client = { usersConnectionsStatistic: { getTargetsTimeline } } as unknown as ApiClient;

    const { container } = render(
      <ApiClientProvider value={client}>
        <TargetsConnectionsStatisticCards targets={targets} />
      </ApiClientProvider>,
    );

    expect(await screen.findByText('Target One')).toBeInTheDocument();
    expect(container.querySelector('.ant-spin')).toBeFalsy();
    expect(consoleError).toHaveBeenCalledWith(failure);
    expect(message.error).toHaveBeenCalledWith('Targets connections statistic request failed');
  });

  it('clears the refresh interval on unmount', async () => {
    vi.useFakeTimers();
    const { getTargetsTimeline, unmount } = renderCards({ targets, updateInterval: 30_000 });

    expect(getTargetsTimeline).toHaveBeenCalledTimes(1);
    await act(async () => {});

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(getTargetsTimeline).toHaveBeenCalledTimes(2);

    unmount();
    // The interval is cleared, so nothing is left ticking after unmount.
    expect(vi.getTimerCount()).toBe(0);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(120_000);
    });
    expect(getTargetsTimeline).toHaveBeenCalledTimes(2);
  });
});
