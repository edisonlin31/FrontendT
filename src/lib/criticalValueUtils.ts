import type { CriticalValue } from '../types';

interface CriticalValueData {
  icon: string;
  color: string;
  label: string;
}

// Utility function to get critical value display data
export const getCriticalValueDisplay = (value: CriticalValue | undefined | ''): CriticalValueData => {
  if (!value) return { icon: '-', color: 'text-gray-400', label: 'Not Set' };
  
  switch (value) {
    case 'C1':
      return { icon: '!!!', color: 'text-red-500', label: 'Critical (C1)' };
    case 'C2':
      return { icon: '!!', color: 'text-orange-500', label: 'High (C2)' };
    case 'C3':
      return { icon: '!', color: 'text-[#0973DC]', label: 'Medium (C3)' };
    default:
      return { icon: '-', color: 'text-gray-400', label: 'Not Set' };
  }
};