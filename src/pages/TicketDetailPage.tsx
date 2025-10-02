import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { AutoPageHeader } from '../components/ui/AutoPageHeader';
import { getStatusColor, getLevelColor, formatDate, getPriorityColor, cn } from '../lib/utils';
import { getCriticalValueDisplay } from '../lib/criticalValueUtils';
import { getErrorMessage } from '../lib/errorUtils';
import { api } from '../lib/api';
import type { User, TicketStatus, CriticalValue } from '../types';
import { Clock, User as UserIcon, Calendar, AlertTriangle } from 'lucide-react';

interface TicketDetailPageProps {
  currentUser: User;
}

const escalationSchema = z.object({
  criticalValue: z.enum(['C1', 'C2', 'C3']).optional(),
});

type EscalationFormData = z.infer<typeof escalationSchema>;

export function TicketDetailPage({ currentUser }: TicketDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: ticket, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => api.getTicket(id!),
    enabled: !!id,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale to ensure fresh data
    retry: false,
  });

  const [selectedCriticalValue, setSelectedCriticalValue] = useState<CriticalValue | ''>(ticket?.criticalValue || '');

  // Update selected critical value when ticket data changes
  useEffect(() => {
    if (ticket?.criticalValue) {
      setSelectedCriticalValue(ticket.criticalValue);
    }
  }, [ticket?.criticalValue]);

  // Reusable CSS class for form labels
  const labelClass = "text-sm font-medium text-foreground";

  const updateStatusMutation = useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: TicketStatus }) =>
      api.updateTicketStatus(ticketId, status),
    onSuccess: () => {
      // Immediately invalidate and refetch the ticket data
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      
      // Force an immediate refetch to update the UI
      refetch();
      
      toast.success('Ticket status updated successfully!');
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error) || 'Failed to update ticket status';
      toast.error(errorMessage);
    },
  });

  const escalateMutation = useMutation({
    mutationFn: ({ ticketId, toLevel }: { ticketId: string; toLevel: string }) =>
      api.escalateTicket(ticketId, toLevel, 'Escalated by system'),
    onSuccess: (_, variables) => {
      // Immediately invalidate and refetch the ticket data
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      
      // Force an immediate refetch to update the UI
      refetch();
      
      escalationForm.reset();
      toast.success(`Ticket escalated to ${variables.toLevel} successfully!`);
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error) || 'Failed to escalate ticket';
      toast.error(errorMessage);
    },
  });

  const updateCriticalValueMutation = useMutation({
    mutationFn: ({ ticketId, criticalValue }: { ticketId: string; criticalValue: CriticalValue }) =>
      api.updateCriticalValue(ticketId, criticalValue),
    onSuccess: () => {
      // Immediately invalidate and refetch the ticket data
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      
      // Force an immediate refetch to update the UI
      refetch();
      
      toast.success('Critical value updated successfully!');
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error) || 'Failed to update critical value';
      toast.error(errorMessage);
    },
  });

  const escalationForm = useForm<EscalationFormData>({
    resolver: zodResolver(escalationSchema),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading ticket...</div>
      </div>
    );
  }

  if (isError) {
    const message = getErrorMessage(error) || 'Failed to load ticket';
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900">Unable to load ticket</h2>
        <p className="text-gray-600 mt-2">{message}</p>
        <Button onClick={() => navigate('/tickets')} className="mt-4">
          Back to Tickets
        </Button>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900">Ticket Not Found</h2>
        <p className="text-gray-600 mt-2">The ticket you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/tickets')} className="mt-4">
          Back to Tickets
        </Button>
      </div>
    );
  }

  const canUpdateStatus = (status: TicketStatus) => {
    if (!currentUser) return false;
    
    // L1 can update status on L1 tickets
    if (currentUser.role === 'L1' && ticket.currentLevel === 'L1' && ['New', 'Attending', 'Completed'].includes(status)) return true;
    
    // L2 can update status on L1 and L2 tickets (not L3)
    if (currentUser.role === 'L2' && ['L1', 'L2'].includes(ticket.currentLevel)) return true;
    
    // L3 can update status on any ticket level (with restrictions for L3 critical tickets)
    if (currentUser.role === 'L3') {
      if (ticket.currentLevel === 'L3') {
        // For L3 tickets, only allow if it's C1 or C2
        return ['C1', 'C2'].includes(ticket.criticalValue || '');
      }
      return true; // Can work on L1 and L2 tickets
    }
    
    return false;
  };

  const canEscalate = () => {
    if (!currentUser) return false;
    
    const canEscalateResult = (
      // L1 can escalate to L2
      (currentUser.role === 'L1' && ticket.currentLevel === 'L1' && ticket.status !== 'Completed' && ticket.status !== 'Resolved') ||
      // L2 can escalate to L3 only if critical value is C1 or C2
      (currentUser.role === 'L2' && ticket.currentLevel === 'L2' && ticket.status !== 'Completed' && ticket.status !== 'Resolved' && ['C1', 'C2'].includes(ticket.criticalValue || ''))
    );
    
    return canEscalateResult;
  };

  const canResolve = () => {
    if (!currentUser) return false;
    
    // L1 must be attending first before resolving and can only resolve L1 tickets
    if (currentUser.role === 'L1') {
      return ticket.currentLevel === 'L1' && ticket.status === 'Attending';
    }
    
    // L2 can only resolve L2 tickets (no need to be attending)
    if (currentUser.role === 'L2') {
      return ticket.currentLevel === 'L2';
    }
    
    // L3 can only resolve L3 tickets (no need to be attending, with restrictions for critical tickets)
    if (currentUser.role === 'L3') {
      return ticket.currentLevel === 'L3' && ['C1', 'C2'].includes(ticket.criticalValue || '');
    }
    
    return false;
  };

  const canUpdateCriticalValue = () => {
    if (!currentUser) return false;
    return currentUser.role === 'L2' && ticket.currentLevel === 'L2' && ticket.status !== 'Completed' && ticket.status !== 'Resolved';
  };

  const hasAvailableActions = () => {
    if (new Date(ticket.expectedCompletionDate) < new Date() && ticket.status !== 'Resolved') {
      return false;
    }
    
    return (
      canEscalate() ||
      (canResolve() && !['Completed', 'Resolved'].includes(ticket.status)) ||
      (canUpdateStatus('Attending') && ticket.status === 'New') ||
      (canUpdateStatus('Completed') && ticket.status === 'Attending')
    );
  };

  const handleStatusUpdate = (status: TicketStatus) => {
    updateStatusMutation.mutate({ ticketId: ticket.id, status });
  };

  const handleEscalation = () => {
    // Determine the target level based on current user role
    const targetLevel = currentUser.role === 'L1' ? 'L2' : 'L3'; // L1 goes to L2, L2 goes to L3
    
    escalateMutation.mutate({
      ticketId: ticket.id,
      toLevel: targetLevel,
    });
  };

  const handleCriticalValueChange = (criticalValue: CriticalValue) => {
    updateCriticalValueMutation.mutate({
      ticketId: ticket.id,
      criticalValue,
    });
    setSelectedCriticalValue(criticalValue);
  };

  return (
    <Card variant="rounded-2xl">
      <AutoPageHeader
        currentUser={currentUser}
        customTitle="My Tickets"
      >
        <div className="flex items-center mt-2 space-x-3">
            <Badge variant="status" className={getStatusColor(ticket.status)}>
                {ticket.status}
            </Badge>
            <p className="text-2xl font-semibold truncate min-w-0 flex-1">{ticket.id}</p>
        </div>
      </AutoPageHeader>

      <div className="p-3">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-3">
          {/* Ticket Details */}
          <Card>
            <CardContent>
                <div className='flex items-center space-x-2 mb-4'>
                    <Badge variant="status" className={getLevelColor(ticket.currentLevel)}>
                        {ticket.currentLevel}
                    </Badge>
                    <span className="font-medium text-xl">{ticket.title}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <h4 className="font-medium text-gray-900 mb-1">Category</h4>
                    <p className="text-gray-700">{ticket.category}</p>
                    </div>
                    <div>
                    <h4 className="font-medium text-gray-900 mb-1">Priority</h4>
                      <Badge  variant="status"  className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                        </Badge>
                    </div>
                </div>
                
                <div className='mt-4 rounded-lg p-4 bg-primary-foreground'>
                    <h3 className="font-medium text-muted-foreground mb-1">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
                </div>

                {ticket.escalationNotes && (
                    <div className='mt-4'>
                        <h4 className="font-medium text-gray-900 mb-1">Escalation Notes</h4>
                        <p className="text-gray-700">{ticket.escalationNotes}</p>
                    </div>
                )}

                {ticket.resolution && (
                    <div className='mt-4'>
                        <h4 className="font-medium text-gray-900 mb-1">Resolution</h4>
                        <p className="text-gray-700">{ticket.resolution}</p>
                    </div>
                )}
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.logs.length === 0 ? (
                <p className="text-gray-500">No activity logs yet.</p>
              ) : (
                <div className="space-y-4">
                  {ticket.logs
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((log) => (
                      <div key={log.id} className="flex items-start space-x-3 p-3 bg-primary-foreground rounded-lg">
                        <div className="flex-shrink-0">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{log.userName}</span>
                            <span className="text-sm text-gray-500">{log.action}</span>
                            <span className="text-xs text-gray-400">
                              {formatDate(new Date(log.timestamp))}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{log.details}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Actions */}
          <Card>
              <CardContent>
                {/* Action Buttons */}
                <div className={cn("flex gap-4 mb-4", !hasAvailableActions() && 'hidden')}>
                  {/* Escalation Button */}
                  {canEscalate() && (
                    <Button 
                      onClick={handleEscalation}
                      variant="secondary" 
                      size="sm" 
                      className="flex-1 h-9 px-4 py-2 text-sm font-medium"
                      disabled={escalateMutation.isPending}
                    >
                      {escalateMutation.isPending ? 'Escalating...' : `Escalate to ${currentUser.role === 'L1' ? 'L2' : 'L3'}`}
                    </Button>
                  )}
                  
                  {/* Resolve Button */}
                  {canResolve() && !['Completed', 'Resolved', 'Escalated'].includes(ticket.status) && (
                    <Button 
                      onClick={() => handleStatusUpdate('Completed')}
                      variant="default"
                      size="sm" 
                      className="flex-1 h-9 px-4 py-2 text-sm font-medium"
                      disabled={updateStatusMutation.isPending}
                    >
                      {updateStatusMutation.isPending ? 'Completing...' : 'Resolve Ticket'}
                    </Button>
                  )}

                  {/* Status Update Buttons */}
                  {['New', 'Escalated'].includes(ticket.status) && (
                    <Button
                      onClick={() => handleStatusUpdate('Attending')}
                      variant="default"
                      size="sm"
                      className="flex-1 h-9 px-4 py-2 text-sm font-medium"
                      disabled={updateStatusMutation.isPending}
                    >
                      Start Working
                    </Button>
                  )}
                </div>

                {/* Separator - Only show if there are action buttons */}
                {hasAvailableActions() && (
                  <div className="w-full h-px bg-gray-300 mb-4" />
                )}

                {/* Form Fields */}
                <div className="space-y-4 mb-4">
                  {/* Overdue Warning */}
                  {ticket && new Date(ticket.expectedCompletionDate) < new Date() && ticket.status !== 'Resolved' && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">
                        This ticket is overdue and can't be submitted
                      </span>
                    </div>
                  )}
                  
                  {/* Severity Level - Show for L2 always, or for others only if value exists */}
                  {(currentUser.role === 'L2' || ticket.criticalValue) && (
                    <div className="space-y-1.5">
                      <label className={labelClass}>Severity Level</label>
                      {canUpdateCriticalValue() ? (
                        // Custom styled dropdown for L2 users who can update
                        <div className="relative">
                          <Select
                            options={[
                              { value: 'C1', label: 'Critical (C1)' },
                              { value: 'C2', label: 'High (C2)' },
                              { value: 'C3', label: 'Medium (C3)' }
                            ]}
                            value={selectedCriticalValue}
                            onChange={(value) => handleCriticalValueChange(value as CriticalValue)}
                            className="opacity-0 absolute inset-0 w-full h-full z-10 cursor-pointer"
                            disabled={updateCriticalValueMutation.isPending}
                            customOptionRenderer={(option) => (
                              <div className="flex items-center gap-2 px-2.5 py-0.5 border border-gray-300 rounded-md bg-gray-50 mx-1 my-1">
                                <span className={`text-sm font-bold ${getCriticalValueDisplay(option.value as CriticalValue).color}`}>
                                  {getCriticalValueDisplay(option.value as CriticalValue).icon}
                                </span>
                                <span className="text-sm font-medium text-gray-700">
                                  {getCriticalValueDisplay(option.value as CriticalValue).label}
                                </span>
                              </div>
                            )}
                          />
                          {/* Styled display that looks like the read-only version */}
                          <div className="h-9 w-full border border-gray-300 bg-white rounded-md px-3 py-2 flex items-center pointer-events-none">
                            <div className="flex items-center gap-2 px-2.5 py-0.5 border border-gray-300 rounded-md bg-gray-50">
                              <span className={`text-sm font-bold ${getCriticalValueDisplay(selectedCriticalValue || ticket.criticalValue).color}`}>
                                {getCriticalValueDisplay(selectedCriticalValue || ticket.criticalValue).icon}
                              </span>
                              <span className="text-sm font-medium text-gray-700">
                                {getCriticalValueDisplay(selectedCriticalValue || ticket.criticalValue).label}
                              </span>
                            </div>
                            <div className="ml-auto">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Read-only display for all other users
                        <div className="h-9 w-full border border-gray-300 bg-white rounded-md px-3 py-2 flex items-center">
                          <div className="flex items-center gap-2 px-2.5 py-0.5 border border-gray-300 rounded-md bg-gray-50">
                            <span className={`text-sm font-bold ${getCriticalValueDisplay(ticket.criticalValue).color}`}>
                              {getCriticalValueDisplay(ticket.criticalValue).icon}
                            </span>
                            <span className="text-sm font-medium text-gray-700">
                              {getCriticalValueDisplay(ticket.criticalValue).label}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reported Date & time */}
                  <div className="space-y-1.5">
                    <label className={labelClass}>Reported Date & time</label>
                    <div className="relative mt-1">
                      <Input 
                        value={formatDate(new Date(ticket.createdAt))}
                        className="h-9 border-border bg-white text-sm pl-10"
                        readOnly
                      />
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Due Date</p>
                    <p className={`text-sm ${
                      new Date(ticket.expectedCompletionDate) < new Date() && ticket.status !== 'Resolved'
                        ? 'text-red-600 font-medium'
                        : 'text-gray-600'
                    }`}>
                      {formatDate(new Date(ticket.expectedCompletionDate))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Last Updated</p>
                    <p className="text-sm text-gray-600">{formatDate(new Date(ticket.updatedAt))}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
      </div>
    </Card>
  );
}