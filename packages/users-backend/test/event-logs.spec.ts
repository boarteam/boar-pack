import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
  Post,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import request from 'supertest';
import { EventLogsModule } from '../src/event-logs/event-logs.module';
import { EventLogsService } from '../src/event-logs/event-logs.service';
import { SkipEventsLog } from '../src/event-logs/event-logs.interceptor';
import { EventLog, LogLevel, LogType, UserRole } from '../src/event-logs/entities/event-log.entity';
import { Roles, User } from '../src/users/entities/user.entity';
import { createTestDatabase, testDataSourceOptions } from './pg';

const SERVICE_CONFIG = { name: 'test-service', id: 'svc-1' };

@Controller()
class EventLogsTestController {
  @Get('ok')
  ok() {
    return { ok: true };
  }

  @Get('as-user')
  asUser() {
    return { ok: true };
  }

  @Post('items/:id')
  updateItem(@Body() body: Record<string, unknown>) {
    return body;
  }

  // Mirrors local-auth's @SkipEventsLog({ body: ['password'] }) usage
  @SkipEventsLog({ body: ['password'] })
  @Post('secrets')
  secrets() {
    return { done: true };
  }

  @SkipEventsLog()
  @Get('skipped')
  skipped() {
    return { ok: true };
  }

  @Get('bad')
  bad() {
    throw new BadRequestException('nope');
  }

  @Get('boom')
  boom() {
    throw new Error('boom');
  }
}

describe('EventLogsModule.forInterceptor', () => {
  let app: INestApplication;
  let service: EventLogsService;
  let repo: Repository<EventLog>;
  let auditUser: User;

  beforeAll(async () => {
    const db = await createTestDatabase();

    @Module({
      imports: [
        TypeOrmModule.forRoot(testDataSourceOptions(db, [EventLog, User])),
        EventLogsModule.forInterceptor({
          dataSourceName: 'default',
          service: SERVICE_CONFIG,
        }),
      ],
      controllers: [EventLogsTestController],
    })
    class AppModule implements NestModule {
      configure(consumer: MiddlewareConsumer) {
        consumer
          .apply((req: any, res: any, next: any) => {
            req.user = {
              id: auditUser.id,
              name: auditUser.name,
              email: auditUser.email,
              role: auditUser.role,
              permissions: [],
            };
            next();
          })
          .forRoutes('as-user');
      }
    }

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    service = app.get(EventLogsService);
    const dataSource = app.get<DataSource>(getDataSourceToken());
    repo = dataSource.getRepository(EventLog);

    // event_logs.userId has a FK to users, so audit rows need a real user
    auditUser = await dataSource.getRepository(User).save({
      name: 'Audit Admin',
      email: 'audit-admin@test.test',
      role: Roles.ADMIN,
      pass: null,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * Logs are buffered in memory and flushed by a 10s cron; trigger the flush
   * directly and poll until the expected row lands (the cron may race us).
   */
  async function flushAndFind(where: FindOptionsWhere<EventLog>): Promise<EventLog[]> {
    const deadline = Date.now() + 10_000;
    for (;;) {
      await (service as any).saveAccumulatedLogs();
      const rows = await repo.find({ where });
      if (rows.length || Date.now() > deadline) {
        return rows;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  it('writes an audit row for a handled 2xx request with request details captured', async () => {
    await request(app.getHttpServer())
      .get('/ok?probe=1')
      .set('User-Agent', 'jest-agent')
      .expect(200, { ok: true });

    const rows = await flushAndFind({ url: '/ok?probe=1' });
    expect(rows).toHaveLength(1);

    const row = rows[0];
    expect(row).toMatchObject({
      logType: LogType.AUDIT,
      logLevel: LogLevel.INFO,
      action: 'ok', // handler name
      entity: 'EventLogsTestController', // controller name
      method: 'GET',
      url: '/ok?probe=1',
      statusCode: 200,
      userId: null,
      userName: null,
      userRole: UserRole.GUEST,
      userAgent: 'jest-agent',
      service: SERVICE_CONFIG.name,
      serviceId: SERVICE_CONFIG.id,
    });
    expect(row.duration).toBeGreaterThanOrEqual(0);
    expect(row.ipAddress).toEqual(expect.any(String));
  });

  it('captures the authenticated user and maps its role', async () => {
    await request(app.getHttpServer()).get('/as-user').expect(200);

    const rows = await flushAndFind({ url: '/as-user' });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      userId: auditUser.id,
      userName: 'Audit Admin',
      userRole: UserRole.ADMIN,
    });
  });

  it('captures the request body as payload and the :id param as entityId', async () => {
    await request(app.getHttpServer()).post('/items/i-42').send({ foo: 'bar', n: 7 }).expect(201);

    const rows = await flushAndFind({ url: '/items/i-42' });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      action: 'updateItem',
      method: 'POST',
      entityId: 'i-42',
      payload: { foo: 'bar', n: 7 },
    });
  });

  it('@SkipEventsLog({ body: [...] }) logs the request but masks the listed body fields', async () => {
    await request(app.getHttpServer())
      .post('/secrets')
      .send({ login: 'bob', password: 'hunter2' })
      .expect(201, { done: true });

    const rows = await flushAndFind({ url: '/secrets' });
    expect(rows).toHaveLength(1);
    // The row is still written — only the listed fields are replaced with *****
    expect(rows[0].payload).toEqual({ login: 'bob', password: '*****' });
    expect(JSON.stringify(rows[0])).not.toContain('hunter2');
  });

  it('@SkipEventsLog() writes no row at all for a successful request', async () => {
    await request(app.getHttpServer()).get('/skipped').expect(200);
    // Marker request: once its row is flushed, /skipped would have been too
    await request(app.getHttpServer()).get('/ok?marker=skip-check').expect(200);

    const markerRows = await flushAndFind({ url: '/ok?marker=skip-check' });
    expect(markerRows).toHaveLength(1);
    await expect(repo.findBy({ url: '/skipped' })).resolves.toEqual([]);
  });

  it('logs 4xx errors from handlers as warnings with the error status code', async () => {
    await request(app.getHttpServer()).get('/bad').expect(400);

    const rows = await flushAndFind({ url: '/bad' });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      action: 'bad',
      entity: 'EventLogsTestController',
      statusCode: 400,
      logLevel: LogLevel.WARNING,
      logType: LogType.AUDIT,
    });
  });

  it('logs unexpected handler errors as 500 with Error level', async () => {
    await request(app.getHttpServer()).get('/boom').expect(500);

    const rows = await flushAndFind({ url: '/boom' });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      statusCode: 500,
      logLevel: LogLevel.ERROR,
    });
  });

  it('middleware logs unrouted (404) requests that the interceptor never sees', async () => {
    await request(app.getHttpServer()).get('/unknown/path').expect(404);

    const rows = await flushAndFind({ url: '/unknown/path' });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      action: 'GET', // middleware uses the HTTP method as action
      entity: 'Unknown Path', // and a titleized url as entity
      method: 'GET',
      statusCode: 404,
      logLevel: LogLevel.WARNING,
      logType: LogType.AUDIT,
      userRole: UserRole.GUEST,
      service: SERVICE_CONFIG.name,
      serviceId: SERVICE_CONFIG.id,
    });
  });

  it('does not double-log handled requests (middleware defers to the interceptor)', async () => {
    const marker = `/ok?marker=${randomUUID()}`;
    await request(app.getHttpServer()).get(marker).expect(200);

    const rows = await flushAndFind({ url: marker });
    expect(rows).toHaveLength(1);
    expect(rows[0].action).toBe('ok');
  });
});
