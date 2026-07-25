import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { describe, expect, it, vi } from 'vitest';
import { RelationSelect } from './RelationSelect';

// antd's generated select-dropdown stylesheet contains a selector that nwsapi
// cannot parse, which makes jsdom's getComputedStyle (used by user-event)
// throw. Treat invalid selectors as "no match".
const rawQuerySelectorAll = Element.prototype.querySelectorAll;
Element.prototype.querySelectorAll = function (selector: string) {
  try {
    return rawQuerySelectorAll.call(this, selector);
  } catch {
    return rawQuerySelectorAll.call(this, '.__invalid_selector_no_match__');
  }
} as typeof Element.prototype.querySelectorAll;

type Item = { id: string; name: string };

const items: Item[] = [
  { id: '1', name: 'Alpha' },
  { id: '2', name: 'Beta' },
];

const messages = {
  'table.newButton': 'New',
  'table.saveText': 'Save',
  'table.cancelText': 'Cancel',
  'table.deleteText': 'Delete',
  'table.deletePopconfirmMessage': 'Delete this?',
  'table.onlyAddOneLineAlertMessage': 'Only one line',
};

const renderSelect = (props: Partial<React.ComponentProps<typeof RelationSelect<Item>>> = {}) => {
  const fetchItems = vi.fn().mockResolvedValue({ data: items });
  const onChange = vi.fn();
  const utils = render(
    <IntlProvider locale="en" messages={messages}>
      <RelationSelect<Item>
        selectedItem={undefined}
        fetchItems={fetchItems}
        onChange={onChange}
        {...props}
      />
    </IntlProvider>,
  );
  return { fetchItems, onChange, ...utils };
};

describe('RelationSelect', () => {
  it('renders the placeholder and fetches items', async () => {
    const { fetchItems } = renderSelect();

    expect(screen.getByText('Please choose')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));

    await waitFor(() => expect(fetchItems).toHaveBeenCalled());
    expect(fetchItems).toHaveBeenCalledWith([], undefined);
    expect(await screen.findByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('shows the pre-selected item', () => {
    renderSelect({ selectedItem: items[1] });
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('applies the base filter and keyword filter when searching', async () => {
    const { fetchItems } = renderSelect({ filter: ['type||$eq||demo'] });
    const user = userEvent.setup();

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    await user.type(combobox, 'Al');

    await waitFor(() =>
      expect(fetchItems).toHaveBeenCalledWith(
        ['type||$eq||demo', 'name||$contL||Al'],
        'Al',
      ),
    );
  });

  it('calls onChange with the picked option', async () => {
    const { onChange } = renderSelect();
    const user = userEvent.setup();

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByText('Alpha'));

    expect(onChange).toHaveBeenCalledTimes(1);
    const picked = onChange.mock.calls[0][0];
    expect(picked).toBeTruthy();
    expect(picked).toMatchObject({ value: '1' });
  });

  it('does not offer inline creation without onCreate', async () => {
    renderSelect();
    const user = userEvent.setup();

    await user.click(screen.getByRole('combobox'));
    await screen.findByText('Alpha');

    expect(screen.queryByText('New')).not.toBeInTheDocument();
  });

  it('offers inline creation and opens the create modal when onCreate is provided', async () => {
    const onCreate = vi.fn().mockResolvedValue(items[0]);
    renderSelect({
      onCreate,
      creationColumns: [{ title: 'Name', dataIndex: 'name' }],
      createPopupTitle: 'Add related record',
    });
    const user = userEvent.setup();

    await user.click(screen.getByRole('combobox'));
    await screen.findByText('Alpha');

    const newButton = await screen.findByText('New');
    await user.click(newButton);

    // CreateEntityModal opens in a portal
    expect(await screen.findByText('Add related record')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });
});
