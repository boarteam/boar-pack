import { ArgumentsHost, Logger } from '@nestjs/common';
import {
  Column,
  DataSource,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  QueryFailedError,
  Unique,
} from 'typeorm';
import { TypeOrmExceptionFilter } from '../src/tools/typeorm.execption-filter';
import { createTestDataSource } from './pg';

const UNIQUE_CONSTRAINT = 'uq_tof_users_email';

@Entity('tof_users')
@Unique(UNIQUE_CONSTRAINT, ['email'])
class TofUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;
}

@Entity('tof_posts')
class TofPost {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TofUser, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: TofUser;
}

/** Minimal http ArgumentsHost double exposing express-style status().json() spies. */
function createHost() {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const host = {
    switchToHttp: () => ({ getResponse: () => response }),
    // BaseExceptionFilter reaches the response via getArgByIndex(1)
    getArgByIndex: (index: number) => (index === 1 ? response : undefined),
  } as unknown as ArgumentsHost;
  return { host, response };
}

/** Http adapter double so the BaseExceptionFilter fall-through path is observable. */
function createAdapter() {
  return {
    isHeadersSent: jest.fn().mockReturnValue(false),
    reply: jest.fn(),
    end: jest.fn(),
  };
}

describe('Tools.TypeOrmExceptionFilter (Postgres)', () => {
  let ds: DataSource;
  let user: TofUser;
  let loggerErrorSpy: jest.SpyInstance;

  beforeAll(async () => {
    // Silence the filter's own Logger and BaseExceptionFilter's static logger.
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    ds = await createTestDataSource([TofUser, TofPost]);
    user = await ds.getRepository(TofUser).save({ email: 'dup@example.com' });
    await ds.getRepository(TofPost).save({ user });
  });

  afterAll(async () => {
    delete (TypeOrmExceptionFilter as any).uniqueConstraintMessages[UNIQUE_CONSTRAINT];
    loggerErrorSpy?.mockRestore();
    await ds?.destroy();
  });

  async function provokeUniqueViolation(): Promise<QueryFailedError> {
    try {
      await ds.getRepository(TofUser).insert({ email: 'dup@example.com' });
    } catch (e) {
      return e as QueryFailedError;
    }
    throw new Error('expected duplicate insert to fail');
  }

  it('a duplicate insert raises a real 23505 QueryFailedError with the constraint name', async () => {
    const err = await provokeUniqueViolation();

    expect(err).toBeInstanceOf(QueryFailedError);
    expect((err as any).code).toBe('23505');
    expect((err as any).constraint).toBe(UNIQUE_CONSTRAINT);
  });

  it('turns a unique violation into 400 with the default duplicate message', async () => {
    const err = await provokeUniqueViolation();
    const adapter = createAdapter();
    const filter = new TypeOrmExceptionFilter(adapter as any);
    const { host, response } = createHost();

    filter.catch(err, host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'The record already exists',
      error: 'Bad Request',
    });
    // handled by the filter itself, never delegated to the base filter
    expect(adapter.reply).not.toHaveBeenCalled();
  });

  it('a message registered for an unrelated constraint does not change the default', async () => {
    TypeOrmExceptionFilter.setUniqueConstraintMessage('uq_some_other_table', 'Should not be used');
    const err = await provokeUniqueViolation();
    const filter = new TypeOrmExceptionFilter(createAdapter() as any);
    const { host, response } = createHost();

    filter.catch(err, host);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'The record already exists' }),
    );
  });

  it('uses the custom message registered via setUniqueConstraintMessage', async () => {
    TypeOrmExceptionFilter.setUniqueConstraintMessage(
      UNIQUE_CONSTRAINT,
      'This email is already registered',
    );
    const err = await provokeUniqueViolation();
    const filter = new TypeOrmExceptionFilter(createAdapter() as any);
    const { host, response } = createHost();

    filter.catch(err, host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'This email is already registered',
      error: 'Bad Request',
    });
  });

  it('maps the MySQL foreign-key codes to the 400 "remove related records" message', () => {
    // Cannot be provoked on Postgres — synthesize the driver error shape.
    const driverError = Object.assign(new Error('fk violation'), {
      code: 'ER_ROW_IS_REFERENCED_2',
    });
    const err = new QueryFailedError('DELETE FROM tof_users', [], driverError as any);
    const adapter = createAdapter();
    const filter = new TypeOrmExceptionFilter(adapter as any);
    const { host, response } = createHost();

    filter.catch(err, host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'System cannot remove the record, please remove all related records first',
      error: 'Bad Request',
    });
    expect(adapter.reply).not.toHaveBeenCalled();
  });

  it('a Postgres foreign-key violation (23503) falls through to the base filter as 500', async () => {
    // Only the MySQL FK codes are mapped, so a real pg FK error is NOT turned
    // into a 400 — current behavior, documented on purpose.
    let err: QueryFailedError | undefined;
    try {
      await ds.getRepository(TofUser).delete(user.id);
    } catch (e) {
      err = e as QueryFailedError;
    }
    expect(err).toBeInstanceOf(QueryFailedError);
    expect((err as any).code).toBe('23503');

    const adapter = createAdapter();
    const filter = new TypeOrmExceptionFilter(adapter as any);
    const { host, response } = createHost();

    filter.catch(err!, host);

    // not handled by the filter's own 400 branches...
    expect(response.status).not.toHaveBeenCalled();
    expect(response.json).not.toHaveBeenCalled();
    // ...but delegated to BaseExceptionFilter, which replies 500 via the adapter
    expect(adapter.reply).toHaveBeenCalledWith(
      response,
      expect.objectContaining({ statusCode: 500 }),
      500,
    );
  });

  it('any other QueryFailedError also falls through to the base filter as 500', async () => {
    let err: QueryFailedError | undefined;
    try {
      await ds.query('SELECT * FROM missing_table_42');
    } catch (e) {
      err = e as QueryFailedError;
    }
    expect(err).toBeInstanceOf(QueryFailedError);

    const adapter = createAdapter();
    const filter = new TypeOrmExceptionFilter(adapter as any);
    const { host, response } = createHost();

    filter.catch(err!, host);

    expect(response.status).not.toHaveBeenCalled();
    expect(adapter.reply).toHaveBeenCalledWith(
      response,
      expect.objectContaining({ statusCode: 500 }),
      500,
    );
  });
});
