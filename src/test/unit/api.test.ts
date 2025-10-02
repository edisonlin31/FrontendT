import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, getToken, getStoredUser } from '../../lib/api';

// Get API base URL from environment or use test default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: {
            _id: 'user123',
            username: 'testuser',
            email: 'test@example.com',
            role: 'L1',
          },
          token: 'mock-token',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await api.login('test@example.com', 'password');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/login`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password',
          }),
        })
      );

      expect(result).toEqual({
        id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'L1',
        name: 'testuser',
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('helpdesk_token', 'mock-token');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'helpdesk_user',
        JSON.stringify(result)
      );
    });

    it('should handle login failure', async () => {
      const mockResponse = {
        success: false,
        message: 'Invalid credentials',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(api.login('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials'
      );

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it('should logout successfully', async () => {
      await api.logout();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('helpdesk_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('helpdesk_user');
    });
  });

  describe('Token Management', () => {
    it('should get token from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('stored-token');

      const token = getToken();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('helpdesk_token');
      expect(token).toBe('stored-token');
    });

    it('should return null when no token exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const token = getToken();

      expect(token).toBeNull();
    });

    it('should get stored user from localStorage', () => {
      const mockUser = {
        id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'L1',
        name: 'testuser',
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

      const user = getStoredUser();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('helpdesk_user');
      expect(user).toEqual(mockUser);
    });

    it('should return null when no user is stored', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const user = getStoredUser();

      expect(user).toBeNull();
    });
  });

  describe('Tickets', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue('valid-token');
    });

    it('should get tickets successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          tickets: [
            {
              _id: 'ticket123',
              title: 'Test Ticket',
              description: 'Test description',
              category: 'Technical Support',
              priority: 'High',
              status: 'New',
              currentLevel: 'L1',
              expectedCompletionDate: '2023-12-31T00:00:00Z',
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z',
              createdBy: { _id: 'user1', username: 'creator' },
              actionLogs: [],
              escalationHistory: [],
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

  const result = await api.getTickets();

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/tickets`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer valid-token',
          }),
        })
      );

      expect(result.tickets).toHaveLength(1);
      expect(result.pagination).toEqual({
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        hasNext: false,
        hasPrev: false,
      });
      expect(result.tickets[0]).toEqual(
        expect.objectContaining({
          id: 'ticket123',
          title: 'Test Ticket',
          status: 'New',
        })
      );
    });

    it('should create ticket successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          ticket: {
            _id: 'new-ticket',
            title: 'New Ticket',
            description: 'New description',
            category: 'Technical Support',
            priority: 'Medium',
            status: 'New',
            currentLevel: 'L1',
            expectedCompletionDate: '2023-12-31T00:00:00Z',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
            createdBy: { _id: 'user1', username: 'creator' },
            actionLogs: [],
            escalationHistory: [],
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const ticketData = {
        title: 'New Ticket',
        description: 'New description',
        category: 'Technical Support',
        priority: 'Medium' as const,
        expectedCompletionDate: new Date('2023-12-31'),
      };

      const result = await api.createTicket(ticketData);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/tickets`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-token',
          }),
          body: JSON.stringify(ticketData),
        })
      );

      expect(result.id).toBe('new-ticket');
      expect(result.title).toBe('New Ticket');
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          success: false,
          message: 'Internal server error',
        }),
      });

      await expect(api.getTickets()).rejects.toThrow('Internal server error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(api.getTickets()).rejects.toThrow('Network error');
    });
  });

  describe('Error Handling', () => {
    it('should handle unauthorized requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          success: false,
          message: 'Unauthorized',
        }),
      });

      await expect(api.getTickets()).rejects.toThrow('Unauthorized');
    });

    it('should handle forbidden requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({
          success: false,
          message: 'Forbidden',
        }),
      });

      await expect(api.getTickets()).rejects.toThrow('Forbidden');
    });

    it('should handle not found requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({
          success: false,
          message: 'Not found',
        }),
      });

      await expect(api.getTicket('nonexistent')).rejects.toThrow('Not found');
    });
  });
});