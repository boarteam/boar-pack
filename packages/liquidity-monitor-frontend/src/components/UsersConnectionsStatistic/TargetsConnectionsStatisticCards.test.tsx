import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { TargetsConnectionsStatisticCards } from './TargetsConnectionsStatisticCards';
import { ApiClientProvider } from '../ApiClientContext';
import {
  ApiClient,
  UsersConnectionsStatisticDto,
} from '../../tools/api-client/generated';

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
  props: { targets?: { id: string; name: string }[] },
  rows: UsersConnectionsStatisticDto[] = [],
) {
  const getTargetsTimeline = vi.fn().mockResolvedValue(rows);
  const client = { usersConnectionsStatistic: { getTargetsTimeline } } as unknown as ApiClient;
  const utils = render(
    <ApiClientProvider value={client}>
      <TargetsConnectionsStatisticCards targets={props.targets} />
    </ApiClientProvider>,
  );
  return { ...utils, getTargetsTimeline };
}

beforeEach(() => {
  captured.line.length = 0;
});

afterEach(() => {
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

  it('does not request anything when the targets list is empty', async () => {
    // Current behavior: with no targets there is no request, so `data` never
    // resolves and the component stays on the loading spinner forever.
    const { getTargetsTimeline, container } = renderCards({ targets: [] });

    await act(async () => {});
    expect(getTargetsTimeline).not.toHaveBeenCalled();
    expect(container.querySelector('.ant-spin')).toBeTruthy();
  });

  it('does not request anything when targets is undefined', async () => {
    const { getTargetsTimeline, container } = renderCards({ targets: undefined });

    await act(async () => {});
    expect(getTargetsTimeline).not.toHaveBeenCalled();
    expect(container.querySelector('.ant-spin')).toBeTruthy();
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });
});
