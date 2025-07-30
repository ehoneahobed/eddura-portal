'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

/**
 * Global Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the component tree and displays
 * a user-friendly error message instead of crashing the application.
 * 
 * Features:
 * - User-friendly error messages
 * - Error reporting capabilities
 * - Recovery options (retry, go back, go home)
 * - Development mode with detailed error info
 * - Error ID generation for tracking
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate a unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  getErrorMessage = (error: Error): string => {
    // Map common errors to user-friendly messages
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }
    
    if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
      return 'Your session has expired. Please log in again to continue.';
    }
    
    if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
      return 'You don\'t have permission to access this resource.';
    }
    
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return 'The requested resource was not found.';
    }
    
    if (errorMessage.includes('timeout')) {
      return 'The request timed out. Please try again.';
    }
    
    if (errorMessage.includes('trim') || errorMessage.includes('undefined')) {
      return 'There was an issue processing your data. Please refresh the page and try again.';
    }
    
    // Default error message
    return 'Something went wrong. Please try again or contact support if the problem persists.';
  };

  render() {
    if (this.state.hasError) {
      const { error, errorId } = this.state;
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-gray-600">
                We encountered an unexpected error. Don't worry, we're working to fix it.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* User-friendly error message */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {error ? this.getErrorMessage(error) : 'An unexpected error occurred.'}
                </AlertDescription>
              </Alert>

              {/* Error ID for support */}
              {errorId && (
                <div className="text-xs text-gray-500 text-center">
                  Error ID: {errorId}
                </div>
              )}

              {/* Development mode error details */}
              {isDevelopment && error && (
                <details className="bg-gray-100 p-4 rounded-lg">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                    Technical Details (Development Only)
                  </summary>
                  <div className="text-xs text-gray-600 space-y-2">
                    <div>
                      <strong>Error:</strong> {error.name}
                    </div>
                    <div>
                      <strong>Message:</strong> {error.message}
                    </div>
                    {error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 bg-gray-200 p-2 rounded overflow-auto max-h-32">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Recovery actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                
                <Button
                  onClick={this.handleGoBack}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </div>

              {/* Additional help */}
              <div className="text-center text-sm text-gray-500">
                <p>
                  If this problem persists, please contact our support team with the Error ID above.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 