import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { LoginPage } from '../../../pages/LoginPage';
import authReducer from '../../../store/slices/authSlice';
import ticketsReducer from '../../../store/slices/ticketsSlice';
import uiReducer from '../../../store/slices/uiSlice';

// Mock the API calls
vi.mock('../../../lib/api', () => ({
  api: {
    login: vi.fn().mockResolvedValue({
      id: 'user-id',
      email: 'test@example.com',
      username: 'testuser',
      role: 'L1',
      name: 'Test User'
    }),
  },
}));
import { api } from '../../../lib/api';

const createTestStore = (initialAuthState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      tickets: ticketsReducer,
      ui: uiReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        ...initialAuthState,
      },
    },
  });
};

const TestWrapper = ({ 
  children, 
  initialAuthState = {} 
}: { 
  children: React.ReactNode;
  initialAuthState?: Record<string, unknown>;
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const store = createTestStore(initialAuthState);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText('Welcome back! Please sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    // Use an email that passes native email validation but fails zod (.email requires TLD)
    fireEvent.change(emailInput, { target: { value: 'invalid@example' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('should show loading state when login is in progress', () => {
    render(
      <TestWrapper initialAuthState={{ isLoading: true }}>
        <LoginPage />
      </TestWrapper>
    );

    const loadingButton = screen.getByRole('button', { name: /signing in/i });
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveTextContent(/Signing in/i);
  });

  it('should show error message when login fails', () => {
    const errorMessage = 'Invalid credentials';
    
    render(
      <TestWrapper initialAuthState={{ error: errorMessage }}>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
  });

  it('should submit form and update auth state when valid data is provided', async () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <QueryClientProvider client={new QueryClient()}>
          <BrowserRouter>
            <LoginPage />
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Assert API was called with credentials (ensures thunk dispatched)
    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    // Assert auth state eventually reflects logged in user
    await waitFor(() => {
      const state = store.getState().auth;
      expect(state.user?.email).toBe('test@example.com');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });
  });

  it('should handle demo account buttons', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    // Find and click the L1 Agent demo button
    const l1Button = screen.getByText('L1 Agent');
    expect(l1Button).toBeInTheDocument();
    
    fireEvent.click(l1Button);
    
    await waitFor(() => {
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      
      expect(emailInput.value).toBe('l1@helpdesk.com');
      expect(passwordInput.value).toBe('password123');
    });
  });
});