import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChangesModal } from './ChangesModal';
import type { TDiffResult } from '../Table/useImportExport';

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

type Entity = { id: number; name: string; version?: number };

const messages = {
  'table.newButton': 'New',
  'table.saveText': 'Save',
  'table.cancelText': 'Cancel',
  'table.deleteText': 'Delete',
  'table.deletePopconfirmMessage': 'Delete this?',
  'table.onlyAddOneLineAlertMessage': 'Only one line',
};

const columns = [{ title: 'Name', dataIndex: 'name' as const }];

const changes: TDiffResult<Entity> = {
  created: [
    { id: 101, name: 'Fresh One' },
    { id: 102, name: 'Fresh Two' },
  ],
  updated: [{ id: 1, version: 3, name: 'Updated Row' }],
  tableData: [
    {
      id: 1,
      name: 'Updated Row',
      diff: [{ kind: 'E', path: ['name'], lhs: 'Old Row', rhs: 'Updated Row' } as any],
    },
  ],
};

function renderModal(overrides: Partial<React.ComponentProps<typeof ChangesModal<Entity, any>>> = {}) {
  const onCommit = vi.fn().mockResolvedValue({ created_count: 2, updated_count: 1 });
  const onClose = vi.fn();
  const utils = render(
    <IntlProvider locale="en" messages={messages}>
      <ChangesModal<Entity, any>
        onCommit={onCommit}
        onClose={onClose}
        changes={changes}
        originRecordsColumnsConfig={columns}
        changedRecordsColumnsConfig={columns}
        createdRecordsColumnsConfig={{ columns }}
        {...overrides}
      />
    </IntlProvider>,
  );
  return { onCommit, onClose, ...utils };
}

describe('ChangesModal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when there are no changes', () => {
    renderModal({ changes: undefined });
    expect(screen.queryByText('Preview changes')).not.toBeInTheDocument();
  });

  it('opens with all tabs and per-tab counts', async () => {
    renderModal();

    // modal renders into a portal
    expect(await screen.findByText('Preview changes')).toBeInTheDocument();

    const tablist = screen.getAllByRole('tablist')[0];
    expect(within(tablist).getByText('Changed Values')).toBeInTheDocument();
    expect(within(tablist).getByText('New Records')).toBeInTheDocument();
    expect(within(tablist).getByText('Errors')).toBeInTheDocument();
    expect(within(tablist).getByText('Conflicts')).toBeInTheDocument();
    expect(within(tablist).getByText('Results')).toBeInTheDocument();

    // badge counts: 1 changed row, 2 new records
    expect(within(tablist).getByTitle('1')).toBeInTheDocument();
    expect(within(tablist).getByTitle('2')).toBeInTheDocument();
  });

  it('shows the changed rows with their field diffs on the default tab', async () => {
    renderModal();

    expect(await screen.findByText('Changed Values (Local Comparing)')).toBeInTheDocument();
    expect(await screen.findByText('Updated Row')).toBeInTheDocument();
    // diff render: Tag with path + lhs → rhs
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText(/Old Row/)).toBeInTheDocument();
  });

  it('shows created rows on the New Records tab', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(await screen.findByRole('tab', { name: /New Records/ }));

    expect(await screen.findByText('New Records (Local Comparing)')).toBeInTheDocument();
    expect(await screen.findByText('Fresh One')).toBeInTheDocument();
    expect(screen.getByText('Fresh Two')).toBeInTheDocument();
  });

  it('fires onClose from the Close button', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    // the modal X icon is also named "Close", so scope to the footer
    await screen.findByText('Preview changes');
    const footer = document.querySelector('.ant-modal-footer') as HTMLElement;
    await user.click(within(footer).getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('fires onClose from the modal X icon', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.click(await screen.findByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('commits new+modified payload and shows the results tab on success', async () => {
    const user = userEvent.setup();
    const { onCommit } = renderModal();

    await user.click(await screen.findByRole('button', { name: 'Commit' }));

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith({
      new: changes.created,
      modified: changes.updated,
    });

    expect(await screen.findByText('Import Results')).toBeInTheDocument();
    expect(screen.getByText('Created: 2')).toBeInTheDocument();
    expect(screen.getByText('Updated: 1')).toBeInTheDocument();
  });

  it('switches to the conflicts tab when the server reports conflicts', async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn().mockResolvedValue({
      created_count: 0,
      updated_count: 0,
      conflicts: [
        {
          id: 1,
          version: 4,
          fields: [
            { field: 'name', current_value: 'Server Name', imported_value: 'Imported Name' },
          ],
        },
      ],
    });
    renderModal({ onCommit });

    await user.click(await screen.findByRole('button', { name: 'Commit' }));

    expect(
      await screen.findByText('There are conflicts in the import. Please resolve them.'),
    ).toBeInTheDocument();
    expect(await screen.findByText('ID 1')).toBeInTheDocument();
    expect(screen.getByText('Server version: v4')).toBeInTheDocument();
    expect(screen.getByText('Current (From Server)')).toBeInTheDocument();
    expect(screen.getByText('New (Importing)')).toBeInTheDocument();
  });

  it('shows server validation errors on the errors tab after a 400', async () => {
    const user = userEvent.setup();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onCommit = vi.fn().mockRejectedValue({
      status: 400,
      body: {
        statusCode: 400,
        message: 'Validation failed',
        errors: [{ field: 'new.0.name', message: 'Name is required' }],
      },
    });
    renderModal({ onCommit });

    await user.click(await screen.findByRole('button', { name: 'Commit' }));

    expect(await screen.findByText('Validation failed')).toBeInTheDocument();
    expect(
      await screen.findByText('Please fix the following errors and repeat import'),
    ).toBeInTheDocument();
    expect(screen.getByText('New #1: name')).toBeInTheDocument();
    expect(screen.getByText('Name is required')).toBeInTheDocument();

    // commit stays blocked while server errors are present
    expect(screen.getByRole('button', { name: 'Commit' })).toBeDisabled();
  });

  it('reports an unexpected error for non-validation failures', async () => {
    const user = userEvent.setup();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onCommit = vi.fn().mockRejectedValue(new Error('boom'));
    renderModal({ onCommit });

    await user.click(await screen.findByRole('button', { name: 'Commit' }));

    expect(
      await screen.findByText('Unexpected error while committing changes'),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Commit' })).toBeEnabled(),
    );
  });
});
