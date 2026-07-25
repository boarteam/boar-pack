import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from 'antd';
import enUS from 'antd/es/locale/en_US';
import { ProColumns } from '@ant-design/pro-components';
import Table from './Table';
import { Operators } from './tableTools';
import { TSearchableColumn } from './tableTypes';

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

const messages = {
  'table.newButton': 'New',
  'table.saveText': 'Save',
  'table.cancelText': 'Cancel',
  'table.deleteText': 'Delete',
  'table.deletePopconfirmMessage': 'Delete this row?',
  'table.onlyAddOneLineAlertMessage': 'Only one line can be added at a time',
  'tables.columnsSetSelect.hint.title': 'Columns sets',
  'tables.columnsSetSelect.hint.message': 'Use {gearIcon} to configure',
};

const alice: User = { id: '1', name: 'Alice', email: 'alice@example.com', createdAt: '2026-01-01' };
const bob: User = { id: '2', name: 'Bob', email: 'bob@example.com', createdAt: '2026-01-02' };

const baseColumns: ProColumns<User>[] = [
  { title: 'Name', dataIndex: 'name' },
  { title: 'Email', dataIndex: 'email' },
];

// Editable ProTable rows only render save/delete/cancel inside a valueType: 'option'
// column, mirroring how UsersTable wires editing up in the real apps.
const columnsWithActions: ProColumns<User>[] = [
  ...baseColumns,
  {
    title: 'Actions',
    valueType: 'option',
    render: (_dom, record, _index, action) => [
      <a key="edit" onClick={() => action?.startEditable?.(record.id)}>
        Edit
      </a>,
    ],
  },
];

const searchableColumns: TSearchableColumn[] = [
  { field: 'name', operator: Operators.containsLow },
  { field: 'email', operator: Operators.containsLow },
];

// ConfigProvider pins antd (and pro-components) to the English locale the way the
// host apps do; without it ProTable falls back to zh-CN texts.
const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <MemoryRouter>
      <ConfigProvider locale={enUS}>
        <IntlProvider locale="en" messages={messages}>
          {ui}
        </IntlProvider>
      </ConfigProvider>
    </MemoryRouter>,
  );

describe('Table (viewOnly)', () => {
  it('renders fetched rows, hides the New button and sends crud-request params', async () => {
    const getAll = vi.fn().mockResolvedValue({ data: [alice, bob] });

    renderWithProviders(
      <Table<User>
        getAll={getAll}
        pathParams={{}}
        columns={baseColumns}
        searchableColumns={searchableColumns}
        viewOnly
      />,
    );

    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();

    expect(screen.queryByText('New')).not.toBeInTheDocument();

    expect(getAll).toHaveBeenCalled();
    expect(getAll.mock.calls[0][0]).toEqual({
      page: 1,
      limit: 20,
      sort: ['createdAt,DESC'],
      s: JSON.stringify({ $and: [] }),
      join: [],
      fields: ['name,email'],
    });
  });

  it('passes the params prop through as a crud search condition', async () => {
    const getAll = vi.fn().mockResolvedValue({ data: [alice] });

    renderWithProviders(
      <Table<User>
        getAll={getAll}
        pathParams={{}}
        columns={baseColumns}
        searchableColumns={searchableColumns}
        params={{ name: 'ali' }}
        viewOnly
      />,
    );

    await waitFor(() => expect(getAll).toHaveBeenCalled());
    expect(JSON.parse(getAll.mock.calls[0][0].s)).toEqual({
      $and: [{ name: { $contL: 'ali' } }],
    });
  });

  it('requests the next page when pagination changes', async () => {
    const rows: User[] = Array.from({ length: 5 }, (_, i) => ({
      id: String(i + 1),
      name: `Row ${i + 1}`,
      email: `row${i + 1}@example.com`,
      createdAt: '2026-01-01',
    }));
    // Server-side pagination: return one page at a time plus the total count,
    // the shape the nestjsx-crud backends respond with.
    const getAll = vi.fn(async (params: { page: number; limit: number }) => ({
      data: rows.slice((params.page - 1) * params.limit, params.page * params.limit),
      total: rows.length,
    }));
    const user = userEvent.setup();

    renderWithProviders(
      <Table<User>
        getAll={getAll as any}
        pathParams={{}}
        columns={baseColumns}
        searchableColumns={searchableColumns}
        pagination={{ pageSize: 2 }}
        viewOnly
      />,
    );

    await screen.findByText('Row 1');
    expect(getAll.mock.calls[0][0]).toMatchObject({ page: 1, limit: 2 });
    expect(screen.queryByText('Row 3')).not.toBeInTheDocument();

    await user.click(screen.getByTitle('2'));

    // The second page is fetched with crud pagination params and rendered.
    expect(await screen.findByText('Row 3')).toBeInTheDocument();
    expect(getAll).toHaveBeenCalledWith(expect.objectContaining({ page: 2, limit: 2 }));
  });

  it('sends the toolbar keyword as an $or search across searchable columns', async () => {
    const getAll = vi.fn().mockResolvedValue({ data: [alice, bob] });
    const user = userEvent.setup();

    const { container } = renderWithProviders(
      <Table<User>
        getAll={getAll}
        pathParams={{}}
        columns={baseColumns}
        searchableColumns={searchableColumns}
        viewOnly
      />,
    );

    await screen.findByText('Alice');

    const searchInput = container.querySelector('.ant-pro-table-list-toolbar input');
    expect(searchInput).toBeTruthy();

    await user.type(searchInput as HTMLInputElement, 'ali{Enter}');

    await waitFor(() => {
      const keywordCall = getAll.mock.calls.find(
        ([params]) => JSON.parse(params.s).$and.length > 0,
      );
      expect(keywordCall).toBeTruthy();
      expect(JSON.parse(keywordCall![0].s)).toEqual({
        $and: [
          {
            $or: [{ name: { $contL: 'ali' } }, { email: { $contL: 'ali' } }],
          },
        ],
      });
      expect(keywordCall![0].page).toBe(1);
    });
  });

  it('stays rendered with an empty state when getAll rejects', async () => {
    const getAll = vi.fn().mockRejectedValue(new Error('boom'));
    const onRequestError = vi.fn();

    const { container } = renderWithProviders(
      <Table<User>
        getAll={getAll}
        pathParams={{}}
        columns={baseColumns}
        searchableColumns={searchableColumns}
        onRequestError={onRequestError}
        viewOnly
      />,
    );

    await waitFor(() => expect(onRequestError).toHaveBeenCalled());
    expect(onRequestError.mock.calls[0][0]).toBeInstanceOf(Error);

    // The table survives the failure: still mounted, no data rows, antd empty state.
    expect(await screen.findByText('No data')).toBeInTheDocument();
    expect(container.querySelector('.ant-table')).toBeTruthy();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });
});

