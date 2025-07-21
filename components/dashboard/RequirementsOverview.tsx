'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  FileText,
  Plus,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface RequirementsOverview {
  totalApplications: number;
  totalRequirements: number;
  completedRequirements: number;
  pendingRequirements: number;
  overdueRequirements: number;
  overallProgress: number;
  applicationsWithDeadlines: {
    _id: string;
    name: string;
    applicationDeadline: string;
    progress: number;
    daysUntilDeadline: number;
  }[];
  recentActivity: {
    _id: string;
    applicationName: string;
    requirementName: string;
    action: 'completed' | 'updated' | 'added';
    timestamp: string;
  }[];
}

export const RequirementsOverview: React.FC = () => {
  const [overview, setOverview] = useState<RequirementsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch requirements overview
  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);

      // This would typically fetch from a dedicated endpoint
      // For now, we'll simulate the data
      const mockData: RequirementsOverview = {
        totalApplications: 5,
        totalRequirements: 47,
        completedRequirements: 32,
        pendingRequirements: 12,
        overdueRequirements: 3,
        overallProgress: 68,
        applicationsWithDeadlines: [
          {
            _id: '1',
            name: 'MIT Computer Science Application',
            applicationDeadline: '2024-12-15',
            progress: 85,
            daysUntilDeadline: 7
          },
          {
            _id: '2',
            name: 'Stanford Engineering Application',
            applicationDeadline: '2024-12-20',
            progress: 60,
            daysUntilDeadline: 12
          },
          {
            _id: '3',
            name: 'Harvard Business School Application',
            applicationDeadline: '2024-12-10',
            progress: 45,
            daysUntilDeadline: 2
          }
        ],
        recentActivity: [
          {
            _id: '1',
            applicationName: 'MIT Computer Science Application',
            requirementName: 'Personal Statement',
            action: 'completed',
            timestamp: '2024-12-08T10:30:00Z'
          },
          {
            _id: '2',
            applicationName: 'Stanford Engineering Application',
            requirementName: 'TOEFL Score',
            action: 'updated',
            timestamp: '2024-12-07T15:45:00Z'
          },
          {
            _id: '3',
            applicationName: 'Harvard Business School Application',
            requirementName: 'Recommendation Letter',
            action: 'added',
            timestamp: '2024-12-06T09:15:00Z'
          }
        ]
      };

      setOverview(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'updated':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'added':
        return <Plus className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'completed':
        return 'text-green-600';
      case 'updated':
        return 'text-yellow-600';
      case 'added':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <Target className="h-8 w-8 mx-auto mb-2" />
            <p>{error || 'Failed to load requirements overview'}</p>
            <Button onClick={fetchOverview} className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Requirements Overview</h2>
          <p className="text-gray-600 mt-1">
            Track your application requirements and progress
          </p>
        </div>
        <Link href="/applications/packages">
          <Button>
            <Target className="h-4 w-4 mr-2" />
            View All Applications
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{overview.totalApplications}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requirements</p>
                <p className="text-2xl font-bold text-gray-900">{overview.totalRequirements}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{overview.completedRequirements}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-gray-900">{overview.overallProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Requirements Progress</span>
              <span className="text-sm text-gray-600">
                {overview.completedRequirements} of {overview.totalRequirements} completed
              </span>
            </div>
            <Progress value={overview.overallProgress} className="h-3" />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{overview.completedRequirements}</div>
              <div className="text-sm text-green-700">Completed</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{overview.pendingRequirements}</div>
              <div className="text-sm text-yellow-700">Pending</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{overview.overdueRequirements}</div>
              <div className="text-sm text-red-700">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overview.applicationsWithDeadlines.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming deadlines</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overview.applicationsWithDeadlines
                .sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline)
                .slice(0, 5)
                .map((app) => (
                  <div key={app._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{app.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{app.daysUntilDeadline} days remaining</span>
                        <span>{app.progress}% complete</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={app.progress} className="w-20 h-2" />
                      <Badge 
                        variant={app.daysUntilDeadline <= 3 ? 'destructive' : 
                               app.daysUntilDeadline <= 7 ? 'default' : 'secondary'}
                      >
                        {app.daysUntilDeadline <= 0 ? 'Overdue' : 
                         app.daysUntilDeadline === 1 ? 'Tomorrow' : 
                         `${app.daysUntilDeadline} days`}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overview.recentActivity.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overview.recentActivity.slice(0, 5).map((activity) => (
                <div key={activity._id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getActionIcon(activity.action)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.requirementName}
                    </p>
                    <p className="text-xs text-gray-600">
                      {activity.applicationName} • {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                  <Badge className={getActionColor(activity.action)}>
                    {activity.action}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/applications/packages">
              <Button variant="outline" className="w-full h-16">
                <div className="text-center">
                  <Plus className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Create Application Package</div>
                </div>
              </Button>
            </Link>
            <Link href="/applications/templates">
              <Button variant="outline" className="w-full h-16">
                <div className="text-center">
                  <FileText className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Browse Templates</div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 