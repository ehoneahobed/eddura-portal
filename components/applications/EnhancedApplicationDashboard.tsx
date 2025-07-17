'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GraduationCap, 
  DollarSign, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Plus,
  TrendingUp,
  Users,
  Target,
  Award
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

interface DashboardStats {
  totalInterests: number;
  totalApplications: number;
  totalScholarships: number;
  upcomingInterviews: number;
  completedApplications: number;
  totalAwards: number;
  averageProgress: number;
}

interface RecentActivity {
  id: string;
  type: 'interest' | 'application' | 'scholarship' | 'interview' | 'award';
  title: string;
  description: string;
  date: string;
  status: string;
}

interface UpcomingDeadline {
  id: string;
  type: 'program' | 'scholarship';
  name: string;
  deadline: string;
  daysLeft: number;
  status: string;
}

interface EnhancedApplicationDashboardProps {
  userId: string;
}

export default function EnhancedApplicationDashboard({ userId }: EnhancedApplicationDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalInterests: 0,
    totalApplications: 0,
    totalScholarships: 0,
    upcomingInterviews: 0,
    completedApplications: 0,
    totalAwards: 0,
    averageProgress: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [interestsResponse, applicationsResponse, scholarshipsResponse, interviewsResponse] = await Promise.all([
        fetch('/api/user-interests'),
        fetch('/api/application-packages'),
        fetch('/api/scholarship-applications'),
        fetch('/api/user-interests?hasInterview=true')
      ]);

      const interestsData = await interestsResponse.json();
      const applicationsData = await applicationsResponse.json();
      const scholarshipsData = await scholarshipsResponse.json();
      const interviewsData = await interviewsResponse.json();

      // Calculate stats
      const interests = interestsData.userInterests || [];
      const applications = applicationsData.applicationPackages || [];
      const scholarships = scholarshipsData.applications || [];
      const interviews = interviewsData.userInterests || [];

      const upcomingInterviews = interviews.filter((interview: any) => 
        interview.interviewScheduled && 
        isAfter(new Date(interview.interviewDate), new Date())
      ).length;

      const completedApplications = applications.filter((app: any) => 
        app.applicationStatus === 'submitted' || app.applicationStatus === 'decision_made'
      ).length;

      const totalAwards = scholarships.filter((scholarship: any) => 
        scholarship.status === 'awarded'
      ).length;

      const averageProgress = applications.length > 0 
        ? applications.reduce((sum: number, app: any) => sum + (app.progress || 0), 0) / applications.length
        : 0;

      setStats({
        totalInterests: interests.length,
        totalApplications: applications.length,
        totalScholarships: scholarships.length,
        upcomingInterviews,
        completedApplications,
        totalAwards,
        averageProgress: Math.round(averageProgress)
      });

      // Generate recent activity
      const activity: RecentActivity[] = [];
      
      // Add recent interests
      interests.slice(0, 3).forEach((interest: any) => {
        activity.push({
          id: interest._id,
          type: 'interest',
          title: interest.programId?.name || interest.programName || 'External Program',
          description: `Added to interests with ${interest.status} status`,
          date: interest.createdAt,
          status: interest.status
        });
      });

      // Add recent applications
      applications.slice(0, 3).forEach((app: any) => {
        activity.push({
          id: app._id,
          type: 'application',
          title: app.name,
          description: `Application package created with ${app.progress}% progress`,
          date: app.createdAt,
          status: app.applicationStatus || 'in_progress'
        });
      });

      // Add recent scholarships
      scholarships.slice(0, 3).forEach((scholarship: any) => {
        activity.push({
          id: scholarship._id,
          type: 'scholarship',
          title: scholarship.scholarshipId?.name || 'Scholarship',
          description: `Scholarship application ${scholarship.status}`,
          date: scholarship.createdAt,
          status: scholarship.status
        });
      });

      // Sort by date and take top 10
      activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivity(activity.slice(0, 10));

      // Generate upcoming deadlines
      const deadlines: UpcomingDeadline[] = [];
      
      // Add program deadlines
      interests.forEach((interest: any) => {
        if (interest.programId?.deadline) {
          const deadline = new Date(interest.programId.deadline);
          const daysLeft = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysLeft >= 0 && daysLeft <= 30) {
            deadlines.push({
              id: interest._id,
              type: 'program',
              name: interest.programId.name,
              deadline: interest.programId.deadline,
              daysLeft,
              status: interest.status
            });
          }
        }
      });

      // Add scholarship deadlines
      scholarships.forEach((scholarship: any) => {
        if (scholarship.scholarshipId?.deadline) {
          const deadline = new Date(scholarship.scholarshipId.deadline);
          const daysLeft = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysLeft >= 0 && daysLeft <= 30) {
            deadlines.push({
              id: scholarship._id,
              type: 'scholarship',
              name: scholarship.scholarshipId.name,
              deadline: scholarship.scholarshipId.deadline,
              daysLeft,
              status: scholarship.status
            });
          }
        }
      });

      // Sort by days left and take top 5
      deadlines.sort((a, b) => a.daysLeft - b.daysLeft);
      setUpcomingDeadlines(deadlines.slice(0, 5));

    } catch (error) {
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'interested':
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'preparing':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'applied':
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'interviewed':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
      case 'awarded':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'interest':
        return <Target className="w-4 h-4" />;
      case 'application':
        return <FileText className="w-4 h-4" />;
      case 'scholarship':
        return <DollarSign className="w-4 h-4" />;
      case 'interview':
        return <Calendar className="w-4 h-4" />;
      case 'award':
        return <Award className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Application Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your academic journey and application progress</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/applications/interests/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Interest
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/applications/scholarships/new">
              <DollarSign className="w-4 h-4 mr-2" />
              Apply for Scholarship
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interests</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInterests}</div>
            <p className="text-xs text-muted-foreground">
              Programs you're interested in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Application Packages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              Active application packages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scholarship Applications</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScholarships}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAwards} awards received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingInterviews}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled interviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Application Progress</span>
              <span className="text-sm text-gray-600">{stats.averageProgress}%</span>
            </div>
            <Progress value={stats.averageProgress} className="w-full" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.completedApplications}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalApplications - stats.completedApplications}</div>
                <div className="text-xs text-gray-600">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.totalAwards}</div>
                <div className="text-xs text-gray-600">Awards</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-red-600" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingDeadlines.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No upcoming deadlines</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingDeadlines.map((deadline) => (
                      <div key={deadline.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{deadline.name}</div>
                          <div className="text-sm text-gray-600">
                            {format(new Date(deadline.deadline), 'MMM dd, yyyy')}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={deadline.daysLeft <= 7 ? "destructive" : "secondary"}
                            className="mb-1"
                          >
                            {deadline.daysLeft} days
                          </Badge>
                          <div className="text-xs text-gray-600 capitalize">
                            {deadline.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{activity.title}</div>
                          <div className="text-xs text-gray-600">{activity.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {format(new Date(activity.date), 'MMM dd, yyyy')}
                          </div>
                        </div>
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deadlines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No upcoming deadlines</p>
              ) : (
                <div className="space-y-4">
                  {upcomingDeadlines.map((deadline) => (
                    <div key={deadline.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {deadline.type === 'program' ? (
                          <GraduationCap className="w-5 h-5 text-blue-600" />
                        ) : (
                          <DollarSign className="w-5 h-5 text-green-600" />
                        )}
                        <div>
                          <div className="font-medium">{deadline.name}</div>
                          <div className="text-sm text-gray-600">
                            {format(new Date(deadline.deadline), 'EEEE, MMMM dd, yyyy')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={deadline.daysLeft <= 7 ? "destructive" : deadline.daysLeft <= 14 ? "default" : "secondary"}
                          className="mb-2"
                        >
                          {deadline.daysLeft} days left
                        </Badge>
                        <div className="text-xs text-gray-600 capitalize">
                          Status: {deadline.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No recent activity</p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{activity.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{activity.description}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          {format(new Date(activity.date), 'MMM dd, yyyy at h:mm a')}
                        </div>
                      </div>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quick-actions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <GraduationCap className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <h3 className="font-semibold mb-2">Browse Programs</h3>
                <p className="text-sm text-gray-600 mb-4">Discover new programs and add them to your interests</p>
                <Button asChild className="w-full">
                  <Link href="/programs">Browse Programs</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <DollarSign className="w-12 h-12 mx-auto text-green-600 mb-4" />
                <h3 className="font-semibold mb-2">Find Scholarships</h3>
                <p className="text-sm text-gray-600 mb-4">Search and apply for scholarships</p>
                <Button asChild className="w-full">
                  <Link href="/scholarships">Browse Scholarships</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <FileText className="w-12 h-12 mx-auto text-purple-600 mb-4" />
                <h3 className="font-semibold mb-2">Create Application Package</h3>
                <p className="text-sm text-gray-600 mb-4">Start building your application package</p>
                <Button asChild className="w-full">
                  <Link href="/applications/packages/new">Create Package</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 mx-auto text-orange-600 mb-4" />
                <h3 className="font-semibold mb-2">Manage Interviews</h3>
                <p className="text-sm text-gray-600 mb-4">Schedule and track your interviews</p>
                <Button asChild className="w-full">
                  <Link href="/applications/interviews">View Interviews</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Target className="w-12 h-12 mx-auto text-red-600 mb-4" />
                <h3 className="font-semibold mb-2">Add External Program</h3>
                <p className="text-sm text-gray-600 mb-4">Track applications for programs not in our system</p>
                <Button asChild className="w-full">
                  <Link href="/applications/interests/new">Add External</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Award className="w-12 h-12 mx-auto text-yellow-600 mb-4" />
                <h3 className="font-semibold mb-2">View Awards</h3>
                <p className="text-sm text-gray-600 mb-4">Track your scholarship awards and achievements</p>
                <Button asChild className="w-full">
                  <Link href="/applications/scholarships">View Awards</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}