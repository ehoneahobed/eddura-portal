import { useState, useEffect } from 'react';

export interface ActiveUser {
  id: string;
  name: string;
  email: string;
  type: 'user' | 'admin';
  role?: string;
  sessionId: string;
  sessionStartTime: string;
  sessionDuration: number;
  sessionDurationFormatted: string;
  lastLoginAt?: string;
  loginCount: number;
  isEmailVerified: boolean;
  device?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  country?: string;
  city?: string;
  totalPages: number;
  totalTimeOnSite: number;
}

export interface ActiveUsersSummary {
  totalActiveUsers: number;
  totalUsers: number;
  totalAdmins: number;
  averageSessionDuration: number;
  averageSessionDurationFormatted: string;
  cutoffTime: string;
  minutes: number;
}

export interface ActiveUsersData {
  activeUsers: ActiveUser[];
  summary: ActiveUsersSummary;
}

export interface UseActiveUsersReturn {
  data: ActiveUsersData | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
}

export function useActiveUsers(minutes: number = 5): UseActiveUsersReturn {
  const [data, setData] = useState<ActiveUsersData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveUsers = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const response = await fetch(`/api/admin/active-users?minutes=${minutes}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch active users');
      }
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching active users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveUsers();
    
    // Set up polling every 30 seconds
    const interval = setInterval(fetchActiveUsers, 30000);
    
    return () => clearInterval(interval);
  }, [minutes]);

  const refetch = () => {
    fetchActiveUsers();
  };

  return {
    data,
    isLoading,
    isError,
    error,
    refetch
  };
}