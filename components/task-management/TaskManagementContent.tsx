'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play,
  Pause,
  FileText,
  Award,
  GraduationCap,
  BookOpen,
  Filter,
  Search,
  Plus,
  Loader2,
  Eye,
  Edit,
  Trash2,
  Flag,
  MessageSquare,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckSquare,
  Square,
  CalendarDays,
  Users,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Star,
  Tag,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ApplicationType, ApplicationStatus } from '@/models/Application';
import AddApplicationModal from './AddApplicationModal';
import ApplicationDetailModal from './ApplicationDetailModal';
import TaskList from './TaskList';
import DeadlineCalendar from './DeadlineCalendar';
import StatusOverview from './StatusOverview';

interface Application {
  _id: string;
  applicationType: ApplicationType;
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

export default function TaskManagementContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'lastActivity' | 'progress'>('deadline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchApplications();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    filterAndSortApplications();
  }, [applications, searchTerm, statusFilter, typeFilter, priorityFilter, sortBy, sortOrder]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      } else {
        toast.error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortApplications = () => {
    let filtered = applications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(app => app.applicationType === typeFilter);
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(app => app.priority === priorityFilter);
    }

    // Sort applications
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'deadline':
          comparison = new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime();
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'lastActivity':
          comparison = new Date(a.lastActivityAt).getTime() - new Date(b.lastActivityAt).getTime();
          break;
        case 'progress':
          comparison = a.progress - b.progress;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredApplications(filtered);
  };

  const getStatusInfo = (status: ApplicationStatus) => {
    switch (status) {
      case 'not_started':
        return { color: 'bg-gray-100 text-gray-800', icon: Square, label: 'Not Started' };
      case 'researching':
        return { color: 'bg-blue-100 text-blue-800', icon: Search, label: 'Researching' };
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
        return { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Rejected' };
      case 'waitlisted':
        return { color: 'bg-orange-100 text-orange-800', icon: Pause, label: 'Waitlisted' };
      case 'deferred':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Deferred' };
      case 'withdrawn':
        return { color: 'bg-gray-100 text-gray-800', icon: Trash2, label: 'Withdrawn' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Unknown' };
    }
  };

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Urgent' };
      case 'high':
        return { color: 'bg-orange-100 text-orange-800', icon: Flag, label: 'High' };
      case 'medium':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Flag, label: 'Medium' };
      case 'low':
        return { color: 'bg-green-100 text-green-800', icon: Flag, label: 'Low' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Flag, label: 'Unknown' };
    }
  };

  const getTypeInfo = (type: ApplicationType) => {
    switch (type) {
      case 'school':
        return { color: 'bg-blue-100 text-blue-800', icon: GraduationCap, label: 'School' };
      case 'program':
        return { color: 'bg-purple-100 text-purple-800', icon: BookOpen, label: 'Program' };
      case 'scholarship':
        return { color: 'bg-green-100 text-green-800', icon: Award, label: 'Scholarship' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Unknown' };
    }
  };

  const getDeadlineStatus = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline < 0) {
      return { status: 'overdue', color: 'text-red-600', bgColor: 'bg-red-50', days: Math.abs(daysUntilDeadline) };
    } else if (daysUntilDeadline <= 7) {
      return { status: 'urgent', color: 'text-red-600', bgColor: 'bg-red-50', days: daysUntilDeadline };
    } else if (daysUntilDeadline <= 30) {
      return { status: 'soon', color: 'text-orange-600', bgColor: 'bg-orange-50', days: daysUntilDeadline };
    } else {
      return { status: 'ok', color: 'text-green-600', bgColor: 'bg-green-50', days: daysUntilDeadline };
    }
  };

  const calculateStats = (): DashboardStats => {
    const stats: DashboardStats = {
      totalApplications: applications.length,
      activeApplications: applications.filter(app => 
        ['not_started', 'researching', 'draft', 'in_progress', 'waiting_for_documents', 
         'waiting_for_recommendations', 'waiting_for_test_scores', 'ready_to_submit', 
         'submitted', 'under_review', 'interview_scheduled', 'interview_completed', 
         'waiting_for_feedback', 'need_to_follow_up'].includes(app.status)
      ).length,
      overdueTasks: applications.reduce((total, app) => 
        total + app.tasks.filter(task => task.status === 'overdue').length, 0
      ),
      upcomingDeadlines: applications.filter(app => {
        const deadlineStatus = getDeadlineStatus(app.applicationDeadline);
        return deadlineStatus.status === 'urgent' || deadlineStatus.status === 'soon';
      }).length,
      applicationsByType: {
        school: applications.filter(app => app.applicationType === 'school').length,
        program: applications.filter(app => app.applicationType === 'program').length,
        scholarship: applications.filter(app => app.applicationType === 'scholarship').length,
      },
      applicationsByStatus: {
        not_started: 0,
        researching: 0,
        draft: 0,
        in_progress: 0,
        waiting_for_documents: 0,
        waiting_for_recommendations: 0,
        waiting_for_test_scores: 0,
        ready_to_submit: 0,
        submitted: 0,
        under_review: 0,
        interview_scheduled: 0,
        interview_completed: 0,
        waiting_for_feedback: 0,
        need_to_follow_up: 0,
        approved: 0,
        rejected: 0,
        waitlisted: 0,
        deferred: 0,
        withdrawn: 0,
      }
    };

    // Count applications by status
    applications.forEach(app => {
      stats.applicationsByStatus[app.status]++;
    });

    return stats;
  };

  const handleApplicationUpdate = (updatedApplication: Application) => {
    setApplications(prev => 
      prev.map(app => app._id === updatedApplication._id ? updatedApplication : app)
    );
  };

  const handleApplicationDelete = (applicationId: string) => {
    setApplications(prev => prev.filter(app => app._id !== applicationId));
  };

  const handleAddApplication = (newApplication: Application) => {
    setApplications(prev => [...prev, newApplication]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Task Management</h2>
          <p className="text-gray-600">Getting your application data...</p>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive management for all your school, program, and scholarship applications
          </p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Application
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Applications</p>
                <p className="text-2xl font-bold text-blue-600">{stats.activeApplications}</p>
              </div>
              <Play className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdueTasks}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
                <p className="text-2xl font-bold text-orange-600">{stats.upcomingDeadlines}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <StatusOverview stats={stats} applications={applications} />
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search applications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="school">Schools</SelectItem>
                    <SelectItem value="program">Programs</SelectItem>
                    <SelectItem value="scholarship">Scholarships</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="researching">Researching</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting_for_documents">Waiting for Documents</SelectItem>
                    <SelectItem value="waiting_for_recommendations">Waiting for Recommendations</SelectItem>
                    <SelectItem value="waiting_for_test_scores">Waiting for Test Scores</SelectItem>
                    <SelectItem value="ready_to_submit">Ready to Submit</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                    <SelectItem value="interview_completed">Interview Completed</SelectItem>
                    <SelectItem value="waiting_for_feedback">Waiting for Feedback</SelectItem>
                    <SelectItem value="need_to_follow_up">Need to Follow Up</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="waitlisted">Waitlisted</SelectItem>
                    <SelectItem value="deferred">Deferred</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-full lg:w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="lastActivity">Last Activity</SelectItem>
                      <SelectItem value="progress">Progress</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications List */}
          <div className="grid gap-4">
            <AnimatePresence>
              {filteredApplications.map((application) => {
                const statusInfo = getStatusInfo(application.status);
                const priorityInfo = getPriorityInfo(application.priority);
                const typeInfo = getTypeInfo(application.applicationType);
                const deadlineStatus = getDeadlineStatus(application.applicationDeadline);
                const StatusIcon = statusInfo.icon;
                const PriorityIcon = priorityInfo.icon;
                const TypeIcon = typeInfo.icon;

                return (
                  <motion.div
                    key={application._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowDetailModal(true);
                          }}>
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          {/* Application Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 mb-2">
                                <TypeIcon className="w-5 h-5 text-gray-600" />
                                <Badge className={typeInfo.color}>
                                  {typeInfo.label}
                                </Badge>
                                <Badge className={statusInfo.color}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusInfo.label}
                                </Badge>
                                <Badge className={priorityInfo.color}>
                                  <PriorityIcon className="w-3 h-3 mr-1" />
                                  {priorityInfo.label}
                                </Badge>
                              </div>
                            </div>
                            
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {application.title}
                            </h3>
                            
                            {application.description && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {application.description}
                              </p>
                            )}

                            {/* Progress and Deadline */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="text-gray-600">Progress</span>
                                  <span className="font-medium">{application.progress}%</span>
                                </div>
                                <Progress value={application.progress} className="h-2" />
                              </div>
                              
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${deadlineStatus.bgColor} ${deadlineStatus.color}`}>
                                <Calendar className="w-4 h-4 inline mr-1" />
                                {deadlineStatus.days === 0 ? 'Due today' : 
                                 deadlineStatus.days === 1 ? 'Due tomorrow' :
                                 deadlineStatus.status === 'overdue' ? `${deadlineStatus.days} days overdue` :
                                 `${deadlineStatus.days} days left`}
                              </div>
                            </div>

                            {/* Tags */}
                            {application.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {application.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {application.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{application.tags.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/applications/${application._id}`);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedApplication(application);
                                setShowDetailModal(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredApplications.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all'
                      ? 'Try adjusting your filters or search terms.'
                      : 'Get started by adding your first application.'}
                  </p>
                  <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Application
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <TaskList applications={applications} onApplicationUpdate={handleApplicationUpdate} />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <DeadlineCalendar applications={applications} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddApplicationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onApplicationAdded={handleAddApplication}
      />

      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedApplication(null);
          }}
          onApplicationUpdate={handleApplicationUpdate}
          onApplicationDelete={handleApplicationDelete}
        />
      )}
    </div>
  );
}