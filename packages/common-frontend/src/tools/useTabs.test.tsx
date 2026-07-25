import { describe, expect, it } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { useTabs } from './useTabs';

function Probe({ defaultTab }: { defaultTab: string }) {
  const [tab, setTab] = useTabs<string>(defaultTab);
  const location = useLocation();
  return (
    <div>
      <span data-testid="tab">{tab}</span>
      <span data-testid="search">{location.search}</span>
      <button onClick={() => setTab('details')}>go details</button>
    </div>
  );
}

function renderProbe(initialEntry: string, defaultTab = 'general') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Probe defaultTab={defaultTab} />
    </MemoryRouter>,
  );
}

function currentParams(): URLSearchParams {
  return new URLSearchParams(screen.getByTestId('search').textContent ?? '');
}

describe('useTabs', () => {
  it('falls back to the default tab when the URL has no ?tab= and writes it into the URL', async () => {
    renderProbe('/page');

    expect(screen.getByTestId('tab')).toHaveTextContent('general');
    await waitFor(() => {
      expect(currentParams().get('tab')).toBe('general');
    });
  });

  it('initializes from an existing ?tab= search param', async () => {
    renderProbe('/page?tab=settings');

    expect(screen.getByTestId('tab')).toHaveTextContent('settings');
    await waitFor(() => {
      expect(currentParams().get('tab')).toBe('settings');
    });
  });

  it('updates the URL search param when the tab is changed', async () => {
    const user = userEvent.setup();
    renderProbe('/page?tab=settings');

    await user.click(screen.getByRole('button', { name: 'go details' }));

    expect(screen.getByTestId('tab')).toHaveTextContent('details');
    await waitFor(() => {
      expect(currentParams().get('tab')).toBe('details');
    });
  });

  it('preserves unrelated search params when writing the tab', async () => {
    const user = userEvent.setup();
    renderProbe('/page?foo=1&bar=two');

    await waitFor(() => {
      expect(currentParams().get('tab')).toBe('general');
    });
    expect(currentParams().get('foo')).toBe('1');
    expect(currentParams().get('bar')).toBe('two');

    await user.click(screen.getByRole('button', { name: 'go details' }));

    await waitFor(() => {
      expect(currentParams().get('tab')).toBe('details');
    });
    expect(currentParams().get('foo')).toBe('1');
    expect(currentParams().get('bar')).toBe('two');
  });
});
