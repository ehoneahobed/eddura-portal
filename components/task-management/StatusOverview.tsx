'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  Pause,
  FileText,
  Users,
  Target,
  Eye,
  MessageSquare
} from 'lucide-react';
import { ApplicationStatus } from '@/models/Application';

interface Application {
  _id: string;
  applicationType: 'school' | 'program' | 'scholarship';
  title: string;
  description?: string;
  status: ApplicationStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  applicationDeadline: string;
  earlyDecisionDeadline?: string;
  regularDecisionDeadline?: string;
  rollingDeadline?: boolean;
  progress: number;
  startedAt: string;
  lastActivityAt: string;
  submittedAt?: string;
  notes?: string;
  tags: string[];
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    category: 'document' | 'test' | 'recommendation' | 'follow_up' | 'interview' | 'other';
    completedAt?: string;
    notes?: string;
  }>;
  communications: Array<{
    id: string;
    type: 'email' | 'phone' | 'in_person' | 'portal_message';
    subject: string;
    content: string;
    date: string;
    withWhom: string;
    outcome?: string;
    followUpRequired: boolean;
    followUpDate?: string;
  }>;
  // Related data
  scholarshipId?: {
    _id: string;
    title: string;
    value?: number;
    currency?: string;
  };
  schoolId?: {
    _id: string;
    name: string;
    country: string;
    city: string;
  };
  programId?: {
    _id: string;
    title: string;
    school: string;
    degree: string;
  };
}

interface DashboardStats {
  totalApplications: number;
  activeApplications: number;
  overdueTasks: number;
  upcomingDeadlines: number;
  applicationsByType: {
    school: number;
    program: number;
    scholarship: number;
  };
  applicationsByStatus: Record<ApplicationStatus, number>;
}

interface StatusOverviewProps {
  stats: DashboardStats;
  applications: Application[];
}

