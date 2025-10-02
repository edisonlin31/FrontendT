import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getStatusColor(status: string): string {
  const colors = {
    'New': 'bg-blue-100 text-blue-800',
    'Attending': 'bg-yellow-100 text-yellow-800',
    'Completed': 'bg-green-100 text-green-800',
    'Escalated': 'bg-orange-100 text-orange-800',
    'Resolved': 'bg-green-100 text-green-800',
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}

export function getPriorityColor(priority: string): string {
  const colors = {
    'Low': 'bg-gray-100 text-gray-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-red-100 text-red-800',
  };
  return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}

export function getCriticalColor(critical: string): string {
  const colors = {
    'C1': 'bg-red-100 text-red-800',
    'C2': 'bg-orange-100 text-orange-800',
    'C3': 'bg-yellow-100 text-yellow-800',
  };
  return colors[critical as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}

export function getLevelColor(level: string): string {
  const colors = {
    'L1': 'bg-green-500 text-white',
    'L2': 'bg-orange-500 text-white',
    'L3': 'bg-red-500 text-white',
  };
  return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}