'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play,
  Calendar,
  Award,
  Filter,
  Search,
  Plus,
  Loader2,
  Eye,
  Edit,
  Trash2,
  Users,
  Phone,
  Mail,
  CalendarDays,
  Target,
  BookOpen,
  GraduationCap,
  School,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AddTaskModal from './AddTaskModal';

interface Application {
  _id: string;
  scholarshipId?: {
    _id: string;
    title: string;
    value?: number;
    currency?: string;
    deadline: string;
    type?: 'scholarship' | 'program' | 'school';
  };
  status: 'draft' | 'in_progress' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'waitlisted' | 'withdrawn';
  progress: number;
  currentSectionId?: string;
  startedAt: string;
  lastActivityAt: string;
  submittedAt?: string;
  estimatedTimeRemaining?: number;
  notes?: string;
}

interface Task {
  _id: string;
  type: 'application' | 'interview' | 'follow_up' | 'deadline' | 'document' | 'meeting';
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  completedAt?: string;
  applicationId?: string;
  application?: Application;
  createdAt: string;
  updatedAt: string;
}

interface TaskStats {
  totalApplications: number;
  activeApplications: number;
  overdueTasks: number;
  upcomingDeadlines: number;
  applicationTypes: {
    schools: number;
    programs: number;
    scholarships: number;
  };
  applicationStatus: {
    draft: number;
    submitted: number;
    approved: number;
    rejected: number;
  };
  progressOverview: {
    averageProgress: number;
    applicationsInProgress: number;
  };
}

