'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
  BookOpen,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface ApplicationStats {
  total: number;
  draft: number;
  inProgress: number;
  readyForSubmission: number;
  submitted: number;
  accepted: number;
  rejected: number;
  upcomingDeadlines: number;
}

interface Application {
  _id: string;
  name: string;
  applicationType: 'scholarship' | 'school' | 'program' | 'external';
  status: 'draft' | 'in_progress' | 'ready_for_submission' | 'submitted' | 'accepted' | 'rejected' | 'waitlisted' | 'withdrawn';
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  applicationDeadline?: string;
  targetName?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ApplicationManagePage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    draft: 0,
    inProgress: 0,
    readyForSubmission: 0,
    submitted: 0,
    accepted: 0,
    rejected: 0,
    upcomingDeadlines: 0
  });
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchApplicationData();
    }
  }, [session?.user?.id]);

  const fetchApplicationData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/applications');
      
      if (response.ok) {
        const data = await response.json();
        const apps = data.applications || [];
        setApplications(apps);
        
        // Calculate stats from real data
        const now = new Date();
        const upcomingDeadlines = apps.filter((app: Application) => {
          if (!app.applicationDeadline) return false;
          const deadline = new Date(app.applicationDeadline);
          const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays > 0 && diffDays <= 30;
        }).length;

        const newStats: ApplicationStats = {
          total: apps.length,
          draft: apps.filter((app: Application) => app.status === 'draft').length,
          inProgress: apps.filter((app: Application) => app.status === 'in_progress').length,
          readyForSubmission: apps.filter((app: Application) => app.status === 'ready_for_submission').length,
          submitted: apps.filter((app: Application) => app.status === 'submitted').length,
          accepted: apps.filter((app: Application) => app.status === 'accepted').length,
          rejected: apps.filter((app: Application) => app.status === 'rejected').length,
          upcomingDeadlines
        };
        
        setStats(newStats);
      } else {
        toast.error('Failed to fetch application data');
      }
    } catch (error) {
      console.error('Error fetching application data:', error);
      toast.error('Failed to fetch application data');
    } finally {
      setIsLoading(false);
    }
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

  // Get recent applications (last 5)
  const recentApplications = applications
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready_for_submission':
        return 'bg-green-100 text-green-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'waitlisted':
        return 'bg-orange-100 text-orange-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
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
                <p className="text-2xl font-bold text-green-600">{stats.readyForSubmission}</p>
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
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Loading applications...</span>
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No applications yet</p>
                <p className="text-sm">Create your first application package to get started</p>
              </div>
            ) : (
              recentApplications.map((app) => (
                <div key={app._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {app.applicationType === 'program' || app.applicationType === 'school' ? (
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
                        {app.applicationDeadline ? getDaysUntilDeadline(app.applicationDeadline) : 'No deadline'} days
                      </div>
                    </div>
                    <Link href={`/applications/${app._id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
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
              {(() => {
                const programApps = applications.filter(app => 
                  app.applicationType === 'program' || app.applicationType === 'school'
                );
                return (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Applications</span>
                      <span className="font-medium">{programApps.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Ready for Submission</span>
                      <span className="font-medium text-green-600">
                        {programApps.filter(app => app.status === 'ready_for_submission').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">In Progress</span>
                      <span className="font-medium text-yellow-600">
                        {programApps.filter(app => app.status === 'in_progress').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Accepted</span>
                      <span className="font-medium text-green-600">
                        {programApps.filter(app => app.status === 'accepted').length}
                      </span>
                    </div>
                  </>
                );
              })()}
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
              {(() => {
                const scholarshipApps = applications.filter(app => 
                  app.applicationType === 'scholarship'
                );
                return (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Applications</span>
                      <span className="font-medium">{scholarshipApps.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Ready for Submission</span>
                      <span className="font-medium text-green-600">
                        {scholarshipApps.filter(app => app.status === 'ready_for_submission').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">In Progress</span>
                      <span className="font-medium text-yellow-600">
                        {scholarshipApps.filter(app => app.status === 'in_progress').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Awarded</span>
                      <span className="font-medium text-green-600">
                        {scholarshipApps.filter(app => app.status === 'accepted').length}
                      </span>
                    </div>
                  </>
                );
              })()}
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