/**
 * Error handling utilities for consistent error management across the application
 */

export interface AppError extends Error {
  code?: string;
  status?: number;
  userMessage?: string;
  isRetryable?: boolean;
}

/**
 * Create a user-friendly error message
 * @param error - The error object
 * @returns A user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: Error | AppError): string {
  // If the error has a custom user message, use it
  if ('userMessage' in error && error.userMessage) {
    return error.userMessage;
  }

  const message = error.message.toLowerCase();
  
  // Network errors
  if (message.includes('network') || message.includes('fetch')) {
    return 'Network connection issue. Please check your internet connection and try again.';
  }
  
  // Authentication errors
  if (message.includes('unauthorized') || message.includes('401')) {
    return 'Your session has expired. Please log in again to continue.';
  }
  
  if (message.includes('forbidden') || message.includes('403')) {
    return 'You don\'t have permission to access this resource.';
  }
  
  // Not found errors
  if (message.includes('not found') || message.includes('404')) {
    return 'The requested resource was not found.';
  }
  
  // Timeout errors
  if (message.includes('timeout')) {
    return 'The request timed out. Please try again.';
  }
  
  // Data processing errors
  if (message.includes('trim') || message.includes('undefined') || message.includes('null')) {
    return 'There was an issue processing your data. Please refresh the page and try again.';
  }
  
  // Validation errors
  if (message.includes('validation') || message.includes('invalid')) {
    return 'Please check your input and try again.';
  }
  
  // Default error message
  return 'Something went wrong. Please try again or contact support if the problem persists.';
}

/**
 * Create an AppError with additional context
 * @param error - The original error
 * @param context - Additional context for the error
 * @returns An AppError with enhanced information
 */
export function createAppError(
  error: Error | string,
  context?: {
    code?: string;
    status?: number;
    userMessage?: string;
    isRetryable?: boolean;
  }
): AppError {
  const appError = new Error(typeof error === 'string' ? error : error.message) as AppError;
  
  if (typeof error === 'object') {
    Object.assign(appError, error);
  }
  
  if (context) {
    appError.code = context.code;
    appError.status = context.status;
    appError.userMessage = context.userMessage;
    appError.isRetryable = context.isRetryable;
  }
  
  return appError;
}

/**
 * Handle API errors consistently
 * @param response - The fetch response
 * @returns A promise that resolves to the response or throws an AppError
 */
export async function handleApiError(response: Response): Promise<Response> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorData: any = {};
    
    try {
      errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // If we can't parse the error response, use the default message
    }
    
    const appError = createAppError(errorMessage, {
      status: response.status,
      code: `HTTP_${response.status}`,
      isRetryable: response.status >= 500 || response.status === 429,
    });
    
    throw appError;
  }
  
  return response;
}

/**
 * Wrap a function with error handling
 * @param fn - The function to wrap
 * @param errorHandler - Optional custom error handler
 * @returns A function that catches errors and handles them consistently
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  errorHandler?: (error: AppError) => void
) {
  return ((...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error) {
      const appError = createAppError(error as Error);
      if (errorHandler) {
        errorHandler(appError);
      }
      throw appError;
    }
  }) as T;
}

/**
 * Wrap an async function with error handling
 * @param fn - The async function to wrap
 * @param errorHandler - Optional custom error handler
 * @returns An async function that catches errors and handles them consistently
 */
export function withAsyncErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorHandler?: (error: AppError) => void
) {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      const appError = createAppError(error as Error);
      if (errorHandler) {
        errorHandler(appError);
      }
      throw appError;
    }
  }) as T;
}

/**
 * Check if an error is retryable
 * @param error - The error to check
 * @returns True if the error is retryable
 */
export function isRetryableError(error: Error | AppError): boolean {
  if ('isRetryable' in error && error.isRetryable !== undefined) {
    return error.isRetryable;
  }
  
  const message = error.message.toLowerCase();
  
  // Network errors are usually retryable
  if (message.includes('network') || message.includes('fetch')) {
    return true;
  }
  
  // Server errors (5xx) are usually retryable
  if ('status' in error && error.status && error.status >= 500) {
    return true;
  }
  
  // Rate limiting errors are retryable after a delay
  if ('status' in error && error.status === 429) {
    return true;
  }
  
  return false;
}

/**
 * Get retry delay for an error
 * @param error - The error
 * @param attempt - The current attempt number
 * @returns Delay in milliseconds
 */
export function getRetryDelay(error: Error | AppError, attempt: number): number {
  // Rate limiting: exponential backoff
  if ('status' in error && error.status === 429) {
    return Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 seconds
  }
  
  // Server errors: exponential backoff
  if ('status' in error && error.status && error.status >= 500) {
    return Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
  }
  
  // Network errors: shorter delay
  const message = error.message.toLowerCase();
  if (message.includes('network') || message.includes('fetch')) {
    return Math.min(500 * Math.pow(2, attempt), 5000); // Max 5 seconds
  }
  
  // Default: 1 second
  return 1000;
} 