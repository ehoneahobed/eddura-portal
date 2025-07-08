import useSWR from 'swr';

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

// Dashboard stats interface
export interface DashboardStats {
  schools: number;
  programs: number;
  scholarships: number;
  applicationTemplates: number;
  recentActivity: RecentActivity[];
  topSchools: TopSchool[];
  topPrograms: TopProgram[];
  topScholarships: TopScholarship[];
  growthRate: number;
}

export interface RecentActivity {
  id: string;
  type: 'school' | 'program' | 'scholarship' | 'template';
  action: 'created' | 'updated' | 'deleted';
  title: string;
  timestamp: string;
  description: string;
}

export interface TopSchool {
  id: string;
  name: string;
  country: string;
  programCount: number;
  globalRanking?: number;
}

export interface TopProgram {
  id: string;
  name: string;
  schoolName: string;
  degreeType: string;
  fieldOfStudy: string;
  tuitionFees: {
    international: number;
    currency: string;
  };
}

export interface TopScholarship {
  id: string;
  title: string;
  provider: string;
  value: number | string;
  currency?: string;
  deadline: string;
}

// Custom hook for dashboard stats
export function useDashboardStats() {
  const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
    '/api/dashboard/stats',
    fetcher,
    {
      refreshInterval: 10000, // Refresh every 10 seconds for more real-time updates
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateOnMount: true,
    }
  );

  return {
    stats: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Custom hook for schools data
export function useSchools(page: number = 1, limit: number = 5) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/schools?page=${page}&limit=${limit}`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );

  return {
    schools: data?.schools || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
}

// Custom hook for programs data
export function usePrograms(page: number = 1, limit: number = 5) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/programs?page=${page}&limit=${limit}`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );

  return {
    programs: data?.programs || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
}

// Custom hook for scholarships data
export function useScholarships(page: number = 1, limit: number = 5) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/scholarships?page=${page}&limit=${limit}`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );

  return {
    scholarships: data?.scholarships || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
} 