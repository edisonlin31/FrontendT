import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { AutoPageHeader } from '../components/ui/AutoPageHeader';
import { getStatusColor, getPriorityColor, formatDate } from '../lib/utils';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTickets } from '../store/slices/ticketsSlice';
import { api } from '../lib/api';
import type { TicketsResult } from '../lib/api';
import type { Ticket } from '../types';
import { TrendingUp, Clock, AlertTriangle } from 'lucide-react';

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  
  // Use React Query as fallback while Redux is being set up
  const { data: ticketsResult, isLoading, isError, error, refetch } = useQuery<TicketsResult>({
    queryKey: ['tickets', currentUser?.role],
    queryFn: () =>
      currentUser
        ? api.getTickets({ level: currentUser.role, page: 1, limit: 100 })
        : Promise.resolve({
            tickets: [],
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalItems: 0,
              hasNext: false,
              hasPrev: false,
            },
          }),
    enabled: !!currentUser,
  });

  const tickets = ticketsResult?.tickets ?? [];

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchTickets(currentUser.role));
    }
  }, [dispatch, currentUser]);

  const stats = {
    total: ticketsResult?.pagination.totalItems ?? tickets.length,
    open: tickets.filter((t: Ticket) => ['New', 'Attending', 'Escalated'].includes(t.status)).length,
    highPriority: tickets.filter((t: Ticket) => t.priority === 'High').length,
    overdue: tickets.filter((t: Ticket) => new Date(t.expectedCompletionDate) < new Date() && t.status !== 'Resolved').length,
  };

  const recentTickets = [...tickets]
    .sort((a: Ticket, b: Ticket) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (!currentUser || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <div className="p-8 text-center">
            <div className="mb-6">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Error Loading Data
            </h2>
            <p className="text-gray-600 mb-6">
              {error instanceof Error 
                ? error.message 
                : 'Unable to load dashboard data. Please check your connection and try again.'}
            </p>
            <Button 
              onClick={() => refetch()}
              className="w-full"
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Main Container with Border and Custom Rounded Corners */}
      <Card variant="rounded-2xl">
        {/* Header Section */}
        <AutoPageHeader
          currentUser={currentUser}
          customTitle="Dashboard"
          showBreadcrumbs={false}
        >
          <div className="mt-4">
            <p className="text-gray-600">Welcome back, {currentUser?.name}</p>
          </div>
        </AutoPageHeader>

        {/* Content Section */}
        <div className="p-3 sm:p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-gray-600">
                  All tickets in your scope
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
                <p className="text-xs text-gray-600">
                  Awaiting resolution
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
                <p className="text-xs text-gray-600">
                  Requires immediate attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.overdue}</div>
                <p className="text-xs text-gray-600">
                  Past expected completion
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Tickets */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Tickets</CardTitle>
                <Link to="/tickets">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentTickets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No tickets found
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTickets.map((ticket: Ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/tickets/${ticket.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-primary-600"
                        >
                          {ticket.title}
                        </Link>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant='status' className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                          <Badge variant='status' className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {ticket.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-900">
                          {formatDate(ticket.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Due: {formatDate(ticket.expectedCompletionDate)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          
        </div>
      </Card>
    </div>
  );
}