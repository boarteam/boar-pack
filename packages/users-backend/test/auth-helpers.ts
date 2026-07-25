import request from 'supertest';
import type { Response, Test } from 'supertest';

type THttpServer = Parameters<typeof request>[0];

export const ADMIN_EMAIL = 'test-admin@test.test';
export const ADMIN_PASSWORD = 'test';

export function login(
  server: THttpServer,
  email: string = ADMIN_EMAIL,
  password: string = ADMIN_PASSWORD,
): Test {
  return request(server).post('/auth/login').send({ email, password });
}

export function setCookies(res: Response): string[] {
  const header = res.headers['set-cookie'] as unknown as string | string[] | undefined;
  if (!header) {
    return [];
  }
  return Array.isArray(header) ? header : [header];
}

/** Full Set-Cookie header line for the given cookie name. */
export function findSetCookie(res: Response, name: string): string | undefined {
  return setCookies(res).find((cookie) => cookie.startsWith(`${name}=`));
}

/** Just the value part of the given Set-Cookie header. */
export function setCookieValue(res: Response, name: string): string | undefined {
  const cookie = findSetCookie(res, name);
  return cookie?.split(';')[0].slice(name.length + 1);
}
