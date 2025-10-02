import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AutoPageHeader } from '../components/ui/AutoPageHeader';
import { CreateTicketDialog } from '../components/ui/CreateTicketDialog';
import { CriticalValueDisplay } from '../components/ui/CriticalValueDisplay';
import { getStatusColor, getPriorityColor, getCriticalColor, formatDate } from '../lib/utils';
import { api } from '../lib/api';
import type { TicketsResult } from '../lib/api';
import type { User, Ticket } from '../types';
import { Plus, Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import EmptyTicketsImage from '../assets/empty_tickets.svg';

interface TicketListPageProps {
  currentUser: User;
}

const columnHelper = createColumnHelper<Ticket>();
const DEFAULT_PAGE_SIZE = 10;
const emptyTicketsResult: TicketsResult = {
  tickets: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  },
};

export function TicketListPage({ currentUser }: TicketListPageProps) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [showCreateTicketPopup, setShowCreateTicketPopup] = useState(false);
  const navigate = useNavigate();
  const [pageIndex, setPageIndex] = useState(0);

  const {
    data: ticketsResult = emptyTicketsResult,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    isPending,
  } = useQuery<TicketsResult>({
    queryKey: ['tickets', { page: pageIndex + 1, limit: DEFAULT_PAGE_SIZE }],
    queryFn: () =>
      api.getTickets({
        page: pageIndex + 1,
        limit: DEFAULT_PAGE_SIZE,
      }),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1, // Retry once on failure
  });

  const tickets = ticketsResult?.tickets ?? [];
  const pagination = ticketsResult?.pagination ?? emptyTicketsResult.pagination;

  useEffect(() => {
    setPageIndex(0);
  }, [globalFilter]);

  useEffect(() => {
    if (isFetching) {
      return;
    }

    const desiredIndex = Math.max(pagination.currentPage - 1, 0);
    if (pageIndex !== desiredIndex) {
      setPageIndex(desiredIndex);
    }
  }, [pagination.currentPage, pageIndex, isFetching]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => (
          <span className="text-primary-600 font-mono text-sm">#{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => (
          <div className="overflow-hidden " style={{ width: '125px', minWidth: '60px', maxWidth: '250px' }}>
            <span 
              className="font-medium text-gray-900 block truncate"
              title={info.getValue()}
            >
              {info.getValue()}
            </span>
            <p className="text-sm text-gray-500 mt-1 truncate" title={info.row.original.category}>
              {info.row.original.category}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => (
          <Badge variant='status' className={getStatusColor(info.getValue())}>
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor('priority', {
        header: 'Priority',
        cell: (info) => (
          <Badge variant='status' className={getPriorityColor(info.getValue())}>
            {info.getValue()}
          </Badge>
        ),
      }),
       columnHelper.accessor('currentLevel', {
        header: 'Support',
        cell: (info) => (
            <Badge variant='level' className={getCriticalColor(info.getValue())}>
              {info.getValue()}
            </Badge>
        ),
      }),
      columnHelper.accessor('criticalValue', {
        header: 'Critical',
        cell: (info) => {
          const value = info.getValue();
          return value ? (
            <CriticalValueDisplay value={value} size="sm" />
          ) : (
            <span className="text-gray-400">-</span>
          );
        },
      }),
     
      columnHelper.accessor('expectedCompletionDate', {
        header: 'Due Date',
        cell: (info) => {
          const date = new Date(info.getValue());
          const isOverdue = date < new Date() && info.row.original.status !== 'Resolved';
          return (
            <span className={`text-sm  ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
              {formatDate(date)}
            </span>
          );
        },
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created',
        cell: (info) => (
          <span className="text-sm text-gray-600">
            {formatDate(new Date(info.getValue()))}
          </span>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: tickets,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: 'includesString',
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  // Simplified loading condition: only show loading on first fetch when no data exists
  const showInitialLoading = (isLoading || isPending) && tickets.length === 0;

  if (showInitialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading tickets...</div>
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
                : 'Unable to load tickets. Please check your connection and try again.'}
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
      <Card variant="rounded-2xl" >  
        {/* Header Section */}
        <AutoPageHeader
          currentUser={currentUser}
          showBreadcrumbs={false}
        >
          {/* Filter Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
            <div className="flex items-center space-x-2">
              {/* Search Input */}
              <div className="relative w-full sm:w-64 md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tickets..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
              
            {/* Create Ticket Button */}
            {(currentUser.role === 'ADMIN' || currentUser.role === 'L1') && (
              <Button 
                onClick={() => setShowCreateTicketPopup(true)}
                className="px-4 py-2 flex items-center space-x-2 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create Ticket</span>
              </Button>
            )}
          </div>
        </AutoPageHeader>

        {/* Content Section */}
        <div className="p-3 sm:p-6">
          {/* Show empty state if no tickets */}
          {tickets.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              {/* Empty State Image */}
              <div className="mb-8">
                <img 
                  src={EmptyTicketsImage} 
                  alt="No tickets" 
                  className="w-80 h-auto opacity-90"
                />
              </div>
              
              {/* Title and Description */}
              <div className="text-center mb-8 max-w-md">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to Ticket Maintenance System
                </h2>
                <p className="text-gray-600 text-base leading-relaxed">
                  Manage and sort all your ticket into a single list that can be easily scanned and sorted by category
                </p>
              </div>
              
              {/* Create Ticket Button - Only show for L1 and ADMIN */}
              {(currentUser.role === 'L1' || currentUser.role === 'ADMIN') && (
                <Button
                  variant="default"
                  onClick={() => setShowCreateTicketPopup(true)}
                  className="flex items-center gap-2 px-6 py-3"
                >
                  <Plus className="h-5 w-5" />
                  Create Ticket
                </Button>
              )}
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {/* Scroll container to keep table responsive on smaller viewports */}
              <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
                <table
                  className="divide-y divide-gray-200 text-sm"
                  style={{ minWidth: '100px', width: '100%' }}
                >
                  <thead className="bg-gray-50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            onClick={header.column.getToggleSortingHandler()}
                            className={`px-2 sm:px-3 py-2 sm:py-2 text-left align-middle font-medium uppercase tracking-wide text-[10px] sm:text-[11px] md:text-[11px] lg:text-xs text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors select-none whitespace-nowrap ${header.column.getIsSorted() ? 'bg-gray-100' : ''
                              }`}
                            style={{ 
                              minWidth:'100px',
                              width:'auto'
                            }}
                          >
                            <div className="flex items-center space-x-1">
                              <span>
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </span>
                              {header.column.getIsSorted() && (
                                <span className="text-primary-600">
                                  {header.column.getIsSorted() === 'desc' ? '↓' : '↑'}
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        tabIndex={0}
                        onClick={() => navigate(`/tickets/${row.original.id}`)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            navigate(`/tickets/${row.original.id}`);
                          }
                        }}
                        className="hover:bg-gray-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={`px-2 sm:px-3 py-2 sm:py-2 align-middle text-[11px] sm:text-[13px] leading-snug ${
                              cell.column.id === 'title' ? '' : 'whitespace-nowrap'
                            }`}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                
              </div>
              {/* Pagination */}
              <div className="px-3 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-gray-500 text-center sm:text-left">
                  Showing
                  {' '}
                  {pagination.totalItems === 0
                    ? 0
                    : (pagination.currentPage - 1) * DEFAULT_PAGE_SIZE + 1}
                  {' '}
                  to{' '}
                  {Math.min(
                    pagination.currentPage * DEFAULT_PAGE_SIZE,
                    pagination.totalItems
                  )}
                  {' '}
                  of {pagination.totalItems} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
                    disabled={!pagination.hasPrev || isFetching}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageIndex((prev) => prev + 1)}
                    disabled={!pagination.hasNext || isFetching}
                  >
                    {isFetching ? 'Loading…' : 'Next'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Create Ticket Dialog */}
      <CreateTicketDialog 
        isOpen={showCreateTicketPopup}
        onClose={() => setShowCreateTicketPopup(false)}
      />
    </div>
  );
}