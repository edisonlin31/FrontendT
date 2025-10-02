import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { createPortal } from 'react-dom';

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  disabled?: boolean;
  minDate?: string;
}

const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  ({ value, onChange, placeholder = "Select date", className, error, disabled, minDate, ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [hasMounted, setHasMounted] = useState(false);
    const [menuStyles, setMenuStyles] = useState<{ top: number; left: number; width: number }>({
      top: 0,
      left: 0,
      width: 0,
    });
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());

    useEffect(() => {
      setHasMounted(true);
    }, []);

    useLayoutEffect(() => {
      if (!isOpen) {
        return undefined;
      }

      const updatePosition = () => {
        const button = buttonRef.current;
        if (!button) {
          return;
        }

        const rect = button.getBoundingClientRect();
        const popoverWidth = Math.max(288, rect.width);
        const popoverHeight = popoverRef.current?.offsetHeight ?? 340;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        const horizontalPadding = 16;
        const verticalPadding = 16;

        let left = rect.left + scrollX;
        if (left + popoverWidth + horizontalPadding > scrollX + viewportWidth) {
          left = scrollX + viewportWidth - popoverWidth - horizontalPadding;
        }
        left = Math.max(left, scrollX + horizontalPadding);

        let top = rect.bottom + scrollY + 8;
        if (top + popoverHeight + verticalPadding > scrollY + viewportHeight) {
          top = rect.top + scrollY - popoverHeight - 8;
        }
        top = Math.max(top, scrollY + verticalPadding);

        setMenuStyles((prev) => {
          if (prev.top === top && prev.left === left && prev.width === popoverWidth) {
            return prev;
          }
          return {
            top,
            left,
            width: popoverWidth,
          };
        });
      };

      updatePosition();
      const rafId = requestAnimationFrame(updatePosition);

      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
  }, [isOpen, viewDate]);

    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const getDaysInMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const isDateDisabled = (day: number) => {
      if (!minDate) return false;
      const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const minDateTime = new Date(minDate);
      return checkDate < minDateTime;
    };

    const handleDateSelect = (day: number) => {
      const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const dateString = selectedDate.toISOString().split('T')[0];
      onChange(dateString);
      setIsOpen(false);
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
      const newDate = new Date(viewDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      setViewDate(newDate);
    };

    const renderCalendar = () => {
      const daysInMonth = getDaysInMonth(viewDate);
      const firstDay = getFirstDayOfMonth(viewDate);
      const days = [];

      // Empty cells for days before the first day of the month
      for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
      }

      // Days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const isSelected = value === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toISOString().split('T')[0];
        const isDisabled = isDateDisabled(day);

        days.push(
          <button
            key={day}
            type="button"
            onClick={() => !isDisabled && handleDateSelect(day)}
            disabled={isDisabled}
            className={cn(
              "h-8 w-8 text-sm rounded-md transition-colors",
              isSelected 
                ? "bg-primary-600 text-white" 
                : "hover:bg-gray-100",
              isDisabled && "text-gray-300 cursor-not-allowed hover:bg-transparent"
            )}
          >
            {day}
          </button>
        );
      }

      return days;
    };

    return (
      <div className="relative" ref={ref} {...props}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-red-300 focus-visible:ring-red-500' : 'border-gray-300',
            className
          )}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-500'}>
            {value ? formatDate(value) : placeholder}
          </span>
          <Calendar className="h-4 w-4 text-gray-400" />
        </button>
        {hasMounted && isOpen &&
          createPortal(
            <>
              <div
                className="fixed inset-0 z-[55]"
                onClick={() => setIsOpen(false)}
              />
              <div
                ref={popoverRef}
                className="z-[60] bg-white border border-gray-200 rounded-md shadow-lg p-4 w-72"
                style={{
                  position: 'absolute',
                  top: menuStyles.top,
                  left: menuStyles.left,
                  minWidth: menuStyles.width,
                }}
              >
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => navigateMonth('prev')}
                    className="p-1 hover:bg-gray-100 rounded-md"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <h3 className="font-medium text-gray-900">
                    {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigateMonth('next')}
                    className="p-1 hover:bg-gray-100 rounded-md"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="h-8 w-8 text-xs font-medium text-gray-500 flex items-center justify-center">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar()}
                </div>
              </div>
            </>,
            document.body
          )
        }
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export { DatePicker };