import { mutate } from 'swr';

/**
 * Utility to invalidate dashboard stats cache
 * Call this whenever data is created/updated/deleted to ensure real-time accuracy
 */
export const invalidateDashboardStats = () => {
  // Invalidate the dashboard stats cache
  mutate('/api/dashboard/stats');
};

/**
 * Invalidate multiple cache keys for comprehensive data refresh
 */
export const invalidateAllStats = () => {
  mutate('/api/dashboard/stats');
  mutate('/api/schools');
  mutate('/api/programs');
  mutate('/api/scholarships');
  mutate('/api/application-templates');
};

/**
 * Force refresh dashboard stats (ignores cache)
 */
export const forceRefreshDashboardStats = () => {
  mutate('/api/dashboard/stats', undefined, { 
    revalidate: true,
    populateCache: false 
  });
};