import useSWR from 'swr';
import { Scholarship } from '@/types';

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

// Scholarships data interface
export interface ScholarshipsData {
  scholarships: Scholarship[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Scholarships query parameters interface
export interface ScholarshipsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  provider?: string;
  coverage?: string;
  frequency?: string;
  degreeLevel?: string;
  minValue?: string;
  maxValue?: string;
  eligibleNationalities?: string[];
  countryResidency?: string[];
  sortBy?: 'title' | 'provider' | 'value' | 'deadline' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  includeExpired?: boolean;
  status?: 'active' | 'expired' | 'coming-soon' | 'urgent';
}

// Build query string from parameters
const buildQueryString = (params: ScholarshipsQueryParams): string => {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);
  if (params.provider) searchParams.append('provider', params.provider);
  if (params.coverage) searchParams.append('coverage', params.coverage);
  if (params.frequency) searchParams.append('frequency', params.frequency);
  if (params.degreeLevel) searchParams.append('degreeLevel', params.degreeLevel);
  if (params.minValue) searchParams.append('minValue', params.minValue);
  if (params.maxValue) searchParams.append('maxValue', params.maxValue);
  if (params.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
  if (params.includeExpired) searchParams.append('includeExpired', 'true');
  if (params.status) searchParams.append('status', params.status);
  
  // Handle arrays
  if (params.eligibleNationalities && params.eligibleNationalities.length > 0) {
    params.eligibleNationalities.forEach(nationality => {
      searchParams.append('eligibleNationalities', nationality);
    });
  }
  
  if (params.countryResidency && params.countryResidency.length > 0) {
    params.countryResidency.forEach(country => {
      searchParams.append('countryResidency', country);
    });
  }
  
  return searchParams.toString();
};

// Custom hook for scholarships data with comprehensive query support
export function useScholarships(params: ScholarshipsQueryParams = {}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    provider = '',
    coverage,
    frequency,
    degreeLevel,
    minValue,
    maxValue,
    eligibleNationalities = [],
    countryResidency = [],
    sortBy = 'title',
    sortOrder = 'asc',
    includeExpired = false,
    status
  } = params;

  const queryString = buildQueryString({
    page,
    limit,
    search,
    provider,
    coverage: coverage || undefined,
    frequency: frequency || undefined,
    degreeLevel: degreeLevel || undefined,
    minValue: minValue || undefined,
    maxValue: maxValue || undefined,
    eligibleNationalities,
    countryResidency,
    sortBy,
    sortOrder,
    includeExpired,
    status: status || undefined
  });

  const { data, error, isLoading, mutate } = useSWR<ScholarshipsData>(
    `/api/scholarships?${queryString}`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
    }
  );

  return {
    scholarships: data?.scholarships || [],
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
    isEmpty: !isLoading && (!data?.scholarships || data.scholarships.length === 0),
  };
}

// Custom hook for a single scholarship
export function useScholarship(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Scholarship>(
    id ? `/api/scholarships/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    scholarship: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Custom hook for scholarships list (simplified for dropdowns, etc.)
export function useScholarshipsList() {
  const { data, error, isLoading } = useSWR<{ scholarships: Scholarship[] }>(
    '/api/scholarships?limit=1000&sortBy=title&sortOrder=asc',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    scholarships: data?.scholarships || [],
    isLoading,
    isError: error,
  };
}

// Custom hook for scholarships by coverage type
export function useScholarshipsByCoverage(coverage: string) {
  const { data, error, isLoading, mutate } = useSWR<{ scholarships: Scholarship[] }>(
    coverage ? `/api/scholarships?coverage=${coverage}&limit=1000&sortBy=title&sortOrder=asc` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    scholarships: data?.scholarships || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// Custom hook for scholarships by frequency
export function useScholarshipsByFrequency(frequency: string) {
  const { data, error, isLoading, mutate } = useSWR<{ scholarships: Scholarship[] }>(
    frequency ? `/api/scholarships?frequency=${frequency}&limit=1000&sortBy=title&sortOrder=asc` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    scholarships: data?.scholarships || [],
    isLoading,
    isError: error,
    mutate,
  };
} 