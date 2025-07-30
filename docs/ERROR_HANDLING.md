# Error Handling System

This document describes the comprehensive error handling system implemented in the Eddura application. The system provides user-friendly error messages, graceful error recovery, and consistent error handling patterns across the application.

## Overview

The error handling system consists of several components:

1. **Global Error Boundary** - Catches JavaScript errors at the application level
2. **Component-specific Error Boundaries** - Targeted error handling for specific features
3. **Error Handling Utilities** - Helper functions for consistent error management
4. **Error Boundary Hook** - React hook for error boundary functionality
5. **User-friendly Error Messages** - Automatic translation of technical errors to user-friendly messages

## Components

### 1. Global Error Boundary (`components/ErrorBoundary.tsx`)

The main error boundary that wraps the entire application and catches any unhandled JavaScript errors.

**Features:**
- User-friendly error messages
- Error ID generation for tracking
- Recovery options (retry, go back, go home)
- Development mode with detailed error information
- Custom error handlers

**Usage:**
```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary onError={(error, errorInfo) => {
  // Custom error handling
  console.error('Global error:', error);
}}>
  <YourApp />
</ErrorBoundary>
```

### 2. Error Boundary Provider (`components/providers/ErrorBoundaryProvider.tsx`)

A provider component that wraps the application with error boundaries and provides global error handling capabilities.

**Features:**
- Global error handling
- Error reporting capabilities
- Graceful degradation
- Maintains user experience during errors

**Usage:**
```tsx
import ErrorBoundaryProvider from '@/components/providers/ErrorBoundaryProvider';

<ErrorBoundaryProvider onError={(error, errorInfo) => {
  // Handle global errors
}}>
  <YourApp />
</ErrorBoundaryProvider>
```

### 3. Component-specific Error Boundaries

Targeted error boundaries for specific features with custom recovery options.

**Example: Document Error Boundary (`components/documents/DocumentErrorBoundary.tsx`)**

```tsx
import DocumentErrorBoundary from '@/components/documents/DocumentErrorBoundary';

<DocumentErrorBoundary
  onRetry={fetchDocuments}
  onCreateNew={() => setCreateDialogOpen(true)}
>
  <DocumentsPage />
</DocumentErrorBoundary>
```

## Utilities

### Error Handling Utilities (`utils/errorHandling.ts`)

Helper functions for consistent error management across the application.

#### `getUserFriendlyErrorMessage(error: Error): string`

Translates technical error messages to user-friendly messages.

```tsx
import { getUserFriendlyErrorMessage } from '@/utils/errorHandling';

const userMessage = getUserFriendlyErrorMessage(error);
// "Network connection issue. Please check your internet connection and try again."
```

#### `createAppError(error: Error | string, context?: object): AppError`

Creates an enhanced error object with additional context.

```tsx
import { createAppError } from '@/utils/errorHandling';

const appError = createAppError(error, {
  code: 'NETWORK_ERROR',
  status: 500,
  userMessage: 'Custom user message',
  isRetryable: true
});
```

#### `handleApiError(response: Response): Promise<Response>`

Handles API responses and throws appropriate errors for non-OK responses.

```tsx
import { handleApiError } from '@/utils/errorHandling';

const response = await fetch('/api/documents');
const validResponse = await handleApiError(response);
```

#### `withErrorHandling(fn: Function, errorHandler?: Function): Function`

Wraps a function with error handling.

```tsx
import { withErrorHandling } from '@/utils/errorHandling';

const safeFunction = withErrorHandling(
  (data) => {
    // Your function logic
  },
  (error) => {
    // Custom error handler
  }
);
```

#### `withAsyncErrorHandling(fn: AsyncFunction, errorHandler?: Function): AsyncFunction`

Wraps an async function with error handling.

```tsx
import { withAsyncErrorHandling } from '@/utils/errorHandling';

const safeAsyncFunction = withAsyncErrorHandling(
  async (data) => {
    // Your async function logic
  },
  (error) => {
    // Custom error handler
  }
);
```

### Error Boundary Hook (`hooks/useErrorBoundary.ts`)

React hook that provides error boundary functionality.

