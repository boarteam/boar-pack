import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestProviders } from '../../../test/testUtils';
import { EventLog } from '../../tools/api-client/generated';

// See UsersTable.test.tsx: the dist build of common-frontend cannot be loaded
// natively by Node, redirect the package to its sources.
vi.mock('@boarteam/boar-pack-common-frontend', () => import('../../../../common-frontend/src'));

import EventLogsTable from './EventLogsTable';

// Once the toolbar Select mounts, @ant-design/cssinjs (jsdom does not support
// `:where`) injects a stylesheet with a malformed selector, and every
// subsequent jsdom getComputedStyle call throws a SyntaxError while matching
// it. Fall back to an empty style declaration in that case.
const originalGetComputedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = ((elt: Element, pseudoElt?: string | null) => {
  try {
    return originalGetComputedStyle(elt, pseudoElt as any);
  } catch {
    return document.createElement('span').style;
  }
}) as typeof window.getComputedStyle;

function makeEventLog(overrides: Partial<EventLog> = {}): EventLog {
  return {
    id: 'log-1',
    logType: EventLog.logType.AUDIT,
    logLevel: EventLog.logLevel.INFO,
    action: 'getManyBase',
    method: 'GET',
    userId: 'u1',
    user: { id: 'u1', name: 'Alice' } as EventLog['user'],
    userRole: EventLog.userRole.ADMIN,
    userName: null,
    externalUserId: null,
    entity: 'EventLogsController',
    entityId: 'e-1',
    payload: null,
    url: '/api/event-logs?limit=10',
    ipAddress: '10.0.0.1',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    duration: 42,
    statusCode: 200,
    service: 'api-service',
    serviceId: 'srv-1',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
    ...overrides,
  };
}

const logs = [
  makeEventLog(),
  makeEventLog({
    id: 'log-2',
    logLevel: EventLog.logLevel.ERROR,
    action: 'createOneBase',
    entity: 'UsersController',
    user: { id: 'u2', name: 'Bob' } as EventLog['user'],
    userRole: EventLog.userRole.USER,
  }),
];

function makeClient() {
  return {
    eventLogs: {
      getManyBaseEventLogsControllerEventLog: vi.fn().mockResolvedValue({
        data: logs,
        count: logs.length,
        total: logs.length,
        page: 1,
        pageCount: 1,
      }),
      getServiceNames: vi.fn().mockResolvedValue(['api-service']),
    },
    users: {
      getManyBaseUsersControllerUser: vi.fn().mockResolvedValue({
        data: [{ id: 'u1', name: 'Alice' }],
        count: 1,
        total: 1,
        page: 1,
        pageCount: 1,
      }),
    },
  };
}

const renderTable = (
  props: Partial<React.ComponentProps<typeof EventLogsTable>> = {},
  client = makeClient(),
) => {
  const onDateRangeChange = vi.fn();
  render(
    <TestProviders client={client}>
      <EventLogsTable onDateRangeChange={onDateRangeChange} {...props} />
    </TestProviders>
  );
  return { client, onDateRangeChange };
};

describe('EventLogsTable', () => {
  it('renders rows from the event logs service with humanized cells', async () => {
    renderTable();

    // entity render: EventLogsController -> Event Logs
    expect(await screen.findByText('Event Logs')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    // action render: getManyBase -> Get Many
    expect(screen.getByText('Get Many')).toBeInTheDocument();
    expect(screen.getByText('Create One')).toBeInTheDocument();
    // joined user names
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    // log levels
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('requests the logs joined with the user and sorted by createdAt DESC', async () => {
    const { client } = renderTable();

    await screen.findByText('Event Logs');
    const getMany = client.eventLogs.getManyBaseEventLogsControllerEventLog;
    expect(getMany).toHaveBeenCalledTimes(1);
    const params = getMany.mock.calls[0][0];
    expect(params.sort).toEqual(['createdAt,DESC']);
    expect(params.join).toEqual(['user||id,name']);
    expect(JSON.parse(params.s)).toEqual({ $and: [] });
  });

  it('filters by the createdAt range when startTime and endTime are set', async () => {
    const { client } = renderTable({
      startTime: '2026-01-01T00:00:00Z',
      endTime: '2026-01-31T00:00:00Z',
    });

    await screen.findByText('Event Logs');
    const params =
      client.eventLogs.getManyBaseEventLogsControllerEventLog.mock.calls[0][0];
    expect(JSON.parse(params.s)).toEqual({
      $and: [
        {
          createdAt: {
            $between: ['2026-01-01T00:00:00Z', '2026-01-31T00:00:00Z'],
          },
        },
      ],
    });
  });

  it('loads the users and service names for the column filters', async () => {
    const { client } = renderTable();

    await screen.findByText('Event Logs');
    expect(client.users.getManyBaseUsersControllerUser).toHaveBeenCalledWith({
      sort: ['name,ASC'],
    });
    expect(client.eventLogs.getServiceNames).toHaveBeenCalled();
  });

  it('offers the predefined columns sets in the toolbar select', async () => {
    renderTable();

    await screen.findByText('Event Logs');
    // the first set is preselected
    expect(screen.getByText('Audit')).toBeInTheDocument();
  });

  it('expands a row into the event log explanation', async () => {
    renderTable();

    await screen.findByText('Event Logs');
    const expandButtons = document.querySelectorAll('.ant-table-row-expand-icon');
    expect(expandButtons.length).toBeGreaterThan(0);
    await userEvent.click(expandButtons[0] as HTMLElement);

    expect(await screen.findByText('Audit Log')).toBeInTheDocument();
    expect(screen.getByText(/captured at/)).toBeInTheDocument();
  });
});
