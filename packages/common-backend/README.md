# @boarteam/boar-pack-common-backend

[![npm version](https://img.shields.io/npm/v/@boarteam/boar-pack-common-backend.svg)](https://www.npmjs.com/package/@boarteam/boar-pack-common-backend)
[![license](https://img.shields.io/npm/l/@boarteam/boar-pack-common-backend.svg)](https://github.com/boarteam/boar-pack/blob/master/LICENSE)

Shared NestJS building blocks used across the boar-pack backends: symmetric
encryption (scrypt-keyed AES), multi-process clustering, an outbound
WebSocket client manager, a Swagger-aware scheduler wrapper, and TypeORM
utilities.

Part of the [boar-pack](https://github.com/boarteam/boar-pack) monorepo.

## What's inside

All modules are plain `@Module` classes — add them to `imports: []`, no
`forRoot` needed.

| Export | Purpose |
| --- | --- |
| `ScryptModule` / `ScryptService` | `encrypt(str)` / `decrypt(str)` with AES-256-CTR, key derived via scrypt from the `SCRYPT_SALT` and `SCRYPT_IV` env vars (IV must be 16 characters). |
| `ClusterModule` | Forks and supervises worker processes with Node's `cluster`: per-worker env/ports, auto-restart on exit, runtime start/stop of individual workers. You describe workers by implementing `ClusterInterface` and registering it with `ClusterService.addCluster()`. |
| `ScheduleModule` | Wraps `@nestjs/schedule`'s `ScheduleModule.forRoot()`; additionally stops all cron jobs/intervals when `SWAGGER=true`, so OpenAPI-generation runs don't kick off background work. |
| `WebsocketsClients` | Transient provider managing **outbound** WebSocket connections (`ws`): connect/send/close/reconnect callbacks, JSON parsing via `lossless-json` with safe number handling. |
| `WebsocketsExceptionFilter` | `@Catch()` filter for NestJS WS gateways that emits errors as `{ event: 'error', data: … }` frames. |
| `Tools.NamedLogger` | `ConsoleLogger` subclass that prefixes messages with a custom name. |
| `Tools.TypeOrmExceptionFilter` | Maps Postgres unique-violation (and MySQL FK) errors to friendly HTTP 400s; customize per constraint with `TypeOrmExceptionFilter.setUniqueConstraintMessage()`. |
| `Tools.VirtualColumn` | Decorator (+ a `SelectQueryBuilder` patch applied on import) that hydrates entity properties from raw SQL aliases. |

## Install

```bash
yarn add @boarteam/boar-pack-common-backend
```

**Peer requirements (currently undeclared):** the manifest only declares
`@nestjs/websockets`, `lossless-json` and `reflect-metadata`; the code also
imports `@nestjs/common`, `@nestjs/core`, `@nestjs/config`,
`@nestjs/schedule`, `typeorm`, `joi` and `ws` from the **host application**.
Any NestJS 11 app with TypeORM has these already — but they must be present.

## Usage

Encryption service:

```ts
import { Module } from '@nestjs/common';
import { ScryptModule, ScryptService } from '@boarteam/boar-pack-common-backend';

@Module({
  imports: [ScryptModule], // requires SCRYPT_SALT and SCRYPT_IV env vars
})
export class AppModule {}

// somewhere in a service:
constructor(private readonly scrypt: ScryptService) {}
async store(secret: string) {
  const encrypted = await this.scrypt.encrypt(secret);
  // … persist; later: await this.scrypt.decrypt(encrypted)
}
```

Clustered workers:

```ts
import {
  ClusterModule,
  ClusterService,
  ClusterInterface,
} from '@boarteam/boar-pack-common-backend';

class WebWorkers implements ClusterInterface {
  async getSettings() {
    return { clusterId: 'web', appRole: 'web' };
  }
  async getWorkersSettings() {
    // one worker per port: PORT = base port + portIncrement
    return [
      { workerId: 1, workerName: 'web-1', portIncrement: 0 },
      { workerId: 2, workerName: 'web-2', portIncrement: 1 },
    ];
  }
}

// register during bootstrap; workers fork on application start
app.get(ClusterService).addCluster(new WebWorkers());
```

The primary process reads `PORT` (required) and forks workers with
`APP_ROLE`, `WORKER`, `WORKER_NAME` and the computed `PORT` in their env;
set `DISABLE_CLUSTER=true` to run single-process.

TypeORM error mapping:

```ts
import { Tools } from '@boarteam/boar-pack-common-backend';

Tools.TypeOrmExceptionFilter.setUniqueConstraintMessage(
  'UQ_user_email',
  'A user with this email already exists',
);
app.useGlobalFilters(new Tools.TypeOrmExceptionFilter());
```

## Stability

Beta. Extracted from production systems and used in real projects, but the
public API surface is still being curated — expect breaking changes between
major versions. Maintained on a best-effort basis; see the
[monorepo README](https://github.com/boarteam/boar-pack#versioning--stability)
for the versioning policy.

## License

[MIT](https://github.com/boarteam/boar-pack/blob/master/LICENSE)
