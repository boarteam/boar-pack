export default async function globalTeardown() {
  await (globalThis as any).__PG_CONTAINER__?.stop();
}
