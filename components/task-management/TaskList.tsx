'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, 
  Square, 
  Clock, 
  AlertTriangle, 
  Flag,
  Calendar,
  FileText,
  Users,
  Target,
  MessageSquare,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  GraduationCap,
  BookOpen,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  category: 'document' | 'test' | 'recommendation' | 'follow_up' | 'interview' | 'other';
  completedAt?: string;
  notes?: string;
}

interface Application {
  _id: string;
  applicationType: 'school' | 'program' | 'scholarship';
  title: string;
  status: string;
  tasks: Task[];
  // Related data
  scholarshipId?: {
    _id: string;
    title: string;
  };
  schoolId?: {
    _id: string;
    name: string;
  };
  programId?: {
    _id: string;
    title: string;
  };
}

interface TaskListProps {
  applications: Application[];
  onApplicationUpdate: (application: Application) => void;
}

export default function TaskList({ applications, onApplicationUpdate }: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [applicationFilter, setApplicationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'category' | 'application'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showCompleted, setShowCompleted] = useState(false);

  // Flatten all tasks from all applications
  const allTasks = applications.flatMap(app => 
    app.tasks.map(task => ({
      ...task,
      applicationId: app._id,
      applicationTitle: app.title,
      applicationType: app.applicationType
    }))
  );

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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'bg-green-100 text-green-800', icon: CheckSquare, label: 'Completed' };
      case 'in_progress':
        return { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'In Progress' };
      case 'overdue':
        return { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Overdue' };
      case 'pending':
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Square, label: 'Pending' };
    }
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'document':
        return { color: 'bg-blue-100 text-blue-800', icon: FileText, label: 'Document' };
      case 'test':
        return { color: 'bg-purple-100 text-purple-800', icon: Target, label: 'Test' };
      case 'recommendation':
        return { color: 'bg-orange-100 text-orange-800', icon: Users, label: 'Recommendation' };
      case 'follow_up':
        return { color: 'bg-red-100 text-red-800', icon: MessageSquare, label: 'Follow Up' };
      case 'interview':
        return { color: 'bg-indigo-100 text-indigo-800', icon: Calendar, label: 'Interview' };
      case 'other':
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Flag, label: 'Other' };
    }
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'school':
        return { color: 'bg-blue-100 text-blue-800', icon: GraduationCap, label: 'School' };
      case 'program':
        return { color: 'bg-purple-100 text-purple-800', icon: BookOpen, label: 'Program' };
      case 'scholarship':
        return { color: 'bg-green-100 text-green-800', icon: Award, label: 'Scholarship' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Flag, label: 'Unknown' };
    }
  };

  const getDeadlineStatus = (dueDate?: string) => {
    if (!dueDate) return { status: 'no-deadline', color: 'text-gray-600', bgColor: 'bg-gray-50' };
    
    const now = new Date();
    const deadlineDate = new Date(dueDate);
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline < 0) {
      return { status: 'overdue', color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (daysUntilDeadline <= 3) {
      return { status: 'urgent', color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (daysUntilDeadline <= 7) {
      return { status: 'soon', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    } else {
      return { status: 'ok', color: 'text-green-600', bgColor: 'bg-green-50' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredTasks = allTasks.filter(task => {
    // Filter by search term
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filter by status
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false;
    }

    // Filter by priority
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }

    // Filter by category
    if (categoryFilter !== 'all' && task.category !== categoryFilter) {
      return false;
    }

    // Filter by application
    if (applicationFilter !== 'all' && task.applicationId !== applicationFilter) {
      return false;
    }

    // Filter completed tasks
    if (!showCompleted && task.status === 'completed') {
      return false;
    }

    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) comparison = 0;
        else if (!a.dueDate) comparison = 1;
        else if (!b.dueDate) comparison = -1;
        else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'application':
        comparison = a.applicationTitle.localeCompare(b.applicationTitle);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleTaskStatusToggle = async (taskId: string, applicationId: string, newStatus: 'completed' | 'pending') => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
        }),
      });

      if (response.ok) {
        const updatedApplication = await response.json();
        onApplicationUpdate(updatedApplication);
        toast.success(`Task ${newStatus === 'completed' ? 'completed' : 'marked as pending'}`);
      } else {
        toast.error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const stats = {
    total: allTasks.length,
    completed: allTasks.filter(task => task.status === 'completed').length,
    pending: allTasks.filter(task => task.status === 'pending').length,
    overdue: allTasks.filter(task => task.status === 'overdue').length,
    urgent: allTasks.filter(task => {
      if (!task.dueDate) return false;
      const deadlineStatus = getDeadlineStatus(task.dueDate);
      return deadlineStatus.status === 'urgent' || deadlineStatus.status === 'overdue';
    }).length
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
              </div>
              <Square className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-orange-600">{stats.urgent}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
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

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="recommendation">Recommendation</SelectItem>
                <SelectItem value="follow_up">Follow Up</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={applicationFilter} onValueChange={setApplicationFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Application" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                {applications.map(app => (
                  <SelectItem key={app._id} value={app._id}>
                    {app.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="application">Application</SelectItem>
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

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-completed"
                checked={showCompleted}
                onCheckedChange={(checked) => setShowCompleted(checked as boolean)}
              />
              <label htmlFor="show-completed" className="text-sm font-medium">
                Show completed tasks
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-3">
        <AnimatePresence>
          {sortedTasks.map((task) => {
            const priorityInfo = getPriorityInfo(task.priority);
            const statusInfo = getStatusInfo(task.status);
            const categoryInfo = getCategoryInfo(task.category);
            const typeInfo = getTypeInfo(task.applicationType);
            const deadlineStatus = getDeadlineStatus(task.dueDate);
            const PriorityIcon = priorityInfo.icon;
            const StatusIcon = statusInfo.icon;
            const CategoryIcon = categoryInfo.icon;
            const TypeIcon = typeInfo.icon;

            return (
              <motion.div
                key={`${task.applicationId}-${task.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div className="pt-1">
                        <Checkbox
                          checked={task.status === 'completed'}
                          onCheckedChange={(checked) => 
                            handleTaskStatusToggle(
                              task.id, 
                              task.applicationId, 
                              checked ? 'completed' : 'pending'
                            )
                          }
                        />
                      </div>

                      {/* Task Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={priorityInfo.color}>
                              <PriorityIcon className="w-3 h-3 mr-1" />
                              {priorityInfo.label}
                            </Badge>
                            <Badge className={statusInfo.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                            <Badge className={categoryInfo.color}>
                              <CategoryIcon className="w-3 h-3 mr-1" />
                              {categoryInfo.label}
                            </Badge>
                          </div>
                        </div>

                        <h3 className={`font-medium mb-1 ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>

                        {task.description && (
                          <p className={`text-sm mb-2 ${task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <TypeIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600">{task.applicationTitle}</span>
                            </div>
                            
                            {task.dueDate && (
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${deadlineStatus.bgColor} ${deadlineStatus.color}`}>
                                <Calendar className="w-3 h-3" />
                                {formatDate(task.dueDate)}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // TODO: Implement edit task functionality
                                toast.info('Edit task functionality coming soon');
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {sortedTasks.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all' || applicationFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'No tasks have been created yet.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}