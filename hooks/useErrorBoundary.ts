import { useCallback } from 'react';

/**
 * Custom hook for error boundary functionality
 * Provides utilities for error handling and reporting
 */
export const useErrorBoundary = () => {
  /**
   * Report an error to the error boundary
   * @param error - The error to report
   * @param errorInfo - Additional error information
   */
  const reportError = useCallback((error: Error, errorInfo?: any) => {
    console.error('Error reported to boundary:', error, errorInfo);
    
    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
    
    // You could also dispatch a custom event for global error handling
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('app-error', {
          detail: { error, errorInfo }
        })
      );
    }
  }, []);

  /**
   * Create a safe function wrapper that catches errors
   * @param fn - The function to wrap
   * @returns A function that catches errors and reports them
   */
  const withErrorBoundary = useCallback(<T extends (...args: any[]) => any>(
    fn: T
  ) => {
    return ((...args: Parameters<T>) => {
      try {
        return fn(...args);
      } catch (error) {
        reportError(error as Error);
        throw error; // Re-throw to let the error boundary handle it
      }
    }) as T;
  }, [reportError]);

  /**
   * Create an async function wrapper that catches errors
   * @param fn - The async function to wrap
   * @returns An async function that catches errors and reports them
   */
  const withAsyncErrorBoundary = useCallback(<T extends (...args: any[]) => Promise<any>>(
    fn: T
  ) => {
    return (async (...args: Parameters<T>) => {
      try {
        return await fn(...args);
      } catch (error) {
        reportError(error as Error);
        throw error; // Re-throw to let the error boundary handle it
      }
    }) as T;
  }, [reportError]);

  return {
    reportError,
    withErrorBoundary,
    withAsyncErrorBoundary,
  };
}; 