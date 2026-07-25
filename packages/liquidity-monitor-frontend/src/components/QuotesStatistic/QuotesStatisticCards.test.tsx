import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { QuotesStatisticCards } from './QuotesStatisticCards';
import { ApiClientProvider } from '../ApiClientContext';
import type { ApiClient, QuotesStatisticDto } from '../../tools/api-client/generated';

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

// NOTE: the component groups the fetched rows by `providerName` but looks the
// groups up by `provider.id`, so rows only attach to a card when the DTO's
// providerName field carries the provider id.
const makeRow = (providerName: string, time: string, records: number): QuotesStatisticDto => ({
  time,
  records,
  providerName,
  startTime: `2026-07-25T09:00:00.000Z`,
  endTime: `2026-07-25T10:00:00.000Z`,
});

const providers = [
  { id: 'p1', name: 'Provider One', enabled: true },
  { id: 'p2', name: 'Provider Two', enabled: false },
];

function renderCards(
  ui: { providers?: any; updateInterval?: number },
  rows: QuotesStatisticDto[] | Promise<QuotesStatisticDto[]> = [],
) {
  const getTimeline = vi.fn().mockReturnValue(Promise.resolve(rows));
  const client = { quotesStatistics: { getTimeline } } as unknown as ApiClient;
  const utils = render(
    <ApiClientProvider value={client}>
      <QuotesStatisticCards providers={ui.providers} updateInterval={ui.updateInterval} />
    </ApiClientProvider>,
  );
  return { ...utils, getTimeline };
}

beforeEach(() => {
  captured.line.length = 0;
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('QuotesStatisticCards', () => {
  it('renders one card per provider with its name and enabled/disabled tag', async () => {
    renderCards({ providers }, [makeRow('p1', '10:00', 5), makeRow('p2', '10:00', 2)]);

    expect(await screen.findByText('Provider One')).toBeInTheDocument();
    expect(screen.getByText('Provider Two')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
    expect(screen.getAllByTestId('line-chart')).toHaveLength(2);
  });

  it('requests the last-hour timeline window with the browser timezone', async () => {
    const { getTimeline } = renderCards({ providers });

    await waitFor(() => expect(getTimeline).toHaveBeenCalledTimes(1));
    const args = getTimeline.mock.calls[0][0];

    expect(args).toEqual({
      startTime: expect.any(String),
      endTime: expect.any(String),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    const start = new Date(args.startTime).getTime();
    const end = new Date(args.endTime).getTime();
    expect(Number.isNaN(start)).toBe(false);
    expect(Number.isNaN(end)).toBe(false);
    // Window is one hour, allowing for the few ms between the two Date() calls.
    expect(end - start).toBeGreaterThanOrEqual(60 * 60 * 1000);
    expect(end - start).toBeLessThan(60 * 60 * 1000 + 5000);
    // endTime is "now".
    expect(Math.abs(Date.now() - end)).toBeLessThan(5000);
  });

  it('passes each provider its own timeline rows to the Line chart', async () => {
    const p1Rows = [makeRow('p1', '10:00', 5), makeRow('p1', '10:05', 7)];
    const p2Rows = [makeRow('p2', '10:00', 1)];
    renderCards({ providers }, [...p1Rows, ...p2Rows]);

    await screen.findAllByTestId('line-chart');

    const p1Chart = captured.line.find((props) => props.data[0].providerName === 'p1');
    const p2Chart = captured.line.find((props) => props.data[0].providerName === 'p2');

    expect(p1Chart).toBeDefined();
    expect(p1Chart.data).toEqual(p1Rows);
    expect(p1Chart.xField).toBe('time');
    expect(p1Chart.yField).toBe('records');
    expect(p1Chart.height).toBe(150);

    expect(p2Chart).toBeDefined();
    expect(p2Chart.data).toEqual(p2Rows);

    // Enabled and disabled providers get different line colors.
    expect(typeof p1Chart.line.style.stroke).toBe('string');
    expect(typeof p2Chart.line.style.stroke).toBe('string');
    expect(p1Chart.line.style.stroke).not.toBe(p2Chart.line.style.stroke);
    expect(p1Chart.area.style.fill).not.toBe(p2Chart.area.style.fill);
  });

  it('shows an empty placeholder for providers without rows', async () => {
    renderCards({ providers }, [makeRow('p1', '10:00', 5)]);

    await screen.findByText('Provider Two');
    expect(screen.getAllByTestId('line-chart')).toHaveLength(1);
    expect(screen.getByText('No quotes statistic')).toBeInTheDocument();
  });

  it('refetches the shifted window when updateInterval elapses and stops after unmount', async () => {
    vi.useFakeTimers();
    const { getTimeline, unmount } = renderCards({ providers, updateInterval: 30_000 });

    // Initial fetch happens on mount.
    expect(getTimeline).toHaveBeenCalledTimes(1);
    await act(async () => {}); // flush the resolved promise

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });

    expect(getTimeline).toHaveBeenCalledTimes(2);

    const first = getTimeline.mock.calls[0][0];
    const second = getTimeline.mock.calls[1][0];
    // The window shifted forward by exactly the update interval (fake timers).
    expect(new Date(second.endTime).getTime() - new Date(first.endTime).getTime()).toBe(30_000);
    // And is still one hour wide.
    expect(new Date(second.endTime).getTime() - new Date(second.startTime).getTime()).toBe(
      60 * 60 * 1000,
    );

    unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(120_000);
    });
    // The interval is cleared on unmount, so no further requests.
    expect(getTimeline).toHaveBeenCalledTimes(2);
  });

  it('does not schedule refetches without updateInterval', async () => {
    vi.useFakeTimers();
    const { getTimeline } = renderCards({ providers });

    expect(getTimeline).toHaveBeenCalledTimes(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600_000);
    });
    expect(getTimeline).toHaveBeenCalledTimes(1);
  });

  it('shows an error result when the request fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const failure = new Error('network down');
    const getTimeline = vi.fn().mockRejectedValue(failure);
    const client = { quotesStatistics: { getTimeline } } as unknown as ApiClient;

    render(
      <ApiClientProvider value={client}>
        <QuotesStatisticCards providers={providers} />
      </ApiClientProvider>,
    );

    expect(await screen.findByText('Quotes statistic request failed')).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(failure);
    expect(consoleError).toHaveBeenCalledWith('Quotes statistic request failed');
    expect(screen.queryByText('Provider One')).not.toBeInTheDocument();
  });

  it('renders the error result when providers is null', async () => {
    renderCards({ providers: null }, [makeRow('p1', '10:00', 5)]);

    expect(await screen.findByText('Quotes statistic request failed')).toBeInTheDocument();
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });

  it('stays in the loading state while providers is undefined', async () => {
    const { container } = renderCards({ providers: undefined }, [makeRow('p1', '10:00', 5)]);

    // Let the timeline request resolve; the component still waits for providers.
    await act(async () => {});
    expect(container.querySelector('.ant-spin')).toBeTruthy();
    expect(screen.queryByText('Quotes statistic request failed')).not.toBeInTheDocument();
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });
});
