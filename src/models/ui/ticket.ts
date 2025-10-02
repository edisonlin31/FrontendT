import type { Ticket } from '../../types';

// UI Ticket Actions
export interface TicketAction {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

// UI Ticket List Item
export interface TicketListItem {
  id: string;
  title: string;
  priority: string;
  status: string;
  createdAt: string;
  assignedTo?: string;
  currentLevel: string;
}

// UI Ticket Detail View
export interface TicketDetailView {
  ticket: Ticket;
  actions: TicketAction[];
  canEscalate: boolean;
  canUpdateCritical: boolean;
  canResolve: boolean;
}