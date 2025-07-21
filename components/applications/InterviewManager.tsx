'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, Video, Phone, MapPin, MessageSquare, Plus, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { toast } from 'sonner';

interface Interview {
  _id: string;
  applicationId: string;
  applicationType: 'program' | 'scholarship';
  applicationName: string;
  interviewDate: string;
  interviewType: 'in-person' | 'virtual' | 'phone';
  interviewNotes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  location?: string;
  meetingLink?: string;
  interviewerName?: string;
  interviewerEmail?: string;
  preparationNotes?: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

interface InterviewManagerProps {
  userId: string;
}

const interviewTypeIcons = {
  'in-person': MapPin,
  'virtual': Video,
  'phone': Phone
};

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  rescheduled: 'bg-yellow-100 text-yellow-800'
};

const statusLabels = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rescheduled: 'Rescheduled'
};

export default function InterviewManager({ userId }: InterviewManagerProps) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState<Date>();
  const [interviewType, setInterviewType] = useState<'in-person' | 'virtual' | 'phone'>('virtual');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [interviewerName, setInterviewerName] = useState('');
  const [interviewerEmail, setInterviewerEmail] = useState('');
  const [preparationNotes, setPreparationNotes] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      // Fetch both program and scholarship applications with interviews
      const [programResponse, scholarshipResponse] = await Promise.all([
        fetch('/api/user-interests?hasInterview=true'),
        fetch('/api/scholarship-applications?hasInterview=true')
      ]);

      const programData = await programResponse.json();
      const scholarshipData = await scholarshipResponse.json();

      const programInterviews = (programData.userInterests || [])
        .filter((interest: any) => interest.interviewScheduled)
        .map((interest: any) => ({
          _id: interest._id,
          applicationId: interest._id,
          applicationType: 'program' as const,
          applicationName: interest.programId?.name || interest.programName || 'External Program',
          interviewDate: interest.interviewDate,
          interviewType: interest.interviewType,
          interviewNotes: interest.interviewNotes,
          status: interest.interviewStatus || 'scheduled',
          location: interest.interviewLocation,
          meetingLink: interest.interviewMeetingLink,
          interviewerName: interest.interviewerName,
          interviewerEmail: interest.interviewerEmail,
          preparationNotes: interest.interviewPreparationNotes,
          feedback: interest.interviewFeedback,
          createdAt: interest.createdAt,
          updatedAt: interest.updatedAt
        }));

      const scholarshipInterviews = (scholarshipData.applications || [])
        .filter((app: any) => app.interviewScheduled)
        .map((app: any) => ({
          _id: app._id,
          applicationId: app._id,
          applicationType: 'scholarship' as const,
          applicationName: app.scholarshipId?.name || 'Scholarship',
          interviewDate: app.interviewDate,
          interviewType: app.interviewType,
          interviewNotes: app.interviewNotes,
          status: app.interviewStatus || 'scheduled',
          location: app.interviewLocation,
          meetingLink: app.interviewMeetingLink,
          interviewerName: app.interviewerName,
          interviewerEmail: app.interviewerEmail,
          preparationNotes: app.interviewPreparationNotes,
          feedback: app.interviewFeedback,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt
        }));

      const allInterviews = [...programInterviews, ...scholarshipInterviews]
        .sort((a, b) => new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime());

      setInterviews(allInterviews);
    } catch (error) {
      toast.error('Error fetching interviews');
    } finally {
      setLoading(false);
    }
  };

  const scheduleInterview = async () => {
    if (!selectedInterview || !interviewDate || !interviewType) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const endpoint = selectedInterview.applicationType === 'program' 
        ? `/api/user-interests/${selectedInterview.applicationId}/interview`
        : `/api/scholarship-applications/${selectedInterview.applicationId}/interview`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewDate: interviewDate.toISOString(),
          interviewType,
          interviewNotes,
          location: location || undefined,
          meetingLink: meetingLink || undefined,
          interviewerName: interviewerName || undefined,
          interviewerEmail: interviewerEmail || undefined,
          preparationNotes: preparationNotes || undefined
        })
      });

      if (response.ok) {
        toast.success('Interview scheduled successfully');
        setIsScheduleDialogOpen(false);
        fetchInterviews();
      } else {
        toast.error('Failed to schedule interview');
      }
    } catch (error) {
      toast.error('Error scheduling interview');
    }
  };

  const updateInterview = async () => {
    if (!selectedInterview) return;

    try {
      const endpoint = selectedInterview.applicationType === 'program' 
        ? `/api/user-interests/${selectedInterview.applicationId}/interview`
        : `/api/scholarship-applications/${selectedInterview.applicationId}/interview`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewDate: interviewDate?.toISOString(),
          interviewType,
          interviewNotes,
          location: location || undefined,
          meetingLink: meetingLink || undefined,
          interviewerName: interviewerName || undefined,
          interviewerEmail: interviewerEmail || undefined,
          preparationNotes: preparationNotes || undefined
        })
      });

      if (response.ok) {
        toast.success('Interview updated successfully');
        setIsEditDialogOpen(false);
        fetchInterviews();
      } else {
        toast.error('Failed to update interview');
      }
    } catch (error) {
      toast.error('Error updating interview');
    }
  };

  const updateFeedback = async () => {
    if (!selectedInterview) return;

    try {
      const endpoint = selectedInterview.applicationType === 'program' 
        ? `/api/user-interests/${selectedInterview.applicationId}`
        : `/api/scholarship-applications/${selectedInterview.applicationId}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewFeedback: feedback,
          interviewStatus: 'completed'
        })
      });

      if (response.ok) {
        toast.success('Feedback updated successfully');
        setIsFeedbackDialogOpen(false);
        fetchInterviews();
      } else {
        toast.error('Failed to update feedback');
      }
    } catch (error) {
      toast.error('Error updating feedback');
    }
  };

  const cancelInterview = async (interview: Interview) => {
    if (!confirm('Are you sure you want to cancel this interview?')) return;

    try {
      const endpoint = interview.applicationType === 'program' 
        ? `/api/user-interests/${interview.applicationId}/interview`
        : `/api/scholarship-applications/${interview.applicationId}/interview`;

      const response = await fetch(endpoint, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Interview cancelled successfully');
        fetchInterviews();
      } else {
        toast.error('Failed to cancel interview');
      }
    } catch (error) {
      toast.error('Error cancelling interview');
    }
  };

  const getUpcomingInterviews = () => {
    const now = new Date();
    return interviews.filter(interview => 
      interview.status === 'scheduled' && 
      isAfter(new Date(interview.interviewDate), now)
    );
  };

  const getPastInterviews = () => {
    const now = new Date();
    return interviews.filter(interview => 
      isBefore(new Date(interview.interviewDate), now) ||
      interview.status === 'completed'
    );
  };

  const openScheduleDialog = (interview: Interview) => {
    setSelectedInterview(interview);
    setInterviewDate(undefined);
    setInterviewType('virtual');
    setInterviewNotes('');
    setLocation('');
    setMeetingLink('');
    setInterviewerName('');
    setInterviewerEmail('');
    setPreparationNotes('');
    setIsScheduleDialogOpen(true);
  };

  const openEditDialog = (interview: Interview) => {
    setSelectedInterview(interview);
    setInterviewDate(new Date(interview.interviewDate));
    setInterviewType(interview.interviewType);
    setInterviewNotes(interview.interviewNotes || '');
    setLocation(interview.location || '');
    setMeetingLink(interview.meetingLink || '');
    setInterviewerName(interview.interviewerName || '');
    setInterviewerEmail(interview.interviewerEmail || '');
    setPreparationNotes(interview.preparationNotes || '');
    setIsEditDialogOpen(true);
  };

  const openFeedbackDialog = (interview: Interview) => {
    setSelectedInterview(interview);
    setFeedback(interview.feedback || '');
    setIsFeedbackDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading interviews...</div>;
  }

  const upcomingInterviews = getUpcomingInterviews();
  const pastInterviews = getPastInterviews();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Interview Management</h2>
        <div className="flex gap-2">
          <Badge variant="outline">
            {upcomingInterviews.length} Upcoming
          </Badge>
          <Badge variant="outline">
            {pastInterviews.length} Past
          </Badge>
        </div>
      </div>

      {/* Upcoming Interviews */}
      {upcomingInterviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Upcoming Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingInterviews.map((interview) => {
                const IconComponent = interviewTypeIcons[interview.interviewType];
                const isToday = format(new Date(interview.interviewDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                const isTomorrow = format(new Date(interview.interviewDate), 'yyyy-MM-dd') === format(addDays(new Date(), 1), 'yyyy-MM-dd');

                return (
                  <Card key={interview._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          <Badge className={statusColors[interview.status]}>
                            {statusLabels[interview.status]}
                          </Badge>
                        </div>
                        {(isToday || isTomorrow) && (
                          <Badge variant="destructive">
                            {isToday ? 'Today' : 'Tomorrow'}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{interview.applicationName}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-1 mb-1">
                          <CalendarIcon className="w-4 h-4" />
                          {format(new Date(interview.interviewDate), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(interview.interviewDate), 'h:mm a')}
                        </div>
                      </div>

                      {interview.location && (
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {interview.location}
                          </div>
                        </div>
                      )}

                      {interview.meetingLink && (
                        <div className="text-sm">
                          <a 
                            href={interview.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Video className="w-4 h-4" />
                            Join Meeting
                          </a>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(interview)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openFeedbackDialog(interview)}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelInterview(interview)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Interviews */}
      {pastInterviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Past Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastInterviews.map((interview) => {
                const IconComponent = interviewTypeIcons[interview.interviewType];

                return (
                  <Card key={interview._id} className="opacity-75">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          <Badge className={statusColors[interview.status]}>
                            {statusLabels[interview.status]}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{interview.applicationName}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-1 mb-1">
                          <CalendarIcon className="w-4 h-4" />
                          {format(new Date(interview.interviewDate), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(interview.interviewDate), 'h:mm a')}
                        </div>
                      </div>

                      {interview.feedback && (
                        <div className="text-sm">
                          <div className="font-medium mb-1">Feedback:</div>
                          <div className="text-gray-600 line-clamp-2">
                            {interview.feedback}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openFeedbackDialog(interview)}
                        >
                          <MessageSquare className="w-4 h-4" />
                          {interview.feedback ? 'Edit Feedback' : 'Add Feedback'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {interviews.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No interviews scheduled</h3>
            <p className="text-gray-600 mb-4">
              When you have interviews scheduled for your applications, they will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Schedule Interview Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Interview Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {interviewDate ? format(interviewDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={interviewDate}
                      onSelect={setInterviewDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Interview Type</label>
                <Select value={interviewType} onValueChange={(value: any) => setInterviewType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Interviewer Name</label>
                <Input
                  value={interviewerName}
                  onChange={(e) => setInterviewerName(e.target.value)}
                  placeholder="Interviewer's name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Interviewer Email</label>
                <Input
                  type="email"
                  value={interviewerEmail}
                  onChange={(e) => setInterviewerEmail(e.target.value)}
                  placeholder="interviewer@example.com"
                />
              </div>
            </div>

            {interviewType === 'in-person' && (
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Interview location"
                />
              </div>
            )}

            {interviewType === 'virtual' && (
              <div>
                <label className="block text-sm font-medium mb-2">Meeting Link</label>
                <Input
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Preparation Notes</label>
              <Textarea
                value={preparationNotes}
                onChange={(e) => setPreparationNotes(e.target.value)}
                placeholder="Any notes for interview preparation..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Additional Notes</label>
              <Textarea
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
                placeholder="Any additional notes about the interview..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={scheduleInterview}>
                Schedule Interview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Interview Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Interview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Same form fields as schedule dialog */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Interview Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {interviewDate ? format(interviewDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={interviewDate}
                      onSelect={setInterviewDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Interview Type</label>
                <Select value={interviewType} onValueChange={(value: any) => setInterviewType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Interviewer Name</label>
                <Input
                  value={interviewerName}
                  onChange={(e) => setInterviewerName(e.target.value)}
                  placeholder="Interviewer's name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Interviewer Email</label>
                <Input
                  type="email"
                  value={interviewerEmail}
                  onChange={(e) => setInterviewerEmail(e.target.value)}
                  placeholder="interviewer@example.com"
                />
              </div>
            </div>

            {interviewType === 'in-person' && (
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Interview location"
                />
              </div>
            )}

            {interviewType === 'virtual' && (
              <div>
                <label className="block text-sm font-medium mb-2">Meeting Link</label>
                <Input
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Preparation Notes</label>
              <Textarea
                value={preparationNotes}
                onChange={(e) => setPreparationNotes(e.target.value)}
                placeholder="Any notes for interview preparation..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Additional Notes</label>
              <Textarea
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
                placeholder="Any additional notes about the interview..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updateInterview}>
                Update Interview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Interview Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Feedback</label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Add your feedback about the interview..."
                rows={6}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsFeedbackDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updateFeedback}>
                Save Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}