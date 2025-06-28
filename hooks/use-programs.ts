import useSWR from 'swr';
import { Program } from '@/types';

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

// Programs data interface
export interface ProgramsData {
  programs: Program[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Programs query parameters interface
export interface ProgramsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  schoolId?: string;
  degreeType?: string;
  fieldOfStudy?: string;
  country?: string;
  sortBy?: 'name' | 'schoolName' | 'degreeType' | 'fieldOfStudy' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// Build query string from parameters
const buildQueryString = (params: ProgramsQueryParams): string => {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);
  if (params.schoolId) searchParams.append('schoolId', params.schoolId);
  if (params.degreeType) searchParams.append('degreeType', params.degreeType);
  if (params.fieldOfStudy) searchParams.append('fieldOfStudy', params.fieldOfStudy);
  if (params.country) searchParams.append('country', params.country);
  if (params.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
  
  return searchParams.toString();
};

// Custom hook for programs data with comprehensive query support
export function usePrograms(params: ProgramsQueryParams = {}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    schoolId = '',
    degreeType = '',
    fieldOfStudy = '',
    country = '',
    sortBy = 'name',
    sortOrder = 'asc'
  } = params;

  const queryString = buildQueryString({
    page,
    limit,
    search,
    schoolId,
    degreeType,
    fieldOfStudy,
    country,
    sortBy,
    sortOrder
  });

  const { data, error, isLoading, mutate } = useSWR<ProgramsData>(
    `/api/programs?${queryString}`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
    }
  );

  return {
    programs: data?.programs || [],
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
    isEmpty: !isLoading && (!data?.programs || data.programs.length === 0),
  };
}

// Custom hook for a single program
export function useProgram(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Program>(
    id ? `/api/programs/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    program: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Custom hook for programs list (simplified for dropdowns, etc.)
export function useProgramsList() {
  const { data, error, isLoading } = useSWR<{ programs: Program[] }>(
    '/api/programs?limit=1000&sortBy=name&sortOrder=asc',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    programs: data?.programs || [],
    isLoading,
    isError: error,
  };
}

// Custom hook for programs by school
export function useProgramsBySchool(schoolId: string) {
  const { data, error, isLoading, mutate } = useSWR<{ programs: Program[] }>(
    schoolId ? `/api/programs?schoolId=${schoolId}&limit=1000&sortBy=name&sortOrder=asc` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    programs: data?.programs || [],
    isLoading,
    isError: error,
    mutate,
  };
} 