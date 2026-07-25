import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MultiStringSelect } from './MultiStringSelect';

// antd's generated select-dropdown stylesheet contains a selector that nwsapi
// cannot parse, which makes jsdom's getComputedStyle (used by user-event on
// every pointer/keyboard step) throw. Treat invalid selectors as "no match".
const rawQuerySelectorAll = Element.prototype.querySelectorAll;
Element.prototype.querySelectorAll = function (selector: string) {
  try {
    return rawQuerySelectorAll.call(this, selector);
  } catch {
    return rawQuerySelectorAll.call(this, '.__invalid_selector_no_match__');
  }
} as typeof Element.prototype.querySelectorAll;

describe('MultiStringSelect', () => {
  it('renders a tags-mode select reflecting the current value', () => {
    const { container } = render(<MultiStringSelect value={['alpha', 'beta']} />);
    expect(container.querySelector('.ant-select-multiple')).toBeTruthy();
    // jsdom measures zero width, so the responsive maxTagCount collapses the
    // tags into the "+ N ..." rest indicator; assert on the collapsed count.
    expect(container.querySelector('.ant-select-selection-overflow')).toBeTruthy();
    expect(container.textContent).toContain('...');
  });

  it('adds a typed string on Enter and calls onChange with a string[]', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MultiStringSelect value={['alpha']} onChange={onChange} />);

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    await user.type(combobox, 'gamma');
    fireEvent.keyDown(combobox, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13 });

    expect(onChange).toHaveBeenCalledTimes(1);
    const emitted = onChange.mock.calls[0][0];
    expect(emitted).toEqual(['alpha', 'gamma']);
    emitted.forEach((item: unknown) => expect(typeof item).toBe('string'));
  });

  it('starts from an empty list when no value is provided', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MultiStringSelect onChange={onChange} />);

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    await user.type(combobox, 'first');
    fireEvent.keyDown(combobox, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13 });

    expect(onChange).toHaveBeenCalledWith(['first'], expect.anything());
  });

  it('shows the manual-entry hint when there are no options', async () => {
    const user = userEvent.setup();
    render(<MultiStringSelect />);

    await user.click(screen.getByRole('combobox'));

    expect(await screen.findByText('Enter manually')).toBeInTheDocument();
  });

  it('clears all values via the clear icon and reports an empty string[]', () => {
    const onChange = vi.fn();
    const { container } = render(
      <MultiStringSelect value={['alpha', 'beta']} onChange={onChange} />,
    );

    const clearIcon = container.querySelector('.ant-select-clear')!;
    expect(clearIcon).toBeTruthy();
    fireEvent.mouseDown(clearIcon);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toEqual([]);
  });
});
