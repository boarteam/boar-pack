import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UsersConnectionsStatisticCards } from './UsersConnectionsStatisticCards';
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
  userId: string,
  target: UsersConnectionsStatisticDto.target,
  time: string,
  records: number,
): UsersConnectionsStatisticDto => ({
  time,
  records,
  userId,
  targetId: `${target}-id`,
  target,
  startTime: '2026-07-25T09:00:00.000Z',
  endTime: '2026-07-25T10:00:00.000Z',
});

const users = [
  { id: 'u1', name: 'Alice' },
  { id: 'u2', name: 'Bob' },
];

function renderCards(rows: UsersConnectionsStatisticDto[], updateInterval?: number) {
  const getTimeline = vi.fn().mockResolvedValue(rows);
  const client = { usersConnectionsStatistic: { getTimeline } } as unknown as ApiClient;
  const utils = render(
    <MemoryRouter>
      <ApiClientProvider value={client}>
        <UsersConnectionsStatisticCards users={users} updateInterval={updateInterval} />
      </ApiClientProvider>
    </MemoryRouter>,
  );
  return { ...utils, getTimeline };
}

beforeEach(() => {
  captured.line.length = 0;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('UsersConnectionsStatisticCards', () => {
  it('renders one card per user with the name linking to the admin user page', async () => {
    renderCards([
      makeRow('u1', UsersConnectionsStatisticDto.target.FIX_SERVER, '10:00', 3),
    ]);

    const aliceLink = await screen.findByRole('link', { name: 'Alice' });
    const bobLink = screen.getByRole('link', { name: 'Bob' });
    expect(aliceLink).toHaveAttribute('href', '/admin/users/u1');
    expect(bobLink).toHaveAttribute('href', '/admin/users/u2');
  });

  it('fetches the last-hour window through usersConnectionsStatistic.getTimeline', async () => {
    const { getTimeline } = renderCards([]);

    await waitFor(() => expect(getTimeline).toHaveBeenCalledTimes(1));
    const args = getTimeline.mock.calls[0][0];
    expect(args).toEqual({
      startTime: expect.any(String),
      endTime: expect.any(String),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    const windowMs = new Date(args.endTime).getTime() - new Date(args.startTime).getTime();
    expect(windowMs).toBeGreaterThanOrEqual(60 * 60 * 1000);
    expect(windowMs).toBeLessThan(60 * 60 * 1000 + 5000);
  });

  it('passes each user their own rows and colors series by target', async () => {
    const u1Rows = [
      makeRow('u1', UsersConnectionsStatisticDto.target.FIX_SERVER, '10:00', 3),
      makeRow('u1', UsersConnectionsStatisticDto.target.WEBSOCKET_SERVER, '10:00', 8),
      makeRow('u1', UsersConnectionsStatisticDto.target.FIX_SERVER, '10:05', 4),
    ];
    const u2Rows = [
      makeRow('u2', UsersConnectionsStatisticDto.target.TOKEN, '10:00', 1),
    ];
    renderCards([...u1Rows, ...u2Rows]);

    await screen.findAllByTestId('line-chart');
    expect(screen.getAllByTestId('line-chart')).toHaveLength(2);

    const u1Chart = captured.line.find((props) => props.data[0].userId === 'u1');
    const u2Chart = captured.line.find((props) => props.data[0].userId === 'u2');

    // Rows are grouped by userId and handed to the chart untouched.
    expect(u1Chart.data).toEqual(u1Rows);
    expect(u2Chart.data).toEqual(u2Rows);

    // The series split/coloring key is the connection target.
    expect(u1Chart.colorField).toBe('target');
    expect(u1Chart.xField).toBe('time');
    expect(u1Chart.yField).toBe('records');
    expect(u1Chart.height).toBe(200);
    expect(u1Chart.legend).toEqual({ size: false, color: { itemMarker: 'rect' } });
  });

  it('shows an empty placeholder for users without connection rows', async () => {
    renderCards([
      makeRow('u1', UsersConnectionsStatisticDto.target.ACCOUNT, '10:00', 2),
    ]);

    await screen.findByRole('link', { name: 'Bob' });
    expect(screen.getAllByTestId('line-chart')).toHaveLength(1);
    expect(screen.getByText('No user connections statistic')).toBeInTheDocument();
  });

  it('stays in the loading state until the timeline request resolves', async () => {
    let resolveRequest!: (rows: UsersConnectionsStatisticDto[]) => void;
    const getTimeline = vi.fn().mockReturnValue(
      new Promise<UsersConnectionsStatisticDto[]>((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const client = { usersConnectionsStatistic: { getTimeline } } as unknown as ApiClient;

    const { container } = render(
      <MemoryRouter>
        <ApiClientProvider value={client}>
          <UsersConnectionsStatisticCards users={users} />
        </ApiClientProvider>
      </MemoryRouter>,
    );

    expect(container.querySelector('.ant-spin')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Alice' })).not.toBeInTheDocument();

    resolveRequest([]);
    expect(await screen.findByRole('link', { name: 'Alice' })).toBeInTheDocument();
  });
});
