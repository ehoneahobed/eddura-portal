"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  User, 
  Shield, 
  Clock, 
  Globe, 
  Monitor,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Mail,
  Phone
} from "lucide-react";
import { useActiveUsers, ActiveUser } from "@/hooks/use-active-users";
import { formatDistanceToNow } from 'date-fns';

export default function ActiveUsersPage() {
  const [minutes, setMinutes] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [sortBy, setSortBy] = useState<'duration' | 'name' | 'email' | 'lastLogin'>('duration');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, isError, error, refetch } = useActiveUsers(minutes);

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

  // Filter and sort users
  const filteredAndSortedUsers = data?.activeUsers
    ?.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = userTypeFilter === 'all' || user.type === userTypeFilter;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'duration':
          comparison = a.sessionDuration - b.sessionDuration;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'lastLogin':
          const aTime = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
          const bTime = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
          comparison = aTime - bTime;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    }) || [];

  const handleSort = (field: 'duration' | 'name' | 'email' | 'lastLogin') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Active Users</h1>
            <p className="text-gray-600">Monitor users currently logged in to the platform</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
            <Button 
              variant="outline" 
              onClick={refetch}
              className="mt-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Active Users</h1>
          <p className="text-gray-600">Monitor users currently logged in to the platform</p>
        </div>
        <Button 
          variant="outline" 
          onClick={refetch}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Active</p>
                  <p className="text-2xl font-bold">{data.summary.totalActiveUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <User className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Regular Users</p>
                  <p className="text-2xl font-bold">{data.summary.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Admin Users</p>
                  <p className="text-2xl font-bold">{data.summary.totalAdmins}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Avg Session</p>
                  <p className="text-2xl font-bold">{data.summary.averageSessionDurationFormatted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">User Type</label>
              <Select value={userTypeFilter} onValueChange={(value: any) => setUserTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="user">Regular Users</SelectItem>
                  <SelectItem value="admin">Admin Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Window</label>
              <Select value={String(minutes)} onValueChange={(value) => setMinutes(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last 1 minute</SelectItem>
                  <SelectItem value="5">Last 5 minutes</SelectItem>
                  <SelectItem value="15">Last 15 minutes</SelectItem>
                  <SelectItem value="30">Last 30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="duration">Session Duration</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="lastLogin">Last Login</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions ({filteredAndSortedUsers.length})</CardTitle>
          <CardDescription>
            Users currently logged in and active on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedUsers.length > 0 ? (
            <div className="space-y-4">
              {filteredAndSortedUsers.map((user) => (
                <div key={user.sessionId} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getUserTypeIcon(user.type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.name}</h3>
                          <Badge className={getUserTypeColor(user.type)}>
                            {user.type === 'admin' ? user.role || 'Admin' : 'User'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{user.sessionDurationFormatted}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span>{user.country || 'Unknown location'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-gray-400" />
                      <span>{user.device || 'Unknown'} • {user.browser || 'Unknown'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Pages: {user.totalPages} • Logins: {user.loginCount}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>Last login: {user.lastLoginAt ? formatTimeAgo(user.lastLoginAt) : 'Never'}</span>
                    </div>
                  </div>
                  
                  {user.ipAddress && (
                    <div className="mt-2 text-xs text-gray-500">
                      IP: {user.ipAddress}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active users</h3>
              <p className="text-gray-600">
                {searchTerm || userTypeFilter !== 'all' 
                  ? 'No users match your current filters.' 
                  : `No users have been active in the last ${minutes} minutes.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}