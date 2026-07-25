import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Descriptions from './Descriptions';
import { FieldsEdit } from './descriptionTypes';

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

type Entity = { id: string; name: string; age: number };

const entity: Entity = { id: 'e-1', name: 'Foo', age: 30 };

const messages = {
  'table.saveText': 'Save',
  'table.cancelText': 'Cancel',
  'table.deleteText': 'Delete',
  'table.deletePopconfirmMessage': 'Delete this?',
  'table.onlyAddOneLineAlertMessage': 'Only one line',
};

const columns = [
  { title: 'Name', dataIndex: 'name' as const },
  { title: 'Age', dataIndex: 'age' as const },
];

function renderDescriptions(
  props: Partial<React.ComponentProps<typeof Descriptions<Entity>>> = {},
) {
  const getOne = vi.fn().mockResolvedValue(entity);
  const onUpdate = vi.fn().mockImplementation(async ({ requestBody }) => ({
    ...entity,
    ...requestBody,
  }));
  const utils = render(
    <IntlProvider locale="en" messages={messages}>
      <Descriptions<Entity>
        getOne={getOne}
        onUpdate={onUpdate}
        entityToUpdateDto={(e) => e}
        idColumnName="id"
        columns={columns}
        {...props}
      />
    </IntlProvider>,
  );
  return { getOne, onUpdate, ...utils };
}

describe('Descriptions', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches the entity via getOne and renders its values', async () => {
    const { getOne } = renderDescriptions();

    expect(await screen.findByText('Foo')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();

    expect(getOne).toHaveBeenCalledTimes(1);
    const params = getOne.mock.calls[0][0];
    // collectFieldsFromColumns produces a single comma-joined string and
    // intentionally omits the id column (backend always includes it)
    expect(params.fields).toEqual(['name,age']);
  });

  it('renders a provided entity without needing getOne', async () => {
    render(
      <IntlProvider locale="en" messages={messages}>
        <Descriptions<Entity> entity={entity} columns={columns} />
      </IntlProvider>,
    );

    expect(await screen.findByText('Foo')).toBeInTheDocument();
  });

  it('shows a 404 result when getOne fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const getOne = vi.fn().mockRejectedValue(new Error('not found'));
    render(
      <IntlProvider locale="en" messages={messages}>
        <Descriptions<Entity> getOne={getOne} columns={columns} />
      </IntlProvider>,
    );

    expect(await screen.findByText('The entity is not found.')).toBeInTheDocument();
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('offers no edit controls when canEdit is false', async () => {
    const { container } = renderDescriptions({ canEdit: false });

    await screen.findByText('Foo');
    expect(container.querySelector('.anticon-edit')).toBeNull();
  });

  it('edits a single field and sends only that field to onUpdate', async () => {
    const user = userEvent.setup();
    const { container, onUpdate } = renderDescriptions({
      canEdit: true,
      fieldsEditType: FieldsEdit.Single,
    });

    await screen.findByText('Foo');
    const editIcons = container.querySelectorAll('.anticon-edit');
    expect(editIcons.length).toBe(2);

    // first icon belongs to the first column (name)
    await user.click(editIcons[0]);

    const input = await screen.findByDisplayValue('Foo');
    await user.clear(input);
    await user.type(input, 'Bar');

    // ProDescriptions renders the save action as a check icon
    const saveIcon = input.closest('td')!.querySelector('.anticon-check')!;
    await user.click(saveIcon);

    await waitFor(() => expect(onUpdate).toHaveBeenCalledTimes(1));
    const arg = onUpdate.mock.calls[0][0];
    // dto built from pick(record, [propName]) — only the edited field
    expect(arg.requestBody).toEqual({ name: 'Bar' });

    // saved value replaces the old one in the view
    expect(await screen.findByText('Bar')).toBeInTheDocument();
    expect(screen.queryByText('Foo')).not.toBeInTheDocument();
  });

  it('groups child columns into tabs and renders each section', async () => {
    const sectionedColumns = [
      { title: 'Name', dataIndex: 'name' as const },
      {
        title: 'Details',
        dataIndex: 'details' as const,
        children: [{ title: 'Age', dataIndex: 'age' as const }],
      },
    ];
    renderDescriptions({ columns: sectionedColumns as any, mainTitle: 'General' });

    await screen.findByText('Foo');

    const tablist = screen.getAllByRole('tablist')[0];
    expect(within(tablist).getByText('General')).toBeInTheDocument();
    expect(within(tablist).getByText('Details')).toBeInTheDocument();

    // both sections render (forceRender), so both values exist
    expect(screen.getByText('Foo')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });
});
