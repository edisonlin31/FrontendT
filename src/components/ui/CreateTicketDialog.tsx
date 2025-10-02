import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './Button';
import { Input } from './Input';
import { Select, type SelectOption } from './Select';
import { DatePicker } from './DatePicker';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import type { TicketPriority } from '../../types';

const ticketSchema = z.object({
  title: z.string().min(1, 'Title is required').min(5, 'Title must be at least 5 characters'),
  description: z.string().min(1, 'Description is required').min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.string().min(1, 'Please select a priority'),
  expectedCompletionDate: z.string()
    .min(1, 'Expected completion date is required')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'Expected completion date cannot be in the past'),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface CreateTicketDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTicketDialog({ isOpen, onClose }: CreateTicketDialogProps) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: TicketFormData) => {
      const ticketData = {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority as TicketPriority,
        expectedCompletionDate: new Date(data.expectedCompletionDate),
      };
      return api.createTicket(ticketData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      onClose();
      reset();
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      expectedCompletionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: TicketFormData) => {
    createMutation.mutate(data);
  };

  const categoryOptions: SelectOption[] = [
    { value: 'Technical', label: 'Technical' },
    { value: 'Hardware', label: 'Hardware' },
    { value: 'Software', label: 'Software' },
    { value: 'Network', label: 'Network' },
    { value: 'Access', label: 'Access' },
    { value: 'Other', label: 'Other' },
  ];

  const priorityOptions: SelectOption[] = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Create New Ticket</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-6 pb-6 overflow-y-auto flex-1">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Brief description of the issue"
              error={!!errors.title}
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              rows={4}
              className={cn(
                "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 resize-vertical",
                errors.description 
                  ? "border-red-300 focus:ring-red-500" 
                  : "border-gray-300 focus:ring-primary-500"
              )}
              {...register('description')}
              placeholder="Detailed description of the issue, including steps to reproduce if applicable"
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Category, Priority, Critical Value */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    options={categoryOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select category"
                    error={!!errors.category}
                  />
                )}
              />
              {errors.category && (
                <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select
                    options={priorityOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select priority"
                    error={!!errors.priority}
                  />
                )}
              />
              {errors.priority && (
                <p className="text-red-600 text-sm mt-1">{errors.priority.message}</p>
              )}
            </div>
          </div>

          {/* Expected Completion Date */}
          <div>
            <label htmlFor="expectedCompletionDate" className="block text-sm font-medium text-gray-700 mb-2">
              Expected Completion Date *
            </label>
            <Controller
              name="expectedCompletionDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select completion date"
                  error={!!errors.expectedCompletionDate}
                  minDate={new Date().toISOString().split('T')[0]}
                />
              )}
            />
            {errors.expectedCompletionDate && (
              <p className="text-red-600 text-sm mt-1">{errors.expectedCompletionDate.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="px-6"
            >
              {createMutation.isPending ? 'Creating...' : 'Save Ticket'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}