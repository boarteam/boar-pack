import { describe, expect, it } from 'vitest';
import { ApiError } from './ApiError';

// ApiError declares its fields but has no constructor of its own: instances are
// hydrated by the generated api-client (which assigns url/status/... onto the
// instance). The tests mirror that usage.
function hydrate(error: ApiError, fields: Record<string, unknown>): ApiError {
  return Object.assign(error, fields);
}

describe('ApiError', () => {
  it('is an Error with the message preserved', () => {
    const error = new ApiError('Bad Request');
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Bad Request');
    expect(typeof error.stack).toBe('string');
  });

  it('preserves url/status/statusText/body/request fields', () => {
    const body = {
      statusCode: 400,
      message: 'Validation failed',
      errors: [
        { field: 'name', message: 'name should not be empty' },
        { field: 'email', message: 'email must be an email' },
      ],
    };
    const request = { method: 'POST', url: '/api/users' };
    const error = hydrate(new ApiError('Bad Request'), {
      url: 'http://localhost/api/users',
      status: 400,
      statusText: 'Bad Request',
      body,
      request,
    });

    expect(error.url).toBe('http://localhost/api/users');
    expect(error.status).toBe(400);
    expect(error.statusText).toBe('Bad Request');
    expect(error.body).toBe(body);
    expect(error.request).toBe(request);
  });

  it('matches the TApiErrorBodyType contract that useCreation relies on', () => {
    const error = hydrate(new ApiError('Bad Request'), {
      url: 'http://localhost/api/users',
      status: 400,
      statusText: 'Bad Request',
      body: {
        statusCode: 400,
        message: 'Validation failed',
        errors: [{ field: 'name', message: 'name should not be empty' }],
      },
      request: {},
    }) as any;

    // useCreation's guard: e.body && e.body.statusCode && e.body.errors
    expect(Boolean(error.body && error.body.statusCode && error.body.errors)).toBe(true);

    // useCreation maps body.errors into antd form errors — the shape must hold.
    const formErrors = error.body.errors.map((e: { field: string; message: string }) => ({
      name: e.field,
      errors: [e.message],
    }));
    expect(formErrors).toEqual([
      { name: 'name', errors: ['name should not be empty'] },
    ]);
  });

  it('leaves declared fields undefined when nothing hydrates them', () => {
    // No constructor assigns these — a bare instance has no data.
    const error = new ApiError('empty');
    expect(error.url).toBeUndefined();
    expect(error.status).toBeUndefined();
    expect(error.statusText).toBeUndefined();
    expect(error.body).toBeUndefined();
    expect(error.request).toBeUndefined();
  });
});
