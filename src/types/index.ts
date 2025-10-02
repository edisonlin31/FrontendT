export type UserRole = 'L1' | 'L2' | 'L3' | 'ADMIN';

export type TicketStatus = 'New' | 'Attending' | 'Completed' | 'Escalated' | 'Resolved';

export type TicketPriority = 'Low' | 'Medium' | 'High';

export type CriticalValue = 'C1' | 'C2' | 'C3';

export type TicketCategory = 
  | 'Technical Support'
  | 'Software Issue'
  | 'Hardware Issue'
  | 'Network Problem'
  | 'Access Request'
  | 'General Inquiry';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface TicketLog {
  id: string;
  ticketId: string;
  userId: string;
  action: string;
  details: string;
  timestamp: Date;
  userName: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  criticalValue?: CriticalValue;
  expectedCompletionDate: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  assignedTo?: string;
  currentLevel: UserRole;
  escalationNotes?: string;
  resolution?: string;
  logs: TicketLog[];
}

export interface TicketFormData {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  expectedCompletionDate: string;
}

export interface EscalationData {
  notes: string;
  criticalValue?: CriticalValue;
}

export interface ActionLogData {
  action: string;
  details: string;
}