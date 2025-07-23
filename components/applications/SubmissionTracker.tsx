'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar, 
  ExternalLink, 
  Copy, 
  Edit, 
  Plus, 
  Trash2, 
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  FileText,
  Mail,
  Globe,
  MapPin,
  User,
  Bell,
  CheckSquare,
  Square,
  ArrowRight,
  CalendarDays,
  Clock3,
  AlertTriangle,
  Info,
  Download,
  Share2,
  MessageSquare
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
import { format, addDays, isAfter, isBefore, parseISO, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SubmissionStatus {
  _id: string;
  applicationSubmitted: boolean;
  submittedAt?: string;
  submissionMethod: 'online' | 'email' | 'mail' | 'in_person';
  confirmationNumber?: string;
  confirmationEmail?: string;
  submissionNotes?: string;
  followUpRequired: boolean;
  followUpNotes?: string;
  nextFollowUpDate?: string;
  followUpCompleted: boolean;
  followUpHistory: FollowUpEntry[];
  createdAt: string;
  updatedAt: string;
}

interface FollowUpEntry {
  _id: string;
  date: string;
  type: 'email' | 'phone' | 'in_person' | 'portal';
  notes: string;
  outcome?: string;
  nextAction?: string;
  nextActionDate?: string;
}

interface SubmissionTrackerProps {
  applicationId: string;
  submissionStatus: SubmissionStatus | null;
  onSubmissionUpdate: (updates: Partial<SubmissionStatus>) => Promise<void>;
  onFollowUpAdd: (followUp: Omit<FollowUpEntry, '_id'>) => Promise<void>;
  onFollowUpUpdate: (followUpId: string, updates: Partial<FollowUpEntry>) => Promise<void>;
  onFollowUpDelete: (followUpId: string) => Promise<void>;
}

export default function SubmissionTracker({ 
  applicationId, 
  submissionStatus, 
  onSubmissionUpdate, 
  onFollowUpAdd, 
  onFollowUpUpdate, 
  onFollowUpDelete 
}: SubmissionTrackerProps) {
  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false);
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUpEntry | null>(null);
  const [expandedFollowUps, setExpandedFollowUps] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submission form state
  const [submissionForm, setSubmissionForm] = useState({
    applicationSubmitted: false,
    submittedAt: '',
    submissionMethod: 'online' as 'online' | 'email' | 'mail' | 'in_person',
    confirmationNumber: '',
    confirmationEmail: '',
    submissionNotes: ''
  });

  // Follow-up form state
  const [followUpForm, setFollowUpForm] = useState({
    date: '',
    type: 'email' as 'email' | 'phone' | 'in_person' | 'portal',
    notes: '',
    outcome: '',
    nextAction: '',
    nextActionDate: ''
  });

  useEffect(() => {
    if (submissionStatus) {
      setSubmissionForm({
        applicationSubmitted: submissionStatus.applicationSubmitted,
        submittedAt: submissionStatus.submittedAt ? format(parseISO(submissionStatus.submittedAt), 'yyyy-MM-dd') : '',
        submissionMethod: submissionStatus.submissionMethod,
        confirmationNumber: submissionStatus.confirmationNumber || '',
        confirmationEmail: submissionStatus.confirmationEmail || '',
        submissionNotes: submissionStatus.submissionNotes || ''
      });
    }
  }, [submissionStatus]);

  const resetFollowUpForm = () => {
    setFollowUpForm({
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'email',
      notes: '',
      outcome: '',
      nextAction: '',
      nextActionDate: ''
    });
  };

  const handleSubmissionUpdate = async () => {
    try {
      setIsSubmitting(true);
      const submittedAt = submissionForm.submittedAt ? new Date(submissionForm.submittedAt).toISOString() : undefined;
      
      await onSubmissionUpdate({
        applicationSubmitted: submissionForm.applicationSubmitted,
        submittedAt,
        submissionMethod: submissionForm.submissionMethod,
        confirmationNumber: submissionForm.confirmationNumber,
        confirmationEmail: submissionForm.confirmationEmail,
        submissionNotes: submissionForm.submissionNotes
      });

      toast.success('Submission status updated successfully');
      setShowSubmissionDialog(false);
    } catch (error) {
      toast.error('Failed to update submission status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollowUpAdd = async () => {
    if (!followUpForm.date || !followUpForm.notes) {
      toast.error('Please fill in the required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await onFollowUpAdd({
        date: new Date(followUpForm.date).toISOString(),
        type: followUpForm.type,
        notes: followUpForm.notes,
        outcome: followUpForm.outcome,
        nextAction: followUpForm.nextAction,
        nextActionDate: followUpForm.nextActionDate ? new Date(followUpForm.nextActionDate).toISOString() : undefined
      });

      toast.success('Follow-up added successfully');
      setShowFollowUpDialog(false);
      resetFollowUpForm();
    } catch (error) {
      toast.error('Failed to add follow-up');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollowUpUpdate = async () => {
    if (!editingFollowUp) return;

    try {
      setIsSubmitting(true);
      await onFollowUpUpdate(editingFollowUp._id, {
        date: new Date(followUpForm.date).toISOString(),
        type: followUpForm.type,
        notes: followUpForm.notes,
        outcome: followUpForm.outcome,
        nextAction: followUpForm.nextAction,
        nextActionDate: followUpForm.nextActionDate ? new Date(followUpForm.nextActionDate).toISOString() : undefined
      });

      toast.success('Follow-up updated successfully');
      setShowFollowUpDialog(false);
      setEditingFollowUp(null);
      resetFollowUpForm();
    } catch (error) {
      toast.error('Failed to update follow-up');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollowUpDelete = async (followUpId: string) => {
    if (!confirm('Are you sure you want to delete this follow-up?')) return;

    try {
      await onFollowUpDelete(followUpId);
      toast.success('Follow-up deleted successfully');
    } catch (error) {
      toast.error('Failed to delete follow-up');
    }
  };

  const toggleFollowUpExpansion = (followUpId: string) => {
    const newExpanded = new Set(expandedFollowUps);
    if (newExpanded.has(followUpId)) {
      newExpanded.delete(followUpId);
    } else {
      newExpanded.add(followUpId);
    }
    setExpandedFollowUps(newExpanded);
  };

  const openEditFollowUp = (followUp: FollowUpEntry) => {
    setEditingFollowUp(followUp);
    setFollowUpForm({
      date: format(parseISO(followUp.date), 'yyyy-MM-dd'),
      type: followUp.type,
      notes: followUp.notes,
      outcome: followUp.outcome || '',
      nextAction: followUp.nextAction || '',
      nextActionDate: followUp.nextActionDate ? format(parseISO(followUp.nextActionDate), 'yyyy-MM-dd') : ''
    });
    setShowFollowUpDialog(true);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'online': return <Globe className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'mail': return <FileText className="h-4 w-4" />;
      case 'in_person': return <MapPin className="h-4 w-4" />;
      default: return <Send className="h-4 w-4" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'online': return 'bg-blue-100 text-blue-800';
      case 'email': return 'bg-green-100 text-green-800';
      case 'mail': return 'bg-orange-100 text-orange-800';
      case 'in_person': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFollowUpTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <MessageSquare className="h-4 w-4" />;
      case 'in_person': return <MapPin className="h-4 w-4" />;
      case 'portal': return <Globe className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getFollowUpTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-green-100 text-green-800';
      case 'phone': return 'bg-blue-100 text-blue-800';
      case 'in_person': return 'bg-purple-100 text-purple-800';
      case 'portal': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getUpcomingFollowUps = () => {
    if (!submissionStatus?.followUpHistory) return [];
    const now = new Date();
    return submissionStatus.followUpHistory
      .filter(followUp => 
        followUp.nextActionDate && isAfter(parseISO(followUp.nextActionDate), now)
      )
      .sort((a, b) => 
        a.nextActionDate && b.nextActionDate 
          ? parseISO(a.nextActionDate).getTime() - parseISO(b.nextActionDate).getTime()
          : 0
      );
  };

  const upcomingFollowUps = getUpcomingFollowUps();

  const getDaysUntilFollowUp = (date: string) => {
    const now = new Date();
    const followUpDate = parseISO(date);
    return differenceInDays(followUpDate, now);
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Submission Status</p>
                <p className="text-lg font-bold">
                  {submissionStatus?.applicationSubmitted ? 'Submitted' : 'Not Submitted'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Submitted Date</p>
                <p className="text-lg font-bold">
                  {submissionStatus?.submittedAt 
                    ? format(parseISO(submissionStatus.submittedAt), 'MMM d')
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Follow-ups</p>
                <p className="text-lg font-bold">
                  {submissionStatus?.followUpHistory?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Follow-up Required</p>
                <p className="text-lg font-bold">
                  {submissionStatus?.followUpRequired ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submission Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Application Submission Status
            </span>
            <Button size="sm" onClick={() => setShowSubmissionDialog(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Update Status
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submissionStatus ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {submissionStatus.applicationSubmitted ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <Clock className="h-6 w-6 text-yellow-500" />
                  )}
                  <span className="text-lg font-medium">
                    {submissionStatus.applicationSubmitted ? 'Application Submitted' : 'Application Not Submitted'}
                  </span>
                </div>
              </div>

              {submissionStatus.applicationSubmitted && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Submission Method</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {getMethodIcon(submissionStatus.submissionMethod)}
                        <Badge className={getMethodColor(submissionStatus.submissionMethod)}>
                          {submissionStatus.submissionMethod.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-600">Submission Date</Label>
                      <p className="mt-1">
                        {submissionStatus.submittedAt 
                          ? format(parseISO(submissionStatus.submittedAt), 'PPP')
                          : 'Not specified'
                        }
                      </p>
                    </div>

                    {submissionStatus.confirmationNumber && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Confirmation Number</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="font-mono">{submissionStatus.confirmationNumber}</p>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(submissionStatus.confirmationNumber!)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {submissionStatus.confirmationEmail && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Confirmation Email</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <p>{submissionStatus.confirmationEmail}</p>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(submissionStatus.confirmationEmail!)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Submission Notes</Label>
                    <p className="mt-1 text-gray-700">
                      {submissionStatus.submissionNotes || 'No notes added'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Send className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No submission information available</p>
              <Button onClick={() => setShowSubmissionDialog(true)} className="mt-4">
                Add Submission Details
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Follow-up Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Follow-up Management
            </span>
            <Button size="sm" onClick={() => {
              resetFollowUpForm();
              setShowFollowUpDialog(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Follow-up
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Follow-up Required Status */}
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="follow-up-required"
                  checked={submissionStatus?.followUpRequired || false}
                  onCheckedChange={async (checked) => {
                    try {
                      await onSubmissionUpdate({ followUpRequired: checked as boolean });
                      toast.success('Follow-up requirement updated');
                    } catch (error) {
                      toast.error('Failed to update follow-up requirement');
                    }
                  }}
                />
                <Label htmlFor="follow-up-required" className="text-lg font-medium">
                  Follow-up Required
                </Label>
              </div>
              {submissionStatus?.followUpRequired && (
                <Badge variant="destructive">Action Required</Badge>
              )}
            </div>
            {submissionStatus?.followUpNotes && (
              <p className="mt-2 text-sm text-gray-600">{submissionStatus.followUpNotes}</p>
            )}
          </div>

          {/* Upcoming Follow-ups */}
          {upcomingFollowUps.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Upcoming Follow-ups
              </h4>
              <div className="space-y-2">
                {upcomingFollowUps.slice(0, 3).map(followUp => {
                  const daysUntil = followUp.nextActionDate ? getDaysUntilFollowUp(followUp.nextActionDate) : 0;
                  return (
                    <div key={followUp._id} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50">
                      <div className="flex items-center gap-3">
                        {getFollowUpTypeIcon(followUp.type)}
                        <div>
                          <p className="font-medium">{followUp.nextAction}</p>
                          <p className="text-sm text-gray-600">
                            {followUp.nextActionDate && format(parseISO(followUp.nextActionDate), 'PPP')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={daysUntil <= 3 ? 'destructive' : 'secondary'}>
                        {daysUntil === 0 ? 'Due today' : `${daysUntil} days`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Follow-ups */}
          <div>
            <h4 className="font-medium mb-3">All Follow-ups</h4>
            {submissionStatus?.followUpHistory && submissionStatus.followUpHistory.length > 0 ? (
              <div className="space-y-3">
                {submissionStatus.followUpHistory
                  .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
                  .map(followUp => (
                    <div key={followUp._id} className="border rounded-lg overflow-hidden">
                      <div className="p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {getFollowUpTypeIcon(followUp.type)}
                              <Badge className={getFollowUpTypeColor(followUp.type)}>
                                {followUp.type}
                              </Badge>
                            </div>
                            <div>
                              <p className="font-medium">{followUp.notes}</p>
                              <p className="text-sm text-gray-600">
                                {format(parseISO(followUp.date), 'PPP')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleFollowUpExpansion(followUp._id)}
                            >
                              {expandedFollowUps.has(followUp._id) ? (
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
                                <DropdownMenuItem onClick={() => openEditFollowUp(followUp)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleFollowUpDelete(followUp._id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedFollowUps.has(followUp._id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="p-4 border-t">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="font-medium mb-2">Outcome</h5>
                                  <p className="text-sm text-gray-600">
                                    {followUp.outcome || 'No outcome recorded'}
                                  </p>
                                </div>
                                
                                {followUp.nextAction && (
                                  <div>
                                    <h5 className="font-medium mb-2">Next Action</h5>
                                    <p className="text-sm text-gray-600">{followUp.nextAction}</p>
                                    {followUp.nextActionDate && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Due: {format(parseISO(followUp.nextActionDate), 'PPP')}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No follow-ups recorded</p>
                <Button onClick={() => {
                  resetFollowUpForm();
                  setShowFollowUpDialog(true);
                }} className="mt-4">
                  Add First Follow-up
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submission Status Dialog */}
      <Dialog open={showSubmissionDialog} onOpenChange={setShowSubmissionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Submission Status</DialogTitle>
            <DialogDescription>
              Update your application submission details and status
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="submitted"
                checked={submissionForm.applicationSubmitted}
                onCheckedChange={(checked) => setSubmissionForm({...submissionForm, applicationSubmitted: checked as boolean})}
              />
              <Label htmlFor="submitted" className="text-lg font-medium">
                Application has been submitted
              </Label>
            </div>

            {submissionForm.applicationSubmitted && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="submittedAt">Submission Date</Label>
                    <Input
                      id="submittedAt"
                      type="date"
                      value={submissionForm.submittedAt}
                      onChange={(e) => setSubmissionForm({...submissionForm, submittedAt: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="submissionMethod">Submission Method</Label>
                    <Select value={submissionForm.submissionMethod} onValueChange={(value: any) => setSubmissionForm({...submissionForm, submissionMethod: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online Portal</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="mail">Mail</SelectItem>
                        <SelectItem value="in_person">In Person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="confirmationNumber">Confirmation Number</Label>
                    <Input
                      id="confirmationNumber"
                      placeholder="Application confirmation number"
                      value={submissionForm.confirmationNumber}
                      onChange={(e) => setSubmissionForm({...submissionForm, confirmationNumber: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmationEmail">Confirmation Email</Label>
                    <Input
                      id="confirmationEmail"
                      type="email"
                      placeholder="confirmation@example.com"
                      value={submissionForm.confirmationEmail}
                      onChange={(e) => setSubmissionForm({...submissionForm, confirmationEmail: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="submissionNotes">Submission Notes</Label>
                  <Textarea
                    id="submissionNotes"
                    placeholder="Additional notes about the submission..."
                    value={submissionForm.submissionNotes}
                    onChange={(e) => setSubmissionForm({...submissionForm, submissionNotes: e.target.value})}
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowSubmissionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmissionUpdate} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Update Status'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Follow-up Dialog */}
      <Dialog open={showFollowUpDialog} onOpenChange={(open) => {
        if (!open) {
          setShowFollowUpDialog(false);
          setEditingFollowUp(null);
          resetFollowUpForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFollowUp ? 'Edit Follow-up' : 'Add Follow-up'}
            </DialogTitle>
            <DialogDescription>
              {editingFollowUp ? 'Update follow-up details' : 'Record a new follow-up action'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="followUpDate">Date</Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={followUpForm.date}
                  onChange={(e) => setFollowUpForm({...followUpForm, date: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="followUpType">Type</Label>
                <Select value={followUpForm.type} onValueChange={(value: any) => setFollowUpForm({...followUpForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="in_person">In Person</SelectItem>
                    <SelectItem value="portal">Portal Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="followUpNotes">Notes *</Label>
              <Textarea
                id="followUpNotes"
                placeholder="Describe what was done or discussed..."
                value={followUpForm.notes}
                onChange={(e) => setFollowUpForm({...followUpForm, notes: e.target.value})}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="followUpOutcome">Outcome</Label>
              <Textarea
                id="followUpOutcome"
                placeholder="What was the result or response?"
                value={followUpForm.outcome}
                onChange={(e) => setFollowUpForm({...followUpForm, outcome: e.target.value})}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nextAction">Next Action</Label>
                <Input
                  id="nextAction"
                  placeholder="What needs to be done next?"
                  value={followUpForm.nextAction}
                  onChange={(e) => setFollowUpForm({...followUpForm, nextAction: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="nextActionDate">Next Action Date</Label>
                <Input
                  id="nextActionDate"
                  type="date"
                  value={followUpForm.nextActionDate}
                  onChange={(e) => setFollowUpForm({...followUpForm, nextActionDate: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => {
              setShowFollowUpDialog(false);
              setEditingFollowUp(null);
              resetFollowUpForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={editingFollowUp ? handleFollowUpUpdate : handleFollowUpAdd}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (editingFollowUp ? 'Update Follow-up' : 'Add Follow-up')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 