'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getUserFriendlyErrorMessage } from '@/utils/errorHandling';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
  onCreateNew?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

/**
 * Document-specific Error Boundary
 * 
 * Provides targeted error handling for document-related operations
 * with specific recovery options for document management.
 */
class DocumentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `doc_err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Document Error Boundary caught an error:', error, errorInfo);
    
    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { 
    //   extra: errorInfo,
    //   tags: { component: 'documents' }
    // });
  }

  handleRetry = () => {
    if (this.props.onRetry) {
      this.props.onRetry();
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
    });
  };

  handleCreateNew = () => {
    if (this.props.onCreateNew) {
      this.props.onCreateNew();
    }
  };

  getDocumentSpecificMessage = (error: Error): string => {
    const message = error.message.toLowerCase();
    
    // Document-specific error messages
    if (message.includes('content') || message.includes('trim')) {
      return 'There was an issue processing your document content. Please check your document and try again.';
    }
    
    if (message.includes('file') || message.includes('upload')) {
      return 'There was an issue with the file upload. Please try uploading your document again.';
    }
    
    if (message.includes('permission') || message.includes('access')) {
      return 'You don\'t have permission to access this document. Please contact your administrator.';
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return 'The document you\'re looking for was not found. It may have been moved or deleted.';
    }
    
    // Use the general error message handler
    return getUserFriendlyErrorMessage(error);
  };

  render() {
    if (this.state.hasError) {
      const { error, errorId } = this.state;
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return (
        <div className="p-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Document Error
              </CardTitle>
              <CardDescription className="text-gray-600">
                We encountered an issue while processing your documents.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error message */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {error ? this.getDocumentSpecificMessage(error) : 'An unexpected error occurred while loading your documents.'}
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
                  onClick={this.handleCreateNew}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create New Document
                </Button>
              </div>

              {/* Additional help */}
              <div className="text-center text-sm text-gray-500">
                <p>
                  If this problem persists, please contact support with the Error ID above.
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

export default DocumentErrorBoundary; 