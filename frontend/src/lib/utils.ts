import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getPriorityColor(priority: 'LOW' | 'MEDIUM' | 'HIGH') {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-500';
    case 'MEDIUM':
      return 'bg-yellow-500';
    case 'LOW':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
}
