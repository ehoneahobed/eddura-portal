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
    if (!mountedRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction(params);
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      if (mountedRef.current) {
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
    if (immediate) {
      fetchData();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    fetchData,
    refetch: () => fetchData()
  };
}