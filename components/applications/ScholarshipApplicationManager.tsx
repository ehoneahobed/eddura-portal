'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, DollarSign, FileText, MessageSquare, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ScholarshipApplication {
  _id: string;
  scholarshipId: {
    _id: string;
    name: string;
    amount: number;
    deadline: string;
    requirements: string[];
  };
  applicationPackageId?: {
    _id: string;
    name: string;
    type: string;
  };
  status: 'draft' | 'submitted' | 'under_review' | 'interviewed' | 'awarded' | 'rejected';
  submittedAt?: string;
  decisionDate?: string;
  formResponses?: Array<{
    questionId: string;
    answer: string;
    attachments?: string[];
  }>;
  requiresInterview?: boolean;
  interviewScheduled?: boolean;
  interviewDate?: string;
  interviewType?: 'in-person' | 'virtual' | 'phone';
  interviewNotes?: string;
  awardAmount?: number;
  awardCurrency?: string;
  awardConditions?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ScholarshipApplicationManagerProps {
  userId: string;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  interviewed: 'bg-purple-100 text-purple-800',
  awarded: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const statusLabels = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  interviewed: 'Interviewed',
  awarded: 'Awarded',
  rejected: 'Rejected'
};

export default function ScholarshipApplicationManager({ userId }: ScholarshipApplicationManagerProps) {
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<ScholarshipApplication | null>(null);
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false);
  const [isAwardDialogOpen, setIsAwardDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState<Date>();
  const [interviewType, setInterviewType] = useState<'in-person' | 'virtual' | 'phone'>('virtual');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [awardAmount, setAwardAmount] = useState('');
  const [awardCurrency, setAwardCurrency] = useState('USD');
  const [awardConditions, setAwardConditions] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/scholarship-applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      } else {
        toast.error('Failed to fetch applications');
      }
    } catch (error) {
      toast.error('Error fetching applications');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const response = await fetch(`/api/scholarship-applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success('Application status updated');
        fetchApplications();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const scheduleInterview = async () => {
    if (!selectedApplication || !interviewDate || !interviewType) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`/api/scholarship-applications/${selectedApplication._id}/interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewDate: interviewDate.toISOString(),
          interviewType,
          interviewNotes
        })
      });

      if (response.ok) {
        toast.success('Interview scheduled successfully');
        setIsInterviewDialogOpen(false);
        fetchApplications();
      } else {
        toast.error('Failed to schedule interview');
      }
    } catch (error) {
      toast.error('Error scheduling interview');
    }
  };

  const updateAward = async () => {
    if (!selectedApplication || !awardAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`/api/scholarship-applications/${selectedApplication._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          awardAmount: parseFloat(awardAmount),
          awardCurrency,
          awardConditions,
          status: 'awarded'
        })
      });

      if (response.ok) {
        toast.success('Award details updated');
        setIsAwardDialogOpen(false);
        fetchApplications();
      } else {
        toast.error('Failed to update award details');
      }
    } catch (error) {
      toast.error('Error updating award details');
    }
  };

  const updateNotes = async () => {
    if (!selectedApplication) return;

    try {
      const response = await fetch(`/api/scholarship-applications/${selectedApplication._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        toast.success('Notes updated');
        setIsNotesDialogOpen(false);
        fetchApplications();
      } else {
        toast.error('Failed to update notes');
      }
    } catch (error) {
      toast.error('Error updating notes');
    }
  };

  const deleteApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      const response = await fetch(`/api/scholarship-applications/${applicationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Application deleted');
        fetchApplications();
      } else {
        toast.error('Failed to delete application');
      }
    } catch (error) {
      toast.error('Error deleting application');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading applications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Scholarship Applications</h2>
        <Button onClick={() => window.location.href = '/applications/scholarships/new'}>
          <Plus className="w-4 h-4 mr-2" />
          New Application
        </Button>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No scholarship applications yet</h3>
            <p className="text-gray-600 mb-4">Start applying to scholarships to track your progress here.</p>
            <Button onClick={() => window.location.href = '/scholarships'}>
              Browse Scholarships
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((application) => (
            <Card key={application._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{application.scholarshipId.name}</CardTitle>
                  <Badge className={statusColors[application.status]}>
                    {statusLabels[application.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {application.scholarshipId.amount.toLocaleString()} USD
                </div>

                {application.interviewScheduled && application.interviewDate && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    Interview: {format(new Date(application.interviewDate), 'MMM dd, yyyy')}
                  </div>
                )}

                {application.awardAmount && (
                  <div className="flex items-center text-sm text-green-600 font-medium">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Awarded: {application.awardAmount.toLocaleString()} {application.awardCurrency}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Select
                    value={application.status}
                    onValueChange={(value) => updateApplicationStatus(application._id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex gap-1">
                    {application.requiresInterview && !application.interviewScheduled && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedApplication(application);
                          setIsInterviewDialogOpen(true);
                        }}
                      >
                        Schedule Interview
                      </Button>
                    )}

                    {application.status === 'under_review' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedApplication(application);
                          setIsAwardDialogOpen(true);
                        }}
                      >
                        Update Award
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedApplication(application);
                        setNotes(application.notes || '');
                        setIsNotesDialogOpen(true);
                      }}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteApplication(application._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Interview Scheduling Dialog */}
      <Dialog open={isInterviewDialogOpen} onOpenChange={setIsInterviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <Textarea
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
                placeholder="Any additional notes about the interview..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsInterviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={scheduleInterview}>
                Schedule Interview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Award Update Dialog */}
      <Dialog open={isAwardDialogOpen} onOpenChange={setIsAwardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Award Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Award Amount</label>
              <Input
                type="number"
                value={awardAmount}
                onChange={(e) => setAwardAmount(e.target.value)}
                placeholder="Enter award amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <Select value={awardCurrency} onValueChange={setAwardCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Conditions</label>
              <Textarea
                value={awardConditions}
                onChange={(e) => setAwardConditions(e.target.value)}
                placeholder="Any conditions or requirements for the award..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAwardDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updateAward}>
                Update Award
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Application Notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this application..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updateNotes}>
                Save Notes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}