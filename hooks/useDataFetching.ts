import { useState, useEffect, useCallback, useRef } from 'react';

interface UseDataFetchingOptions<T> {
  fetchFunction: (params?: any) => Promise<T>;
  dependencies?: any[];
  immediate?: boolean;
  debounceMs?: number;
}

export function useDataFetching<T>({
  fetchFunction,
  dependencies = [],
  immediate = true,
  debounceMs = 0
}: UseDataFetchingOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const executeFetch = useCallback(async (params?: any) => {
    console.log('🔍 useDataFetching - executeFetch called with params:', params);
    
    if (!mountedRef.current) {
      console.log('🔍 useDataFetching - Component unmounted, skipping fetch');
      return;
    }
    
    console.log('🔍 useDataFetching - Setting loading to true');
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 useDataFetching - Calling fetchFunction...');
      const result = await fetchFunction(params);
      console.log('🔍 useDataFetching - fetchFunction result:', result);
      
      if (mountedRef.current) {
        console.log('🔍 useDataFetching - Setting data');
        setData(result);
      } else {
        console.log('🔍 useDataFetching - Component unmounted, not setting data');
      }
    } catch (err) {
      console.error('❌ useDataFetching - Error in executeFetch:', err);
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        console.log('🔍 useDataFetching - Setting error:', errorMessage);
        setError(errorMessage);
      }
    } finally {
      if (mountedRef.current) {
        console.log('🔍 useDataFetching - Setting loading to false');
        setLoading(false);
      }
    }
  }, [fetchFunction]);

  const fetchData = useCallback((params?: any) => {
    if (debounceMs > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        executeFetch(params);
      }, debounceMs);
    } else {
      executeFetch(params);
    }
  }, [executeFetch, debounceMs]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    console.log('🔍 useDataFetching - Dependencies changed:', dependencies);
    if (immediate) {
      console.log('🔍 useDataFetching - Immediate fetch triggered');
      fetchData();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    fetchData,
    refetch: (params?: any) => fetchData(params)
  };
}