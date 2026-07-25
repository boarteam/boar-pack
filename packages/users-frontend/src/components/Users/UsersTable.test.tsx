import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { messageById, TestProviders } from '../../../test/testUtils';
import { User } from '../../tools/api-client/generated';

// The published dist of common-frontend deep-requires antd/es/form/Form, which
// Node cannot load natively (require(esm) with directory imports); redirect the
// package to its sources so vite processes the whole chain.
vi.mock('@boarteam/boar-pack-common-frontend', () => import('../../../../common-frontend/src'));

const hoisted = vi.hoisted(() => ({
  access: { canManageAll: true } as Record<string, boolean>,
  initialState: { currentUser: { id: 'u1' } } as Record<string, any>,
}));

vi.mock('umi', () => ({
  useAccess: () => hoisted.access,
  useModel: () => ({ initialState: hoisted.initialState }),
}));

vi.mock('@umijs/max', async () => {
  const routerDom: any = await vi.importActual('react-router-dom');
  return {
    Link: routerDom.Link,
    useIntl: () => ({
      formatMessage: ({ id }: { id: string }) => messageById(id),
    }),
  };
});

import { UsersTable } from './UsersTable';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    name: 'Alice',
    email: 'alice@example.com',
    role: User.role.ADMIN,
    pass: null,
    permissions: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    deletedAt: null,
    policies: [],
    experimentalFeatures: [],
    ...overrides,
  };
}

const users = [
  makeUser(),
  makeUser({ id: 'u2', name: 'Bob', email: 'bob@example.com', role: User.role.USER }),
];

function makeClient() {
  return {
    users: {
      getManyBaseUsersControllerUser: vi.fn().mockResolvedValue({
        data: users,
        count: users.length,
        total: users.length,
        page: 1,
        pageCount: 1,
      }),
      createOneBaseUsersControllerUser: vi.fn(),
      updateOneBaseUsersControllerUser: vi.fn(),
      deleteOneBaseUsersControllerUser: vi.fn(),
    },
    authentication: {
      loginAsUser: vi.fn(),
    },
  };
}

const renderTable = (
  props: Partial<React.ComponentProps<typeof UsersTable>> = {},
  client = makeClient(),
) => {
  render(
    <TestProviders client={client}>
      <UsersTable {...props} />
    </TestProviders>,
  );
  return client;
};

describe('UsersTable', () => {
  beforeEach(() => {
    hoisted.access = { canManageAll: true };
    hoisted.initialState = { currentUser: { id: 'u1' } };
  });

  it('renders the rows returned by the users service', async () => {
    renderTable();

    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    // role valueEnum renders the localized labels
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('appends permissions to the requested fields', async () => {
    const client = renderTable();

    await screen.findByText('Alice');
    expect(client.users.getManyBaseUsersControllerUser).toHaveBeenCalledTimes(1);
    const params = client.users.getManyBaseUsersControllerUser.mock.calls[0][0];
    expect(params.fields).toEqual(['name,email,pass,role,permissions']);
  });

  it('queries the first page with the default sort', async () => {
    const client = renderTable();

    await screen.findByText('Alice');
    const params = client.users.getManyBaseUsersControllerUser.mock.calls[0][0];
    expect(params.page).toBe(1);
    expect(params.sort).toEqual(['createdAt,DESC']);
    expect(JSON.parse(params.s)).toEqual({ $and: [] });
  });

  it('shows the New button for a user with canManageAll', async () => {
    renderTable();

    await screen.findByText('Alice');
    expect(screen.getByRole('button', { name: /New/ })).toBeInTheDocument();
  });

  it('is view-only without canManageAll: no New button and no actions column', async () => {
    hoisted.access = { canManageAll: false };
    renderTable();

    await screen.findByText('Alice');
    expect(screen.queryByRole('button', { name: /New/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
  });

  it('links user names to the default /admin/users prefix', async () => {
    renderTable();

    const link = await screen.findByRole('link', { name: 'Alice' });
    expect(link).toHaveAttribute('href', '/admin/users/u1');
    expect(screen.getByRole('link', { name: 'Bob' })).toHaveAttribute('href', '/admin/users/u2');
  });

  it('links user names with a custom userPageUrlPrefix', async () => {
    renderTable({ userPageUrlPrefix: '/crm/users' });

    const link = await screen.findByRole('link', { name: 'Alice' });
    expect(link).toHaveAttribute('href', '/crm/users/u1');
  });

  it('renders plain names when userPageUrlPrefix is null', async () => {
    renderTable({ userPageUrlPrefix: null });

    await screen.findByText('Alice');
    expect(screen.queryByRole('link', { name: 'Alice' })).not.toBeInTheDocument();
  });

  it('expands a row into the default PermissionsList', async () => {
    renderTable({
      permissionsConfig: [{ key: 'docs.read', title: 'Read docs' }],
    });

    await screen.findByText('Alice');
    const expandButtons = document.querySelectorAll('.ant-table-row-expand-icon');
    expect(expandButtons.length).toBeGreaterThan(0);
    await userEvent.click(expandButtons[0] as HTMLElement);

    expect(await screen.findByText('Permissions for Alice')).toBeInTheDocument();
    expect(screen.getByText('Read docs')).toBeInTheDocument();
  });

  it('uses renderPermissions for expanded rows when provided', async () => {
    const renderPermissions = vi.fn((user: User) => <div>custom permissions for {user.name}</div>);
    renderTable({ renderPermissions });

    await screen.findByText('Alice');
    await userEvent.click(
      document.querySelectorAll('.ant-table-row-expand-icon')[0] as HTMLElement,
    );

    expect(await screen.findByText('custom permissions for Alice')).toBeInTheDocument();
    expect(renderPermissions).toHaveBeenCalled();
    expect(renderPermissions.mock.calls[0][0]).toMatchObject({ name: 'Alice' });
  });

  it('logs in as another user through the actions column', async () => {
    const client = makeClient();
    client.authentication.loginAsUser.mockReturnValue(new Promise(() => {}));
    renderTable({}, client);

    await screen.findByText('Alice');
    const bobRow = screen.getByText('Bob').closest('tr') as HTMLElement;

    // the "Login as user" action renders the antd user icon inside an anchor
    const userIcon = within(bobRow).getByLabelText('user');
    await userEvent.click(userIcon.closest('a') as HTMLElement);

    await waitFor(() => {
      expect(client.authentication.loginAsUser).toHaveBeenCalledWith({
        userId: 'u2',
      });
    });
  });
});
