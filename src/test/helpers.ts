import { vi } from 'vitest';

// Mock user data
export const mockUsers = {
  l1User: {
    id: '507f1f77bcf86cd799439011',
    username: 'l1user',
    email: 'l1@example.com',
    role: 'L1' as const,
    password: 'password123'
  },
  l2User: {
    id: '507f1f77bcf86cd799439012',
    username: 'l2user', 
    email: 'l2@example.com',
    role: 'L2' as const,
    password: 'password123'
  },
  l3User: {
    id: '507f1f77bcf86cd799439013',
    username: 'l3user',
    email: 'l3@example.com', 
    role: 'L3' as const,
    password: 'password123'
  }
};

// Mock ticket data
export const mockTickets = [
  {
    id: '507f1f77bcf86cd799439020',
    title: 'Login Issue',
    description: 'User cannot login to the system',
    category: 'Software',
    priority: 'High',
    status: 'Open',
    currentLevel: 'L1',
    createdBy: mockUsers.l1User.id,
    expectedCompletionDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
    criticalValue: 85,
    logs: []
  },
  {
    id: '507f1f77bcf86cd799439021',
    title: 'Email Configuration',
    description: 'Configure email settings for notifications',
    category: 'Configuration',
    priority: 'Medium',
    status: 'In Progress',
    currentLevel: 'L2',
    createdBy: mockUsers.l1User.id,
    expectedCompletionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    criticalValue: 45,
    logs: []
  }
];

// Mock API responses
export const mockApiResponse = {
  success: (data: any) => ({ success: true, data }),
  error: (message: string, errors: string[] = []) => ({ 
    success: false, 
    message, 
    errors 
  })
};

// Mock fetch implementation
export const mockFetch = (response: any, status = 200) => {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response))
  });
};

// Mock localStorage
export const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(), 
  removeItem: vi.fn(),
  clear: vi.fn()
};