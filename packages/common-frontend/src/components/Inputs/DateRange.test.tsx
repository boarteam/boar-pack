import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DateRange } from './DateRange';

// antd's generated picker stylesheets can contain selectors nwsapi cannot
// parse, which makes jsdom's getComputedStyle throw. Treat invalid selectors
// as "no match".
const rawQuerySelectorAll = Element.prototype.querySelectorAll;
Element.prototype.querySelectorAll = function (selector: string) {
  try {
    return rawQuerySelectorAll.call(this, selector);
  } catch {
    return rawQuerySelectorAll.call(this, '.__invalid_selector_no_match__');
  }
} as typeof Element.prototype.querySelectorAll;

const ISO_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const openPicker = () => {
  const [startInput] = screen.getAllByPlaceholderText('Start date');
  fireEvent.mouseDown(startInput);
  fireEvent.click(startInput);
  fireEvent.focus(startInput);
  return startInput;
};

describe('DateRange', () => {
  it('renders a range picker with two inputs', () => {
    render(<DateRange />);
    expect(screen.getByPlaceholderText('Start date')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('End date')).toBeInTheDocument();
  });

  it('shows the preset shortcuts when opened', async () => {
    render(<DateRange />);
    openPicker();

    for (const label of [
      'Today',
      'Yesterday',
      'Last 15 minutes',
      'Last 30 minutes',
      'Last 1 hour',
      'Last 24 hours',
      'Last 7 days',
      'Last 30 days',
      'This month',
      'Last month',
    ]) {
      expect(await screen.findByText(label)).toBeInTheDocument();
    }
  });

  it('emits ISO [from, to] strings when a preset is selected', async () => {
    const onChange = vi.fn();
    render(<DateRange onChange={onChange} />);
    openPicker();

    fireEvent.click(await screen.findByText('Last 1 hour'));

    expect(onChange).toHaveBeenCalledTimes(1);
    const emitted = onChange.mock.calls[0][0];
    expect(Array.isArray(emitted)).toBe(true);
    expect(emitted).toHaveLength(2);
    const [from, to] = emitted;
    expect(from).toMatch(ISO_REGEX);
    expect(to).toMatch(ISO_REGEX);
    const spanMs = new Date(to).getTime() - new Date(from).getTime();
    expect(spanMs).toBeGreaterThanOrEqual(60 * 60 * 1000 - 5000);
    expect(spanMs).toBeLessThanOrEqual(60 * 60 * 1000 + 5000);
  });

  it('emits a day-long range for the Today preset', async () => {
    const onChange = vi.fn();
    render(<DateRange onChange={onChange} />);
    openPicker();

    fireEvent.click(await screen.findByText('Today'));

    const [from, to] = onChange.mock.calls[0][0];
    expect(from).toMatch(ISO_REGEX);
    expect(to).toMatch(ISO_REGEX);
    const fromDate = new Date(from);
    const toDate = new Date(to);
    expect(toDate.getTime()).toBeGreaterThan(fromDate.getTime());
    // start of day .. end of day, expressed in local time serialized to UTC
    expect(toDate.getTime() - fromDate.getTime()).toBeLessThan(24 * 60 * 60 * 1000);
  });

  it('renders provided ISO string values into the inputs', () => {
    render(<DateRange value={['2024-01-02T03:04:05.000Z', '2024-01-03T03:04:05.000Z']} />);

    const start = screen.getByPlaceholderText('Start date') as HTMLInputElement;
    const end = screen.getByPlaceholderText('End date') as HTMLInputElement;
    expect(start.value).toContain('2024-01-0');
    expect(end.value).toContain('2024-01-0');
  });
});
