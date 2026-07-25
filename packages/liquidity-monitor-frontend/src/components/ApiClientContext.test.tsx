import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApiClientProvider, useApiClient } from './ApiClientContext';
import type { ApiClient } from '../tools/api-client/generated';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useApiClient', () => {
  it('throws when used outside of an ApiClientProvider', () => {
    // React logs the render error via console.error; keep the output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const Probe = () => {
      useApiClient();
      return <div>should not render</div>;
    };

    expect(() => render(<Probe />)).toThrow(
      'useApiClient must be used within an ApiClientProvider.',
    );
  });

  it('returns the exact client provided by ApiClientProvider', () => {
    const fakeClient = { marker: 'fake-client' } as unknown as ApiClient;
    let received: ApiClient | undefined;

    const Probe = () => {
      received = useApiClient();
      return <div>child content</div>;
    };

    render(
      <ApiClientProvider value={fakeClient}>
        <Probe />
      </ApiClientProvider>,
    );

    expect(received).toBe(fakeClient);
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('resolves the nearest provider when providers are nested', () => {
    const outerClient = { marker: 'outer' } as unknown as ApiClient;
    const innerClient = { marker: 'inner' } as unknown as ApiClient;
    let received: ApiClient | undefined;

    const Probe = () => {
      received = useApiClient();
      return null;
    };

    render(
      <ApiClientProvider value={outerClient}>
        <ApiClientProvider value={innerClient}>
          <Probe />
        </ApiClientProvider>
      </ApiClientProvider>,
    );

    expect(received).toBe(innerClient);
  });

  it('throws when the provider value is undefined', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const Probe = () => {
      useApiClient();
      return null;
    };

    expect(() =>
      render(
        <ApiClientProvider value={undefined}>
          <Probe />
        </ApiClientProvider>,
      ),
    ).toThrow('useApiClient must be used within an ApiClientProvider.');
  });
});
