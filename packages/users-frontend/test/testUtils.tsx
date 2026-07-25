import React from 'react';
import { MemoryRouter } from 'react-router-dom';
// The common-frontend package (loaded from its dist by these tests) resolves
// react-intl to its OWN node_modules copy. The IntlProvider wrapping the tests
// must come from that same module instance, otherwise the react context does
// not match and every <FormattedMessage> inside Table blows up.
// @ts-ignore -- deep import into the sibling package's physical dependency
import { IntlProvider } from '../../common-frontend/node_modules/react-intl';
import { ApiClientProvider } from '../src/components/ApiClientContext';
import type { ApiClient } from '../src/tools/api-client/generated';

export const intlMessages: Record<string, string> = {
  'table.newButton': 'New',
  'table.saveText': 'Save',
  'table.cancelText': 'Cancel',
  'table.deleteText': 'Delete',
  'table.deletePopconfirmMessage': 'Delete this record?',
  'table.onlyAddOneLineAlertMessage': 'Only one line can be added at a time',
  'table.actions': 'Actions',
  'tables.columnsSetSelect.hint.title': 'Columns sets',
  'tables.columnsSetSelect.hint.message': 'Choose a columns set',
  'pages.users.name': 'Name',
  'pages.users.email': 'Email',
  'pages.users.password': 'Password',
  'pages.users.role': 'Role',
  'pages.users.roles.admin': 'Admin',
  'pages.users.roles.user': 'User',
};

// Used by tests that mock @umijs/max's useIntl.
export function messageById(id: string): string {
  return intlMessages[id] ?? id;
}

export function TestProviders({
  client,
  children,
}: {
  client: unknown;
  children: React.ReactNode;
}) {
  return (
    <IntlProvider locale="en" messages={intlMessages} onError={() => {}}>
      <MemoryRouter>
        <ApiClientProvider value={client as ApiClient}>{children}</ApiClientProvider>
      </MemoryRouter>
    </IntlProvider>
  );
}
