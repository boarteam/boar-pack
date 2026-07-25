# @boarteam/boar-pack-users-backend

[![npm version](https://img.shields.io/npm/v/@boarteam/boar-pack-users-backend.svg)](https://www.npmjs.com/package/@boarteam/boar-pack-users-backend)
[![license](https://img.shields.io/npm/l/@boarteam/boar-pack-users-backend.svg)](https://github.com/boarteam/boar-pack/blob/master/LICENSE)

Batteries-included NestJS users module: JWT auth with refresh-token rotation,
local + Google/Microsoft/Yandex OAuth login, API tokens, CASL-based
permissions, WebSocket auth, event logs, app settings and Telegram
notifications.

Part of the [boar-pack](https://github.com/boarteam/boar-pack) monorepo; the
matching UI lives in
[`@boarteam/boar-pack-users-frontend`](https://www.npmjs.com/package/@boarteam/boar-pack-users-frontend).

## What's inside

| Module            | Registration                                                                                    | Purpose                                                                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `AuthModule`      | `forRoot({ localAuth?, googleAuth?, msAuth?, yandexAuth?, withControllers?, dataSourceName? })` | Login endpoints and passport strategies; installs the global JWT guard. Each login method is opt-in via its flag.                     |
| `UsersModule`     | `register({ withControllers?, dataSourceName? })`                                               | User entity, CRUD controllers (`@dataui/crud`), `/me` endpoint with packed CASL abilities.                                            |
| `CaslModule`      | `forRoot()` / `forFeature()`                                                                    | Permission system. `forRoot()` installs the global `PoliciesGuard` — **endpoints are closed by default** unless a policy allows them. |
| `JwtAuthModule`   | `register({ dataSourceName? })`                                                                 | Access + refresh JWT strategies, token revocation (pulled in by `AuthModule` automatically).                                          |
| `TokensModule`    | `forRoot({ dataSourceName })` / `forAuth({ dataSourceName })`                                   | Long-lived API tokens; `forAuth` adds bearer-token authentication.                                                                    |
| `EventLogsModule` | `forRoot(…)` / `forInterceptor(…)` / `forFeature(…)`                                            | Audit trail of requests/events; `forInterceptor` logs globally via interceptor + middleware.                                          |
| `SettingsModule`  | `register({ withControllers, dataSourceName })`                                                 | Key-value application settings with CRUD endpoints.                                                                                   |
| `TelegrafModule`  | `register({ withControllers, dataSourceName })`                                                 | Outbound Telegram notifications (not a login method).                                                                                 |
| `WsAuthModule`    | plain import / `forCustomStrategy(name)`                                                        | Authenticates WebSocket connections (default: the JWT strategy) on a `/ws` gateway.                                                   |
| `BcryptModule`    | plain import                                                                                    | Password hashing service used by users/tokens.                                                                                        |

## Install

```bash
yarn add @boarteam/boar-pack-users-backend
```

Requirements of the host application:

- **NestJS 11**, **TypeORM 0.3** (currently direct dependencies of this
  package — keep your app on compatible majors).
- **PostgreSQL** (the `pg` driver is included; the modules are developed and
  run against Postgres).
- No migrations are shipped: create the schema from entity metadata
  (`synchronize: true` in dev, your own migrations in production).

## Quick start

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
      // Registers every entity the package ships, including internal ones
      // (e.g. revoked refresh tokens):
      entities: ['node_modules/@boarteam/boar-pack-users-backend/dist/**/entities/*.entity.js'],
      synchronize: true, // dev only — manage schema yourself in production
    }),
    CaslModule.forRoot(), // installs the global PoliciesGuard
    AuthModule.forRoot({
      localAuth: true, // email + password login at POST /auth/login
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

Required environment variables for this setup (see
[`.env.example`](https://github.com/boarteam/boar-pack/blob/master/packages/users-backend/.env.example)):

| Variable                                                                                         | Meaning                                                         |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `JWT_SECRET`                                                                                     | Secret for signing access/refresh tokens (**required**).        |
| `BCRYPT_SALT_ROUNDS`                                                                             | Bcrypt cost factor, e.g. `10` (**required**).                   |
| `ACCESS_TOKEN_EXPIRATION`                                                                        | Access-token TTL, default `1h`.                                 |
| `REFRESH_TOKEN_EXPIRATION`                                                                       | Refresh-token TTL, default `7d`.                                |
| `REFRESH_TOKEN_PATH`                                                                             | Cookie path for the refresh token, default `/api/auth/refresh`. |
| `SECURE_COOKIE`                                                                                  | Set `true` in production to mark auth cookies `Secure`.         |
| `GOOGLE_CLIENT_ID` / `GOOGLE_SECRET_ID` / `GOOGLE_CALLBACK_URL`                                  | Only when `googleAuth: true`.                                   |
| `MICROSOFT_CLIENT_ID` / `MICROSOFT_TENANT_ID` / `MICROSOFT_SECRET_ID` / `MICROSOFT_CALLBACK_URL` | Only when `msAuth: true`.                                       |
| `YANDEX_CLIENT_ID` / `YANDEX_SECRET_ID` / `YANDEX_CALLBACK_URL`                                  | Only when `yandexAuth: true`.                                   |

Controller routes (`/auth/login`, `/users`, `/me`, …) sit under your app's
global prefix; the `REFRESH_TOKEN_PATH` default assumes
`app.setGlobalPrefix('api')`, so set that prefix or override the variable.

> ⚠️ **Default admin seeding:** on startup, if the users table is empty (and
> `SWAGGER` is not `true`), `UsersModule` creates an admin user
> `test-admin@test.test` with password `test` so you can log in for the first
> time. **Change or replace this account immediately** in any environment
> that is reachable by anyone but you.

Auth is JWT-based: tokens arrive either as an `Authorization: Bearer …`
header or as cookies set by the login endpoints; refresh tokens are rotated
and revoked server-side. The full design is documented in
[docs/auth-refresh-token.md](https://github.com/boarteam/boar-pack/blob/master/docs/auth-refresh-token.md).

## Permissions (CASL)

- `CaslModule.forRoot()` installs a global `PoliciesGuard`. Routes without a
  policy are **denied** by default; annotate handlers with
  `@CheckPolicies(new ViewUsersPolicy())` (or a
  `(ability) => boolean` callback), or opt out with `@SkipPoliciesGuard()`.
- Admins (`role: admin`) can manage everything; regular users get abilities
  mapped from their `permissions` array via `CaslAbilityFactory`.
- Modules register their own permission → ability mappings; you can add your
  own with `CaslAbilityFactory.addPermissionToAction({ permission, action, subject })`.
- `GET /me` returns the packed ability rules so a frontend (e.g.
  `@boarteam/boar-pack-users-frontend`) can mirror permissions client-side.

## Stability

Beta. Extracted from production systems and used in real projects, but the
public API surface is still being curated — expect breaking changes between
major versions. Maintained on a best-effort basis; see the
[monorepo README](https://github.com/boarteam/boar-pack#versioning--stability)
for the versioning policy.

## License

[MIT](https://github.com/boarteam/boar-pack/blob/master/LICENSE)
