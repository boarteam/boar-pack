import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import safetyRunDefault, { safetyRun } from './safetyRun';

function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('safetyRun', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lets a resolved promise pass through silently', async () => {
    expect(safetyRun(Promise.resolve('ok'))).toBeUndefined();
    await flush();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('catches a rejected promise (no unhandled rejection) and logs the error', async () => {
    const failure = new Error('boom');
    safetyRun(Promise.reject(failure));

    // If the rejection were unhandled, vitest would fail the run.
    await flush();
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(failure);
  });

  it('logs non-Error rejection reasons as-is', async () => {
    safetyRun(Promise.reject('plain string reason'));
    await flush();
    expect(console.error).toHaveBeenCalledWith('plain string reason');
  });

  it('tolerates undefined / missing input', async () => {
    expect(() => safetyRun(undefined)).not.toThrow();
    expect(() => safetyRun()).not.toThrow();
    await flush();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('is also exposed as the default export', () => {
    expect(safetyRunDefault).toBe(safetyRun);
  });
});
