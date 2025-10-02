import type { UserDto } from './user';
import type { TicketDto } from './ticket';

// Specific API response types
export interface UserResponse {
  user: UserDto;
}

export interface TicketResponse {
  ticket: TicketDto;
}

export interface TicketsResponse {
  tickets: TicketDto[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ActionLogResponse {
  actionLog: {
    action: string;
    performedBy: {
      _id: string;
      username: string;
      role: string;
    };
    performedAt: string;
    details?: string;
  };
}