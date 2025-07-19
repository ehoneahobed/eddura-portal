'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  Target,
  RefreshCw
} from 'lucide-react';
import { RequirementStatus, RequirementCategory } from '@/types/requirements';

interface ProgressData {
  total: number;
  completed: number;
  required: number;
  requiredCompleted: number;
  optional: number;
  optionalCompleted: number;
  byCategory: {
    [key in RequirementCategory]: {
      total: number;
      completed: number;
    };
  };
  byStatus: {
    [key in RequirementStatus]: number;
  };
  percentage: number;
  requiredPercentage: number;
}

interface ProgressTrackerProps {
  applicationId: string;
  applicationDeadline?: Date;
  onRefresh?: () => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  applicationId,
  applicationDeadline,
  onRefresh
}) => {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch progress data
  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/applications/${applicationId}/requirements/progress`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch progress');
      }

      setProgress(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [applicationId]);

  const getStatusIcon = (status: RequirementStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      case 'waived':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'not_applicable':
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryColor = (category: RequirementCategory) => {
    switch (category) {
      case 'academic':
        return 'bg-blue-100 text-blue-800';
      case 'financial':
        return 'bg-green-100 text-green-800';
      case 'personal':
        return 'bg-purple-100 text-purple-800';
      case 'professional':
        return 'bg-orange-100 text-orange-800';
      case 'administrative':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: RequirementStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'waived':
        return 'bg-blue-100 text-blue-800';
      case 'not_applicable':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilDeadline = () => {
    if (!applicationDeadline) return null;
    const now = new Date();
    const deadline = new Date(applicationDeadline);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getReadinessStatus = () => {
    if (!progress) return { status: 'unknown', message: 'Loading...', color: 'text-gray-500' };

    if (progress.requiredPercentage === 100) {
      return { 
        status: 'ready', 
        message: 'Ready to apply!', 
        color: 'text-green-600',
        icon: <CheckCircle className="h-5 w-5" />
      };
    } else if (progress.requiredPercentage >= 75) {
      return { 
        status: 'almost-ready', 
        message: 'Almost ready', 
        color: 'text-yellow-600',
        icon: <Clock className="h-5 w-5" />
      };
    } else if (progress.requiredPercentage >= 50) {
      return { 
        status: 'in-progress', 
        message: 'In progress', 
        color: 'text-orange-600',
        icon: <TrendingUp className="h-5 w-5" />
      };
    } else {
      return { 
        status: 'needs-work', 
        message: 'Needs work', 
        color: 'text-red-600',
        icon: <AlertCircle className="h-5 w-5" />
      };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button onClick={fetchProgress} className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Target className="h-8 w-8 mx-auto mb-2" />
            <p>No progress data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const readinessStatus = getReadinessStatus();
  const daysUntilDeadline = getDaysUntilDeadline();

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Application Progress
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchProgress();
                onRefresh?.();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">{progress.percentage}%</span>
            </div>
            <Progress value={progress.percentage} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{progress.completed} of {progress.total} completed</span>
              <span>{progress.total - progress.completed} remaining</span>
            </div>
          </div>

          {/* Required vs Optional */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Required</span>
                <span className="text-sm text-gray-600">{progress.requiredPercentage}%</span>
              </div>
              <Progress value={progress.requiredPercentage} className="h-2" />
              <div className="text-xs text-gray-500 mt-1">
                {progress.requiredCompleted} of {progress.required} completed
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Optional</span>
                <span className="text-sm text-gray-600">
                  {progress.optional > 0 ? Math.round((progress.optionalCompleted / progress.optional) * 100) : 0}%
                </span>
              </div>
              <Progress 
                value={progress.optional > 0 ? (progress.optionalCompleted / progress.optional) * 100 : 0} 
                className="h-2" 
              />
              <div className="text-xs text-gray-500 mt-1">
                {progress.optionalCompleted} of {progress.optional} completed
              </div>
            </div>
          </div>

          {/* Readiness Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {readinessStatus.icon}
              <span className={`font-medium ${readinessStatus.color}`}>
                {readinessStatus.message}
              </span>
            </div>
            {daysUntilDeadline !== null && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  {daysUntilDeadline > 0 
                    ? `${daysUntilDeadline} days until deadline`
                    : daysUntilDeadline === 0
                    ? 'Deadline is today'
                    : `${Math.abs(daysUntilDeadline)} days past deadline`
                  }
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Progress by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {progress.byCategory && Object.entries(progress.byCategory).map(([category, data]) => {
              if (data.total === 0) return null;
              const percentage = Math.round((data.completed / data.total) * 100);
              
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(category as RequirementCategory)}>
                        {category}
                      </Badge>
                      <span className="text-sm font-medium">{percentage}%</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {data.completed}/{data.total}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Progress by Status */}
      <Card>
        <CardHeader>
          <CardTitle>Requirements by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {progress.byStatus && Object.entries(progress.byStatus).map(([status, count]) => {
              if (count === 0) return null;
              
              return (
                <div key={status} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  {getStatusIcon(status as RequirementStatus)}
                  <div>
                    <div className="text-sm font-medium capitalize">
                      {status.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-600">{count} requirements</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 