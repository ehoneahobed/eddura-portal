'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Mail, 
  Calendar,
  User,
  Building,
  FileText,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Download,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';

interface Recipient {
  _id: string;
  name: string;
  email: string;
  title: string;
  institution: string;
  department?: string;
  prefersDrafts: boolean;
}

interface RecommendationRequest {
  _id: string;
  title: string;
  description: string;
  deadline: string | Date;
  status: 'pending' | 'sent' | 'received' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  recipientId: Recipient;
  createdAt: string | Date;
  sentAt?: string | Date;
  receivedAt?: string | Date;
  purpose: string;
  relationshipContext: string;
  additionalContext?: string;
  requestType: string;
  submissionMethod: string;
  communicationStyle: string;
  institutionName?: string;
  schoolEmail?: string;
  schoolInstructions?: string;
  includeDraft: boolean;
  draftContent?: string;
  reminderIntervals: number[];
  secureToken: string;
  tokenExpiresAt: string | Date;
}

interface RecommendationLetter {
  _id: string;
  content?: string;
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  submittedAt: string;
  version: number;
}

export default function RecommendationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<RecommendationRequest | null>(null);
  const [recommendationLetter, setRecommendationLetter] = useState<RecommendationLetter | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showSubmissionLink, setShowSubmissionLink] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  const fetchRequest = useCallback(async () => {
    try {
      console.log('Fetching request with ID:', params.id);
      const response = await fetch(`/api/recommendations/requests/${params.id}`);
      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', data);
      
      if (response.ok) {
        setRequest(data.request);
        setRecommendationLetter(data.recommendationLetter || null);
      } else {
        console.error('API Error:', data);
        toast.error(data.error || 'Failed to fetch request details');
        router.push('/recommendations');
      }
    } catch (error) {
      console.error('Error fetching request:', error);
      toast.error('Failed to fetch request details');
      router.push('/recommendations');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    if (params.id) {
      fetchRequest();
    }
  }, [params.id, fetchRequest]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recommendation request? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/recommendations/requests/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Recommendation request deleted successfully');
        router.push('/recommendations');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete request');
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilDeadline = (deadline: string | Date) => {
    const deadlineDate = new Date(deadline);
    // Check if the date is valid
    if (isNaN(deadlineDate.getTime())) {
      return 0; // Return 0 for invalid dates
    }
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return format(date, 'MMM dd, yyyy');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getSubmissionLink = () => {
    if (!request?.secureToken) return '';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/recommendation/${request.secureToken}`;
  };

  const handleViewSubmissionLink = () => {
    if (!request?.secureToken) {
      toast.error('Submission link not available');
      return;
    }
    setShowSubmissionLink(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
      </div>

      {/* Submission Link Dialog */}
      <Dialog open={showSubmissionLink} onOpenChange={setShowSubmissionLink}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submission Link</DialogTitle>
            <DialogDescription>
              Share this link with your recipient to submit their recommendation letter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Submission URL:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={getSubmissionLink()}
                  readOnly
                  className="flex-1 text-sm bg-white border border-gray-300 rounded px-3 py-2"
                />
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(getSubmissionLink())}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p className="mb-2"><strong>Instructions:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Send this link to your recipient via email</li>
                <li>The link will expire on {formatDate(request?.tokenExpiresAt || '')}</li>
                <li>Recipients can upload their recommendation letter directly</li>
                <li>You&apos;ll be notified when the letter is submitted</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSubmissionLink(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  copyToClipboard(getSubmissionLink());
                  setShowSubmissionLink(false);
                }}
              >
                Copy Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

  if (!request) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Request Not Found</h1>
          <p className="text-gray-600 mb-6">The recommendation request you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/recommendations">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Recommendations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/recommendations">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{request.title}</h1>
            <p className="text-gray-600 mt-1">
              Created on {formatDate(request.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusIcon(request.status)}
          <Badge className={getStatusColor(request.status)}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
          <Badge className={getPriorityColor(request.priority)}>
            {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
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
                <h4 className="font-medium text-gray-900 mb-2">Purpose</h4>
                <p className="text-gray-700">{request.purpose}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
              </div>

              {request.additionalContext && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Additional Context</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{request.additionalContext}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Request Type</h4>
                  <p className="text-gray-700 capitalize">
                    {request.requestType.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Submission Method</h4>
                  <p className="text-gray-700 capitalize">
                    {request.submissionMethod.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Communication Style</h4>
                <p className="text-gray-700 capitalize">{request.communicationStyle}</p>
              </div>

              {request.relationshipContext && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Relationship Context</h4>
                  <p className="text-gray-700">{request.relationshipContext}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* School Information */}
          {(request.institutionName || request.schoolEmail || request.schoolInstructions) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  School/Institution Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {request.institutionName && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Institution</h4>
                    <p className="text-gray-700">{request.institutionName}</p>
                  </div>
                )}
                
                {request.schoolEmail && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">School Email</h4>
                    <p className="text-gray-700">{request.schoolEmail}</p>
                  </div>
                )}

                {request.schoolInstructions && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">School Instructions</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{request.schoolInstructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recommendation Letter */}
          {request.status === 'received' && recommendationLetter && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Received Recommendation Letter
                </CardTitle>
                <CardDescription>
                  Your recommendation letter has been submitted successfully.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 p-4 rounded-lg">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Submitted Document</Label>
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {recommendationLetter?.fileName || 'Recommendation Letter'}
                      </p>
                      <p className="text-xs text-gray-600">
                        Submitted on {recommendationLetter?.submittedAt ? format(new Date(recommendationLetter.submittedAt), 'PPP') : 'Unknown date'}
                      </p>
                      {recommendationLetter?.fileSize && (
                        <p className="text-xs text-gray-500">
                          File size: {(recommendationLetter.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                    {recommendationLetter?.fileUrl && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500">
                          Click &quot;View&quot; to open the document in your browser, or &quot;Download&quot; to save it to your device.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isDownloading}
                            onClick={async () => {
                              setIsDownloading(true);
                              try {
                                const response = await fetch(`/api/recommendations/requests/${request._id}/download`);
                                if (response.ok) {
                                  const data = await response.json();
                                  window.open(data.downloadUrl, '_blank');
                                } else {
                                  const error = await response.json();
                                  toast.error(error.error || 'Failed to generate download link');
                                }
                              } catch (error) {
                                console.error('Error generating download URL:', error);
                                toast.error('Failed to generate download link');
                              } finally {
                                setIsDownloading(false);
                              }
                            }}
                          >
                            {isDownloading ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4 mr-2" />
                            )}
                            {isDownloading ? 'Generating...' : 'Download'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isViewing}
                            onClick={async () => {
                              setIsViewing(true);
                              try {
                                const response = await fetch(`/api/recommendations/requests/${request._id}/view`);
                                if (response.ok) {
                                  const data = await response.json();
                                  // Open in new tab for viewing (browser will handle PDF display)
                                  window.open(data.viewUrl, '_blank');
                                } else {
                                  const error = await response.json();
                                  toast.error(error.error || 'Failed to generate view link');
                                }
                              } catch (error) {
                                console.error('Error generating view URL:', error);
                                toast.error('Failed to generate view link');
                              } finally {
                                setIsViewing(false);
                              }
                            }}
                          >
                            {isViewing ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <FileText className="h-4 w-4 mr-2" />
                            )}
                            {isViewing ? 'Generating...' : 'View'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Draft */}
          {request.includeDraft && request.draftContent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  AI-Generated Draft
                </CardTitle>
                <CardDescription>
                  This draft was generated to help your recipient write the recommendation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">Draft Content</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(request.draftContent!)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap text-sm">
                    {request.draftContent}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recipient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Recipient
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{request.recipientId.name}</h4>
                <p className="text-sm text-gray-600">{request.recipientId.title}</p>
                <p className="text-sm text-gray-600">{request.recipientId.institution}</p>
                {request.recipientId.department && (
                  <p className="text-sm text-gray-600">{request.recipientId.department}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{request.recipientId.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={request.recipientId.prefersDrafts ? 'default' : 'secondary'}>
                  {request.recipientId.prefersDrafts ? 'Prefers Drafts' : 'No Drafts'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Deadline</h4>
                <p className="text-sm text-gray-700">
                  {formatDate(request.deadline)}
                </p>
                {request.status !== 'received' && request.status !== 'cancelled' && (
                  <p className={`text-sm mt-1 ${
                    getDaysUntilDeadline(request.deadline) > 0 
                      ? 'text-yellow-600' 
                      : 'text-red-600'
                  }`}>
                    {getDaysUntilDeadline(request.deadline) > 0 
                      ? `${getDaysUntilDeadline(request.deadline)} days remaining`
                      : `${Math.abs(getDaysUntilDeadline(request.deadline))} days overdue`
                    }
                  </p>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Created</h4>
                <p className="text-sm text-gray-700">
                  {formatDate(request.createdAt)}
                </p>
              </div>

              {request.sentAt && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Sent</h4>
                    <p className="text-sm text-gray-700">
                      {formatDate(request.sentAt)}
                    </p>
                  </div>
                </>
              )}

              {request.receivedAt && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Received</h4>
                    <p className="text-sm text-gray-700">
                      {formatDate(request.receivedAt)}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {request.status !== 'received' && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {request.status === 'pending' && (
                  <Link href={`/recommendations/${request._id}/edit`} className="w-full">
                    <Button className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Request
                    </Button>
                  </Link>
                )}
                
                <Button variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Reminder
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleViewSubmissionLink}
                  disabled={!request?.secureToken}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Submission Link
                </Button>

                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? 'Deleting...' : 'Delete Request'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Submission Link Dialog */}
      <Dialog open={showSubmissionLink} onOpenChange={setShowSubmissionLink}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submission Link</DialogTitle>
            <DialogDescription>
              Share this link with your recipient to submit their recommendation letter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Submission URL:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={getSubmissionLink()}
                  readOnly
                  className="flex-1 text-sm bg-white border border-gray-300 rounded px-3 py-2"
                />
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(getSubmissionLink())}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p className="mb-2"><strong>Instructions:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Send this link to your recipient via email</li>
                <li>The link will expire on {formatDate(request?.tokenExpiresAt || '')}</li>
                <li>Recipients can upload their recommendation letter directly</li>
                <li>You&apos;ll be notified when the letter is submitted</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSubmissionLink(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  copyToClipboard(getSubmissionLink());
                  setShowSubmissionLink(false);
                }}
              >
                Copy Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 