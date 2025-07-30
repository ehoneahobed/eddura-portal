import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely formats a date string with error handling
 * @param dateString - The date string to format
 * @param options - Optional formatting options
 * @returns Formatted date string or fallback text
 */
export function formatDate(dateString: string | undefined | null, options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return 'No date';
  
  try {
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Invalid date';
  }
}

/**
 * Formats a date with time
 * @param dateString - The date string to format
 * @returns Formatted date and time string
 */
export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return 'No date';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return 'Invalid date';
    }
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date time:', dateString, error);
    return 'Invalid date';
  }
}
