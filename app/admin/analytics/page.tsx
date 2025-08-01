"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAnalyticsDashboard } from "@/components/analytics/UserAnalyticsDashboard";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  GraduationCap, 
  Award, 
  FileText,
  Globe,
  Calendar,
  DollarSign,
  Eye,
  Loader2,
  Download,
  Filter
} from "lucide-react";
import { 
  ChartContainer
} from "@/components/ui/chart";
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
} from "recharts";

// Analytics data interfaces
interface AnalyticsData {
  overview: OverviewMetrics;
  trends: TrendData[];
  geographic: GeographicData[];
  topContent: TopContentData[];
  recentActivity: ActivityData[];
  financial: FinancialData;
}

interface OverviewMetrics {
  totalSchools: number;
  totalPrograms: number;
  totalScholarships: number;
  totalTemplates: number;
  growthRate: number;
  activeUsers: number;
  totalValue: number;
}

interface TrendData {
  date: string;
  schools: number;
  programs: number;
  scholarships: number;
  templates: number;
}

interface GeographicData {
  country: string;
  schools: number;
  programs: number;
  scholarships: number;
  color: string;
}

interface TopContentData {
  name: string;
  type: 'school' | 'program' | 'scholarship';
  views: number;
  growth: number;
}

interface ActivityData {
  id: string;
  type: string;
  action: string;
  title: string;
  timestamp: string;
  user: string;
}

interface FinancialData {
  totalScholarshipValue: number;
  averageProgramCost: number;
  topScholarships: Array<{
    title: string;
    value: number;
    currency: string;
  }>;
  costDistribution: Array<{
    range: string;
    count: number;
    color: string;
  }>;
}

export default function AdminAnalyticsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        // Fallback to mock data for now
        setAnalyticsData(getMockAnalyticsData());
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalyticsData(getMockAnalyticsData());
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const getMockAnalyticsData = (): AnalyticsData => ({
    overview: {
      totalSchools: 156,
      totalPrograms: 892,
      totalScholarships: 445,
      totalTemplates: 67,
      growthRate: 12.5,
      activeUsers: 1234,
      totalValue: 2500000
    },
    trends: [
      { date: '2024-01', schools: 120, programs: 650, scholarships: 320, templates: 45 },
      { date: '2024-02', schools: 135, programs: 720, scholarships: 380, templates: 52 },
      { date: '2024-03', schools: 142, programs: 780, scholarships: 410, templates: 58 },
      { date: '2024-04', schools: 148, programs: 820, scholarships: 425, templates: 62 },
      { date: '2024-05', schools: 152, programs: 850, scholarships: 435, templates: 65 },
      { date: '2024-06', schools: 156, programs: 892, scholarships: 445, templates: 67 }
    ],
    geographic: [
      { country: 'United States', schools: 45, programs: 280, scholarships: 150, color: '#3B82F6' },
      { country: 'United Kingdom', schools: 32, programs: 180, scholarships: 95, color: '#EF4444' },
      { country: 'Canada', schools: 28, programs: 165, scholarships: 85, color: '#10B981' },
      { country: 'Australia', schools: 25, programs: 140, scholarships: 75, color: '#F59E0B' },
      { country: 'Germany', schools: 18, programs: 95, scholarships: 50, color: '#8B5CF6' },
      { country: 'Others', schools: 8, programs: 32, scholarships: 20, color: '#6B7280' }
    ],
    topContent: [
      { name: 'MIT Computer Science', type: 'program', views: 1245, growth: 15.2 },
      { name: 'Stanford University', type: 'school', views: 1180, growth: 8.7 },
      { name: 'Harvard Scholarship', type: 'scholarship', views: 956, growth: 22.1 },
      { name: 'Oxford Engineering', type: 'program', views: 892, growth: 12.3 },
      { name: 'Cambridge University', type: 'school', views: 845, growth: 6.8 }
    ],
    recentActivity: [
      { id: '1', type: 'school', action: 'created', title: 'New York University', timestamp: '2024-06-15T10:30:00Z', user: 'admin@example.com' },
      { id: '2', type: 'program', action: 'updated', title: 'Computer Science MSc', timestamp: '2024-06-15T09:15:00Z', user: 'moderator@example.com' },
      { id: '3', type: 'scholarship', action: 'created', title: 'Tech Innovation Grant', timestamp: '2024-06-15T08:45:00Z', user: 'admin@example.com' },
      { id: '4', type: 'template', action: 'updated', title: 'Engineering Application', timestamp: '2024-06-14T16:20:00Z', user: 'support@example.com' }
    ],
    financial: {
      totalScholarshipValue: 2500000,
      averageProgramCost: 45000,
      topScholarships: [
        { title: 'MIT Presidential Scholarship', value: 75000, currency: 'USD' },
        { title: 'Stanford Graduate Fellowship', value: 65000, currency: 'USD' },
        { title: 'Oxford Clarendon Fund', value: 55000, currency: 'GBP' },
        { title: 'Cambridge Gates Scholarship', value: 50000, currency: 'GBP' }
      ],
      costDistribution: [
        { range: '$0-25K', count: 180, color: '#10B981' },
        { range: '$25K-50K', count: 220, color: '#3B82F6' },
        { range: '$50K-75K', count: 150, color: '#F59E0B' },
        { range: '$75K+', count: 95, color: '#EF4444' }
      ]
    }
  });

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">
            Comprehensive insights into your educational platform performance.
          </p>
        </div>
        <div className="flex items-center space-x-4">
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
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading analytics data...</p>
          </div>
        </div>
      ) : analyticsData ? (
        <>
          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Schools</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.overview.totalSchools)}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  {getGrowthIcon(analyticsData.overview.growthRate)}
                  <span className="text-sm text-gray-600 ml-1">
                    {analyticsData.overview.growthRate}% from last month
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Programs</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.overview.totalPrograms)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  {getGrowthIcon(analyticsData.overview.growthRate)}
                  <span className="text-sm text-gray-600 ml-1">
                    {analyticsData.overview.growthRate}% from last month
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Scholarships</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.overview.totalScholarships)}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  {getGrowthIcon(analyticsData.overview.growthRate)}
                  <span className="text-sm text-gray-600 ml-1">
                    {analyticsData.overview.growthRate}% from last month
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.overview.totalValue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  {getGrowthIcon(analyticsData.overview.growthRate)}
                  <span className="text-sm text-gray-600 ml-1">
                    {analyticsData.overview.growthRate}% from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">User Analytics</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="geographic">Geographic</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Growth Trends Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Growth Trends</CardTitle>
                    <CardDescription>Platform growth over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        schools: { color: "#3B82F6" },
                        programs: { color: "#10B981" },
                        scholarships: { color: "#8B5CF6" },
                        templates: { color: "#F59E0B" }
                      }}
                      className="h-[300px]"
                    >
                      <LineChart data={analyticsData.trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="schools" stroke="var(--color-schools)" />
                        <Line type="monotone" dataKey="programs" stroke="var(--color-programs)" />
                        <Line type="monotone" dataKey="scholarships" stroke="var(--color-scholarships)" />
                        <Line type="monotone" dataKey="templates" stroke="var(--color-templates)" />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Top Content */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Content</CardTitle>
                    <CardDescription>Most viewed items</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.topContent.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="capitalize">
                              {item.type}
                            </Badge>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">{item.views} views</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {getGrowthIcon(item.growth)}
                            <span className="text-sm text-gray-600 ml-1">{item.growth}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UserAnalyticsDashboard />
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Growth</CardTitle>
                    <CardDescription>Detailed monthly trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        schools: { color: "#3B82F6" },
                        programs: { color: "#10B981" },
                        scholarships: { color: "#8B5CF6" }
                      }}
                      className="h-[400px]"
                    >
                      <BarChart data={analyticsData.trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="schools" fill="var(--color-schools)" />
                        <Bar dataKey="programs" fill="var(--color-programs)" />
                        <Bar dataKey="scholarships" fill="var(--color-scholarships)" />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest platform updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Eye className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-gray-500">
                              {activity.action} by {activity.user}
                            </p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {activity.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="geographic" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Geographic Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Geographic Distribution</CardTitle>
                    <CardDescription>Schools and programs by country</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        schools: { color: "#3B82F6" },
                        programs: { color: "#10B981" },
                        scholarships: { color: "#8B5CF6" }
                      }}
                      className="h-[400px]"
                    >
                      <BarChart data={analyticsData.geographic}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="country" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="schools" fill="var(--color-schools)" />
                        <Bar dataKey="programs" fill="var(--color-programs)" />
                        <Bar dataKey="scholarships" fill="var(--color-scholarships)" />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Geographic Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Schools by Country</CardTitle>
                    <CardDescription>Distribution of educational institutions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        schools: { color: "#3B82F6" },
                        programs: { color: "#10B981" },
                        scholarships: { color: "#8B5CF6" }
                      }}
                      className="h-[400px]"
                    >
                      <PieChart>
                        <Pie
                          data={analyticsData.geographic}
                          dataKey="schools"
                          nameKey="country"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {analyticsData.geographic.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Financial Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Overview</CardTitle>
                    <CardDescription>Scholarship values and program costs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(analyticsData.financial.totalScholarshipValue)}
                          </p>
                          <p className="text-sm text-gray-600">Total Scholarship Value</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(analyticsData.financial.averageProgramCost)}
                          </p>
                          <p className="text-sm text-gray-600">Average Program Cost</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Top Scholarships</h4>
                        <div className="space-y-2">
                          {analyticsData.financial.topScholarships.map((scholarship, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="text-sm font-medium">{scholarship.title}</span>
                              <span className="text-sm text-green-600 font-bold">
                                {formatCurrency(scholarship.value, scholarship.currency)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cost Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Program Cost Distribution</CardTitle>
                    <CardDescription>Distribution of program costs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        count: { color: "#3B82F6" }
                      }}
                      className="h-[400px]"
                    >
                      <BarChart data={analyticsData.financial.costDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="var(--color-count)" />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No analytics data available</p>
        </div>
      )}
    </div>
  );
} 