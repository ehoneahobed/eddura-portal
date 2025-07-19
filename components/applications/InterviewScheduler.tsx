'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Phone, 
  User, 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  Copy,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  CalendarDays,
  Clock3,
  Users,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { format, addDays, isAfter, isBefore, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Interview {
  _id: string;
  type: 'video' | 'phone' | 'in_person';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  scheduledDate?: string;
  duration?: number;
  notes?: string;
  interviewer?: string;
  location?: string;
  isVirtual?: boolean;
  meetingLink?: string;
  meetingId?: string;
  meetingPassword?: string;
  createdAt: string;
  updatedAt: string;
}

interface InterviewSchedulerProps {
  applicationId: string;
  interviews: Interview[];
  onInterviewCreate: (interview: Partial<Interview>) => Promise<void>;
  onInterviewUpdate: (interviewId: string, updates: Partial<Interview>) => Promise<void>;
  onInterviewDelete: (interviewId: string) => Promise<void>;
}

export default function InterviewScheduler({ 
  applicationId, 
  interviews, 
  onInterviewCreate, 
  onInterviewUpdate, 
  onInterviewDelete 
}: InterviewSchedulerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedInterviews, setExpandedInterviews] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    type: 'video' as 'video' | 'phone' | 'in_person',
    scheduledDate: '',
    scheduledTime: '',
    duration: 30,
    interviewer: '',
    location: '',
    isVirtual: true,
    meetingLink: '',
    meetingId: '',
    meetingPassword: '',
    notes: ''
  });

  // Filter interviews
  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.interviewer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
    const matchesType = typeFilter === 'all' || interview.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Group interviews by status
  const scheduledInterviews = filteredInterviews.filter(i => i.status === 'scheduled');
  const completedInterviews = filteredInterviews.filter(i => i.status === 'completed');
  const cancelledInterviews = filteredInterviews.filter(i => i.status === 'cancelled');

  const resetForm = () => {
    setFormData({
      type: 'video',
      scheduledDate: '',
      scheduledTime: '',
      duration: 30,
      interviewer: '',
      location: '',
      isVirtual: true,
      meetingLink: '',
      meetingId: '',
      meetingPassword: '',
      notes: ''
    });
  };

  const handleCreateInterview = async () => {
    if (!formData.scheduledDate || !formData.scheduledTime) {
      toast.error('Please select a date and time');
      return;
    }

    try {
      setIsSubmitting(true);
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      await onInterviewCreate({
        type: formData.type,
        scheduledDate: scheduledDateTime.toISOString(),
        duration: formData.duration,
        interviewer: formData.interviewer,
        location: formData.location,
        isVirtual: formData.isVirtual,
        meetingLink: formData.meetingLink,
        meetingId: formData.meetingId,
        meetingPassword: formData.meetingPassword,
        notes: formData.notes,
        status: 'scheduled'
      });

      toast.success('Interview scheduled successfully');
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to schedule interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateInterview = async () => {
    if (!editingInterview) return;

    try {
      setIsSubmitting(true);
      const scheduledDateTime = formData.scheduledDate && formData.scheduledTime 
        ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString()
        : editingInterview.scheduledDate;

      await onInterviewUpdate(editingInterview._id, {
        type: formData.type,
        scheduledDate: scheduledDateTime,
        duration: formData.duration,
        interviewer: formData.interviewer,
        location: formData.location,
        isVirtual: formData.isVirtual,
        meetingLink: formData.meetingLink,
        meetingId: formData.meetingId,
        meetingPassword: formData.meetingPassword,
        notes: formData.notes
      });

      toast.success('Interview updated successfully');
      setEditingInterview(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to update interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInterview = async (interviewId: string) => {
    if (!confirm('Are you sure you want to delete this interview?')) return;

    try {
      await onInterviewDelete(interviewId);
      toast.success('Interview deleted successfully');
    } catch (error) {
      toast.error('Failed to delete interview');
    }
  };

  const handleStatusChange = async (interviewId: string, newStatus: Interview['status']) => {
    try {
      await onInterviewUpdate(interviewId, { status: newStatus });
      toast.success('Interview status updated');
    } catch (error) {
      toast.error('Failed to update interview status');
    }
  };

  const toggleInterviewExpansion = (interviewId: string) => {
    const newExpanded = new Set(expandedInterviews);
    if (newExpanded.has(interviewId)) {
      newExpanded.delete(interviewId);
    } else {
      newExpanded.add(interviewId);
    }
    setExpandedInterviews(newExpanded);
  };

  const openEditDialog = (interview: Interview) => {
    setEditingInterview(interview);
    setFormData({
      type: interview.type,
      scheduledDate: interview.scheduledDate ? format(parseISO(interview.scheduledDate), 'yyyy-MM-dd') : '',
      scheduledTime: interview.scheduledDate ? format(parseISO(interview.scheduledDate), 'HH:mm') : '',
      duration: interview.duration || 30,
      interviewer: interview.interviewer || '',
      location: interview.location || '',
      isVirtual: interview.isVirtual || false,
      meetingLink: interview.meetingLink || '',
      meetingId: interview.meetingId || '',
      meetingPassword: interview.meetingPassword || '',
      notes: interview.notes || ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'in_person': return <MapPin className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'phone': return 'bg-blue-100 text-blue-800';
      case 'in_person': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getUpcomingInterviews = () => {
    const now = new Date();
    return scheduledInterviews.filter(interview => 
      interview.scheduledDate && isAfter(parseISO(interview.scheduledDate), now)
    ).sort((a, b) => 
      a.scheduledDate && b.scheduledDate 
        ? parseISO(a.scheduledDate).getTime() - parseISO(b.scheduledDate).getTime()
        : 0
    );
  };

  const upcomingInterviews = getUpcomingInterviews();

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Interviews</p>
                <p className="text-2xl font-bold">{interviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold">{scheduledInterviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{completedInterviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold">{cancelledInterviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search interviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="rescheduled">Rescheduled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="in_person">In Person</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Schedule Interview
        </Button>
      </div>

      {/* Upcoming Interviews */}
      {upcomingInterviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Upcoming Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingInterviews.slice(0, 3).map(interview => (
                <div key={interview._id} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(interview.type)}
                      <Badge className={getTypeColor(interview.type)}>
                        {interview.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">{interview.interviewer || 'Interview'}</p>
                      <p className="text-sm text-gray-600">
                        {interview.scheduledDate && format(parseISO(interview.scheduledDate), 'PPP p')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {interview.isVirtual && interview.meetingLink && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Join
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(interview)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Interviews */}
      <Card>
        <CardHeader>
          <CardTitle>All Interviews</CardTitle>
          <CardDescription>
            Manage all interviews for this application
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInterviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No interviews found</p>
              <Button onClick={() => setShowCreateDialog(true)} className="mt-4">
                Schedule Your First Interview
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInterviews.map(interview => (
                <div key={interview._id} className="border rounded-lg overflow-hidden">
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(interview.type)}
                          <Badge className={getTypeColor(interview.type)}>
                            {interview.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <Badge className={getStatusColor(interview.status)}>
                          {interview.status}
                        </Badge>
                        {interview.interviewer && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            {interview.interviewer}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleInterviewExpansion(interview._id)}
                        >
                          {expandedInterviews.has(interview._id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(interview)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {interview.status === 'scheduled' && (
                              <>
                                <DropdownMenuItem onClick={() => handleStatusChange(interview._id, 'completed')}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark Complete
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(interview._id, 'cancelled')}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              </>
                            )}
                            {interview.meetingLink && (
                              <DropdownMenuItem onClick={() => copyToClipboard(interview.meetingLink!)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Link
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDeleteInterview(interview._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-sm text-gray-600">
                      {interview.scheduledDate && (
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(parseISO(interview.scheduledDate), 'PPP')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(parseISO(interview.scheduledDate), 'p')}
                          </span>
                          {interview.duration && (
                            <span className="flex items-center gap-1">
                              <Clock3 className="h-4 w-4" />
                              {interview.duration} min
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedInterviews.has(interview._id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-4 border-t">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Details</h4>
                              <div className="space-y-2 text-sm">
                                {interview.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span>{interview.location}</span>
                                  </div>
                                )}
                                {interview.isVirtual && (
                                  <div className="flex items-center gap-2">
                                    <Video className="h-4 w-4 text-gray-400" />
                                    <span>Virtual Interview</span>
                                  </div>
                                )}
                                {interview.meetingId && (
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">Meeting ID:</span>
                                    <span>{interview.meetingId}</span>
                                  </div>
                                )}
                                {interview.meetingPassword && (
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">Password:</span>
                                    <span>{interview.meetingPassword}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Notes</h4>
                              <p className="text-sm text-gray-600">
                                {interview.notes || 'No notes added'}
                              </p>
                            </div>
                          </div>
                          
                          {interview.meetingLink && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="flex items-center gap-2">
                                <Button size="sm" asChild>
                                  <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Join Meeting
                                  </a>
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => copyToClipboard(interview.meetingLink!)}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Link
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Interview Dialog */}
      <Dialog open={showCreateDialog || !!editingInterview} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingInterview(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingInterview ? 'Edit Interview' : 'Schedule New Interview'}
            </DialogTitle>
            <DialogDescription>
              {editingInterview ? 'Update interview details' : 'Schedule a new interview for this application'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Interview Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="in_person">In Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select value={formData.duration.toString()} onValueChange={(value) => setFormData({...formData, duration: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="interviewer">Interviewer</Label>
              <Input
                id="interviewer"
                placeholder="Interviewer name"
                value={formData.interviewer}
                onChange={(e) => setFormData({...formData, interviewer: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Interview location or address"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="virtual"
                checked={formData.isVirtual}
                onCheckedChange={(checked) => setFormData({...formData, isVirtual: checked as boolean})}
              />
              <Label htmlFor="virtual">Virtual Interview</Label>
            </div>

            {formData.isVirtual && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="meetingLink">Meeting Link</Label>
                  <Input
                    id="meetingLink"
                    placeholder="https://meet.google.com/..."
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({...formData, meetingLink: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meetingId">Meeting ID</Label>
                    <Input
                      id="meetingId"
                      placeholder="Meeting ID"
                      value={formData.meetingId}
                      onChange={(e) => setFormData({...formData, meetingId: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="meetingPassword">Meeting Password</Label>
                    <Input
                      id="meetingPassword"
                      placeholder="Meeting password"
                      value={formData.meetingPassword}
                      onChange={(e) => setFormData({...formData, meetingPassword: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about the interview..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setEditingInterview(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={editingInterview ? handleUpdateInterview : handleCreateInterview}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (editingInterview ? 'Update Interview' : 'Schedule Interview')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 