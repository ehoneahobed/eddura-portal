'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useErrorBoundary } from '@/hooks/useErrorBoundary';
import { withAsyncErrorHandling, getUserFriendlyErrorMessage } from '@/utils/errorHandling';

/**
 * Example component demonstrating error handling patterns
 * 
 * This component shows how to:
 * - Use the error boundary hook
 * - Wrap async functions with error handling
 * - Display user-friendly error messages
 * - Handle different types of errors
 */
export default function ErrorHandlingExample() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  
  const { reportError, withAsyncErrorBoundary } = useErrorBoundary();

  // Example of a function that might fail
  const fetchData = withAsyncErrorBoundary(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate different types of errors
      const random = Math.random();
      
      if (random < 0.3) {
        throw new Error('Network error: Failed to fetch data');
      } else if (random < 0.5) {
        throw new Error('Unauthorized: Please log in again');
      } else if (random < 0.7) {
        throw new Error('Not found: The requested resource was not found');
      } else if (random < 0.9) {
        throw new Error('Cannot read properties of undefined (reading \'trim\')');
      }
      
      // Simulate successful API call
      const response = await fetch('/api/example');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result);
      
    } catch (error) {
      const appError = error as Error;
      setError(getUserFriendlyErrorMessage(appError));
      reportError(appError);
      throw appError; // Re-throw to let error boundary handle it
    } finally {
      setLoading(false);
    }
  });

  const handleRetry = () => {
    setError(null);
    fetchData();
  };

  const handleSimulateError = () => {
    // This will be caught by the error boundary
    throw new Error('Simulated error for testing error boundary');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Error Handling Examples</CardTitle>
          <CardDescription>
            Examples of different error handling patterns and user-friendly error messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error display */}
          {error && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={fetchData} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Fetch Data (May Fail)'
              )}
            </Button>
            
            <Button 
              onClick={handleRetry} 
              variant="outline"
              disabled={!error}
            >
              Retry
            </Button>
            
            <Button 
              onClick={handleSimulateError} 
              variant="destructive"
            >
              Simulate Error
            </Button>
          </div>

          {/* Data display */}
          {data && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Success!</h4>
              <pre className="text-sm text-green-700">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• &quot;Fetch Data&quot; simulates different types of errors randomly</li>
              <li>• Errors are caught and displayed with user-friendly messages</li>
              <li>• &quot;Simulate Error&quot; triggers the error boundary directly</li>
              <li>• &quot;Retry&quot; attempts to recover from the last error</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 