// UI Filter Options for Tickets
export interface TicketFilters {
  status?: string;
  priority?: string;
  level?: string;
  page?: number;
  limit?: number;
}

// UI Pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// UI Loading States
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// UI Dialog States
export interface DialogState {
  isOpen: boolean;
  data?: unknown;
}