```tsx
import { useErrorBoundary } from '@/hooks/useErrorBoundary';

function MyComponent() {
  const { reportError, withErrorBoundary, withAsyncErrorBoundary } = useErrorBoundary();

  const safeFunction = withAsyncErrorBoundary(async () => {
    // Your async logic
  });

  return (
    <button onClick={safeFunction}>
      Safe Action
    </button>
  );
}
```

## Error Message Mapping

The system automatically maps common error patterns to user-friendly messages:

| Error Pattern | User Message |
|---------------|--------------|
| Network/Fetch errors | "Network connection issue. Please check your internet connection and try again." |
| 401/Unauthorized | "Your session has expired. Please log in again to continue." |
| 403/Forbidden | "You don't have permission to access this resource." |
| 404/Not found | "The requested resource was not found." |
| Timeout errors | "The request timed out. Please try again." |
| Trim/Undefined errors | "There was an issue processing your data. Please refresh the page and try again." |
| Validation errors | "Please check your input and try again." |

## Best Practices

### 1. Use Error Boundaries Appropriately

- **Global Error Boundary**: Catches application-wide errors
- **Component-specific Error Boundaries**: For feature-specific error handling
- **Function-level Error Handling**: For specific operations

### 2. Provide Recovery Options

Always provide users with ways to recover from errors:

```tsx
<DocumentErrorBoundary
  onRetry={fetchDocuments}
  onCreateNew={() => setCreateDialogOpen(true)}
>
  <DocumentsPage />
</DocumentErrorBoundary>
```

### 3. Use User-friendly Messages

Never expose technical error messages to users. Use the utility functions:

```tsx
// ❌ Bad
toast.error(error.message);

// ✅ Good
toast.error(getUserFriendlyErrorMessage(error));
```

### 4. Handle Async Operations

Wrap async operations with error handling:

```tsx
const fetchData = withAsyncErrorHandling(async () => {
  const response = await fetch('/api/data');
  const data = await response.json();
  return data;
});
```

### 5. Log Errors for Debugging

Always log errors for debugging while showing user-friendly messages:

```tsx
try {
  // Your logic
} catch (error) {
  console.error('Technical error:', error);
  toast.error(getUserFriendlyErrorMessage(error));
}
```

## Error Tracking

The system is designed to work with error tracking services like Sentry:

```tsx
// In production, you might want to send errors to Sentry
import * as Sentry from '@sentry/nextjs';

componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  Sentry.captureException(error, { 
    extra: errorInfo,
    tags: { component: 'documents' }
  });
}
```

## Testing Error Boundaries

You can test error boundaries by intentionally throwing errors:

```tsx
const handleTestError = () => {
  throw new Error('Test error for error boundary');
};

<button onClick={handleTestError}>
  Test Error Boundary
</button>
```

## Migration Guide

### From Basic Error Handling

**Before:**
```tsx
try {
  const response = await fetch('/api/data');
  const data = await response.json();
} catch (error) {
  toast.error('Something went wrong');
}
```

**After:**
```tsx
const fetchData = withAsyncErrorHandling(async () => {
  const response = await fetch('/api/data');
  const validResponse = await handleApiError(response);
  const data = await validResponse.json();
  return data;
});

// Usage
try {
  const data = await fetchData();
} catch (error) {
  toast.error(getUserFriendlyErrorMessage(error));
}
```

### From Manual Error Boundaries

**Before:**
```tsx
class ErrorBoundary extends Component {
  // Manual implementation
}
```

**After:**
```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary onError={handleError}>
  <YourComponent />
</ErrorBoundary>
```

## Configuration

The error handling system can be configured through environment variables:

```env
# Enable detailed error logging in development
NODE_ENV=development

# Error tracking service configuration
SENTRY_DSN=your-sentry-dsn
```

## Troubleshooting

### Common Issues

1. **Error boundary not catching errors**: Ensure the error boundary wraps the component that might throw errors
2. **User-friendly messages not showing**: Check that you're using `getUserFriendlyErrorMessage()`
3. **Async errors not handled**: Use `withAsyncErrorHandling()` for async operations

### Debug Mode

In development mode, error boundaries show detailed technical information. This helps with debugging while still providing user-friendly messages.

## Contributing

When adding new error handling:

1. Add new error patterns to `getUserFriendlyErrorMessage()`
2. Create component-specific error boundaries for new features
3. Update this documentation with new patterns
4. Add tests for error scenarios 