import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestProviders } from '../../../test/testUtils';
import type { Token } from '../../tools/api-client';

// See UsersTable.test.tsx: the dist build of common-frontend cannot be loaded
// natively by Node, redirect the package to its sources.
vi.mock('@boarteam/boar-pack-common-frontend', () => import('../../../../common-frontend/src'));

const hoisted = vi.hoisted(() => ({
  access: { canManageTokens: true } as Record<string, boolean>,
}));

vi.mock('umi', () => ({
  useAccess: () => hoisted.access,
}));

import { TokensTable } from './TokensTable';

const tokens: Token[] = [
  {
    id: 't1',
    name: 'deploy token',
    userId: 'user-7',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  } as Token,
  {
    id: 't2',
    name: 'ci token',
    userId: 'user-7',
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  } as Token,
];

function makeClient() {
  return {
    tokens: {
      getManyBaseTokensControllerToken: vi.fn().mockResolvedValue({
        data: tokens,
        count: tokens.length,
        total: tokens.length,
        page: 1,
        pageCount: 1,
      }),
      updateOneBaseTokensControllerToken: vi.fn(),
      deleteOneBaseTokensControllerToken: vi.fn(),
    },
  };
}

const renderTable = (client = makeClient()) => {
  render(
    <TestProviders client={client}>
      <TokensTable userId="user-7" />
    </TestProviders>
  );
  return client;
};

describe('TokensTable', () => {
  beforeEach(() => {
    hoisted.access = { canManageTokens: true };
  });

  it('renders the rows returned by the tokens service', async () => {
    renderTable();

    expect(await screen.findByText('deploy token')).toBeInTheDocument();
    expect(screen.getByText('ci token')).toBeInTheDocument();
  });

  it('scopes the query to the given user and sorts by name', async () => {
    const client = renderTable();

    await screen.findByText('deploy token');
    expect(client.tokens.getManyBaseTokensControllerToken).toHaveBeenCalledTimes(1);
    const params = client.tokens.getManyBaseTokensControllerToken.mock.calls[0][0];
    expect(params.sort).toEqual(['name,ASC']);
    expect(JSON.parse(params.s)).toEqual({
      $and: [{ userId: { $eq: 'user-7' } }],
    });
    expect(params.fields).toEqual(['name']);
  });

  it('shows the edit action when the user can manage tokens', async () => {
    renderTable();

    await screen.findByText('deploy token');
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getAllByLabelText('edit')).toHaveLength(tokens.length);
  });

  it('is view-only without canManageTokens', async () => {
    hoisted.access = { canManageTokens: false };
    renderTable();

    await screen.findByText('deploy token');
    expect(screen.queryByRole('button', { name: /New/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
    expect(screen.queryAllByLabelText('edit')).toHaveLength(0);
  });
});
