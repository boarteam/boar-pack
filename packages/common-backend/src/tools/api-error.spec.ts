import type { TApiErrorBodyType } from './ApiError';
import * as Tools from './index';

describe('src/tools/ApiError runtime export surface', () => {
  it('exports nothing at runtime — TApiErrorBodyType is type-only', () => {
    const mod = require('./ApiError');

    const runtimeKeys = Object.keys(mod).filter((k) => k !== '__esModule');
    expect(runtimeKeys).toEqual([]);
  });

  it('does NOT export the ApiError class (intentional current behavior)', () => {
    // The class is declared in the module but never exported, so consumers
    // cannot reach it — neither from the module nor via the Tools barrel.

    const mod = require('./ApiError');

    expect((mod as any).ApiError).toBeUndefined();
    expect((Tools as any).ApiError).toBeUndefined();
  });

  it('TApiErrorBodyType describes the API error body shape', () => {
    // Type-only usage: this compiling (and being erased at runtime) is the
    // whole contract of the module.
    const body: TApiErrorBodyType = {
      statusCode: 400,
      message: 'Validation failed',
      errors: [{ field: 'email', message: 'must be an email' }],
    };

    expect(body.errors[0].field).toBe('email');
  });
});
