"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  GraduationCap, 
  Award, 
  FileText, 
  BarChart3, 
  Plus,
  Settings,
  Shield
} from "lucide-react";
import Link from "next/link";
import { useDashboardStats } from "@/hooks/use-dashboard";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const { stats, isLoading, isError } = useDashboardStats();

  // Format numbers with commas for better readability
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Stats configuration with real data from database
  const statsConfig = [
    {
      title: "Total Schools",
      value: isLoading ? "..." : isError ? "Error" : formatNumber(stats?.schools || 0),
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Total Programs",
      value: isLoading ? "..." : isError ? "Error" : formatNumber(stats?.programs || 0),
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Total Scholarships",
      value: isLoading ? "..." : isError ? "Error" : formatNumber(stats?.scholarships || 0),
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Application Templates",
      value: isLoading ? "..." : isError ? "Error" : formatNumber(stats?.applicationTemplates || 0),
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  const quickActions = [
    {
      title: "Add School",
      description: "Create a new educational institution",
      icon: Building2,
      href: "/admin/schools/create",
      color: "text-blue-600"
    },
    {
      title: "Add Program",
      description: "Create a new academic program",
      icon: GraduationCap,
      href: "/admin/programs/create",
      color: "text-green-600"
    },
    {
      title: "Add Scholarship",
      description: "Create a new scholarship opportunity",
      icon: Award,
      href: "/admin/scholarships/create",
      color: "text-purple-600"
    },
    {
      title: "Add Admin User",
      description: "Invite or create a new admin user",
      icon: Shield,
      href: "/admin/invite",
      color: "text-red-600"
    }
  ];

  // Format recent activity for display
  const formatRecentActivity = (activity: any) => {
    const timeAgo = (timestamp: string) => {
      const now = new Date();
      const activityTime = new Date(timestamp);
      const diffInHours = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return "just now";
      if (diffInHours === 1) return "1 hour ago";
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return "1 day ago";
      return `${diffInDays} days ago`;
    };

    return activity?.recentActivity?.slice(0, 3).map((item: {
      id: string;
      type: 'school' | 'program' | 'scholarship' | 'template';
      description: string;
      timestamp: string;
    }) => ({
      id: item.id,
      icon: item.type === 'school' ? Building2 : 
            item.type === 'program' ? GraduationCap : 
            item.type === 'scholarship' ? Award : FileText,
      bgColor: item.type === 'school' ? 'bg-green-100' : 
               item.type === 'program' ? 'bg-blue-100' : 
               item.type === 'scholarship' ? 'bg-purple-100' : 'bg-orange-100',
      iconColor: item.type === 'school' ? 'text-green-600' : 
                 item.type === 'program' ? 'text-blue-600' : 
                 item.type === 'scholarship' ? 'text-purple-600' : 'text-orange-600',
      title: item.description,
      time: timeAgo(item.timestamp)
    })) || [];
  };

  const recentActivityItems = formatRecentActivity(stats);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Here&apos;s what&apos;s happening with your educational platform today.
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {session?.user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mr-4`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href}>
                  <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-start gap-2">
                    <div className="flex items-center gap-2">
                      <action.icon className={`w-4 h-4 ${action.color}`} />
                      <span className="font-medium">{action.title}</span>
                    </div>
                    <p className="text-xs text-gray-500 text-left">{action.description}</p>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest platform activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className="text-center py-4 text-gray-500">
                  Unable to load recent activity
                </div>
              ) : recentActivityItems.length > 0 ? (
                recentActivityItems.map((item: {
                  id: string;
                  icon: any;
                  bgColor: string;
                  iconColor: string;
                  title: string;
                  time: string;
                }) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 ${item.bgColor} rounded-full flex items-center justify-center`}>
                      <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No recent activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-green-800">Database</p>
                <p className="text-xs text-green-600">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-green-800">Authentication</p>
                <p className="text-xs text-green-600">Active</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-green-800">API Services</p>
                <p className="text-xs text-green-600">Online</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 