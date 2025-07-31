'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Calendar, Building, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface RecommendationRequest {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  includeDraft: boolean;
  draftContent?: string;
  studentId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  recipientId: {
    name: string;
    email: string;
    title: string;
    institution: string;
    department?: string;
  };
  applicationId?: {
    title: string;
  };
  scholarshipId?: {
    title: string;
  };
}

interface RecommendationLetter {
  _id: string;
  content: string;
  submittedAt: string;
  version: number;
}

export default function RecipientPortalPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [request, setRequest] = useState<RecommendationRequest | null>(null);
  const [existingLetter, setExistingLetter] = useState<RecommendationLetter | null>(null);
  const [letterContent, setLetterContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequest();
  }, [token]);

  const fetchRequest = async () => {
    try {
      const response = await fetch(`/api/recommendations/recipient/${token}`);
      const data = await response.json();
      
      if (response.ok) {
        setRequest(data.request);
        setExistingLetter(data.existingLetter);
        if (data.existingLetter) {
          setLetterContent(data.existingLetter.content);
        } else if (data.request.includeDraft && data.request.draftContent) {
          setLetterContent(data.request.draftContent);
        }
      } else {
        setError(data.error || 'Failed to load request');
      }
    } catch (error) {
      console.error('Error fetching request:', error);
      setError('Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!letterContent.trim()) {
      toast.error('Please provide the recommendation letter content');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/recommendations/recipient/${token}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: letterContent,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Recommendation letter submitted successfully!');
        // Refresh the request to show updated status
        fetchRequest();
      } else {
        toast.error(data.error || 'Failed to submit letter');
      }
    } catch (error) {
      console.error('Error submitting letter:', error);
      toast.error('Failed to submit letter');
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading recommendation request...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            This link may have expired or the request may have been cancelled.
          </p>
        </div>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  const daysUntilDeadline = getDaysUntilDeadline(request.deadline);
  const isOverdue = daysUntilDeadline < 0;
  const isReceived = request.status === 'received';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Recommendation Letter Request
          </h1>
          <p className="text-gray-600">
            {request.studentId.firstName} {request.studentId.lastName} has requested a recommendation letter
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Request Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Request Title</Label>
                  <p className="text-lg font-medium">{request.title}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Description</Label>
                  <p className="text-gray-600 whitespace-pre-wrap">{request.description}</p>
                </div>

                {request.applicationId && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Application</Label>
                    <p className="text-gray-600">{request.applicationId.title}</p>
                  </div>
                )}

                {request.scholarshipId && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Scholarship</Label>
                    <p className="text-gray-600">{request.scholarshipId.title}</p>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Deadline</Label>
                    <p className="text-gray-600">{format(new Date(request.deadline), 'PPP')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <Badge 
                      variant={isReceived ? 'default' : isOverdue ? 'destructive' : 'secondary'}
                      className="ml-2"
                    >
                      {isReceived ? 'Received' : isOverdue ? 'Overdue' : 'Pending'}
                    </Badge>
                  </div>
                </div>

                {!isReceived && (
                  <Alert variant={isOverdue ? 'destructive' : 'default'}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {isOverdue 
                        ? `This request is ${Math.abs(daysUntilDeadline)} days overdue.`
                        : `This request is due in ${daysUntilDeadline} days.`
                      }
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Letter Submission */}
            {!isReceived ? (
              <Card>
                <CardHeader>
                  <CardTitle>Recommendation Letter</CardTitle>
                  <CardDescription>
                    Write your recommendation letter below. You can use the draft provided by the student as a starting point.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="letter-content">Letter Content *</Label>
                      <Textarea
                        id="letter-content"
                        value={letterContent}
                        onChange={(e) => setLetterContent(e.target.value)}
                        placeholder="Write your recommendation letter here..."
                        rows={12}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setLetterContent('')}
                      >
                        Clear
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Letter'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Letter Submitted
                  </CardTitle>
                  <CardDescription>
                    This recommendation letter has been submitted successfully.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Submitted Content</Label>
                    <div className="whitespace-pre-wrap text-gray-600 font-mono text-sm">
                      {existingLetter?.content || letterContent}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Student Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Name</Label>
                  <p className="text-gray-900">
                    {request.studentId.firstName} {request.studentId.lastName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <p className="text-gray-600">{request.studentId.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* Your Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Name</Label>
                  <p className="text-gray-900">{request.recipientId.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Title</Label>
                  <p className="text-gray-600">{request.recipientId.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Institution</Label>
                  <p className="text-gray-600">{request.recipientId.institution}</p>
                </div>
                {request.recipientId.department && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Department</Label>
                    <p className="text-gray-600">{request.recipientId.department}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Draft Information */}
            {request.includeDraft && request.draftContent && (
              <Card>
                <CardHeader>
                  <CardTitle>Student Draft</CardTitle>
                  <CardDescription>
                    The student has provided a draft for your reference
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      This is a draft provided by the student. You may use it as a starting point or write your own letter.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setLetterContent(request.draftContent || '')}
                    >
                      Use Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Deadline Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Deadline Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                  <p className="text-gray-900">{format(new Date(request.deadline), 'PPP')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Time Remaining</Label>
                  <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                    {isOverdue 
                      ? `${Math.abs(daysUntilDeadline)} days overdue`
                      : `${daysUntilDeadline} days remaining`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}