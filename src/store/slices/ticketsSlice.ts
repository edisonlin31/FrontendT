import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Ticket, TicketStatus, TicketPriority, UserRole } from '../../types';
import { api } from '../../lib/api';
import type { TicketsResult } from '../../lib/api';

interface TicketsState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  filters: {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedTo?: string;
    search?: string;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

const initialState: TicketsState = {
  tickets: [],
  currentTicket: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
};

// Async thunks
export const fetchTickets = createAsyncThunk<TicketsResult, UserRole | undefined, { rejectValue: string }>(
  'tickets/fetchTickets',
  async (role: UserRole | undefined, { rejectWithValue }) => {
    try {
      const result = await api.getTickets({
        level: role,
        page: 1,
        limit: 100,
      });
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch tickets');
    }
  }
);

export const fetchTicketById = createAsyncThunk(
  'tickets/fetchTicketById',
  async (id: string, { rejectWithValue }) => {
    try {
      const ticket = await api.getTicket(id);
      return ticket;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch ticket');
    }
  }
);

export const createTicket = createAsyncThunk(
  'tickets/createTicket',
  async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'logs' | 'currentLevel'>, { rejectWithValue }) => {
    try {
      const ticket = await api.createTicket(ticketData);
      return ticket;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create ticket');
    }
  }
);

export const updateTicketStatus = createAsyncThunk(
  'tickets/updateStatus',
  async ({ id, status }: { id: string; status: TicketStatus }, { rejectWithValue }) => {
    try {
      const ticket = await api.updateTicketStatus(id, status);
      return ticket;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update ticket');
    }
  }
);

export const escalateTicket = createAsyncThunk(
  'tickets/escalateTicket',
  async ({ id, toLevel, reason, notes }: { id: string; toLevel: string; reason: string; notes?: string }, { rejectWithValue }) => {
    try {
      const ticket = await api.escalateTicket(id, toLevel, reason, notes);
      return ticket;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to escalate ticket');
    }
  }
);

export const resolveTicket = createAsyncThunk(
  'tickets/resolveTicket',
  async ({ id, resolution }: { id: string; resolution: string }, { rejectWithValue }) => {
    try {
      const ticket = await api.resolveTicket(id, resolution);
      return ticket;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to resolve ticket');
    }
  }
);

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<Partial<TicketsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setPagination: (state, action: PayloadAction<Partial<TicketsState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tickets
      .addCase(fetchTickets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tickets = action.payload.tickets;
        state.pagination.total = action.payload.pagination.totalItems;
        state.pagination.page = action.payload.pagination.currentPage;
        state.pagination.pageSize = action.payload.tickets.length || state.pagination.pageSize;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch ticket by ID
      .addCase(fetchTicketById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTicket = action.payload;
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create ticket
      .addCase(createTicket.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.isCreating = false;
        state.tickets.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      // Update ticket status
      .addCase(updateTicketStatus.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.tickets.findIndex(ticket => ticket.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        if (state.currentTicket?.id === action.payload.id) {
          state.currentTicket = action.payload;
        }
      })
      .addCase(updateTicketStatus.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      // Escalate ticket
      .addCase(escalateTicket.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(escalateTicket.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.tickets.findIndex(ticket => ticket.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        if (state.currentTicket?.id === action.payload.id) {
          state.currentTicket = action.payload;
        }
      })
      .addCase(escalateTicket.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      // Resolve ticket
      .addCase(resolveTicket.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(resolveTicket.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.tickets.findIndex(ticket => ticket.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        if (state.currentTicket?.id === action.payload.id) {
          state.currentTicket = action.payload;
        }
      })
      .addCase(resolveTicket.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setFilters, clearFilters, setPagination, clearCurrentTicket } = ticketsSlice.actions;
export default ticketsSlice.reducer;