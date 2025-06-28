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
            throw new Error('Failed to fetch data');
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