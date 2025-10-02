// Ticket DTO from backend
export interface TicketDto {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'New' | 'Attending' | 'Completed' | 'Escalated' | 'Resolved';
  criticalValue?: 'C1' | 'C2' | 'C3';
  expectedCompletionDate: string;
  createdBy: {
    _id: string;
    username: string;
    email: string;
    role: string;
  };
  assignedTo?: {
    _id: string;
    username: string;
    email: string;
    role: string;
  };
  currentLevel: 'L1' | 'L2' | 'L3';
  escalationHistory: Array<{
    fromLevel: string;
    toLevel: string;
    reason: string;
    escalatedBy: {
      _id: string;
      username: string;
      role: string;
    };
    escalatedAt: string;
    notes?: string;
  }>;
  actionLogs: Array<{
    action: string;
    performedBy: {
      _id: string;
      username: string;
      role: string;
    };
    performedAt: string;
    details?: string;
    previousStatus?: string;
    newStatus?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}