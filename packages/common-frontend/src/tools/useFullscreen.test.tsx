import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFullscreen } from './useFullscreen';

let fullscreenEl: Element | null = null;

function Harness() {
  const { isFullscreen, setIsFullscreen, fullscreenClassName, fullscreenButton } = useFullscreen();
  return (
    <div>
      <div data-testid="panel" className={fullscreenClassName}>
        <span data-testid="state">{String(isFullscreen)}</span>
        {fullscreenButton}
      </div>
      <button data-testid="force-on" onClick={() => setIsFullscreen(true)}>
        force fullscreen state
      </button>
    </div>
  );
}

function getFullscreenButton(): HTMLElement {
  return within(screen.getByTestId('panel')).getByRole('button');
}

function fireFullscreenChange() {
  fireEvent(document, new Event('fullscreenchange'));
}

describe('useFullscreen', () => {
  beforeEach(() => {
    fullscreenEl = null;
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => fullscreenEl,
    });
    (document.documentElement as any).requestFullscreen = vi.fn(() => Promise.resolve());
    (document as any).exitFullscreen = vi.fn(() => Promise.resolve());
  });

  afterEach(() => {
    delete (document as any).fullscreenElement;
    delete (document.documentElement as any).requestFullscreen;
    delete (document as any).exitFullscreen;
    vi.restoreAllMocks();
  });

  it('starts not fullscreen with the enter-fullscreen icon and calls no APIs', () => {
    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('false');
    const button = getFullscreenButton();
    expect(button.querySelector('.anticon-fullscreen')).not.toBeNull();
    expect(button.querySelector('.anticon-fullscreen-exit')).toBeNull();
    expect(document.documentElement.requestFullscreen).not.toHaveBeenCalled();
    expect(document.exitFullscreen).not.toHaveBeenCalled();
  });

  it('requests fullscreen on click and flips state on the fullscreenchange event', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const classBefore = screen.getByTestId('panel').className;

    await user.click(getFullscreenButton());
    expect(document.documentElement.requestFullscreen).toHaveBeenCalledTimes(1);
    // State only flips once the browser fires fullscreenchange.
    expect(screen.getByTestId('state')).toHaveTextContent('false');

    fullscreenEl = document.documentElement;
    fireFullscreenChange();

    expect(screen.getByTestId('state')).toHaveTextContent('true');
    const button = getFullscreenButton();
    expect(button.querySelector('.anticon-fullscreen-exit')).not.toBeNull();
    expect(button.querySelector('.anticon-fullscreen')).toBeNull();
    // The container class switches to the fullscreen style.
    expect(screen.getByTestId('panel').className).not.toBe(classBefore);
  });

  it('exits fullscreen on the next click and flips state back', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    fullscreenEl = document.documentElement;
    fireFullscreenChange();
    expect(screen.getByTestId('state')).toHaveTextContent('true');

    await user.click(getFullscreenButton());
    expect(document.exitFullscreen).toHaveBeenCalledTimes(1);
    expect(document.documentElement.requestFullscreen).not.toHaveBeenCalled();

    fullscreenEl = null;
    fireFullscreenChange();
    expect(screen.getByTestId('state')).toHaveTextContent('false');
  });

  it('does not call exitFullscreen when nothing is actually fullscreen', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    // Force the state on without a real fullscreen element.
    await user.click(screen.getByTestId('force-on'));
    expect(screen.getByTestId('state')).toHaveTextContent('true');

    await user.click(getFullscreenButton());
    // document.fullscreenElement is null, so the guard skips exitFullscreen.
    expect(document.exitFullscreen).not.toHaveBeenCalled();
    expect(document.documentElement.requestFullscreen).not.toHaveBeenCalled();
  });

  it('logs and survives a rejected requestFullscreen', async () => {
    const failure = new Error('fullscreen denied');
    (document.documentElement as any).requestFullscreen = vi.fn(() => Promise.reject(failure));
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(getFullscreenButton());

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(failure);
    });
    expect(screen.getByTestId('state')).toHaveTextContent('false');
  });

  it('stops listening to fullscreenchange after unmount', () => {
    const { unmount } = render(<Harness />);
    unmount();

    fullscreenEl = document.documentElement;
    // Should not throw or attempt to update unmounted state.
    expect(() => fireFullscreenChange()).not.toThrow();
  });
});
