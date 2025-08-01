"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  User, 
  Shield, 
  Clock, 
  Globe, 
  Monitor,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useActiveUsers, ActiveUser } from "@/hooks/use-active-users";
import { formatDistanceToNow } from 'date-fns';

interface ActiveUsersCardProps {
  minutes?: number;
}

export default function ActiveUsersCard({ minutes = 5 }: ActiveUsersCardProps) {
  const { data, isLoading, isError, error, refetch } = useActiveUsers(minutes);
  const [showDetails, setShowDetails] = useState(false);

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const getUserTypeIcon = (type: 'user' | 'admin') => {
    return type === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />;
  };

  const getUserTypeColor = (type: 'user' | 'admin') => {
    return type === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  const getDeviceIcon = (device?: string) => {
    if (!device) return <Monitor className="w-4 h-4" />;
    return device === 'mobile' ? <Monitor className="w-4 h-4" /> : <Monitor className="w-4 h-4" />;
  };

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Active Users
          </CardTitle>
          <CardDescription>
            Users currently logged in and active
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refetch}
            className="mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Active Users
            </CardTitle>
            <CardDescription>
              {isLoading ? 'Loading...' : `${data?.summary.totalActiveUsers || 0} users active in the last ${minutes} minutes`}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refetch}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : data ? (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {data.summary.totalUsers}
                </div>
                <div className="text-sm text-gray-600">Regular Users</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {data.summary.totalAdmins}
                </div>
                <div className="text-sm text-gray-600">Admin Users</div>
              </div>
            </div>

            {/* Average Session Duration */}
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Average Session:</span>
                <span className="font-semibold text-green-600">
                  {data.summary.averageSessionDurationFormatted}
                </span>
              </div>
            </div>

            {/* Active Users List */}
            {data.activeUsers.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Active Sessions</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {data.activeUsers.slice(0, showDetails ? undefined : 5).map((user) => (
                    <div key={user.sessionId} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getUserTypeIcon(user.type)}
                          <span className="font-medium">{user.name}</span>
                          <Badge className={getUserTypeColor(user.type)}>
                            {user.type === 'admin' ? user.role || 'Admin' : 'User'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {user.sessionDurationFormatted}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        {user.email}
                      </div>

                      {showDetails && (
                        <div className="space-y-1 text-xs text-gray-500">
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(user.device)}
                            <span>{user.device || 'Unknown'} • {user.browser || 'Unknown'} • {user.os || 'Unknown'}</span>
                          </div>
                          {user.country && (
                            <div className="flex items-center gap-2">
                              <Globe className="w-3 h-3" />
                              <span>{user.city ? `${user.city}, ` : ''}{user.country}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span>Pages: {user.totalPages}</span>
                            <span>•</span>
                            <span>Login count: {user.loginCount}</span>
                            <span>•</span>
                            <span>Last login: {user.lastLoginAt ? formatTimeAgo(user.lastLoginAt) : 'Never'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {data.activeUsers.length > 5 && !showDetails && (
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDetails(true)}
                    >
                      Show {data.activeUsers.length - 5} more users
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No active users in the last {minutes} minutes</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}