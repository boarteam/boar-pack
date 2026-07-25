import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { NumberInputHandlingNewRecord } from './NumberInputHandlingNewRecord';
import { getNewId } from '../Table';

describe('NumberInputHandlingNewRecord', () => {
  it('blanks out the placeholder id of a new record', () => {
    const newId = getNewId(); // e.g. NEW_RECORD0
    render(<NumberInputHandlingNewRecord value={newId} />);
    expect(screen.getByRole('spinbutton')).toHaveValue('');
  });

  it('passes real numeric values through to the input', () => {
    render(<NumberInputHandlingNewRecord value={42} />);
    expect(screen.getByRole('spinbutton')).toHaveValue('42');
  });

  it('keeps zero visible (only NEW_RECORD ids are blanked)', () => {
    render(<NumberInputHandlingNewRecord value={0} />);
    expect(screen.getByRole('spinbutton')).toHaveValue('0');
  });

  it('emits numbers through onChange when the user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NumberInputHandlingNewRecord onChange={onChange} />);

    await user.type(screen.getByRole('spinbutton'), '7');

    expect(onChange).toHaveBeenCalledWith(7);
  });

  it('lets the user replace a blanked new-record id with a number', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NumberInputHandlingNewRecord value={getNewId()} onChange={onChange} />);

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue('');
    await user.type(input, '3');

    expect(onChange).toHaveBeenCalledWith(3);
  });
});
