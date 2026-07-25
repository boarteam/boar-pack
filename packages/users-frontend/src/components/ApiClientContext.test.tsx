import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApiClientProvider, useApiClient } from './ApiClientContext';
import type { ApiClient } from '../tools/api-client/generated';

describe('useApiClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws a descriptive error when used outside the provider', () => {
    // React logs the thrown error via console.error; keep the output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const Probe = () => {
      useApiClient();
      return null;
    };

    expect(() => render(<Probe />)).toThrow(
      'useApiClient must be used within an ApiClientProvider.',
    );
  });

  it('returns exactly the client provided by ApiClientProvider', () => {
    const fakeClient = { users: {}, tokens: {} } as unknown as ApiClient;
    let received: ApiClient | undefined;

    const Probe = () => {
      received = useApiClient();
      return <span>ready</span>;
    };

    render(
      <ApiClientProvider value={fakeClient}>
        <Probe />
      </ApiClientProvider>,
    );

    expect(screen.getByText('ready')).toBeInTheDocument();
    expect(received).toBe(fakeClient);
  });

  it('provides the nearest client when providers are nested', () => {
    const outer = { name: 'outer' } as unknown as ApiClient;
    const inner = { name: 'inner' } as unknown as ApiClient;
    let received: ApiClient | undefined;

    const Probe = () => {
      received = useApiClient();
      return null;
    };

    render(
      <ApiClientProvider value={outer}>
        <ApiClientProvider value={inner}>
          <Probe />
        </ApiClientProvider>
      </ApiClientProvider>,
    );

    expect(received).toBe(inner);
  });
});
