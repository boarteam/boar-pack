import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SearchSelect } from './SearchSelect';

type Item = { id: number; name: string };

const items: Item[] = [
  { id: 1, name: 'Alpha' },
  { id: 2, name: 'Beta' },
];

describe('SearchSelect', () => {
  it('fetches items on mount with the base filter and renders the options', async () => {
    const fetchItems = vi.fn().mockResolvedValue({ data: items });
    render(
      <SearchSelect<Item> selectedKeys={[]} setSelectedKeys={vi.fn()} fetchItems={fetchItems} />,
    );

    expect(fetchItems).toHaveBeenCalledWith([], 7, '');

    expect(await screen.findByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('refetches with a $contL keyword filter when the user types', async () => {
    const fetchItems = vi.fn().mockResolvedValue({ data: items });
    render(
      <SearchSelect<Item>
        selectedKeys={[]}
        setSelectedKeys={vi.fn()}
        filter={['type||$eq||demo']}
        limit={5}
        fetchItems={fetchItems}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('Search in filters'), {
      target: { value: 'Al' },
    });

    await waitFor(() =>
      expect(fetchItems).toHaveBeenCalledWith(['type||$eq||demo', 'name||$contL||Al'], 5, 'Al'),
    );
  });

  it('respects custom fieldNames for both filtering and labels', async () => {
    const fetchItems = vi.fn().mockResolvedValue({ data: [{ code: 'a1', title: 'First' }] });
    render(
      <SearchSelect<{ code: string; title: string }>
        selectedKeys={[]}
        setSelectedKeys={vi.fn()}
        fetchItems={fetchItems}
        fieldNames={{ value: 'code', label: 'title' }}
      />,
    );

    expect(await screen.findByText('First')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Search in filters'), {
      target: { value: 'Fi' },
    });

    await waitFor(() => expect(fetchItems).toHaveBeenCalledWith(['title||$contL||Fi'], 7, 'Fi'));
  });

  it('adds the clicked option key to the selection', async () => {
    const user = userEvent.setup();
    const setSelectedKeys = vi.fn();
    const fetchItems = vi.fn().mockResolvedValue({ data: items });
    render(
      <SearchSelect<Item>
        selectedKeys={['2']}
        setSelectedKeys={setSelectedKeys}
        fetchItems={fetchItems}
      />,
    );

    await user.click(await screen.findByText('Alpha'));

    expect(setSelectedKeys).toHaveBeenCalledWith(['2', '1']);
  });

  it('removes an already selected key when its option is clicked again', async () => {
    const user = userEvent.setup();
    const setSelectedKeys = vi.fn();
    const fetchItems = vi.fn().mockResolvedValue({ data: items });
    render(
      <SearchSelect<Item>
        selectedKeys={['1', '2']}
        setSelectedKeys={setSelectedKeys}
        fetchItems={fetchItems}
      />,
    );

    await user.click(await screen.findByText('Alpha'));

    expect(setSelectedKeys).toHaveBeenCalledWith(['2']);
  });

  it('shows an empty state when no items are found', async () => {
    const fetchItems = vi.fn().mockResolvedValue({ data: [] });
    render(
      <SearchSelect<Item> selectedKeys={[]} setSelectedKeys={vi.fn()} fetchItems={fetchItems} />,
    );

    expect(await screen.findByText('Not Found')).toBeInTheDocument();
  });
});
