'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock,
  Calendar,
  BarChart3,
  Download,
  Share2
} from 'lucide-react';
import { format, subDays, subWeeks, subMonths } from 'date-fns';

interface ContentAnalyticsProps {
  contentId: string;
  viewCount: number;
  engagementRate?: number;
  conversionRate?: number;
}

interface AnalyticsData {
  views: number;
  uniqueViews: number;
  engagementRate: number;
  conversionRate: number;
  avgTimeOnPage: number;
  bounceRate: number;
  socialShares: number;
  downloads: number;
  period: string;
  change: {
    views: number;
    engagement: number;
    conversion: number;
  };
}

export default function ContentAnalytics({ contentId, viewCount, engagementRate, conversionRate }: ContentAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [contentId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/content/${contentId}/analytics?period=${timeRange}`);
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data.data);
      } else {
        // Fallback to mock data for demo
        setAnalyticsData(generateMockData());
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalyticsData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (): AnalyticsData => {
    const baseViews = viewCount || Math.floor(Math.random() * 1000) + 100;
    const baseEngagement = engagementRate || Math.random() * 0.3 + 0.1;
    const baseConversion = conversionRate || Math.random() * 0.05 + 0.01;
    
    return {
      views: baseViews,
      uniqueViews: Math.floor(baseViews * 0.8),
      engagementRate: baseEngagement,
      conversionRate: baseConversion,
      avgTimeOnPage: Math.floor(Math.random() * 300) + 60,
      bounceRate: Math.random() * 0.4 + 0.2,
      socialShares: Math.floor(Math.random() * 50) + 5,
      downloads: Math.floor(Math.random() * 20) + 2,
      period: timeRange,
      change: {
        views: Math.floor(Math.random() * 20) - 10,
        engagement: Math.random() * 0.1 - 0.05,
        conversion: Math.random() * 0.02 - 0.01
      }
    };
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return `${(num * 100).toFixed(1)}%`;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          No analytics data available
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Content Performance</h3>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold">{formatNumber(analyticsData.views)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getChangeIcon(analyticsData.change.views)}
                  <span className={`text-sm ${getChangeColor(analyticsData.change.views)}`}>
                    {analyticsData.change.views > 0 ? '+' : ''}{analyticsData.change.views}%
                  </span>
                </div>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold">{formatPercentage(analyticsData.engagementRate)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getChangeIcon(analyticsData.change.engagement)}
                  <span className={`text-sm ${getChangeColor(analyticsData.change.engagement)}`}>
                    {analyticsData.change.engagement > 0 ? '+' : ''}{formatPercentage(analyticsData.change.engagement)}
                  </span>
                </div>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold">{formatPercentage(analyticsData.conversionRate)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getChangeIcon(analyticsData.change.conversion)}
                  <span className={`text-sm ${getChangeColor(analyticsData.change.conversion)}`}>
                    {analyticsData.change.conversion > 0 ? '+' : ''}{formatPercentage(analyticsData.change.conversion)}
                  </span>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Time on Page</p>
                <p className="text-2xl font-bold">{formatTime(analyticsData.avgTimeOnPage)}</p>
                <p className="text-sm text-gray-500 mt-1">Per session</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Engagement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Unique Views</span>
              <span className="font-medium">{formatNumber(analyticsData.uniqueViews)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Bounce Rate</span>
              <span className="font-medium">{formatPercentage(analyticsData.bounceRate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Social Shares</span>
              <span className="font-medium">{analyticsData.socialShares}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Downloads</span>
              <span className="font-medium">{analyticsData.downloads}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Views vs Previous Period</span>
                <Badge variant={analyticsData.change.views > 0 ? 'default' : 'destructive'}>
                  {analyticsData.change.views > 0 ? '+' : ''}{analyticsData.change.views}%
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    analyticsData.change.views > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(Math.abs(analyticsData.change.views), 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Engagement vs Previous Period</span>
                <Badge variant={analyticsData.change.engagement > 0 ? 'default' : 'destructive'}>
                  {analyticsData.change.engagement > 0 ? '+' : ''}{formatPercentage(analyticsData.change.engagement)}
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    analyticsData.change.engagement > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(Math.abs(analyticsData.change.engagement * 1000), 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Analytics Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 