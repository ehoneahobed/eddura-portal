'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { 
  Package, 
  FileText, 
  Target, 
  Plus, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  School,
  Award,
  BookOpen
} from 'lucide-react';

interface ApplicationStats {
  total: number;
  draft: number;
  inProgress: number;
  submitted: number;
  accepted: number;
  rejected: number;
  readyToApply: number;
  upcomingDeadlines: number;
}

export default function ApplicationManagePage() {
  // Mock data - replace with real API calls
  const stats: ApplicationStats = {
    total: 8,
    draft: 2,
    inProgress: 3,
    submitted: 2,
    accepted: 1,
    rejected: 0,
    readyToApply: 2,
    upcomingDeadlines: 3
  };

  const quickActions = [
    {
      title: 'Create Application Package',
      description: 'Start a new application for a school or program',
      icon: Package,
      href: '/applications/packages',
      color: 'bg-blue-500 hover:bg-blue-600',
      badge: 'New'
    },
    {
      title: 'Browse Scholarships',
      description: 'Find and apply for scholarships',
      icon: Award,
      href: '/scholarships',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Explore Programs',
      description: 'Discover schools and programs',
      icon: School,
      href: '/programs',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Manage Documents',
      description: 'Upload and organize your documents',
      icon: FileText,
      href: '/documents',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  const recentApplications = [
    {
      id: '1',
      name: 'MIT Computer Science',
      type: 'program',
      status: 'in_progress',
      progress: 75,
      deadline: '2024-12-15',
      priority: 'high'
    },
    {
      id: '2',
      name: 'Stanford MBA',
      type: 'program',
      status: 'draft',
      progress: 25,
      deadline: '2024-11-30',
      priority: 'medium'
    },
    {
      id: '3',
      name: 'Google Scholarship',
      type: 'scholarship',
      status: 'submitted',
      progress: 100,
      deadline: '2024-10-15',
      priority: 'high'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your applications, track progress, and stay organized
          </p>
        </div>
        <Link href="/applications/packages">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Application Package
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready to Apply</p>
                <p className="text-2xl font-bold text-green-600">{stats.readyToApply}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
                <p className="text-2xl font-bold text-orange-600">{stats.upcomingDeadlines}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${action.color} text-white`}>
                        <action.icon className="h-6 w-6" />
                      </div>
                      {action.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Link href="/applications/packages">
              <Button variant="outline" size="sm">
                View All
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {app.type === 'program' ? (
                      <School className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Award className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{app.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getStatusColor(app.status)}>
                        {app.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(app.priority)}>
                        {app.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Progress</div>
                    <div className="text-sm font-medium">{app.progress}%</div>
                  </div>
                  <div className="w-24">
                    <Progress value={app.progress} className="h-2" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Deadline</div>
                    <div className="text-sm font-medium">
                      {getDaysUntilDeadline(app.deadline)} days
                    </div>
                  </div>
                  <Link href={`/applications/packages/${app.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Application Types Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <School className="h-5 w-5 mr-2" />
              Programs & Schools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Applications</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ready to Apply</span>
                <span className="font-medium text-green-600">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="font-medium text-yellow-600">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Accepted</span>
                <span className="font-medium text-green-600">1</span>
              </div>
            </div>
            <Link href="/applications/packages">
              <Button variant="outline" className="w-full mt-4">
                Manage Programs
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Scholarships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Applications</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ready to Apply</span>
                <span className="font-medium text-green-600">1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="font-medium text-yellow-600">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Awarded</span>
                <span className="font-medium text-green-600">0</span>
              </div>
            </div>
            <Link href="/scholarships">
              <Button variant="outline" className="w-full mt-4">
                Browse Scholarships
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 