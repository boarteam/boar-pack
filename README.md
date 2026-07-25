# boar-pack

[![license](https://img.shields.io/github/license/boarteam/boar-pack.svg)](LICENSE)
[![npm scope](https://img.shields.io/badge/npm-%40boarteam-cb3837.svg)](https://www.npmjs.com/search?q=%40boarteam%2Fboar-pack)

NestJS + React (Ant Design) building blocks: users/auth/permissions, CRUD
tooling, and liquidity monitoring — published to npm as
`@boarteam/boar-pack-*`.

## The problem it solves

Every NestJS + React back-office starts with the same weeks of plumbing: a
users module, JWT auth with refresh-token rotation, OAuth logins, role/
permission checks that work on both server and client, and admin tables
wired to CRUD endpoints with filtering, sorting and inline editing.

boar-pack packages that plumbing as composable libraries, extracted from
production trading systems. The backend modules snap into a NestJS app via
`forRoot`-style registration; the frontend components pair with them
through generated, fully-typed OpenAPI clients. On top of the generic
users/CRUD layer sits an optional domain pair for monitoring liquidity
infrastructure (quote flow, provider uptime, connection statistics).

## Packages

| Package                                                                                                                          | Version                                                                                                                                                                 | What it gives you                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@boarteam/boar-pack-users-backend`](https://www.npmjs.com/package/@boarteam/boar-pack-users-backend)                           | [![npm](https://img.shields.io/npm/v/@boarteam/boar-pack-users-backend.svg)](https://www.npmjs.com/package/@boarteam/boar-pack-users-backend)                           | Users, JWT auth + refresh rotation, local/Google/Microsoft/Yandex login, API tokens, CASL permissions, event logs, settings, Telegram notifications. |
| [`@boarteam/boar-pack-users-frontend`](https://www.npmjs.com/package/@boarteam/boar-pack-users-frontend)                         | [![npm](https://img.shields.io/npm/v/@boarteam/boar-pack-users-frontend.svg)](https://www.npmjs.com/package/@boarteam/boar-pack-users-frontend)                         | Admin UI for the above: users/tokens/event-log tables + typed API client.                                                                            |
| [`@boarteam/boar-pack-common-backend`](https://www.npmjs.com/package/@boarteam/boar-pack-common-backend)                         | [![npm](https://img.shields.io/npm/v/@boarteam/boar-pack-common-backend.svg)](https://www.npmjs.com/package/@boarteam/boar-pack-common-backend)                         | Shared NestJS blocks: scrypt-keyed encryption, process clustering, outbound WebSocket clients, TypeORM utilities.                                    |
| [`@boarteam/boar-pack-common-frontend`](https://www.npmjs.com/package/@boarteam/boar-pack-common-frontend)                       | [![npm](https://img.shields.io/npm/v/@boarteam/boar-pack-common-frontend.svg)](https://www.npmjs.com/package/@boarteam/boar-pack-common-frontend)                       | Generic CRUD `Table`/`List`/`Descriptions` on `@ant-design/pro-*` for `@dataui/crud` APIs, form inputs, WS client.                                   |
| [`@boarteam/boar-pack-liquidity-monitor-backend`](https://www.npmjs.com/package/@boarteam/boar-pack-liquidity-monitor-backend)   | [![npm](https://img.shields.io/npm/v/@boarteam/boar-pack-liquidity-monitor-backend.svg)](https://www.npmjs.com/package/@boarteam/boar-pack-liquidity-monitor-backend)   | Quote-flow statistics, stale-provider detection with Telegram alerts, connection/API statistics.                                                     |
| [`@boarteam/boar-pack-liquidity-monitor-frontend`](https://www.npmjs.com/package/@boarteam/boar-pack-liquidity-monitor-frontend) | [![npm](https://img.shields.io/npm/v/@boarteam/boar-pack-liquidity-monitor-frontend.svg)](https://www.npmjs.com/package/@boarteam/boar-pack-liquidity-monitor-frontend) | Dashboard cards and drill-down timelines for the monitor backend.                                                                                    |

Each package has its own README with full registration options — start
there once you've seen the quick start below.

## Quick start — NestJS backend

Starting from a fresh NestJS app (`nest new my-app`):

```bash
yarn add @boarteam/boar-pack-users-backend @nestjs/config @nestjs/typeorm typeorm
```

You need a Postgres to point at — any will do. A throwaway one that matches
the config below:

```bash
docker run -d --name boar-pack-db -p 5951:5432 \
  -e POSTGRES_USER=app -e POSTGRES_PASSWORD=password -e POSTGRES_DB=boar_pack \
  postgres:13
```

Set the two required secrets in `.env`:

```bash
JWT_SECRET=change-me
BCRYPT_SALT_ROUNDS=10
```

Replace `app.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, CaslModule, UsersModule } from '@boarteam/boar-pack-users-backend';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      name: 'boar_pack_db',
      type: 'postgres',
      host: 'localhost',
      port: 5951,
      username: 'app',
      password: 'password',
      database: 'boar_pack',
      entities: ['node_modules/@boarteam/boar-pack-users-backend/dist/**/entities/*.entity.js'],
      synchronize: true, // dev only
    }),
    CaslModule.forRoot(), // global policies guard — endpoints closed by default
    AuthModule.forRoot({
      localAuth: true,
      withControllers: true,
      dataSourceName: 'boar_pack_db',
    }),
    UsersModule.register({
      withControllers: true,
      dataSourceName: 'boar_pack_db',
    }),
  ],
})
export class AppModule {}
```

And prefix the API in `main.ts` (the refresh-token cookie path defaults to
`/api/auth/refresh`, and the frontend client defaults to `BASE: '/api'`):

```ts
const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('api');
await app.listen(3000);
```

Run `yarn start:dev`. On first boot the users table is empty, so a default
admin `test-admin@test.test` / `test` is seeded (replace it immediately in
anything shared). Log in:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email": "test-admin@test.test", "password": "test"}'
```

