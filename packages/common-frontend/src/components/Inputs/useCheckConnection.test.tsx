import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCheckConnection } from './useCheckConnection';

type Request = () => Promise<{ success: boolean; message?: string }>;

function Harness({ request }: { request: Request }) {
  const { button } = useCheckConnection({
    defaultSuccessMessage: 'Connection OK',
    defaultErrorMessage: 'Connection failed',
    request,
  });
  return <>{button}</>;
}

describe('useCheckConnection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a Test button and does not call the request until clicked', () => {
    const request = vi.fn().mockResolvedValue({ success: true });
    render(<Harness request={request} />);

    expect(screen.getByRole('button', { name: 'Test' })).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  it('shows the default success message and a check icon on success', async () => {
    const user = userEvent.setup();
    const request = vi.fn().mockResolvedValue({ success: true });
    const { container } = render(<Harness request={request} />);

    await user.click(screen.getByRole('button', { name: 'Test' }));

    expect(request).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Connection OK')).toBeInTheDocument();
    await waitFor(() => expect(container.querySelector('.anticon-check')).toBeTruthy());
    expect(container.querySelector('.ant-btn-dangerous')).toBeFalsy();
  });

  it('prefers the server-provided success message', async () => {
    const user = userEvent.setup();
    const request = vi.fn().mockResolvedValue({ success: true, message: 'All good over here' });
    render(<Harness request={request} />);

    await user.click(screen.getByRole('button', { name: 'Test' }));

    expect(await screen.findByText('All good over here')).toBeInTheDocument();
  });

  it('shows the error message, danger styling and warning icon on failure', async () => {
    const user = userEvent.setup();
    const request = vi.fn().mockResolvedValue({ success: false, message: 'Connection refused' });
    const { container } = render(<Harness request={request} />);

    await user.click(screen.getByRole('button', { name: 'Test' }));

    expect(await screen.findByText('Connection refused')).toBeInTheDocument();
    await waitFor(() => expect(container.querySelector('.ant-btn-dangerous')).toBeTruthy());
    expect(container.querySelector('.anticon-warning')).toBeTruthy();
  });

  it('falls back to the default error message when the server sends none', async () => {
    const user = userEvent.setup();
    const request = vi.fn().mockResolvedValue({ success: false });
    render(<Harness request={request} />);

    await user.click(screen.getByRole('button', { name: 'Test' }));

    expect(await screen.findByText('Connection failed')).toBeInTheDocument();
  });

  it('logs and swallows a rejected request without showing a message', async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const boom = new Error('network down');
    const request = vi.fn().mockRejectedValue(boom);
    render(<Harness request={request} />);

    await user.click(screen.getByRole('button', { name: 'Test' }));

    await waitFor(() => expect(consoleError).toHaveBeenCalledWith(boom));
    expect(screen.queryByText('Connection failed')).not.toBeInTheDocument();
    expect(screen.queryByText('Connection OK')).not.toBeInTheDocument();
  });
});
