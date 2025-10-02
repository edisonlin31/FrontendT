import toast from 'react-hot-toast';
import type { User, Ticket, TicketLog, UserRole } from '../types';
import type { 
  ApiResponse, 
  AuthResponse, 
  UserDto, 
  TicketDto,
  UserResponse,
  TicketResponse,
  TicketsResponse,
  ActionLogResponse
} from '../models/dto';

// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Local storage for token
const TOKEN_KEY = 'helpdesk_token';
const USER_KEY = 'helpdesk_user';

// Get stored token
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Get stored user
export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

// Set auth data
const setAuthData = (user: User, token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Clear auth data
const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Transform backend user to frontend user
const transformUser = (userDto: UserDto): User => ({
  id: userDto._id,
  username: userDto.username,
  email: userDto.email,
  role: userDto.role,
  name: userDto.username // Use username as name for now
});

// Transform backend ticket to frontend ticket
const transformTicket = (ticketDto: TicketDto): Ticket => {
  // Convert action logs to ticket logs
  const logs: TicketLog[] = ticketDto.actionLogs.map((log, index) => ({
    id: `${ticketDto._id}-log-${index}`,
    ticketId: ticketDto._id,
    userId: log.performedBy._id,
    action: log.action,
    details: log.details || '',
    timestamp: new Date(log.performedAt),
    userName: log.performedBy.username
  }));

  return {
    id: ticketDto._id,
    title: ticketDto.title,
    description: ticketDto.description,
    category: ticketDto.category as Ticket['category'], // Type assertion for categories
    priority: ticketDto.priority,
    status: ticketDto.status,
    criticalValue: ticketDto.criticalValue,
    expectedCompletionDate: new Date(ticketDto.expectedCompletionDate),
    createdAt: new Date(ticketDto.createdAt),
    updatedAt: new Date(ticketDto.updatedAt),
    createdBy: ticketDto.createdBy._id,
    assignedTo: ticketDto.assignedTo?._id,
    currentLevel: ticketDto.currentLevel,
    escalationNotes: ticketDto.escalationHistory.length > 0 
      ? ticketDto.escalationHistory[ticketDto.escalationHistory.length - 1].reason 
      : undefined,
    logs
  };
};

// API request helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    // Handle authentication errors
    if (response.status === 401 || 
        (data.message === 'Token Expired' || 
         data.message === 'Invalid token' || 
         data.message === 'User not found' ||
         (data.errors && data.errors.includes('Invalid token')))) {
      clearAuthData();
      toast.error('Your session has expired. Please login again.');
      
      // Small delay to show toast before redirect
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      message: 'Network error occurred',
      errors: ['Failed to connect to server. Make sure the backend is running ']
    };
  }
};