export default function StatusOverview({ stats, applications }: StatusOverviewProps) {
  const getStatusInfo = (status: ApplicationStatus) => {
    switch (status) {
      case 'not_started':
        return { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Not Started' };
      case 'researching':
        return { color: 'bg-blue-100 text-blue-800', icon: TrendingUp, label: 'Researching' };
      case 'draft':
        return { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Draft' };
      case 'in_progress':
        return { color: 'bg-blue-100 text-blue-800', icon: Play, label: 'In Progress' };
      case 'waiting_for_documents':
        return { color: 'bg-yellow-100 text-yellow-800', icon: FileText, label: 'Waiting for Documents' };
      case 'waiting_for_recommendations':
        return { color: 'bg-orange-100 text-orange-800', icon: Users, label: 'Waiting for Recommendations' };
      case 'waiting_for_test_scores':
        return { color: 'bg-purple-100 text-purple-800', icon: Target, label: 'Waiting for Test Scores' };
      case 'ready_to_submit':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Ready to Submit' };
      case 'submitted':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Submitted' };
      case 'under_review':
        return { color: 'bg-purple-100 text-purple-800', icon: Eye, label: 'Under Review' };
      case 'interview_scheduled':
        return { color: 'bg-indigo-100 text-indigo-800', icon: Calendar, label: 'Interview Scheduled' };
      case 'interview_completed':
        return { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Interview Completed' };
      case 'waiting_for_feedback':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Waiting for Feedback' };
      case 'need_to_follow_up':
        return { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Need to Follow Up' };
      case 'approved':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Rejected' };
      case 'waitlisted':
        return { color: 'bg-orange-100 text-orange-800', icon: Pause, label: 'Waitlisted' };
      case 'deferred':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Deferred' };
      case 'withdrawn':
        return { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Withdrawn' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Unknown' };
    }
  };

  const getTypeInfo = (type: 'school' | 'program' | 'scholarship') => {
    switch (type) {
      case 'school':
        return { color: 'bg-blue-100 text-blue-800', icon: GraduationCap, label: 'Schools' };
      case 'program':
        return { color: 'bg-purple-100 text-purple-800', icon: BookOpen, label: 'Programs' };
      case 'scholarship':
        return { color: 'bg-green-100 text-green-800', icon: Award, label: 'Scholarships' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Unknown' };
    }
  };

  const getDeadlineStatus = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline < 0) {
      return { status: 'overdue', color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (daysUntilDeadline <= 7) {
      return { status: 'urgent', color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (daysUntilDeadline <= 30) {
      return { status: 'soon', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    } else {
      return { status: 'ok', color: 'text-green-600', bgColor: 'bg-green-50' };
    }
  };

  const urgentApplications = applications.filter(app => {
    const deadlineStatus = getDeadlineStatus(app.applicationDeadline);
    return deadlineStatus.status === 'urgent' || deadlineStatus.status === 'overdue';
  });

  const activeStatuses = ['not_started', 'researching', 'draft', 'in_progress', 'waiting_for_documents', 
    'waiting_for_recommendations', 'waiting_for_test_scores', 'ready_to_submit', 'submitted', 
    'under_review', 'interview_scheduled', 'interview_completed', 'waiting_for_feedback', 'need_to_follow_up'];

  const activeApplications = applications.filter(app => activeStatuses.includes(app.status));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Application Types Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Application Types
          </CardTitle>
          <CardDescription>
            Distribution of your applications by type
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(stats.applicationsByType).map(([type, count]) => {
            const typeInfo = getTypeInfo(type as 'school' | 'program' | 'scholarship');
            const percentage = stats.totalApplications > 0 ? (count / stats.totalApplications) * 100 : 0;
            const TypeIcon = typeInfo.icon;

            return (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TypeIcon className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium">{typeInfo.label}</p>
                    <p className="text-sm text-gray-600">{count} applications</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{percentage.toFixed(1)}%</p>
                  <Progress value={percentage} className="w-20 h-2" />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Application Status
          </CardTitle>
          <CardDescription>
            Current status of your applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(stats.applicationsByStatus)
            .filter(([_, count]) => count > 0)
            .sort(([_, a], [__, b]) => b - a)
            .slice(0, 8)
            .map(([status, count]) => {
              const statusInfo = getStatusInfo(status as ApplicationStatus);
              const StatusIcon = statusInfo.icon;

              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-4 h-4" />
                    <Badge className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              );
            })}
        </CardContent>
      </Card>

      {/* Urgent Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Urgent Deadlines
          </CardTitle>
          <CardDescription>
            Applications with deadlines within 7 days or overdue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {urgentApplications.length > 0 ? (
            <div className="space-y-3">
              {urgentApplications.slice(0, 5).map((app) => {
                const deadlineStatus = getDeadlineStatus(app.applicationDeadline);
                const daysUntilDeadline = Math.ceil(
                  (new Date(app.applicationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <div key={app._id} className={`p-3 rounded-lg ${deadlineStatus.bgColor}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{app.title}</p>
                        <p className="text-sm text-gray-600">{app.applicationType}</p>
                      </div>
                      <div className={`text-right ${deadlineStatus.color}`}>
                        <p className="font-semibold">
                          {daysUntilDeadline < 0 ? `${Math.abs(daysUntilDeadline)} days overdue` :
                           daysUntilDeadline === 0 ? 'Due today' :
                           daysUntilDeadline === 1 ? 'Due tomorrow' :
                           `${daysUntilDeadline} days left`}
                        </p>
                        <p className="text-sm">Progress: {app.progress}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {urgentApplications.length > 5 && (
                <p className="text-sm text-gray-600 text-center">
                  +{urgentApplications.length - 5} more urgent applications
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-gray-600">No urgent deadlines!</p>
              <p className="text-sm text-gray-500">You're all caught up.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Progress Overview
          </CardTitle>
          <CardDescription>
            Average progress across all applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeApplications.length > 0 ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {Math.round(activeApplications.reduce((sum, app) => sum + app.progress, 0) / activeApplications.length)}%
                </p>
                <p className="text-sm text-gray-600">Average Progress</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Applications in Progress</span>
                  <span className="font-medium">{activeApplications.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span className="font-medium">
                    {applications.filter(app => app.progress === 100).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Not Started</span>
                  <span className="font-medium">
                    {applications.filter(app => app.progress === 0).length}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No active applications</p>
              <p className="text-sm text-gray-500">Start by adding your first application.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}