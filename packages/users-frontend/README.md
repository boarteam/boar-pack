# @boarteam/boar-pack-users-frontend

[![npm version](https://img.shields.io/npm/v/@boarteam/boar-pack-users-frontend.svg)](https://www.npmjs.com/package/@boarteam/boar-pack-users-frontend)
[![license](https://img.shields.io/npm/l/@boarteam/boar-pack-users-frontend.svg)](https://github.com/boarteam/boar-pack/blob/master/LICENSE)

React (Ant Design) components for administering
[`@boarteam/boar-pack-users-backend`](https://www.npmjs.com/package/@boarteam/boar-pack-users-backend):
user management tables, API-token management, event-log views, plus a typed
OpenAPI client for the backend's endpoints.

Part of the [boar-pack](https://github.com/boarteam/boar-pack) monorepo.

## What's inside

- **Users**: `UsersTable` (CRUD table with role/permission editing),
  `useUsersColumns`, `PermissionsList`.
- **API tokens**: `TokensTable` (all tokens, admin view), `MyTokensTable`
  (current user's tokens), `useTokensColumns`.
- **Event logs**: `EventLogsTable`, `EventLogsTimeline`,
  `useEventLogsColumns`, `UserAgentDisplay`, `getBrowserIcon`,
  `EventLogExplanation`, `eventLogsSearchableColumns`.
- **API client**: `createApiClient(config?)` plus the generated `ApiClient`
  class (services: `authentication`, `users`, `tokens`, `eventLogs`,
  `settings`, `telegraf`) and its DTO models; `ApiClientProvider` /
  `useApiClient` React context to hand the client to the components.

The tables are built on
[`@boarteam/boar-pack-common-frontend`](https://www.npmjs.com/package/@boarteam/boar-pack-common-frontend)'s
`Table` and talk to the backend's `@dataui/crud` endpoints.

## Install

```bash
yarn add @boarteam/boar-pack-users-frontend
```

Host application requirements (the package currently declares no
`peerDependencies`, so nothing will warn you — this is what it actually
needs):

- **React 18**, **antd 5**, `@ant-design/pro-components` — same stack as
  `@boarteam/boar-pack-common-frontend`.
- A **umi 4 / `@umijs/max`** app: components use `useModel('@@initialState')`
  and umi's `useAccess()`, so the model/access plugins must be enabled.
- `react-intl` provider (umi's locale plugin) and a router context.
- A running `@boarteam/boar-pack-users-backend` API for the client to call.

## Usage

```tsx
import { createApiClient, ApiClientProvider, UsersTable } from '@boarteam/boar-pack-users-frontend';

// One client per app; BASE defaults to '/api'. Auth uses the backend's
// cookies by default; set TOKEN for bearer auth instead.
const apiClient = createApiClient({ BASE: '/api' });

export default function UsersPage() {
  return (
    <ApiClientProvider value={apiClient}>
      <UsersTable userPageUrlPrefix="/admin/users" permissionsConfig={[]} />
    </ApiClientProvider>
  );
}
```

Editing capabilities follow the CASL abilities exposed by the backend's
`/me` endpoint — users who can't manage a resource see a read-only table.

### Note on scope

The published package ships the **components and the API client only**. The
`src/pages`, `src/access.ts` and umi config files you can see in the
repository are in-repo scaffolding excluded from the build — use them as
reference for wiring pages in your own app, but don't try to import them.

The generated `authentication` service covers `token`, `logout`, `refresh`
and `login-as-user`; login endpoints for local/OAuth flows exist on the
backend when the corresponding `AuthModule.forRoot` flags are enabled (call
them via your own client or regenerate the API client from your backend's
OpenAPI spec).

## Stability

Beta. Extracted from production systems and used in real projects, but the
public API surface is still being curated — expect breaking changes between
major versions. Maintained on a best-effort basis; see the
[monorepo README](https://github.com/boarteam/boar-pack#versioning--stability)
for the versioning policy.

## License

[MIT](https://github.com/boarteam/boar-pack/blob/master/LICENSE)