describe('Table (editable)', () => {
  const setupEditable = (overrides: Record<string, unknown> = {}) => {
    const getAll = vi.fn().mockResolvedValue({ data: [alice, bob] });
    const onCreate = vi.fn().mockResolvedValue({ ...alice, id: '3' });
    const onUpdate = vi.fn().mockResolvedValue(alice);
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const entityToCreateDto = vi.fn((entity: User) => ({
      name: entity.name,
      email: entity.email,
    }));

    const utils = renderWithProviders(
      <Table<User, Partial<User>, Partial<User>, {}, { tenant: string }>
        getAll={getAll}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
        entityToCreateDto={entityToCreateDto}
        entityToUpdateDto={(entity: User) => ({ name: entity.name, email: entity.email })}
        pathParams={{ tenant: 't1' }}
        columns={columnsWithActions}
        searchableColumns={searchableColumns}
        idColumnName="id"
        {...overrides}
      />,
    );

    return { getAll, onCreate, onUpdate, onDelete, entityToCreateDto, ...utils };
  };

  it('shows the New button, adds an editable row and saves it through onCreate', async () => {
    const user = userEvent.setup();
    const { container, getAll, onCreate, onUpdate } = setupEditable();

    await screen.findByText('Alice');
    const tbody = container.querySelector('.ant-table-tbody') as HTMLElement;
    expect(within(tbody).getAllByRole('row').length).toBeGreaterThanOrEqual(2);
    expect(within(tbody).queryAllByRole('textbox')).toHaveLength(0);

    await user.click(screen.getByText('New'));

    // A fresh editable row (isRecordNew) appears with one input per data column.
    await waitFor(() => expect(within(tbody).getAllByRole('textbox')).toHaveLength(2));
    const [nameInput, emailInput] = within(tbody).getAllByRole('textbox');

    await user.type(nameInput, 'Carol');
    await user.type(emailInput, 'carol@example.com');
    await user.click(within(tbody).getByText('Save'));

    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(1));
    expect(onCreate.mock.calls[0][0]).toEqual({
      tenant: 't1',
      requestBody: { name: 'Carol', email: 'carol@example.com' },
    });
    // The new row goes through the creation path, not the update path.
    expect(onUpdate).not.toHaveBeenCalled();

    // Saving reloads the table data.
    await waitFor(() => expect(getAll.mock.calls.length).toBeGreaterThanOrEqual(2));
  });

  it('deletes a row after confirming the popconfirm', async () => {
    const user = userEvent.setup();
    const { container, onDelete } = setupEditable();

    await screen.findByText('Alice');
    const aliceRow = screen.getByText('Alice').closest('tr') as HTMLElement;

    await user.click(within(aliceRow).getByText('Edit'));

    const deleteTrigger = await waitFor(() => {
      const trigger = container.querySelector('.ant-table-tbody .anticon-delete');
      expect(trigger).toBeTruthy();
      return trigger as HTMLElement;
    });
    await user.click(deleteTrigger);

    // Popconfirm renders in a portal with the intl message.
    await screen.findByText('Delete this row?');
    expect(onDelete).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => expect(onDelete).toHaveBeenCalledTimes(1));
    expect(onDelete.mock.calls[0][0]).toMatchObject({ id: '1', tenant: 't1' });
  });
});
