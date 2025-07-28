'use client';

import { SWRConfig } from 'swr';

interface SWRProviderProps {
  children: React.ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher: async (url: string) => {
          const response = await fetch(url);
          if (!response.ok) {
            // Try to get error details from response
            let errorMessage = 'Failed to fetch data';
            try {
              const errorData = await response.json();
              errorMessage = errorData.error || errorData.message || errorMessage;
            } catch {
              // If we can't parse the error response, use default message
            }
            throw new Error(errorMessage);
          }
          return response.json();
        },
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        dedupingInterval: 2000,
        focusThrottleInterval: 5000,
        loadingTimeout: 10000,
        onError: (error) => {
          console.error('SWR Error:', error);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
} 