export default function TaskManagementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch applications
      const applicationsResponse = await fetch('/api/applications');
      let applicationsData: any = { applications: [] };
      if (applicationsResponse.ok) {
        applicationsData = await applicationsResponse.json();
        const applications = applicationsData.applications || [];
        // Filter out applications without proper data
        const validApplications = applications.filter((app: any) => {
          const isValid = app && app._id && app.status;
          if (!isValid) {
            console.log('Invalid app - missing basic fields:', app);
            return false;
          }
          
          // Check if it has the required scholarshipId structure
          const hasValidScholarshipId = app.scholarshipId && app.scholarshipId.title;
          if (!hasValidScholarshipId) {
            console.log('Invalid app - missing scholarshipId or title:', app);
            return false;
          }
          
          return true;
        });
        console.log('Fetched applications:', applications);
        console.log('Application details:', applications.map((app: any) => ({
          id: app._id,
          status: app.status,
          hasScholarshipId: !!app.scholarshipId,
          scholarshipIdType: typeof app.scholarshipId,
          scholarshipIdKeys: app.scholarshipId ? Object.keys(app.scholarshipId) : null,
          title: app.scholarshipId?.title
        })));
        console.log('Valid applications:', validApplications);
        setApplications(validApplications);
      }

      // Fetch tasks
      const tasksResponse = await fetch('/api/tasks');
      let tasksData: any = { tasks: [] };
      if (tasksResponse.ok) {
        tasksData = await tasksResponse.json();
        console.log('Fetched tasks:', tasksData.tasks);
        setTasks(tasksData.tasks || []);
      } else {
        console.error('Failed to fetch tasks:', tasksResponse.status);
      }

      // Calculate stats
      calculateStats(applicationsData.applications || [], tasksData.tasks || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [session?.user?.id, fetchData]);

  const calculateStats = (apps: Application[], taskList: Task[]) => {
    try {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Filter out invalid applications
      const validApps = apps.filter(app => app && app._id && app.status);

      const stats: TaskStats = {
        totalApplications: validApps.length,
        activeApplications: validApps.filter(app => ['draft', 'in_progress', 'submitted', 'under_review'].includes(app.status)).length,
        overdueTasks: taskList.filter(task => 
          task && task.status === 'pending' && 
          task.dueDate && 
          new Date(task.dueDate) < now
        ).length,
        upcomingDeadlines: taskList.filter(task => 
          task && task.status === 'pending' && 
          task.dueDate && 
          new Date(task.dueDate) <= thirtyDaysFromNow &&
          new Date(task.dueDate) > now
        ).length,
        applicationTypes: {
          schools: validApps.filter(app => app.scholarshipId?.type === 'school').length,
          programs: validApps.filter(app => app.scholarshipId?.type === 'program').length,
          scholarships: validApps.filter(app => app.scholarshipId?.type === 'scholarship').length,
        },
        applicationStatus: {
          draft: validApps.filter(app => app.status === 'draft').length,
          submitted: validApps.filter(app => app.status === 'submitted').length,
          approved: validApps.filter(app => app.status === 'approved').length,
          rejected: validApps.filter(app => app.status === 'rejected').length,
        },
        progressOverview: {
          averageProgress: validApps.length > 0 
            ? Math.round(validApps.reduce((sum, app) => sum + (app.progress || 0), 0) / validApps.length)
            : 0,
          applicationsInProgress: validApps.filter(app => app.status === 'in_progress').length,
        }
      };

      setStats(stats);
    } catch (error) {
      console.error('Error calculating stats:', error);
      // Set default stats if calculation fails
      setStats({
        totalApplications: 0,
        activeApplications: 0,
        overdueTasks: 0,
        upcomingDeadlines: 0,
        applicationTypes: { schools: 0, programs: 0, scholarships: 0 },
        applicationStatus: { draft: 0, submitted: 0, approved: 0, rejected: 0 },
        progressOverview: { averageProgress: 0, applicationsInProgress: 0 }
      });
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'draft':
        return { color: 'bg-[var(--eddura-primary-50)] text-[var(--eddura-primary-800)] dark:bg-[var(--eddura-primary-800)] dark:text-[var(--eddura-primary-200)]', icon: FileText, label: 'Draft' };
      case 'in_progress':
        return { color: 'bg-[var(--eddura-info-50)] text-[var(--eddura-info-800)] dark:bg-[var(--eddura-info-900)] dark:text-[var(--eddura-info-200)]', icon: Play, label: 'In Progress' };
      case 'submitted':
        return { color: 'bg-[var(--eddura-warning-50)] text-[var(--eddura-warning-800)] dark:bg-[var(--eddura-warning-900)] dark:text-[var(--eddura-warning-200)]', icon: Clock, label: 'Submitted' };
      case 'under_review':
        return { color: 'bg-[var(--eddura-primary-100)] text-[var(--eddura-primary-800)] dark:bg-[var(--eddura-primary-800)] dark:text-[var(--eddura-primary-200)]', icon: Eye, label: 'Under Review' };
      case 'approved':
        return { color: 'bg-[var(--eddura-success-100)] text-[var(--eddura-success-800)] dark:bg-[var(--eddura-success-900)] dark:text-[var(--eddura-success-200)]', icon: CheckCircle, label: 'Approved' };
      case 'rejected':
        return { color: 'bg-[var(--eddura-error-50)] text-[var(--eddura-error-dark)] dark:bg-[var(--eddura-error-50)]/10 dark:text-[var(--eddura-error-light)]', icon: AlertCircle, label: 'Rejected' };
      case 'waitlisted':
        return { color: 'bg-[var(--eddura-accent-100)] text-[var(--eddura-accent-800)] dark:bg-[var(--eddura-accent-900)] dark:text-[var(--eddura-accent-200)]', icon: Clock, label: 'Waitlisted' };
      case 'withdrawn':
        return { color: 'bg-[var(--eddura-primary-50)] text-[var(--eddura-primary-800)] dark:bg-[var(--eddura-primary-800)] dark:text-[var(--eddura-primary-200)]', icon: Trash2, label: 'Withdrawn' };
      default:
        return { color: 'bg-[var(--eddura-primary-50)] text-[var(--eddura-primary-800)] dark:bg-[var(--eddura-primary-800)] dark:text-[var(--eddura-primary-200)]', icon: FileText, label: 'Unknown' };
    }
  };

  const getTaskTypeInfo = (type: string) => {
    switch (type) {
      case 'application':
        return { color: 'bg-blue-100 text-blue-800', icon: FileText, label: 'Application' };
      case 'interview':
        return { color: 'bg-green-100 text-green-800', icon: Users, label: 'Interview' };
      case 'follow_up':
        return { color: 'bg-purple-100 text-purple-800', icon: Phone, label: 'Follow Up' };
      case 'deadline':
        return { color: 'bg-red-100 text-red-800', icon: CalendarDays, label: 'Deadline' };
      case 'document':
        return { color: 'bg-orange-100 text-orange-800', icon: BookOpen, label: 'Document' };
      case 'meeting':
        return { color: 'bg-indigo-100 text-indigo-800', icon: Users, label: 'Meeting' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Task' };
    }
  };

  const getStripeForStatus = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-[var(--eddura-info-600)] dark:bg-[var(--eddura-info-600)]';
      case 'submitted':
      case 'under_review':
        return 'bg-[var(--eddura-warning-600)] dark:bg-[var(--eddura-warning-600)]';
      case 'approved':
        return 'bg-[var(--eddura-success-600)] dark:bg-[var(--eddura-success-600)]';
      case 'rejected':
        return 'bg-[var(--eddura-error-dark)] dark:bg-[var(--eddura-error-dark)]';
      case 'waitlisted':
        return 'bg-[var(--eddura-accent-600)] dark:bg-[var(--eddura-accent-600)]';
      default:
        return 'bg-[var(--eddura-primary)] dark:bg-[var(--eddura-primary-600)]';
    }
  };

  const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleContinueApplication = (applicationId: string) => {
    router.push(`/applications/${applicationId}`);
  };

  const handleViewApplication = (applicationId: string) => {
    router.push(`/applications/${applicationId}/view`);
  };

  const handleAddTask = () => {
    setShowAddTaskModal(true);
  };

  const handleAddApplication = () => {
    router.push('/scholarships');
  };

  // Filter applications based on search term and status filter
  const filteredApplications = applications.filter((application) => {
    // Search filter
    const matchesSearch = !searchTerm || 
      application.scholarshipId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginatedApplications = filteredApplications.slice(startIdx, endIdx);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--eddura-primary-50)] via-white to-[var(--eddura-primary-100)] dark:from-[var(--eddura-primary-900)] dark:via-[var(--eddura-primary-800)] dark:to-[var(--eddura-primary-900)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[var(--eddura-primary)]" />
          <h2 className="text-2xl font-bold text-[var(--eddura-primary-900)] dark:text-white mb-2">Loading Task Management</h2>
          <p className="text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">Getting your tasks and applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--eddura-primary-900)] dark:text-white">Task Management</h1>
          <p className="text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)] mt-2">
            Manage your applications, interviews, and follow-ups in one place
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleAddTask}
            variant="outline"
            className="border-[var(--eddura-primary)] text-[var(--eddura-primary)] hover:bg-[var(--eddura-primary-50)] dark:hover:bg-[var(--eddura-primary-800)]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
          <Button 
            onClick={handleAddApplication}
            className="bg-[var(--eddura-primary)] hover:bg-[var(--eddura-primary-600)] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Application
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden border border-[var(--eddura-primary-100)] dark:border-[var(--eddura-primary-800)] dark:bg-[var(--eddura-primary-900)]">
            <div className="absolute inset-x-0 top-0 h-1 bg-[var(--eddura-primary)] dark:bg-[var(--eddura-primary-600)]" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">Total Applications</p>
                  <p className="text-2xl font-bold text-[var(--eddura-primary-900)] dark:text-white">{stats.totalApplications}</p>
                </div>
                <FileText className="w-8 h-8 text-[var(--eddura-primary)]" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border border-[var(--eddura-primary-100)] dark:border-[var(--eddura-primary-800)] dark:bg-[var(--eddura-primary-900)]">
            <div className="absolute inset-x-0 top-0 h-1 bg-[var(--eddura-info-600)]" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">Active Applications</p>
                  <p className="text-2xl font-bold text-[var(--eddura-info-700)] dark:text-[var(--eddura-info-300)]">{stats.activeApplications}</p>
                </div>
                <Play className="w-8 h-8 text-[var(--eddura-info-600)]" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border border-[var(--eddura-primary-100)] dark:border-[var(--eddura-primary-800)] dark:bg-[var(--eddura-primary-900)]">
            <div className="absolute inset-x-0 top-0 h-1 bg-[var(--eddura-error-dark)]" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">Overdue Tasks</p>
                  <p className="text-2xl font-bold text-[var(--eddura-error-dark)]">{stats.overdueTasks}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-[var(--eddura-error-dark)]" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border border-[var(--eddura-primary-100)] dark:border-[var(--eddura-primary-800)] dark:bg-[var(--eddura-primary-900)]">
            <div className="absolute inset-x-0 top-0 h-1 bg-[var(--eddura-warning-600)]" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">Upcoming Deadlines</p>
                  <p className="text-2xl font-bold text-[var(--eddura-warning-700)]">{stats.upcomingDeadlines}</p>
                </div>
                <Calendar className="w-8 h-8 text-[var(--eddura-warning-600)]" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Application Types */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="relative overflow-hidden border border-[var(--eddura-primary-100)] dark:border-[var(--eddura-primary-800)] dark:bg-[var(--eddura-primary-900)]">
            <div className="absolute inset-x-0 top-0 h-1 bg-[var(--eddura-primary)] dark:bg-[var(--eddura-primary-600)]" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Application Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-[var(--eddura-info-600)]" />
                  <span className="text-sm font-medium">Schools</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[var(--eddura-primary-900)] dark:text-white">{stats?.applicationTypes.schools || 0}</p>
                  <p className="text-xs text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-400)]">
                    {stats?.totalApplications ? Math.round((stats.applicationTypes.schools / stats.totalApplications) * 100) : 0}%
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[var(--eddura-success-600)]" />
                  <span className="text-sm font-medium">Programs</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[var(--eddura-primary-900)] dark:text-white">{stats?.applicationTypes.programs || 0}</p>
                  <p className="text-xs text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-400)]">
                    {stats?.totalApplications ? Math.round((stats.applicationTypes.programs / stats.totalApplications) * 100) : 0}%
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[var(--eddura-accent-600)]" />
                  <span className="text-sm font-medium">Scholarships</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[var(--eddura-primary-900)] dark:text-white">{stats?.applicationTypes.scholarships || 0}</p>
                  <p className="text-xs text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-400)]">
                    {stats?.totalApplications ? Math.round((stats.applicationTypes.scholarships / stats.totalApplications) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-[var(--eddura-primary-900)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <CheckCircle className="w-5 h-5" />
                Application Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--eddura-primary-800)] dark:text-[var(--eddura-primary-200)]">Draft</span>
                <Badge variant="secondary">{stats?.applicationStatus.draft || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--eddura-primary-800)] dark:text-[var(--eddura-primary-200)]">Submitted</span>
                <Badge variant="secondary">{stats?.applicationStatus.submitted || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--eddura-primary-800)] dark:text-[var(--eddura-primary-200)]">Approved</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">{stats?.applicationStatus.approved || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--eddura-primary-800)] dark:text-[var(--eddura-primary-200)]">Rejected</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">{stats?.applicationStatus.rejected || 0}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Applications List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <Card className="relative overflow-hidden border border-[var(--eddura-primary-100)] dark:border-[var(--eddura-primary-800)] dark:bg-[var(--eddura-primary-900)]">
            <div className="absolute inset-x-0 top-0 h-1 bg-[var(--eddura-primary)] dark:bg-[var(--eddura-primary-600)]" />
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--eddura-primary-400)] dark:text-[var(--eddura-primary-300)]" />
                    <Input
                      placeholder="Search applications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-700)] focus-visible:ring-[var(--eddura-primary)] bg-white dark:bg-[var(--eddura-primary-800)] text-[var(--eddura-primary-900)] dark:text-white placeholder-[var(--eddura-primary-400)] dark:placeholder-[var(--eddura-primary-400)]"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="border-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-700)] bg-white text-[var(--eddura-primary-900)] dark:bg-[var(--eddura-primary-800)] dark:text-white">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="waitlisted">Waitlisted</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.length === 0 ? (
              <Card className="dark:bg-[var(--eddura-primary-900)]">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-[var(--eddura-primary-400)] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[var(--eddura-primary-900)] dark:text-white mb-2">No applications found</h3>
                  <p className="text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)] mb-4">
                    You haven&apos;t started any applications yet.
                  </p>
                  <Button 
                    onClick={handleAddApplication}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Browse Scholarships
                  </Button>
                </CardContent>
              </Card>
            ) : (
              paginatedApplications.map((application) => {
                const statusInfo = getStatusInfo(application.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <motion.div
                    key={application._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-md transition-shadow border border-[var(--eddura-primary-100)] dark:border-[var(--eddura-primary-800)] dark:bg-[var(--eddura-primary-900)]">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          {/* Left side - Application info */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                 <h3 className="text-lg font-semibold text-[var(--eddura-primary-900)] dark:text-white mb-1">
                                   {application.scholarshipId?.title || 'Untitled Application'}
                                 </h3>
                                  <div className="flex items-center gap-4 text-sm text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">
                                   {application.scholarshipId?.value && (
                                     <span className="flex items-center gap-1">
                                       <Award className="w-4 h-4" />
                                       {formatCurrency(application.scholarshipId.value, application.scholarshipId.currency)}
                                     </span>
                                   )}
                                   {application.scholarshipId?.deadline && (
                                     <span className="flex items-center gap-1">
                                       <Calendar className="w-4 h-4" />
                                       Deadline: {formatDate(application.scholarshipId.deadline)}
                                     </span>
                                   )}
                                 </div>
                               </div>
                              <Badge className={statusInfo.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusInfo.label}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm text-[var(--eddura-primary-700)] dark:text-[var(--eddura-primary-300)]">
                                <span>Progress</span>
                                <span>{application.progress}%</span>
                              </div>
                              <Progress value={application.progress} className="h-2 bg-[var(--eddura-primary-100)] dark:bg-[var(--eddura-primary-700)] [&>div]:bg-[var(--eddura-primary)] dark:[&>div]:bg-[var(--eddura-accent)]" />
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">
                              <span>Started: {formatDate(application.startedAt)}</span>
                              <span>Last activity: {formatDate(application.lastActivityAt)}</span>
                              {application.estimatedTimeRemaining && (
                                <span>~{application.estimatedTimeRemaining} min remaining</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Right side - Actions */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            {application.status === 'draft' || application.status === 'in_progress' ? (
                              <Button 
                                onClick={() => handleContinueApplication(application._id)}
                                className="bg-[var(--eddura-primary)] hover:bg-[var(--eddura-primary-600)] text-white"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Continue
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => handleViewApplication(application._id)}
                                variant="outline"
                                className="border-[var(--eddura-primary-200)] text-[var(--eddura-primary-800)] hover:bg-[var(--eddura-primary-50)] dark:text-white dark:border-[var(--eddura-primary-700)] dark:hover:bg-[var(--eddura-primary-800)]"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}

            {/* Pagination controls */}
            {filteredApplications.length > 0 && (
              <div className="flex items-center justify-between pt-2">
                <div className="text-sm text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">
                  Showing {startIdx + 1}-{Math.min(endIdx, filteredApplications.length)} of {filteredApplications.length}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-700)]"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                  >
                    Prev
                  </Button>
                  <span className="text-sm text-[var(--eddura-primary-900)] dark:text-white">
                    {safePage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-700)]"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                  >
                    Next
                  </Button>
                  <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(parseInt(v)); setCurrentPage(1); }}>
                    <SelectTrigger className="w-28 border-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-700)] bg-white dark:bg-[var(--eddura-primary-900)] text-[var(--eddura-primary-900)] dark:text-white">
                      <SelectValue placeholder="Page size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 / page</SelectItem>
                      <SelectItem value="10">10 / page</SelectItem>
                      <SelectItem value="20">20 / page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      {stats && (
        <Card className="border border-[var(--eddura-primary-100)] dark:border-[var(--eddura-primary-800)] dark:bg-[var(--eddura-primary-900)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-3xl font-extrabold text-[var(--eddura-primary)]">{stats.progressOverview.averageProgress}%</p>
                <p className="text-sm text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">Average Progress</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-[var(--eddura-success-600)]">{stats.progressOverview.applicationsInProgress}</p>
                <p className="text-sm text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">Applications in Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <AddTaskModal
          isOpen={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          applications={applications}
          onTaskAdded={() => {
            fetchData();
            setShowAddTaskModal(false);
          }}
        />
      )}
    </div>
  );
}