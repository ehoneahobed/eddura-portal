import useSWR from 'swr';
import { School } from '@/types';

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

// Schools data interface
export interface SchoolsData {
  schools: School[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Schools query parameters interface
export interface SchoolsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  sortBy?: 'name' | 'country' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// Build query string from parameters
const buildQueryString = (params: SchoolsQueryParams): string => {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);
  if (params.country) searchParams.append('country', params.country);
  if (params.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
  
  return searchParams.toString();
};

// Custom hook for schools data with comprehensive query support
export function useSchools(params: SchoolsQueryParams = {}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    country = '',
    sortBy = 'name',
    sortOrder = 'asc'
  } = params;

  const queryString = buildQueryString({
    page,
    limit,
    search,
    country,
    sortBy,
    sortOrder
  });

  const { data, error, isLoading, mutate } = useSWR<SchoolsData>(
    `/api/schools?${queryString}`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      errorRetryCount: 3,
      errorRetryInterval: 2000,
      shouldRetryOnError: (error) => {
        // Don't retry on 4xx errors (client errors)
        return error?.status >= 500 || !error?.status;
      },
    }
  );

  return {
    schools: data?.schools || [],
    pagination: data?.pagination || {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      limit: limit,
      hasNextPage: false,
      hasPrevPage: false,
    },
    isLoading,
    isError: error,
    mutate,
    isEmpty: !isLoading && (!data?.schools || data.schools.length === 0),
  };
}

// Custom hook for a single school
export function useSchool(id: string) {
  const { data, error, isLoading, mutate } = useSWR<School>(
    id ? `/api/schools/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    school: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Custom hook for schools list (simplified for dropdowns, etc.)
export function useSchoolsList() {
  const { data, error, isLoading } = useSWR<{ schools: School[] }>(
    '/api/schools?limit=1000&sortBy=name&sortOrder=asc',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    schools: data?.schools || [],
    isLoading,
    isError: error,
  };
} 