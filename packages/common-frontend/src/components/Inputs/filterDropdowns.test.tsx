import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import {
  booleanFilters,
  CheckboxFilterDropdown,
  DynamicOptionsFilterDropdown,
  NumberFilterDropdown,
  NumberRangeFilterDropdown,
  StringFilterDropdown,
  SwitchFilterDropdown,
} from './filterDropdowns';

const makeProps = (selectedKeys: React.Key[] = []): FilterDropdownProps => ({
  selectedKeys,
  setSelectedKeys: vi.fn(),
  confirm: vi.fn(),
  clearFilters: vi.fn(),
  close: vi.fn(),
  prefixCls: 'ant-table-filter',
  visible: true,
  filters: undefined,
});

describe('booleanFilters', () => {
  it('exposes Disabled=0 and Enabled=1 options', () => {
    expect(booleanFilters).toHaveLength(2);
    expect(booleanFilters[0].value).toBe(0);
    expect(booleanFilters[1].value).toBe(1);

    render(<>{booleanFilters.map((f, i) => <span key={i}>{f.text}</span>)}</>);
    expect(screen.getByText('Disabled')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });
});

describe('DynamicOptionsFilterDropdown', () => {
  it('renders children and confirms on OK', async () => {
    const user = userEvent.setup();
    const confirm = vi.fn();
    const clearFilters = vi.fn();
    render(
      <DynamicOptionsFilterDropdown confirm={confirm} clearFilters={clearFilters}>
        <div>custom child</div>
      </DynamicOptionsFilterDropdown>,
    );

    expect(screen.getByText('custom child')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(clearFilters).not.toHaveBeenCalled();
  });

  it('clears and confirms on Reset', async () => {
    const user = userEvent.setup();
    const confirm = vi.fn();
    const clearFilters = vi.fn();
    render(
      <DynamicOptionsFilterDropdown confirm={confirm} clearFilters={clearFilters}>
        <div />
      </DynamicOptionsFilterDropdown>,
    );

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(clearFilters).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveBeenCalledTimes(1);
  });
});

describe('StringFilterDropdown', () => {
  it('pushes the typed text through setSelectedKeys', () => {
    const props = makeProps();
    render(<StringFilterDropdown {...props} />);

    fireEvent.change(screen.getByPlaceholderText('Please Enter'), {
      target: { value: 'hello' },
    });

    expect(props.setSelectedKeys).toHaveBeenCalledWith(['hello']);
  });

  it('shows the current key and confirms on Enter', () => {
    const props = makeProps(['abc']);
    render(<StringFilterDropdown {...props} />);

    const input = screen.getByPlaceholderText('Please Enter') as HTMLInputElement;
    expect(input.value).toBe('abc');

    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13 });
    expect(props.confirm).toHaveBeenCalledTimes(1);
  });
});

describe('NumberFilterDropdown', () => {
  it('emits the numeric value via setSelectedKeys', () => {
    const props = makeProps();
    render(<NumberFilterDropdown {...props} />);

    fireEvent.change(screen.getByPlaceholderText('Please Enter'), {
      target: { value: '42' },
    });

    expect(props.setSelectedKeys).toHaveBeenCalledWith([42]);
  });

  it('renders the existing key and confirms on Enter', () => {
    const props = makeProps([7]);
    render(<NumberFilterDropdown {...props} />);

    const input = screen.getByPlaceholderText('Please Enter') as HTMLInputElement;
    expect(input.value).toBe('7');

    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13 });
    expect(props.confirm).toHaveBeenCalledTimes(1);
  });
});

describe('NumberRangeFilterDropdown', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('syncs a pre-selected [from, to] range back through setSelectedKeys on mount', () => {
    const props = makeProps([5, 10]);
    render(<NumberRangeFilterDropdown {...props} />);

    const from = screen.getByPlaceholderText('From') as HTMLInputElement;
    const to = screen.getByPlaceholderText('To') as HTMLInputElement;
    expect(from.value).toBe('5');
    expect(to.value).toBe('10');
    expect(props.setSelectedKeys).toHaveBeenCalledWith([5, 10]);
  });

  it('updates the range when the From bound changes', () => {
    const props = makeProps([5, 10]);
    render(<NumberRangeFilterDropdown {...props} />);

    fireEvent.change(screen.getByPlaceholderText('From'), { target: { value: '3' } });

    expect(props.setSelectedKeys).toHaveBeenLastCalledWith([3, 10]);
  });

  it('confirms on Enter in either bound', () => {
    const props = makeProps([5, 10]);
    render(<NumberRangeFilterDropdown {...props} />);

    fireEvent.keyDown(screen.getByPlaceholderText('To'), {
      key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
    });
    expect(props.confirm).toHaveBeenCalledTimes(1);
  });

  // BUG (current behavior): when no range is selected yet, `range` is
  // undefined and the change handler does `[value, prev[1]]` where prev is
  // undefined, so typing into either input throws a TypeError.
  it('currently crashes when typing into a bound while no range is selected', () => {
    class Boundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
      state = { error: null as Error | null };
      static getDerivedStateFromError(error: Error) {
        return { error };
      }
      render() {
        return this.state.error
          ? <div data-testid="crash">{this.state.error.name}</div>
          : this.props.children;
      }
    }

    const props = makeProps([]);
    render(
      <Boundary>
        <NumberRangeFilterDropdown {...props} />
      </Boundary>,
    );

    fireEvent.change(screen.getByPlaceholderText('From'), { target: { value: '1' } });

    expect(screen.getByTestId('crash')).toHaveTextContent('TypeError');
  });
});

describe('SwitchFilterDropdown', () => {
  it('renders the label and emits 1 when switched on', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<SwitchFilterDropdown {...props} />);

    expect(screen.getByText('Only filled values')).toBeInTheDocument();
    await user.click(screen.getByRole('switch'));

    expect(props.setSelectedKeys).toHaveBeenCalledWith([1]);
  });

  it('emits 0 when switched off from a selected state', async () => {
    const user = userEvent.setup();
    const props = makeProps([1]);
    render(<SwitchFilterDropdown {...props} />);

    const switchEl = screen.getByRole('switch');
    expect(switchEl).toHaveAttribute('aria-checked', 'true');
    await user.click(switchEl);

    expect(props.setSelectedKeys).toHaveBeenCalledWith([0]);
  });
});

describe('CheckboxFilterDropdown', () => {
  it('is indeterminate with a hint when nothing is selected, and emits 1 on check', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    const { container } = render(<CheckboxFilterDropdown {...props} />);

    expect(screen.getByText('Click to filter')).toBeInTheDocument();
    expect(container.querySelector('.ant-checkbox-indeterminate')).toBeTruthy();

    await user.click(screen.getByRole('checkbox'));
    expect(props.setSelectedKeys).toHaveBeenCalledWith([1]);
  });

  it('describes the filled-values state and emits 0 on uncheck', async () => {
    const user = userEvent.setup();
    const props = makeProps([1]);
    render(<CheckboxFilterDropdown {...props} />);

    expect(screen.getByText('Will show only filled values')).toBeInTheDocument();
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(props.setSelectedKeys).toHaveBeenCalledWith([0]);
  });

  it('describes the empty-values state when 0 is selected', () => {
    render(<CheckboxFilterDropdown {...makeProps([0])} />);
    expect(screen.getByText('Will show only empty values')).toBeInTheDocument();
  });
});
