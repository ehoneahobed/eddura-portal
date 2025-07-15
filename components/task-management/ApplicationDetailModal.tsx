'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  GraduationCap, 
  BookOpen, 
  Award, 
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  FileText,
  Users,
  Target,
  Eye,
  MessageSquare,
  Edit,
  Trash2,
  Plus,
  Flag,
  Tag,
  Square,
  CheckSquare,
  Mail,
  Phone,
  User,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ApplicationType, ApplicationStatus } from '@/models/Application';

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

interface Communication {
  id: string;
  type: 'email' | 'phone' | 'in_person' | 'portal_message';
  subject: string;
  content: string;
  date: string;
  withWhom: string;
  outcome?: string;
  followUpRequired: boolean;
  followUpDate?: string;
}

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
  tasks: Task[];
  communications: Communication[];
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

interface ApplicationDetailModalProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
  onApplicationUpdate: (application: Application) => void;
  onApplicationDelete: (applicationId: string) => void;
}

export default function ApplicationDetailModal({ 
  application, 
  isOpen, 
  onClose, 
  onApplicationUpdate, 
  onApplicationDelete 
}: ApplicationDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state for editing
  const [title, setTitle] = useState(application.title);
  const [description, setDescription] = useState(application.description || '');
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [priority, setPriority] = useState(application.priority);
  const [notes, setNotes] = useState(application.notes || '');
  const [tags, setTags] = useState<string[]>(application.tags);
  const [newTag, setNewTag] = useState('');

  // Task management
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as const,
    category: 'other' as const
  });

  // Communication management
  const [newCommunication, setNewCommunication] = useState({
    type: 'email' as const,
    subject: '',
    content: '',
    withWhom: '',
    outcome: '',
    followUpRequired: false,
    followUpDate: ''
  });

  const getStatusInfo = (status: ApplicationStatus) => {
    switch (status) {
      case 'not_started':
        return { color: 'bg-gray-100 text-gray-800', icon: Square, label: 'Not Started' };
      case 'researching':
        return { color: 'bg-blue-100 text-blue-800', icon: Eye, label: 'Researching' };
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/applications/${application._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          status,
          priority,
          notes: notes.trim(),
          tags,
        }),
      });

      if (response.ok) {
        const updatedApplication = await response.json();
        onApplicationUpdate(updatedApplication);
        toast.success('Application updated successfully!');
        setIsEditing(false);
      } else {
        toast.error('Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/applications/${application._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onApplicationDelete(application._id);
        toast.success('Application deleted successfully!');
        onClose();
      } else {
        toast.error('Failed to delete application');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      const response = await fetch(`/api/applications/${application._id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTask,
          dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : undefined,
        }),
      });

      if (response.ok) {
        const updatedApplication = await response.json();
        onApplicationUpdate(updatedApplication);
        setNewTask({
          title: '',
          description: '',
          dueDate: '',
          priority: 'medium',
          category: 'other'
        });
        toast.success('Task added successfully!');
      } else {
        toast.error('Failed to add task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  const handleAddCommunication = async () => {
    if (!newCommunication.subject.trim() || !newCommunication.withWhom.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`/api/applications/${application._id}/communications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newCommunication,
          followUpDate: newCommunication.followUpDate ? new Date(newCommunication.followUpDate).toISOString() : undefined,
        }),
      });

      if (response.ok) {
        const updatedApplication = await response.json();
        onApplicationUpdate(updatedApplication);
        setNewCommunication({
          type: 'email',
          subject: '',
          content: '',
          withWhom: '',
          outcome: '',
          followUpRequired: false,
          followUpDate: ''
        });
        toast.success('Communication logged successfully!');
      } else {
        toast.error('Failed to log communication');
      }
    } catch (error) {
      console.error('Error logging communication:', error);
      toast.error('Failed to log communication');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const statusInfo = getStatusInfo(application.status);
  const priorityInfo = getPriorityInfo(application.priority);
  const typeInfo = getTypeInfo(application.applicationType);
  const deadlineStatus = getDeadlineStatus(application.applicationDeadline);
  const StatusIcon = statusInfo.icon;
  const PriorityIcon = priorityInfo.icon;
  const TypeIcon = typeInfo.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <TypeIcon className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {isEditing ? 'Edit Application' : application.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
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
              </div>
              
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {isEditing ? (
                /* Edit Form */
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={status} onValueChange={(value: ApplicationStatus) => setStatus(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setPriority(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <Button type="button" variant="outline" onClick={addTag}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag, index) => (
                          <div
                            key={index}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="communications">Communications</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Application Details</h3>
                        
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Title</Label>
                          <p className="text-gray-900">{application.title}</p>
                        </div>

                        {application.description && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Description</Label>
                            <p className="text-gray-900">{application.description}</p>
                          </div>
                        )}

                        <div>
                          <Label className="text-sm font-medium text-gray-600">Progress</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={application.progress} className="flex-1" />
                            <span className="text-sm font-medium">{application.progress}%</span>
                          </div>
                        </div>

                        {application.notes && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Notes</Label>
                            <p className="text-gray-900">{application.notes}</p>
                          </div>
                        )}

                        {application.tags.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Tags</Label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {application.tags.map((tag, index) => (
                                <Badge key={index} variant="outline">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Deadlines & Timeline</h3>
                        
                        <div className={`p-4 rounded-lg ${deadlineStatus.bgColor}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Application Deadline</Label>
                              <p className={`font-medium ${deadlineStatus.color}`}>
                                {formatDate(application.applicationDeadline)}
                              </p>
                            </div>
                            <div className={`text-right ${deadlineStatus.color}`}>
                              <p className="font-semibold">
                                {deadlineStatus.days === 0 ? 'Due today' : 
                                 deadlineStatus.days === 1 ? 'Due tomorrow' :
                                 deadlineStatus.status === 'overdue' ? `${deadlineStatus.days} days overdue` :
                                 `${deadlineStatus.days} days left`}
                              </p>
                            </div>
                          </div>
                        </div>

                        {application.earlyDecisionDeadline && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Early Decision Deadline</Label>
                            <p className="text-gray-900">{formatDate(application.earlyDecisionDeadline)}</p>
                          </div>
                        )}

                        {application.regularDecisionDeadline && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Regular Decision Deadline</Label>
                            <p className="text-gray-900">{formatDate(application.regularDecisionDeadline)}</p>
                          </div>
                        )}

                        <div>
                          <Label className="text-sm font-medium text-gray-600">Timeline</Label>
                          <div className="space-y-2 mt-1">
                            <div className="flex justify-between text-sm">
                              <span>Started</span>
                              <span>{formatDate(application.startedAt)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Last Activity</span>
                              <span>{formatDate(application.lastActivityAt)}</span>
                            </div>
                            {application.submittedAt && (
                              <div className="flex justify-between text-sm">
                                <span>Submitted</span>
                                <span>{formatDate(application.submittedAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Related Information */}
                    {(application.schoolId || application.programId || application.scholarshipId) && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Related Information</h3>
                        
                        {application.schoolId && (
                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <GraduationCap className="w-5 h-5 text-blue-600" />
                              <h4 className="font-medium">{application.schoolId.name}</h4>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              {application.schoolId.city}, {application.schoolId.country}
                            </div>
                          </div>
                        )}

                        {application.programId && (
                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpen className="w-5 h-5 text-purple-600" />
                              <h4 className="font-medium">{application.programId.title}</h4>
                            </div>
                            <div className="text-sm text-gray-600">
                              {application.programId.degree} • {application.programId.school}
                            </div>
                          </div>
                        )}

                        {application.scholarshipId && (
                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Award className="w-5 h-5 text-green-600" />
                              <h4 className="font-medium">{application.scholarshipId.title}</h4>
                            </div>
                            {application.scholarshipId.value && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <DollarSign className="w-4 h-4" />
                                {formatCurrency(application.scholarshipId.value, application.scholarshipId.currency)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="tasks" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Tasks</h3>
                      <Button size="sm" onClick={() => setActiveTab('actions')}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Task
                      </Button>
                    </div>

                    {application.tasks.length > 0 ? (
                      <div className="space-y-3">
                        {application.tasks.map((task) => (
                          <div key={task.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Checkbox checked={task.status === 'completed'} />
                                  <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                    {task.title}
                                  </h4>
                                </div>
                                {task.description && (
                                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                                )}
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>Priority: {task.priority}</span>
                                  <span>Category: {task.category}</span>
                                  {task.dueDate && (
                                    <span>Due: {formatDate(task.dueDate)}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">No tasks yet</p>
                        <p className="text-sm text-gray-500">Add tasks to track your progress</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="communications" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Communications</h3>
                      <Button size="sm" onClick={() => setActiveTab('actions')}>
                        <Plus className="w-4 h-4 mr-1" />
                        Log Communication
                      </Button>
                    </div>

                    {application.communications.length > 0 ? (
                      <div className="space-y-4">
                        {application.communications.map((comm) => (
                          <div key={comm.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {comm.type === 'email' && <Mail className="w-4 h-4 text-blue-600" />}
                                {comm.type === 'phone' && <Phone className="w-4 h-4 text-green-600" />}
                                {comm.type === 'in_person' && <User className="w-4 h-4 text-purple-600" />}
                                {comm.type === 'portal_message' && <MessageSquare className="w-4 h-4 text-orange-600" />}
                                <h4 className="font-medium">{comm.subject}</h4>
                              </div>
                              <span className="text-sm text-gray-500">{formatDate(comm.date)}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{comm.content}</p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">With: {comm.withWhom}</span>
                              {comm.followUpRequired && (
                                <span className="text-orange-600 font-medium">Follow-up required</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">No communications logged</p>
                        <p className="text-sm text-gray-500">Log your interactions with schools and programs</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="actions" className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>

                    {/* Add Task */}
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">Add New Task</h4>
                      <div className="space-y-3">
                        <Input
                          placeholder="Task title"
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        />
                        <Textarea
                          placeholder="Task description (optional)"
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          rows={2}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input
                            type="date"
                            placeholder="Due date"
                            value={newTask.dueDate}
                            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                          />
                          <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={newTask.category} onValueChange={(value: any) => setNewTask({ ...newTask, category: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="document">Document</SelectItem>
                              <SelectItem value="test">Test</SelectItem>
                              <SelectItem value="recommendation">Recommendation</SelectItem>
                              <SelectItem value="follow_up">Follow Up</SelectItem>
                              <SelectItem value="interview">Interview</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleAddTask} className="w-full">
                          Add Task
                        </Button>
                      </div>
                    </div>

                    {/* Log Communication */}
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">Log Communication</h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Select value={newCommunication.type} onValueChange={(value: any) => setNewCommunication({ ...newCommunication, type: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                              <SelectItem value="in_person">In Person</SelectItem>
                              <SelectItem value="portal_message">Portal Message</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="With whom"
                            value={newCommunication.withWhom}
                            onChange={(e) => setNewCommunication({ ...newCommunication, withWhom: e.target.value })}
                          />
                        </div>
                        <Input
                          placeholder="Subject"
                          value={newCommunication.subject}
                          onChange={(e) => setNewCommunication({ ...newCommunication, subject: e.target.value })}
                        />
                        <Textarea
                          placeholder="Content/details"
                          value={newCommunication.content}
                          onChange={(e) => setNewCommunication({ ...newCommunication, content: e.target.value })}
                          rows={3}
                        />
                        <Input
                          placeholder="Outcome (optional)"
                          value={newCommunication.outcome}
                          onChange={(e) => setNewCommunication({ ...newCommunication, outcome: e.target.value })}
                        />
                        <div className="flex items-center gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="followUpRequired"
                              checked={newCommunication.followUpRequired}
                              onCheckedChange={(checked) => setNewCommunication({ ...newCommunication, followUpRequired: checked as boolean })}
                            />
                            <Label htmlFor="followUpRequired">Follow-up required</Label>
                          </div>
                          {newCommunication.followUpRequired && (
                            <Input
                              type="date"
                              placeholder="Follow-up date"
                              value={newCommunication.followUpDate}
                              onChange={(e) => setNewCommunication({ ...newCommunication, followUpDate: e.target.value })}
                            />
                          )}
                        </div>
                        <Button onClick={handleAddCommunication} className="w-full">
                          Log Communication
                        </Button>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <h4 className="font-medium text-red-900 mb-3">Danger Zone</h4>
                      <p className="text-sm text-red-700 mb-3">
                        Once you delete an application, there is no going back. Please be certain.
                      </p>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Application
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}