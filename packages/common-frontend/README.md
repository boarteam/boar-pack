# @boarteam/boar-pack-common-frontend

[![npm version](https://img.shields.io/npm/v/@boarteam/boar-pack-common-frontend.svg)](https://www.npmjs.com/package/@boarteam/boar-pack-common-frontend)
[![license](https://img.shields.io/npm/l/@boarteam/boar-pack-common-frontend.svg)](https://github.com/boarteam/boar-pack/blob/master/LICENSE)

Shared React (Ant Design) building blocks for boar-pack frontends. The
centerpiece is a generic CRUD `Table` on top of `@ant-design/pro-table`
that plugs straight into [`@dataui/crud`](https://github.com/dataui/crud)
(nestjsx-crud style) backends — server-side filtering, sorting, inline
editing, XLSX import/export.

Part of the [boar-pack](https://github.com/boarteam/boar-pack) monorepo.

## What's inside

**Components**

- `Table` — generic CRUD table: `getAll`/`onCreate`/`onUpdate`/`onDelete`
  handlers map 1:1 onto a generated `@dataui/crud` API client; builds
  crud-request query params (filters, sort, joins, pagination) from column
  state; row/popup editing, column sets, XLSX import/export. Helpers ship
  alongside: `Operators` (crud filter operators), `useColumnsSets`,
  `useCreation`, `isRecordNew`, query-building utilities.
- `List` — the same CRUD model rendered as an editable `ProList`.
- `Descriptions` — editable single-record detail view (`ProDescriptions`),
  plus `DescriptionsCreateModal` and view-mode helpers.
- `ChangesModal` — diff-review modal for bulk imports (changes / new
  records / conflicts / errors tabs).
- `Inputs` — form controls for table/form columns: `RelationSelect` (async
  select with inline create), `SearchSelect`, `Password` (with generator),
  `MultiStringSelect`, `NumberSwitch`, `DateRange`, filter dropdowns for
  numbers/strings/booleans/ranges, `useCheckConnection`.
- `QuestionMarkHint` — popover hint driven by `react-intl` message ids.

**Tools**

- `WebsocketClient` — browser WS client with reconnect and typed events
  (counterpart of common-backend's `WebsocketsClients`).
- `useFullscreen`, `useTabs` (tab state in the URL query), `safetyRun`,
  `dropTrailZeroes`, `ApiError` (maps API 400s onto form field errors).

## Install

```bash
yarn add @boarteam/boar-pack-common-frontend
```

Peer dependencies: `react` 18, `react-dom`, `antd` 5,
`@ant-design/pro-components` / `pro-table` / `pro-utils` / `icons`,
`react-intl`, `umi` 4.

Despite the `umi` peer, the code calls no umi APIs — any React app works if
it provides:

- a `react-intl` `IntlProvider` (supply messages for the `table.*` keys:
  `table.newButton`, `table.saveText`, `table.cancelText`,
  `table.deleteText`, `table.deletePopconfirmMessage`,
  `table.onlyAddOneLineAlertMessage`, and
  `tables.columnsSetSelect.hint.title` / `.message`),
- a `react-router-dom` router context (used by `useTabs` and the
  import/export flow).

umi/`@umijs/max` apps get both out of the box.

> **Install note:** the `xlsx` dependency resolves to a tarball on
> `cdn.sheetjs.com` (SheetJS stopped publishing new versions to npm).
> Offline mirrors / registry proxies need to allow that URL or override the
> dependency.

## Usage

Real-world usage from
[`@boarteam/boar-pack-users-frontend`](https://www.npmjs.com/package/@boarteam/boar-pack-users-frontend)'s
`UsersTable`, trimmed — `apiClient` is a generated `@dataui/crud` OpenAPI
client:

```tsx
import { Table, Operators } from '@boarteam/boar-pack-common-frontend';
import pick from 'lodash/pick';
import type { User, UserCreateDto, UserUpdateDto } from './api-client';

const entityToDto = (entity: User) =>
  pick(entity, ['name', 'email', 'role', 'pass']);

<Table<User, UserCreateDto, UserUpdateDto>
  getAll={params => apiClient.users.getManyBaseUsersControllerUser(params)}
  onCreate={params => apiClient.users.createOneBaseUsersControllerUser(params)}
  onUpdate={params => apiClient.users.updateOneBaseUsersControllerUser(params)}
  onDelete={params => apiClient.users.deleteOneBaseUsersControllerUser(params)}
  entityToCreateDto={entityToDto}
  entityToUpdateDto={entityToDto}
  pathParams={{}}
  columns={columns}          // ProColumns<User>[]
  idColumnName="id"
  searchableColumns={[
    { field: 'name', operator: Operators.containsLow },
    { field: 'email', operator: Operators.containsLow },
  ]}
  viewOnly={!canManageUsers} // hides all editing affordances
/>
```

`getAll` receives ready-made crud-request query params (`filter`, `sort`,
`join`, `limit`, `page`, …) — pass them through to the generated client and
return `{ data: Entity[] }`.

## Stability

Beta. Extracted from production systems and used in real projects, but the
public API surface is still being curated — expect breaking changes between
major versions. Maintained on a best-effort basis; see the
[monorepo README](https://github.com/boarteam/boar-pack#versioning--stability)
for the versioning policy.

## License

[MIT](https://github.com/boarteam/boar-pack/blob/master/LICENSE)
