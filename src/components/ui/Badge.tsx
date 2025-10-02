import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'status' | 'level';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center  border px-2.5 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        {
          'border-transparent bg-primary-600 text-white hover:bg-primary-700/80 rounded-xl':
            variant === 'default',
          'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200/80 rounded-xl':
            variant === 'secondary',
          'border-transparent bg-red-600 text-white hover:bg-red-700/80 rounded-xl':
            variant === 'destructive',
          'text-gray-950 rounded-xl': variant === 'outline',
          'border-transparent rounded-xl': variant === 'status',
          'border-transparent rounded-md ':
           variant === 'level',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };