"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Eye, 
  Copy, 
  Star, 
  TrendingUp, 
  TrendingDown,
  Users,
  Calendar,
  BarChart3,
  Activity
} from "lucide-react";

interface LibraryAnalytics {
  totalDocuments: number;
  publishedDocuments: number;
  draftDocuments: number;
  reviewDocuments: number;
  totalViews: number;
  totalClones: number;
  totalDownloads: number;
  averageRating: number;
  totalRatings: number;
  recentActivity: {
    date: string;
    views: number;
    clones: number;
    ratings: number;
  }[];
  topDocuments: {
    _id: string;
    title: string;
    views: number;
    clones: number;
    averageRating: number;
  }[];
  documentTypes: {
    type: string;
    count: number;
  }[];
}

export default function LibraryAnalyticsWidget() {
  const [analytics, setAnalytics] = useState<LibraryAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/library/analytics?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        console.error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Failed to load analytics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Library Analytics</h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalDocuments)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Badge variant="outline" className="mr-2">
                {analytics.publishedDocuments} Published
              </Badge>
              <Badge variant="outline" className="mr-2">
                {analytics.draftDocuments} Draft
              </Badge>
              <Badge variant="outline">
                {analytics.reviewDocuments} Review
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalViews)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span>+12% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clones</CardTitle>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalClones)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span>+8% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span>{analytics.totalRatings} total ratings</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Documents and Document Types */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Documents
            </CardTitle>
            <CardDescription>Most viewed and cloned documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topDocuments.map((doc, index) => (
                <div key={doc._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                      <span className="text-sm font-medium text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{doc.title}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {formatNumber(doc.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Copy className="h-3 w-3" />
                          {formatNumber(doc.clones)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {doc.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Document Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Document Types
            </CardTitle>
            <CardDescription>Distribution by document type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.documentTypes.map((type) => (
                <div key={type.type} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{type.type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${(type.count / analytics.totalDocuments) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {type.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Views, clones, and ratings over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {analytics.recentActivity.map((day, index) => {
              const maxValue = Math.max(
                ...analytics.recentActivity.map(d => Math.max(d.views, d.clones, d.ratings))
              );
              return (
                <div key={day.date} className="flex flex-col items-center gap-2 flex-1">
                  <div className="flex flex-col gap-1 w-full">
                    <div 
                      className="bg-blue-500 rounded-t"
                      style={{ 
                        height: `${(day.views / maxValue) * 100}%`,
                        minHeight: '4px'
                      }}
                    />
                    <div 
                      className="bg-green-500"
                      style={{ 
                        height: `${(day.clones / maxValue) * 100}%`,
                        minHeight: '4px'
                      }}
                    />
                    <div 
                      className="bg-yellow-500 rounded-b"
                      style={{ 
                        height: `${(day.ratings / maxValue) * 100}%`,
                        minHeight: '4px'
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span>Views</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span>Clones</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded" />
              <span>Ratings</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 