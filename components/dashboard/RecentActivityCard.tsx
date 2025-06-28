import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RecentActivity } from '@/hooks/use-dashboard';
import { School, BookOpen, GraduationCap } from 'lucide-react';

interface RecentActivityCardProps {
  activities: RecentActivity[];
  isLoading?: boolean;
}

const getActivityIcon = (type: RecentActivity['type']) => {
  switch (type) {
    case 'school':
      return School;
    case 'program':
      return BookOpen;
    case 'scholarship':
      return GraduationCap;
    default:
      return School;
  }
};

const getActivityColor = (type: RecentActivity['type']) => {
  switch (type) {
    case 'school':
      return 'bg-blue-500';
    case 'program':
      return 'bg-green-500';
    case 'scholarship':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};

const getActionColor = (action: RecentActivity['action']) => {
  switch (action) {
    case 'created':
      return 'text-green-600';
    case 'updated':
      return 'text-blue-600';
    case 'deleted':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return activityTime.toLocaleDateString();
};

export function RecentActivityCard({ activities, isLoading = false }: RecentActivityCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No recent activity
            </div>
          ) : (
            activities.slice(0, 5).map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full`}></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-gray-400" />
                      <p className="text-sm font-medium">{activity.title}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getActionColor(activity.action)}`}
                      >
                        {activity.action}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
} 