// API functions
export interface TicketsResult {
  tickets: Ticket[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const defaultPagination: TicketsResult['pagination'] = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  hasNext: false,
  hasPrev: false,
};

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<User> => {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (!response.success) {
      throw new Error(response.errors?.[0] || response.message || 'Login failed');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    const user = transformUser(response.data.user as unknown as UserDto);
    setAuthData(user, response.data.token);
    return user;
  },

  register: async (username: string, email: string, password: string, role: UserRole): Promise<User> => {
    const response = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, role })
    });

    if (!response.success) {
      throw new Error(response.errors?.[0] || response.message || 'Registration failed');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    const user = transformUser(response.data.user as unknown as UserDto);
    setAuthData(user, response.data.token);
    return user;
  },

  logout: async (): Promise<void> => {
    clearAuthData();
  },

  getCurrentUser: (): User | null => {
    return getStoredUser();
  },

  getProfile: async (): Promise<User> => {
    const response = await apiRequest<UserResponse>('/auth/profile');

    if (!response.success) {
      throw new Error(response.errors?.[0] || response.message || 'Failed to get profile');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return transformUser(response.data.user);
  },

  // Tickets
  getTickets: async (filters?: { 
    status?: string; 
    priority?: string; 
    level?: string; 
    page?: number; 
    limit?: number; 
  }): Promise<TicketsResult> => {
    const queryParams = new URLSearchParams();
    
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.priority) queryParams.append('priority', filters.priority);
    if (filters?.level) queryParams.append('level', filters.level);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const endpoint = `/tickets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiRequest<TicketsResponse>(endpoint);

    if (!response.success) {
      throw new Error(response.message || response.errors?.[0] || 'Failed to get tickets');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    const pagination = response.data.pagination
      ? {
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.totalItems,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev,
        }
      : {
          ...defaultPagination,
          totalItems: response.data.tickets.length,
          totalPages: 1,
        };

    return {
      tickets: response.data.tickets.map(transformTicket),
      pagination,
    };
  },

  getTicket: async (id: string): Promise<Ticket | null> => {
    const response = await apiRequest<TicketResponse>(`/tickets/${id}`);

    if (!response.success) {
      if (response.message === 'Ticket not found') {
        return null;
      }
      throw new Error(response.message || response.errors?.[0] || 'Failed to get ticket');
    }

    if (!response.data) {
      return null;
    }

    return transformTicket(response.data.ticket);
  },

  createTicket: async (ticketData: {
    title: string;
    description: string;
    category: string;
    priority: 'Low' | 'Medium' | 'High';
    expectedCompletionDate: Date;
  }): Promise<Ticket> => {
    const response = await apiRequest<TicketResponse>('/tickets', {
      method: 'POST',
      body: JSON.stringify({
        ...ticketData,
        expectedCompletionDate: ticketData.expectedCompletionDate.toISOString()
      })
    });

    if (!response.success) {
      throw new Error(response.message || response.errors?.[0] || 'Failed to create ticket');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return transformTicket(response.data.ticket);
  },

  updateTicketStatus: async (id: string, status: string, criticalValue?: string): Promise<Ticket> => {
    const body: Record<string, unknown> = { status };
    if (criticalValue) {
      body.criticalValue = criticalValue;
    }

    const response = await apiRequest<TicketResponse>(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });

    if (!response.success) {
      throw new Error( response.message || response.errors?.[0] || 'Failed to update ticket status');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return transformTicket(response.data.ticket);
  },

  updateCriticalValue: async (id: string, criticalValue: string): Promise<Ticket> => {
    const response = await apiRequest<TicketResponse>(`/tickets/${id}/critical-value`, {
      method: 'PATCH',
      body: JSON.stringify({ criticalValue })
    });

    if (!response.success) {
      throw new Error(response.message || response.errors?.[0] || 'Failed to update critical value');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return transformTicket(response.data.ticket);
  },

  escalateTicket: async (id: string, toLevel: string, reason: string, notes?: string): Promise<Ticket> => {
    const response = await apiRequest<TicketResponse>(`/tickets/${id}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ toLevel, reason, notes })
    });

    if (!response.success) {
      throw new Error( response.message || response.errors?.[0] ||'Failed to escalate ticket');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return transformTicket(response.data.ticket);
  },

  addTicketLog: async (id: string, action: string, details: string): Promise<Ticket> => {
    const response = await apiRequest<ActionLogResponse>(`/tickets/${id}/action-log`, {
      method: 'POST',
      body: JSON.stringify({ action, details })
    });

    if (!response.success) {
      throw new Error( response.message || response.errors?.[0] || 'Failed to add action log');
    }

    // After adding a log, fetch the updated ticket
    const updatedTicket = await api.getTicket(id);
    if (!updatedTicket) {
      throw new Error('Failed to get updated ticket');
    }

    return updatedTicket;
  },

  resolveTicket: async (id: string, resolution: string): Promise<Ticket> => {
    const response = await apiRequest<TicketResponse>(`/tickets/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution })
    });

    if (!response.success) {
      throw new Error( response.message || response.errors?.[0] || 'Failed to resolve ticket');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return transformTicket(response.data.ticket);
  }
};