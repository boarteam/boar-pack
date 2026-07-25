import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { NumberSwitch } from './NumberSwitcher';

describe('NumberSwitch', () => {
  it('renders a checked switch when value is 1', () => {
    render(<NumberSwitch value={1} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('renders an unchecked switch when value is 0', () => {
    render(<NumberSwitch value={0} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('renders an unchecked switch when value is undefined', () => {
    render(<NumberSwitch />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('shows numeric children 1/0 instead of booleans', () => {
    const { container } = render(<NumberSwitch value={1} />);
    expect(container.querySelector('.ant-switch-inner-checked')).toHaveTextContent('1');
    expect(container.querySelector('.ant-switch-inner-unchecked')).toHaveTextContent('0');
  });

  it('calls onChange with the number 0 when toggled off', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NumberSwitch value={1} onChange={onChange} />);

    await user.click(screen.getByRole('switch'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(0);
    expect(onChange.mock.calls[0][0]).not.toBe(false);
  });

  it('calls onChange with the number 1 when toggled on', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NumberSwitch value={0} onChange={onChange} />);

    await user.click(screen.getByRole('switch'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(1);
    expect(onChange.mock.calls[0][0]).not.toBe(true);
  });

  it('forwards extra antd Switch props (disabled blocks onChange)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NumberSwitch value={0} onChange={onChange} disabled />);

    const switchEl = screen.getByRole('switch');
    expect(switchEl).toBeDisabled();
    await user.click(switchEl);
    expect(onChange).not.toHaveBeenCalled();
  });
});
