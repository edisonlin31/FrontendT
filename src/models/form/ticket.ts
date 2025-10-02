import type { TicketCategory, TicketPriority, CriticalValue } from '../../types';

// Ticket Creation Form
export interface TicketForm {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  expectedCompletionDate: string;
}

// Escalation Form
export interface EscalationForm {
  notes: string;
  criticalValue?: CriticalValue;
}

// Action Log Form
export interface ActionLogForm {
  action: string;
  details: string;
}

// Ticket Status Update Form
export interface StatusUpdateForm {
  status: string;
  criticalValue?: string;
}

// Critical Value Update Form
export interface CriticalValueForm {
  criticalValue: string;
}

// Ticket Resolution Form
export interface ResolutionForm {
  resolution: string;
}