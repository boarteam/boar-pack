import { PostgreSqlContainer } from '@testcontainers/postgresql';

// Starts one Postgres container for the whole jest run; suites create their
// own databases inside it (see pg.ts) so parallel workers stay isolated.
export default async function globalSetup() {
  try {
    const container = await new PostgreSqlContainer('postgres:13')
      .withDatabase('test')
      .withUsername('test')
      .withPassword('test')
      .start();
    process.env.TEST_PG_URI = container.getConnectionUri();
    (globalThis as any).__PG_CONTAINER__ = container;
  } catch (e) {
    throw new Error('Could not start the Postgres test container. Is Docker running?', {
      cause: e,
    });
  }
}
