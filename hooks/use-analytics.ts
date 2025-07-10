import useSWR from 'swr';

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch analytics data');
  }
  return response.json();
};

// Analytics data interfaces
export interface AnalyticsData {
  overview: OverviewMetrics;
  trends: TrendData[];
  geographic: GeographicData[];
  topContent: TopContentData[];
  recentActivity: ActivityData[];
  financial: FinancialData;
}

export interface OverviewMetrics {
  totalSchools: number;
  totalPrograms: number;
  totalScholarships: number;
  totalTemplates: number;
  growthRate: number;
  activeUsers: number;
  totalValue: number;
}

export interface TrendData {
  date: string;
  schools: number;
  programs: number;
  scholarships: number;
  templates: number;
}

export interface GeographicData {
  country: string;
  schools: number;
  programs: number;
  scholarships: number;
  color: string;
}

export interface TopContentData {
  name: string;
  type: 'school' | 'program' | 'scholarship';
  views: number;
  growth: number;
}

export interface ActivityData {
  id: string;
  type: string;
  action: string;
  title: string;
  timestamp: string;
  user: string;
}

export interface FinancialData {
  totalScholarshipValue: number;
  averageProgramCost: number;
  topScholarships: Array<{
    title: string;
    value: number;
    currency: string;
  }>;
  costDistribution: Array<{
    range: string;
    count: number;
    color: string;
  }>;
}

// Custom hook for analytics data
export function useAnalytics(timeRange: string = '30d') {
  const { data, error, isLoading, mutate } = useSWR<AnalyticsData>(
    `/api/admin/analytics?range=${timeRange}`,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds for real-time analytics
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateOnMount: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  return {
    analytics: data,
    isLoading,
    isError: error,
    mutate,
    error
  };
}

// Custom hook for specific analytics sections
export function useOverviewMetrics(timeRange: string = '30d') {
  const { analytics, isLoading, isError } = useAnalytics(timeRange);
  
  return {
    metrics: analytics?.overview,
    isLoading,
    isError
  };
}

export function useTrendsData(timeRange: string = '30d') {
  const { analytics, isLoading, isError } = useAnalytics(timeRange);
  
  return {
    trends: analytics?.trends,
    isLoading,
    isError
  };
}

export function useGeographicData(timeRange: string = '30d') {
  const { analytics, isLoading, isError } = useAnalytics(timeRange);
  
  return {
    geographic: analytics?.geographic,
    isLoading,
    isError
  };
}

export function useFinancialData(timeRange: string = '30d') {
  const { analytics, isLoading, isError } = useAnalytics(timeRange);
  
  return {
    financial: analytics?.financial,
    isLoading,
    isError
  };
}

// Utility functions for analytics
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const getGrowthIcon = (growth: number) => {
  return growth >= 0 ? 'trending-up' : 'trending-down';
};

export const getGrowthColor = (growth: number): string => {
  return growth >= 0 ? 'text-green-600' : 'text-red-600';
};

// Chart configuration helpers
export const getChartColors = () => ({
  primary: '#3B82F6',
  secondary: '#10B981',
  tertiary: '#8B5CF6',
  quaternary: '#F59E0B',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  light: '#6B7280'
});

export const getChartConfig = () => ({
  schools: { color: "#3B82F6" },
  programs: { color: "#10B981" },
  scholarships: { color: "#8B5CF6" },
  templates: { color: "#F59E0B" },
  views: { color: "#EF4444" },
  value: { color: "#10B981" }
}); 