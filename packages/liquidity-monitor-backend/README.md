# @boarteam/boar-pack-liquidity-monitor-backend

[![npm version](https://img.shields.io/npm/v/@boarteam/boar-pack-liquidity-monitor-backend.svg)](https://www.npmjs.com/package/@boarteam/boar-pack-liquidity-monitor-backend)
[![license](https://img.shields.io/npm/l/@boarteam/boar-pack-liquidity-monitor-backend.svg)](https://github.com/boarteam/boar-pack/blob/master/LICENSE)

NestJS modules for monitoring liquidity infrastructure: quote-flow statistics
per provider, per-user/target connection statistics, stale-provider detection
with Telegram alerts, and service-uptime heartbeats.

Part of the [boar-pack](https://github.com/boarteam/boar-pack) monorepo; the
matching UI lives in
[`@boarteam/boar-pack-liquidity-monitor-frontend`](https://www.npmjs.com/package/@boarteam/boar-pack-liquidity-monitor-frontend).

## What's inside

| Module | Purpose |
| --- | --- |
| `QuotesStatisticModule` | Counts quotes per liquidity provider (in-memory counters flushed to Postgres every 5s) and serves a bucketed timeline + latest-quote-per-provider queries. |
| `UsersConnectionsStatisticModule` | Counts messages delivered per user connection and per downstream target (`fix-server`, `websocket-server`, `token`, `account`), with timeline endpoints. |
| `ProviderMonitoringModule` | Every 10s checks providers against their `threshold`; opens a "problematic period" and sends a Telegram alert (with exponential backoff) when a provider goes quiet, closes it on recovery. |
| `ApiStatisticModule` | Records service-uptime intervals as a heartbeat row (`tstzrange` extended every 5s, closed on shutdown). |

Statistics tables are self-purged after 7 days (daily cron).

## Install

```bash
yarn add @boarteam/boar-pack-liquidity-monitor-backend
```

Requirements of the host application:

- **NestJS 11** and **TypeORM 0.3** (currently pulled in as direct
  dependencies — keep your app on compatible majors to avoid
  duplicate-package issues).
- **PostgreSQL** — the entities use `tstzrange` columns, so other databases
  will not work.
- No migrations are shipped: create the schema from the entity metadata
  (TypeORM `synchronize` in dev, your own migrations in production).
- `@boarteam/boar-pack-users-backend` is used internally (CASL policies on
  the controllers; Telegram + Settings for provider monitoring).

## Usage

Register the entities on your (optionally named) data source, then register
the modules. This mirrors the package's own Swagger harness
(`src/generateTypes.ts`):

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  QuotesStatisticModule,
  QuotesStatistic,
  UsersConnectionsStatisticModule,
  UsersConnectionsStatistic,
  ProviderMonitoringModule,
  ProvidersProblematicPeriod,
  ApiStatisticModule,
  ApiStatistic,
} from '@boarteam/boar-pack-liquidity-monitor-backend';
import { Setting } from '@boarteam/boar-pack-users-backend';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      name: 'boar_pack_db',
      type: 'postgres',
      // host, port, credentials …
      entities: [
        QuotesStatistic,
        UsersConnectionsStatistic,
        ProvidersProblematicPeriod,
        ApiStatistic,
        Setting, // used by ProviderMonitoringModule
      ],
    }),
    QuotesStatisticModule.forRoot({ dataSourceName: 'boar_pack_db' }),
    UsersConnectionsStatisticModule.forRoot({ dataSourceName: 'boar_pack_db' }),
    ApiStatisticModule.forRoot({
      dataSourceName: 'boar_pack_db',
      serviceName: 'my-api', // heartbeat rows are written only when set
    }),
    ProviderMonitoringModule.forRootAsync({
      dataSourceName: 'boar_pack_db',
      imports: [MyProvidersModule],
      inject: [MyProvidersService],
      // return a function that lists your providers:
      // { id: string; name: string; threshold: number | null }[]
      useFactory: (providers: MyProvidersService) =>
        () => providers.findAllWithThresholds(),
    }),
  ],
})
export class AppModule {}
```

Notes:

- `forRoot(...)` registers the HTTP controllers; use `forFeature(...)`
  (available on the two statistic modules) when you only need the services.
- Feeding the counters is your integration point: inject
  `QuotesStatisticService.incrementQuotesNumber(provider, n)` and
  `UsersConnectionsStatisticService` increment methods from your quote/connection
  pipeline.
- The controllers are annotated with CASL policies from
  `@boarteam/boar-pack-users-backend` — register its auth/CASL setup in the
  same app to enforce access control on the endpoints.
- Provider monitoring is toggled at runtime via the users-backend `Settings`
  module (`QuotesByProviderStatus` setting) and sends alerts through its
  `TelegrafModule`.
- With `SWAGGER=true` in the environment, monitoring loops are skipped — used
  by the `gen-types` OpenAPI generation script.

## Stability

Beta. Extracted from production systems and used in real projects, but the
public API surface is still being curated — expect breaking changes between
major versions. Maintained on a best-effort basis; see the
[monorepo README](https://github.com/boarteam/boar-pack#versioning--stability)
for the versioning policy.

## License

[MIT](https://github.com/boarteam/boar-pack/blob/master/LICENSE)
