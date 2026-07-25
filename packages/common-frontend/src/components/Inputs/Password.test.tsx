import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Password } from './Password';

const PASSWORD_CHARS = /^[0-9A-Za-z!@#$%&]+$/;

describe('Password', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a password input with a placeholder', () => {
    const { container } = render(<Password />);
    const input = screen.getByPlaceholderText('Enter password');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('autocomplete', 'one-time-code');
    // generate + copy buttons
    expect(container.querySelectorAll('button').length).toBeGreaterThanOrEqual(2);
  });

  it('propagates manual typing through onChange events', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Password onChange={onChange} />);

    await user.type(screen.getByPlaceholderText('Enter password'), 'abc');

    expect(onChange).toHaveBeenCalled();
    const lastEvent = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastEvent.target.value).toBe('abc');
  });

  it('generate button fires onChange with a fresh non-empty 10-char password', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<Password onChange={onChange} />);

    const generateButton = container
      .querySelector('.anticon-thunderbolt')!
      .closest('button')!;
    await user.click(generateButton);

    expect(onChange).toHaveBeenCalledTimes(1);
    // Note: the generate handler calls onChange with the raw string, not an
    // input event (relies on antd Form's default getValueFromEvent fallback).
    const generated = onChange.mock.calls[0][0];
    expect(typeof generated).toBe('string');
    expect(generated).toHaveLength(10);
    expect(generated).toMatch(PASSWORD_CHARS);
  });

  it('copy button copies the current value to the clipboard', async () => {
    const user = userEvent.setup();
    let copiedText: string | null = null;
    // antd Typography copyable uses copy-to-clipboard, which selects a
    // temporary DOM node and calls document.execCommand('copy').
    document.execCommand = vi.fn(() => {
      copiedText = document.getSelection()?.toString() ?? null;
      return true;
    });

    const { container } = render(<Password value="s3cret!" />);

    const copyTrigger = container.querySelector('.ant-typography-copy')!;
    await user.click(copyTrigger);

    expect(document.execCommand).toHaveBeenCalledWith('copy');
    expect(copiedText).toBe('s3cret!');
  });
});
