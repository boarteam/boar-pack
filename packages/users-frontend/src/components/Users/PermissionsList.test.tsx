import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestProviders } from '../../../test/testUtils';
import { PermissionsConfig, PermissionsList } from './PermissionsList';
import { User } from '../../tools/api-client/generated';

const hoisted = vi.hoisted(() => ({
  access: { canManageAll: true } as Record<string, boolean>,
}));

vi.mock('umi', () => ({
  useAccess: () => hoisted.access,
}));

const permissionsConfig: PermissionsConfig = [
  {
    key: 'docs.read',
    title: 'Read docs',
  },
  {
    title: 'Trading',
    permissions: [
      { key: 'trading.view', title: 'View trading' },
      { key: 'trading.manage', title: 'Manage trading' },
    ],
  },
];

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    name: 'Alice',
    email: 'alice@example.com',
    role: User.role.USER,
    pass: null,
    permissions: ['docs.read'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    deletedAt: null,
    policies: [],
    experimentalFeatures: [],
    ...overrides,
  };
}

function makeClient() {
  return {
    users: {
      updateOneBaseUsersControllerUser: vi.fn(),
    },
  };
}

const renderList = (user: User, client = makeClient()) => {
  render(
    <TestProviders client={client}>
      <PermissionsList user={user} permissionsConfig={permissionsConfig} />
    </TestProviders>
  );
  return client;
};

describe('PermissionsList', () => {
  beforeEach(() => {
    hoisted.access = { canManageAll: true };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a titled card with every configured permission and group', () => {
    renderList(makeUser());

    expect(screen.getByText('Permissions for Alice')).toBeInTheDocument();
    expect(screen.getByText('Read docs')).toBeInTheDocument();
    // group header and its children (children rows are expanded by default)
    expect(screen.getByText('Trading')).toBeInTheDocument();
    expect(screen.getByText('View trading')).toBeInTheDocument();
    expect(screen.getByText('Manage trading')).toBeInTheDocument();
  });

  it('checks only the switches for permissions the user has', () => {
    renderList(makeUser({ permissions: ['docs.read'] }));

    const switches = screen.getAllByRole('switch');
    // one switch per leaf permission; group row itself has no switch
    expect(switches).toHaveLength(3);
    // rows render in config order: docs.read, then group children
    expect(switches[0]).toBeChecked();
    expect(switches[1]).not.toBeChecked();
    expect(switches[2]).not.toBeChecked();
    switches.forEach(s => expect(s).toBeEnabled());
  });

  it('does not show the admin alert for a plain user', () => {
    renderList(makeUser());
    expect(
      screen.queryByText(/Admin can perform any action/)
    ).not.toBeInTheDocument();
  });

  it('grants a permission through the api and keeps the server answer', async () => {
    const user = makeUser({ permissions: ['docs.read'] });
    const client = makeClient();
    client.users.updateOneBaseUsersControllerUser.mockResolvedValue(
      makeUser({ permissions: ['docs.read', 'trading.view'] })
    );
    renderList(user, client);

    await userEvent.click(screen.getAllByRole('switch')[1]);

    expect(client.users.updateOneBaseUsersControllerUser).toHaveBeenCalledWith({
      id: 'user-1',
      requestBody: {
        permissions: ['docs.read', 'trading.view'],
      },
    });
    await waitFor(() => {
      expect(screen.getAllByRole('switch')[1]).toBeChecked();
    });
    expect(screen.getAllByRole('switch')[0]).toBeChecked();
    expect(screen.getAllByRole('switch')[2]).not.toBeChecked();
  });

  it('revokes a granted permission through the api', async () => {
    const client = makeClient();
    client.users.updateOneBaseUsersControllerUser.mockResolvedValue(
      makeUser({ permissions: [] })
    );
    renderList(makeUser({ permissions: ['docs.read'] }), client);

    await userEvent.click(screen.getAllByRole('switch')[0]);

    expect(client.users.updateOneBaseUsersControllerUser).toHaveBeenCalledWith({
      id: 'user-1',
      requestBody: {
        permissions: [],
      },
    });
    await waitFor(() => {
      expect(screen.getAllByRole('switch')[0]).not.toBeChecked();
    });
  });

  it('rolls the switch back when the update fails', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const client = makeClient();
    client.users.updateOneBaseUsersControllerUser.mockRejectedValue(
      new Error('update failed')
    );
    renderList(makeUser({ permissions: [] }), client);

    await userEvent.click(screen.getAllByRole('switch')[0]);

    await waitFor(() => {
      expect(screen.getAllByRole('switch')[0]).not.toBeChecked();
    });
    expect(consoleError).toHaveBeenCalled();
  });

  describe('for an admin user', () => {
    it('shows the admin alert, checks and disables every switch', () => {
      renderList(makeUser({ role: User.role.ADMIN, permissions: [] }));

      expect(
        screen.getByText(
          'Admin can perform any action, in order to change permissions, change user role.'
        )
      ).toBeInTheDocument();
      const switches = screen.getAllByRole('switch');
      switches.forEach(s => {
        expect(s).toBeChecked();
        expect(s).toBeDisabled();
      });
    });
  });

  describe('without canManageAll access', () => {
    it('disables the switches but still shows the granted state', () => {
      hoisted.access = { canManageAll: false };
      renderList(makeUser({ permissions: ['trading.view'] }));

      const switches = screen.getAllByRole('switch');
      switches.forEach(s => expect(s).toBeDisabled());
      expect(switches[0]).not.toBeChecked();
      expect(switches[1]).toBeChecked();
    });
  });
});
