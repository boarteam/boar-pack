import { ApiError, TApiErrorBodyType } from './ApiError';
import * as Tools from './index';

// ApiError declares its fields but has no constructor of its own: instances are
// hydrated by the generated api-client (which assigns url/status/... onto the
// instance). The tests mirror that usage, and the frontend twin's tests in
// common-frontend/src/tools/ApiError.test.ts.
function hydrate(error: ApiError, fields: Record<string, unknown>): ApiError {
  return Object.assign(error, fields);
}

describe('src/tools/ApiError', () => {
  it('exports the ApiError class from the module and the Tools barrel', () => {
    const mod = require('./ApiError');

    expect(mod.ApiError).toBe(ApiError);
    expect((Tools as any).ApiError).toBe(ApiError);
  });

  it('is an Error with the message preserved', () => {
    const error = new ApiError('Bad Request');

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Bad Request');
    expect(typeof error.stack).toBe('string');
  });

  it('preserves url/status/statusText/body/request fields', () => {
    const body: TApiErrorBodyType = {
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

  it('leaves declared fields undefined when nothing hydrates them', () => {
    // No constructor assigns these — a bare instance has no data.
    const error = new ApiError('empty');

    expect(error.url).toBeUndefined();
    expect(error.status).toBeUndefined();
    expect(error.statusText).toBeUndefined();
    expect(error.body).toBeUndefined();
    expect(error.request).toBeUndefined();
  });

  it('TApiErrorBodyType describes the API error body shape', () => {
    const body: TApiErrorBodyType = {
      statusCode: 400,
      message: 'Validation failed',
      errors: [{ field: 'email', message: 'must be an email' }],
    };

    expect(body.errors[0].field).toBe('email');
  });
});
