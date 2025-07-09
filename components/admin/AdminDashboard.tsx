"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  GraduationCap, 
  Award, 
  Users, 
  FileText, 
  BarChart3, 
  Plus,
  Settings,
  Shield
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session } = useSession();

  const stats = [
    {
      title: "Total Schools",
      value: "24",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Total Programs",
      value: "156",
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Total Scholarships",
      value: "89",
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Total Users",
      value: "1,234",
      icon: Users,
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
      title: "Invite Admin",
      description: "Invite a new administrator",
      icon: Shield,
      href: "/admin/invite",
      color: "text-red-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session?.user?.firstName || session?.user?.email}! 👋
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
        {stats.map((stat) => (
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
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New school added</p>
                  <p className="text-xs text-gray-500">Harvard University was added 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-gray-500">john.doe@example.com joined 4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Scholarship updated</p>
                  <p className="text-xs text-gray-500">MIT Scholarship deadline extended 6 hours ago</p>
                </div>
              </div>
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