import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Layout } from '../../../components/Layout';
import type { User } from '../../../types';

const renderLayout = (user: User | null, children?: React.ReactNode) => {
  return render(
    <MemoryRouter initialEntries={['/']}> 
      <Layout currentUser={user} onLogout={vi.fn()}>
        {children || <div data-testid="content">Inner Content</div>}
      </Layout>
    </MemoryRouter>
  );
};

describe('Layout', () => {
  const mockUser: User = {
    id: 'u1',
    username: 'agent',
    email: 'agent@example.com',
    role: 'L1',
    name: 'Agent One'
  };

  it('renders navigation items for user role', () => {
    renderLayout(mockUser);
    const links = screen.getAllByRole('link');
    const linkTexts = links.map(l => l.textContent || '');
    expect(linkTexts.some(t => /Dashboard/.test(t))).toBe(true);
    expect(linkTexts.some(t => /My Tickets/.test(t))).toBe(true);
  });

  it('toggles mobile menu', async () => {
    // Simulate mobile by ensuring no md breakpoint (jsdom default width works; sidebar hidden, button rendered)
    renderLayout(mockUser);
    // Icon mocks render as string containing 'menu-icon', locate that button
    const candidate = screen.getAllByRole('button').find(btn => /menu-icon/.test(btn.textContent || ''));
    expect(candidate).toBeTruthy();
    fireEvent.click(candidate!);
    await waitFor(() => {
      expect(document.body.querySelector('.fixed.inset-0')).toBeTruthy();
    });
  });
});