You get access/refresh JWTs (also set as cookies) and a full users CRUD API
under `/users`, guarded by CASL policies. Refresh-token rotation is
described in [docs/auth-refresh-token.md](docs/auth-refresh-token.md).

## Quick start — React frontend

The frontend packages assume a umi 4 / `@umijs/max` app with antd 5 and
`@ant-design/pro-components` (see each package's README for exact host
requirements):

```bash
yarn add @boarteam/boar-pack-users-frontend
```

```tsx
import { createApiClient, ApiClientProvider, UsersTable } from '@boarteam/boar-pack-users-frontend';

// BASE defaults to '/api'; auth rides on the backend's cookies.
const apiClient = createApiClient({ BASE: '/api' });

export default function UsersPage() {
  return (
    <ApiClientProvider value={apiClient}>
      <UsersTable userPageUrlPrefix="/admin/users" permissionsConfig={[]} />
    </ApiClientProvider>
  );
}
```

The table renders the users CRUD from the quick-start backend — server-side
search, sorting, inline editing — and respects the CASL abilities the
backend exposes via `/me`.

## Why this and not …?

- **Rolling your own** from the NestJS docs: that's what these packages
  started as — the value is the finished plumbing (refresh-token rotation,
  token revocation, policy guards closed-by-default, CRUD query building)
  that takes weeks to get right.
- **react-admin / Refine**: frontend-first admin frameworks that treat your
  API as a generic data source. boar-pack is a matched full-stack pairing —
  the server enforces CASL policies and the tables consume generated typed
  clients — but it commits you to NestJS + TypeORM + antd/umi.
- **Keycloak / SuperTokens / Auth0**: external identity servers. boar-pack
  keeps users and permissions _inside_ your app and database, which is
  simpler to operate for internal tools, but it is a library, not a hosted
  IdP.

If your stack isn't NestJS + React/antd, boar-pack is the wrong tool.

## Maturity

**Beta.** The packages are extracted from production systems and run in
real deployments, and are covered by an automated test suite (Jest/Vitest,
with the backend suites running against real Postgres in disposable
containers) — but the public API is still being curated and maintenance is
best-effort with no SLA. Expect breaking changes between majors; pin
versions and read per-package CHANGELOGs when upgrading.

## Versioning & stability

- **SemVer, versioned independently per package**, automated with Lerna
  from [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:` → minor, `fix:` → patch, `BREAKING CHANGE:` → major).
- **What counts as breaking:** removing/renaming exported NestJS
  modules/services or React components; changing module registration
  options, DTO shapes, or React component props incompatibly; changing DB
  entities in ways that require consumer-side migration (no migrations are
  shipped — schema management is yours).
- **Deprecation window:** best-effort — deprecations are announced in a
  minor release and removed no earlier than the next major. Security fixes
  target the latest major of each package (see [SECURITY.md](SECURITY.md)).
- Per-package `CHANGELOG.md` files are generated by
  lerna/conventional-changelog.

## Developing this repo

```bash
git clone https://github.com/boarteam/boar-pack.git
cd boar-pack
yarn install
yarn build         # builds all 6 packages via lerna
yarn test          # full test suite; needs Docker (disposable Postgres containers)
docker compose up -d   # dev Postgres on localhost:5951 (dummy local-only creds)
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow
(watchers/yalc, API-client regeneration), commit conventions, and the
release process. Community standards live in
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and [SECURITY.md](SECURITY.md).

## Documentation

- Per-package READMEs (linked in the table above)
- [Auth refresh tokens](docs/auth-refresh-token.md) — design of the
  refresh-token rotation and revocation flow

## License

[MIT](LICENSE) © Boar Team / Andrey Balakirev
