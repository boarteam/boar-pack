import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestProviders } from '../../../test/testUtils';
import type { Token } from '../../tools/api-client';

// See UsersTable.test.tsx: the dist build of common-frontend cannot be loaded
// natively by Node, redirect the package to its sources.
vi.mock('@boarteam/boar-pack-common-frontend', () => import('../../../../common-frontend/src'));

const hoisted = vi.hoisted(() => ({
  access: { canManageMyTokens: true } as Record<string, boolean>,
}));

vi.mock('umi', () => ({
  useAccess: () => hoisted.access,
}));

import { MyTokensTable } from './MyTokensTable';

const tokens: Token[] = [
  {
    id: 't1',
    name: 'personal token',
    userId: 'me',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  } as Token,
];

function makeClient() {
  return {
    tokens: {
      getManyBaseMyTokensControllerToken: vi.fn().mockResolvedValue({
        data: tokens,
        count: tokens.length,
        total: tokens.length,
        page: 1,
        pageCount: 1,
      }),
      createOneBaseMyTokensControllerToken: vi.fn(),
      updateOneBaseMyTokensControllerToken: vi.fn(),
      deleteOneBaseMyTokensControllerToken: vi.fn(),
    },
  };
}

const renderTable = (client = makeClient()) => {
  render(
    <TestProviders client={client}>
      <MyTokensTable />
    </TestProviders>,
  );
  return client;
};

describe('MyTokensTable', () => {
  beforeEach(() => {
    hoisted.access = { canManageMyTokens: true };
  });

  it('renders the rows returned by the my-tokens service', async () => {
    const client = renderTable();

    expect(await screen.findByText('personal token')).toBeInTheDocument();
    expect(client.tokens.getManyBaseMyTokensControllerToken).toHaveBeenCalledTimes(1);
    const params = client.tokens.getManyBaseMyTokensControllerToken.mock.calls[0][0];
    expect(params.sort).toEqual(['name,ASC']);
    expect(params.fields).toEqual(['name,createdAt']);
  });

  it('does not show the secret modal initially', async () => {
    renderTable();

    await screen.findByText('personal token');
    expect(screen.queryByText('New Token Created')).not.toBeInTheDocument();
  });

  it('is view-only without canManageMyTokens', async () => {
    hoisted.access = { canManageMyTokens: false };
    renderTable();

    await screen.findByText('personal token');
    expect(screen.queryByRole('button', { name: /New/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
  });

  it('creates a token through the my-tokens service and reveals the secret once', async () => {
    const client = makeClient();
    client.tokens.createOneBaseMyTokensControllerToken.mockResolvedValue({
      id: 't-new',
      name: 'release token',
      userId: 'me',
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-02-01T00:00:00Z',
      value: 'super-secret-token-value',
    });
    renderTable(client);

    await screen.findByText('personal token');
    await userEvent.click(screen.getByRole('button', { name: /New/ }));

    // the new editable row renders a name input inside the table body
    const tbody = document.querySelector('.ant-table-tbody') as HTMLElement;
    const input = await within(tbody).findByRole('textbox');
    await userEvent.type(input, 'release token');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(client.tokens.createOneBaseMyTokensControllerToken).toHaveBeenCalledWith({
        requestBody: { name: 'release token' },
      });
    });

    // the one-time secret is revealed in a modal
    expect(await screen.findByText('New Token Created')).toBeInTheDocument();
    expect(
      screen.getByText('This token will only be shown once. Please copy it now.'),
    ).toBeInTheDocument();
    expect(screen.getByText('super-secret-token-value')).toBeInTheDocument();

    // the table reloads after the creation
    await waitFor(() => {
      expect(client.tokens.getManyBaseMyTokensControllerToken.mock.calls.length).toBeGreaterThan(1);
    });
  });
});
