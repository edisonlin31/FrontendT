import React from 'react';
import type { CriticalValue } from '../../types';
import { getCriticalValueDisplay } from '../../lib/criticalValueUtils';

interface CriticalValueDisplayProps {
  value: CriticalValue | undefined | '';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CriticalValueDisplay: React.FC<CriticalValueDisplayProps> = ({ 
  value, 
  className = '',
  size = 'sm'
}) => {
  const { icon, color, label } = getCriticalValueDisplay(value);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  };
  
  const iconSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex items-center gap-2 border border-gray-300 rounded-md  ${sizeClasses[size]} ${className}`}>
      <span className={`font-bold ${color} ${iconSizeClasses[size]}`}>
        {icon}
      </span>
      <span className={`font-medium text-gray-700 ${iconSizeClasses[size]}`}>
        {label}
      </span>
    </div>
  );
};

export default CriticalValueDisplay;