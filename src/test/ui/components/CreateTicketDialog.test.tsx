import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateTicketDialog } from '../../../components/ui/CreateTicketDialog';

vi.mock('../../../lib/api', () => ({
  api: {
    createTicket: vi.fn().mockResolvedValue({ id: 't1' })
  }
}));
import { api } from '../../../lib/api';

const Wrapper: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

describe('CreateTicketDialog', () => {
  const onClose = vi.fn();
  beforeEach(() => vi.clearAllMocks());

  it('returns null when closed', () => {
    const { container } = render(<Wrapper><CreateTicketDialog isOpen={false} onClose={onClose} /></Wrapper>);
    expect(container.firstChild).toBeNull();
  });

  it('validates required fields (title & description show errors)', async () => {
    render(<Wrapper><CreateTicketDialog isOpen onClose={onClose} /></Wrapper>);
    fireEvent.click(screen.getByRole('button', { name: /save ticket/i }));
    await waitFor(() => {
      expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Description is required/i)).toBeInTheDocument();
    });
  });

  it('submits valid form', async () => {
    render(<Wrapper><CreateTicketDialog isOpen onClose={onClose} /></Wrapper>);

    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Test Ticket' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Detailed description data' } });

  // Custom Selects: fallback strategy if placeholder inaccessible
    const allButtons = screen.getAllByRole('button');
    const categoryTrigger = allButtons.find(b => /select category/i.test(b.textContent || '')) || allButtons[0];
    fireEvent.click(categoryTrigger);
    fireEvent.click(await screen.findByText('Technical'));

    const priorityTrigger = allButtons.find(b => /select priority/i.test(b.textContent || '')) || allButtons[1];
    fireEvent.click(priorityTrigger);
    fireEvent.click(await screen.findByText('High'));

  // Date: ensure label exists (component uses button, not input placeholder)
  expect(screen.getByText(/Expected Completion Date/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /save ticket/i }));

    await waitFor(() => {
      expect(api.createTicket).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
