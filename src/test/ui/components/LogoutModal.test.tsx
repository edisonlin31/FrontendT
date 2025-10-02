import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogoutModal } from '../../../components/ui/LogoutModal';

describe('LogoutModal', () => {
  it('returns null when closed', () => {
    const { container } = render(<LogoutModal isOpen={false} onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders and triggers callbacks', () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(<LogoutModal isOpen onCancel={onCancel} onConfirm={onConfirm} />);

    expect(screen.getByText(/Confirm Logout/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onCancel).toHaveBeenCalled();

    fireEvent.click(screen.getAllByRole('button', { name: /Logout/i })[0]);
    expect(onConfirm).toHaveBeenCalled();
  });
});
