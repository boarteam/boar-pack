import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { DataSource, DataSourceOptions } from 'typeorm';

function pgUri(): URL {
  const uri = process.env.TEST_PG_URI;
  if (!uri) {
    throw new Error('TEST_PG_URI is not set — jest global-setup did not run (is Docker up?)');
  }
  return new URL(uri);
}

/**
 * Creates a fresh database inside the shared test container so each suite
 * (and each parallel jest worker) gets full isolation.
 */
export async function createTestDatabase(): Promise<string> {
  const dbName = `test_${randomUUID().replace(/-/g, '')}`;
  const client = new Client({ connectionString: process.env.TEST_PG_URI });
  await client.connect();
  await client.query(`CREATE DATABASE "${dbName}"`);
  await client.end();
  return dbName;
}

export function testDataSourceOptions(
  database: string,
  entities: DataSourceOptions['entities'],
  overrides: Partial<DataSourceOptions> = {},
): DataSourceOptions {
  const uri = pgUri();
  return {
    type: 'postgres',
    host: uri.hostname,
    port: Number(uri.port),
    username: decodeURIComponent(uri.username),
    password: decodeURIComponent(uri.password),
    database,
    entities,
    synchronize: true,
    ...overrides,
  } as DataSourceOptions;
}

/** Convenience: fresh database + initialized standalone DataSource. */
export async function createTestDataSource(
  entities: DataSourceOptions['entities'],
  overrides: Partial<DataSourceOptions> = {},
): Promise<DataSource> {
  const database = await createTestDatabase();
  const ds = new DataSource(testDataSourceOptions(database, entities, overrides));
  await ds.initialize();
  return ds;
}
