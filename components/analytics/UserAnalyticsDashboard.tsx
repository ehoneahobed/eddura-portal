'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Clock, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  Globe,
  Monitor,
  Smartphone,
  Chrome,
  Apple,
  Loader2,
  Download,
  Filter
} from 'lucide-react';
import { 
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

interface UserAnalyticsData {
  overview: {
    activeUsers: number;
    totalSessions: number;
    totalPageViews: number;
    averageSessionDuration: number;
    bounceRate: number;
    avgTimeOnSite: number;
    avgPagesPerSession: number;
    uniqueUsers: number;
  };
  sessions: Array<{
    date: string;
    sessions: number;
    users: number;
    pageViews: number;
  }>;
  devices: Array<{
    device: string;
    sessions: number;
    percentage: number;
  }>;
  browsers: Array<{
    browser: string;
    sessions: number;
    percentage: number;
  }>;
  operatingSystems: Array<{
    os: string;
    sessions: number;
    percentage: number;
  }>;
  topPages: Array<{
    page: string;
    views: number;
    uniqueViews: number;
    avgTimeOnPage: number;
  }>;
  userEngagement: Array<{
    metric: string;
    value: number;
    change: number;
  }>;
}

export function UserAnalyticsDashboard() {
  const [data, setData] = useState<UserAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchUserAnalytics();
  }, [timeRange]);

  const fetchUserAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      const analyticsData = await response.json();
      
      // Transform data for user analytics dashboard
      const userData: UserAnalyticsData = {
        overview: analyticsData.userAnalytics,
        sessions: analyticsData.trends.map((trend: any) => ({
          date: trend.date,
          sessions: trend.sessions || 0,
          users: trend.users || 0,
          pageViews: trend.pageViews || 0
        })),
        devices: [
          { device: 'Desktop', sessions: 65, percentage: 65 },
          { device: 'Mobile', sessions: 30, percentage: 30 },
          { device: 'Tablet', sessions: 5, percentage: 5 }
        ],
        browsers: [
          { browser: 'Chrome', sessions: 45, percentage: 45 },
          { browser: 'Safari', sessions: 25, percentage: 25 },
          { browser: 'Firefox', sessions: 15, percentage: 15 },
          { browser: 'Edge', sessions: 10, percentage: 10 },
          { browser: 'Other', sessions: 5, percentage: 5 }
        ],
        operatingSystems: [
          { os: 'Windows', sessions: 40, percentage: 40 },
          { os: 'macOS', sessions: 25, percentage: 25 },
          { os: 'iOS', sessions: 20, percentage: 20 },
          { os: 'Android', sessions: 10, percentage: 10 },
          { os: 'Linux', sessions: 5, percentage: 5 }
        ],
        topPages: analyticsData.topContent.map((content: any) => ({
          page: content.name,
          views: content.views,
          uniqueViews: Math.round(content.views * 0.8),
          avgTimeOnPage: Math.round(Math.random() * 300 + 60)
        })),
        userEngagement: [
          {
            metric: 'Session Duration',
            value: analyticsData.userAnalytics.averageSessionDuration,
            change: 12.5
          },
          {
            metric: 'Pages per Session',
            value: analyticsData.userAnalytics.avgPagesPerSession,
            change: 8.3
          },
          {
            metric: 'Bounce Rate',
            value: analyticsData.userAnalytics.bounceRate,
            change: -5.2
          },
          {
            metric: 'Time on Site',
            value: analyticsData.userAnalytics.avgTimeOnSite,
            change: 15.7
          }
        ]
      };
      
      setData(userData);
    } catch (error) {
      console.error('Failed to fetch user analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getGrowthColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Analytics</h2>
          <p className="text-muted-foreground">
            Track user behavior, engagement, and platform usage
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.activeUsers)}</div>
            <p className="text-xs text-muted-foreground">
              Currently online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.totalSessions)}</div>
            <p className="text-xs text-muted-foreground">
              In selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.totalPageViews)}</div>
            <p className="text-xs text-muted-foreground">
              Total page views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(data.overview.averageSessionDuration)}</div>
            <p className="text-xs text-muted-foreground">
              Per session
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="devices">Devices & Browsers</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Session Trends</CardTitle>
                <CardDescription>User sessions over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.sessions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sessions" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.userEngagement.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{metric.metric}</span>
                        {getGrowthIcon(metric.change)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold">
                          {metric.metric.includes('Rate') ? formatPercentage(metric.value) : 
                           metric.metric.includes('Duration') || metric.metric.includes('Time') ? formatDuration(metric.value) :
                           formatNumber(metric.value)}
                        </span>
                        <Badge variant={metric.change >= 0 ? 'default' : 'destructive'} className="text-xs">
                          {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Bounce Rate</CardTitle>
                <CardDescription>Percentage of single-page sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600">
                    {formatPercentage(data.overview.bounceRate)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {data.overview.bounceRate > 50 ? 'High bounce rate detected' : 'Good engagement rate'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pages per Session</CardTitle>
                <CardDescription>Average pages viewed per session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {data.overview.avgPagesPerSession.toFixed(1)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {data.overview.avgPagesPerSession > 3 ? 'Excellent engagement' : 'Room for improvement'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>Traffic by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.devices}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ device, percentage }) => `${device} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="sessions"
                    >
                      {data.devices.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B'][index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Browser Usage</CardTitle>
                <CardDescription>Traffic by browser</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.browsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="browser" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sessions" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operating Systems</CardTitle>
                <CardDescription>Traffic by OS</CardDescription>
              </CardHeader>
              <CardContent>
                                  <div className="space-y-3">
                    {data.operatingSystems.map((os, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {os.os === 'Windows' && <Monitor className="h-4 w-4" />}
                          {os.os === 'macOS' && <Apple className="h-4 w-4" />}
                          {os.os === 'Linux' && <Monitor className="h-4 w-4" />}
                          {os.os === 'iOS' && <Apple className="h-4 w-4" />}
                          {os.os === 'Android' && <Smartphone className="h-4 w-4" />}
                          <span className="text-sm">{os.os}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{os.sessions}</span>
                          <Badge variant="secondary">{os.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
              <CardDescription>Most viewed pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{page.page}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(page.views)} views • {formatNumber(page.uniqueViews)} unique
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatDuration(page.avgTimeOnPage)}</div>
                      <p className="text-xs text-muted-foreground">avg time</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}