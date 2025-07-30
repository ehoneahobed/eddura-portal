'use client';

import React, { ReactNode } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

interface ErrorBoundaryProviderProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

/**
 * Global Error Boundary Provider
 * 
 * Wraps the entire application with error boundaries and provides
 * global error handling capabilities.
 * 
 * Features:
 * - Catches errors at the application level
 * - Provides custom error handling
 * - Ensures graceful degradation
 * - Maintains user experience during errors
 */
export default function ErrorBoundaryProvider({ 
  children, 
  onError 
}: ErrorBoundaryProviderProps) {
  const handleError = (error: Error, errorInfo: any) => {
    // Log the error
    console.error('Global error caught:', error, errorInfo);
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
    
    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
    
    // You could also track error metrics
    // Example: analytics.track('error', { error: error.message, stack: error.stack });
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
} 