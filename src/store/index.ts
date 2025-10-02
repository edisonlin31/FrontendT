import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice.js';
import ticketsSlice from './slices/ticketsSlice.js';
import uiSlice from './slices/uiSlice.js';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    tickets: ticketsSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Completely ignore serialization checks for these actions
        ignoredActions: [
          'persist/PERSIST', 
          'persist/REHYDRATE',
          'tickets/fetchTickets/pending',
          'tickets/fetchTickets/fulfilled',
          'tickets/fetchTickets/rejected',
          'tickets/fetchTicketById/pending',
          'tickets/fetchTicketById/fulfilled',
          'tickets/fetchTicketById/rejected',
          'tickets/createTicket/pending',
          'tickets/createTicket/fulfilled',
          'tickets/createTicket/rejected',
          'tickets/updateStatus/pending',
          'tickets/updateStatus/fulfilled',
          'tickets/updateStatus/rejected',
          'tickets/escalateTicket/pending',
          'tickets/escalateTicket/fulfilled',
          'tickets/escalateTicket/rejected',
          'tickets/resolveTicket/pending',
          'tickets/resolveTicket/fulfilled',
          'tickets/resolveTicket/rejected',
        ],
        // Ignore these paths in the state
        ignoredPaths: ['tickets.tickets', 'tickets.currentTicket'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;