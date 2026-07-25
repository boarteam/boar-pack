import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';
import List from './List';

// antd's generated stylesheets can contain selectors nwsapi cannot parse,
// which makes jsdom's getComputedStyle (used by user-event) throw. Treat
// invalid selectors as "no match".
const rawQuerySelectorAll = Element.prototype.querySelectorAll;
Element.prototype.querySelectorAll = function (selector: string) {
  try {
    return rawQuerySelectorAll.call(this, selector);
  } catch {
    return rawQuerySelectorAll.call(this, '.__invalid_selector_no_match__');
  }
} as typeof Element.prototype.querySelectorAll;

type Entity = { id: string; name: string };

const rows: Entity[] = [
  { id: '1', name: 'Row A' },
  { id: '2', name: 'Row B' },
];

const messages = {
  'table.newButton': 'New',
  'table.saveText': 'Save',
  'table.cancelText': 'Cancel',
  'table.deleteText': 'Delete',
  'table.deletePopconfirmMessage': 'Delete this?',
  'table.onlyAddOneLineAlertMessage': 'Only one line',
};

function renderList(props: Partial<React.ComponentProps<typeof List<Entity>>> = {}) {
  const getAll = vi.fn().mockResolvedValue({ data: rows, total: rows.length });
  const onCreate = vi.fn().mockResolvedValue(rows[0]);
  const onUpdate = vi.fn().mockResolvedValue(rows[0]);
  const onDelete = vi.fn().mockResolvedValue(undefined);
  const utils = render(
    <IntlProvider locale="en" messages={messages}>
      <List<Entity>
        getAll={getAll}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
        pathParams={{}}
        entityToCreateDto={(e) => e}
        entityToUpdateDto={(e) => e}
        columns={[{ title: 'Name', dataIndex: 'name' }]}
        metas={{ title: { dataIndex: 'name' }, actions: {} }}
        {...props}
      />
    </IntlProvider>,
  );
  return { getAll, onCreate, onUpdate, onDelete, ...utils };
}

describe('List', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads rows through getAll and renders their titles', async () => {
    const { getAll } = renderList();

    expect(await screen.findByText('Row A')).toBeInTheDocument();
    expect(screen.getByText('Row B')).toBeInTheDocument();
    expect(getAll).toHaveBeenCalledTimes(1);
  });

  it('builds crud-request query params with pagination, default sort and fields', async () => {
    const { getAll } = renderList();
    await screen.findByText('Row A');

    const params = getAll.mock.calls[0][0];
    // pagination is not enabled by default, so page/limit stay undefined
    expect(params.page).toBeUndefined();
    expect(params.limit).toBeUndefined();
    expect(params.sort).toEqual(['createdAt,DESC']);
    expect(params.join).toEqual([]);
    // fields are comma-joined; id omitted (always returned by backend)
    expect(params.fields).toEqual(['name']);
    expect(JSON.parse(params.s)).toEqual({ '$and': [] });
  });

  it('passes pagination through as page/limit when enabled', async () => {
    const { getAll } = renderList({ pagination: { pageSize: 5 } });
    await screen.findByText('Row A');

    const params = getAll.mock.calls[0][0];
    expect(params.page).toBe(1);
    expect(params.limit).toBe(5);
  });

  it('uses a custom defaultSort when provided', async () => {
    const { getAll } = renderList({ defaultSort: ['name', 'ASC'] });
    await screen.findByText('Row A');

    expect(getAll.mock.calls[0][0].sort).toEqual(['name,ASC']);
  });

  it('shows the New button in the toolbar', async () => {
    renderList();
    await screen.findByText('Row A');

    expect(screen.getByRole('button', { name: /New/ })).toBeInTheDocument();
  });

  it('hides the New button when viewOnly', async () => {
    renderList({ viewOnly: true });
    await screen.findByText('Row A');

    expect(screen.queryByRole('button', { name: /New/ })).not.toBeInTheDocument();
  });

  it('adds an editable row with save/cancel controls when New is clicked', async () => {
    const user = userEvent.setup();
    renderList();
    await screen.findByText('Row A');

    await user.click(screen.getByRole('button', { name: /New/ }));

    // the new record enters edit mode: an editable form row with Save button appears
    expect(await screen.findByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(document.querySelector('.ant-pro-list-row-editable')).toBeTruthy();
  });

  it('creates the new record through onCreate when the editable row is saved', async () => {
    const user = userEvent.setup();
    const { onCreate, getAll } = renderList();
    await screen.findByText('Row A');

    await user.click(screen.getByRole('button', { name: /New/ }));
    const saveButton = await screen.findByRole('button', { name: 'Save' });

    const editableInput = document.querySelector(
      '.ant-pro-list-row-editable input',
    ) as HTMLInputElement;
    expect(editableInput).toBeTruthy();
    await user.type(editableInput, 'Created Row');

    // the save handler lives on the wrapping <a>, not the inner button
    fireEvent.click(saveButton.closest('a')!);

    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(1));
    const arg = onCreate.mock.calls[0][0];
    expect(arg.requestBody.name).toBe('Created Row');
    expect(String(arg.requestBody.id)).toMatch(/^NEW_RECORD/);

    // list reloads after save
    await waitFor(() => expect(getAll.mock.calls.length).toBeGreaterThanOrEqual(2));
  });
});
