'use client';

import { useDashboardStats } from '@/hooks/use-dashboard';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivityCard } from '@/components/dashboard/RecentActivityCard';
import { QuickActionsCard } from '@/components/dashboard/QuickActionsCard';
import { TopItemsCard } from '@/components/dashboard/TopItemsCard';
import { PageSEO } from '@/components/seo/PageSEO';
import { School, BookOpen, GraduationCap, TrendingUp, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminDashboard() {
  const { stats, isLoading, isError, mutate } = useDashboardStats();

  if (isError) {
    return (
      <>
        <PageSEO 
          title="Dashboard Error"
          description="Error loading Eddura dashboard"
          noindex={true}
        />
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Overview of your educational platform
            </p>
          </div>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load dashboard data. Please refresh the page or try again later.
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  const statCards = [
    {
      title: 'Total Schools',
      value: stats?.schools || 0,
      icon: School,
      description: 'Educational institutions',
      color: 'text-blue-600',
      trend: { value: 8.2, isPositive: true }
    },
    {
      title: 'Total Programs',
      value: stats?.programs || 0,
      icon: BookOpen,
      description: 'Academic programs',
      color: 'text-green-600',
      trend: { value: 12.5, isPositive: true }
    },
    {
      title: 'Total Scholarships',
      value: stats?.scholarships || 0,
      icon: GraduationCap,
      description: 'Financial aid opportunities',
      color: 'text-purple-600',
      trend: { value: 15.3, isPositive: true }
    },
    {
      title: 'Growth Rate',
      value: `${stats?.growthRate || 0}%`,
      icon: TrendingUp,
      description: 'Month over month',
      color: 'text-orange-600'
    }
  ];

  return (
    <>
      <PageSEO 
        title="Admin Dashboard"
        description="Eddura admin dashboard for managing schools, programs, and scholarships. Access comprehensive educational management tools and analytics."
        keywords={['Eddura dashboard', 'educational management', 'admin portal', 'school management', 'program management']}
        noindex={true}
      />
      
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Overview of your educational platform
            </p>
          </div>
          <button
            onClick={() => mutate()}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Refresh Data
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              description={stat.description}
              color={stat.color}
              isLoading={isLoading}
              trend={stat.trend}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <RecentActivityCard 
              activities={stats?.recentActivity || []} 
              isLoading={isLoading}
            />
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <QuickActionsCard />
          </div>

          {/* Top Schools */}
          <div className="lg:col-span-1">
            <TopItemsCard
              title="Top Schools"
              type="schools"
              items={stats?.topSchools || []}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top Programs */}
          <TopItemsCard
            title="Top Programs by Tuition"
            type="programs"
            items={stats?.topPrograms || []}
            isLoading={isLoading}
          />

          {/* Top Scholarships */}
          <TopItemsCard
            title="Top Scholarships by Value"
            type="scholarships"
            items={stats?.topScholarships || []}
            isLoading={isLoading}
          />
        </div>

        {/* Data Summary */}
        {!isLoading && stats && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Platform Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Data Points:</span>
                <span className="ml-2 text-gray-600">
                  {(stats.schools + stats.programs + stats.scholarships).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>
                <span className="ml-2 text-gray-600">
                  {new Date().toLocaleString()}
                </span>
              </div>
              <div>
                <span className="font-medium">Data Health:</span>
                <span className="ml-2 text-green-600 font-medium">Excellent</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}