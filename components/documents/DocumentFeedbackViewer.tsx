'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Star, 
  User, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Edit3,
  ThumbsUp,
  HelpCircle,
  XCircle,
  Eye,
  Download,
  Sparkles
} from 'lucide-react';
import { Document } from '@/types/documents';
import { DocumentFeedback, FeedbackComment, FeedbackStats } from '@/types/feedback';
import { toast } from 'sonner';
import AIFeedbackRefinementModal from './AIFeedbackRefinementModal';

interface DocumentFeedbackViewerProps {
  document: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DocumentFeedbackViewer({
  document,
  open,
  onOpenChange
}: DocumentFeedbackViewerProps) {
  const [feedback, setFeedback] = useState<DocumentFeedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<DocumentFeedback | null>(null);
  const [selectedComment, setSelectedComment] = useState<FeedbackComment | null>(null);
  const [updating, setUpdating] = useState(false);
  const [aiRefinementOpen, setAiRefinementOpen] = useState(false);

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/documents/${document._id}/feedback`);
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback || []);
        setStats(data.stats || null);
      } else {
        toast.error('Failed to load feedback');
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }, [document._id]);

  // Load feedback when dialog opens
  useEffect(() => {
    if (open) {
      loadFeedback();
    }
  }, [open, document._id, loadFeedback]);

  const updateCommentStatus = async (feedbackId: string, commentId: string, status: 'pending' | 'addressed' | 'ignored') => {
    setUpdating(true);
    try {
      const feedbackItem = feedback.find(f => f._id === feedbackId);
      if (!feedbackItem) return;

      const updatedComments = feedbackItem.comments.map(comment => 
        comment.id === commentId ? { ...comment, status } : comment
      );

      const response = await fetch(`/api/documents/${document._id}/feedback?feedbackId=${feedbackId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comments: updatedComments
        }),
      });

      if (response.ok) {
        toast.success('Comment status updated');
        loadFeedback(); // Refresh feedback
      } else {
        toast.error('Failed to update comment status');
      }
    } catch (error) {
      console.error('Error updating comment status:', error);
      toast.error('Failed to update comment status');
    } finally {
      setUpdating(false);
    }
  };

  const markFeedbackResolved = async (feedbackId: string, resolved: boolean) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/documents/${document._id}/feedback?feedbackId=${feedbackId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isResolved: resolved
        }),
      });

      if (response.ok) {
        toast.success(resolved ? 'Feedback marked as resolved' : 'Feedback marked as pending');
        loadFeedback(); // Refresh feedback
      } else {
        toast.error('Failed to update feedback status');
      }
    } catch (error) {
      console.error('Error updating feedback status:', error);
      toast.error('Failed to update feedback status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAIRefinement = async (content: string, createNewVersion: boolean) => {
    if (createNewVersion) {
      // Navigate to the new document (it will be created by the API)
      // For now, we'll just show a success message
      toast.success('New version created successfully!');
    } else {
      // Update the current document content
      try {
        const response = await fetch(`/api/documents/${document._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: content
          }),
        });

        if (response.ok) {
          toast.success('Document updated with refined content!');
          // You might want to refresh the document data here
        } else {
          toast.error('Failed to update document');
        }
      } catch (error) {
        console.error('Error updating document:', error);
        toast.error('Failed to update document');
      }
    }
  };

  const getCommentTypeIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return <Edit3 className="h-4 w-4" />;
      case 'correction': return <AlertCircle className="h-4 w-4" />;
      case 'question': return <HelpCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'suggestion': return 'bg-blue-100 text-blue-800';
      case 'correction': return 'bg-red-100 text-red-800';
      case 'question': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'addressed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'ignored': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading feedback...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Document Feedback
          </DialogTitle>
          <DialogDescription>
            Review and manage feedback for &quot;{document.title}&quot;
          </DialogDescription>
        </DialogHeader>

        {/* Feedback Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
                    <p className="text-2xl font-bold">{stats.totalFeedback}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">{stats.pendingFeedback}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                    <p className="text-2xl font-bold">{stats.resolvedFeedback}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                    <div className="flex items-center gap-1">
                      <p className="text-2xl font-bold">{stats.averageRating}</p>
                      <div className="flex">
                        {renderStars(Math.round(stats.averageRating))}
                      </div>
                    </div>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Refinement Button */}
        {feedback.length > 0 && (
          <div className="mb-6">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">AI-Powered Document Refinement</h3>
                      <p className="text-xs text-muted-foreground">
                        Use AI to rewrite your document incorporating selected feedback
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setAiRefinementOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Refine with AI
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feedback List */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Feedback ({feedback.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({feedback.filter(f => !f.isResolved).length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({feedback.filter(f => f.isResolved).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {feedback.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No feedback yet</h3>
                  <p className="text-muted-foreground">
                    Share your document to start receiving feedback
                  </p>
                </CardContent>
              </Card>
            ) : (
              feedback.map((feedbackItem) => (
                <Card key={feedbackItem._id} className={feedbackItem.isResolved ? 'opacity-75' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{feedbackItem.reviewerName}</span>
                          {feedbackItem.reviewerEmail && (
                            <span className="text-sm text-muted-foreground">
                              ({feedbackItem.reviewerEmail})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(feedbackItem.createdAt)}
                          </div>
                          {feedbackItem.overallRating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {feedbackItem.overallRating}/5
                            </div>
                          )}
                          <Badge variant={feedbackItem.isResolved ? 'secondary' : 'default'}>
                            {feedbackItem.isResolved ? 'Resolved' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFeedback(feedbackItem)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        <Button
                          variant={feedbackItem.isResolved ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => markFeedbackResolved(feedbackItem._id, !feedbackItem.isResolved)}
                          disabled={updating}
                        >
                          {feedbackItem.isResolved ? 'Mark Pending' : 'Mark Resolved'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {feedbackItem.generalFeedback && (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm">{feedbackItem.generalFeedback}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Comments ({feedbackItem.comments.length})</p>
                      <div className="space-y-2">
                        {feedbackItem.comments.slice(0, 3).map((comment) => (
                          <div key={comment.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                            {getCommentTypeIcon(comment.type)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={getCommentTypeColor(comment.type)}>
                                  {comment.type}
                                </Badge>
                                {getStatusIcon(comment.status)}
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                        {feedbackItem.comments.length > 3 && (
                          <p className="text-sm text-muted-foreground">
                            +{feedbackItem.comments.length - 3} more comments
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {feedback.filter(f => !f.isResolved).map((feedbackItem) => (
              <Card key={feedbackItem._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{feedbackItem.reviewerName}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(feedbackItem.createdAt)}
                        </div>
                        {feedbackItem.overallRating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {feedbackItem.overallRating}/5
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setSelectedFeedback(feedbackItem)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            {feedback.filter(f => f.isResolved).map((feedbackItem) => (
              <Card key={feedbackItem._id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{feedbackItem.reviewerName}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(feedbackItem.createdAt)}
                        </div>
                        {feedbackItem.resolvedAt && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Resolved {formatDate(feedbackItem.resolvedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFeedback(feedbackItem)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Feedback Detail Dialog */}
        <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedFeedback && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Feedback from {selectedFeedback.reviewerName}
                  </DialogTitle>
                  <DialogDescription>
                    Detailed feedback and comments
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Reviewer Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Reviewer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Name:</span>
                        <span>{selectedFeedback.reviewerName}</span>
                      </div>
                      {selectedFeedback.reviewerEmail && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Email:</span>
                          <span>{selectedFeedback.reviewerEmail}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Submitted:</span>
                        <span>{formatDate(selectedFeedback.createdAt)}</span>
                      </div>
                      {selectedFeedback.overallRating && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Rating:</span>
                          <div className="flex items-center gap-1">
                            {renderStars(selectedFeedback.overallRating)}
                            <span>({selectedFeedback.overallRating}/5)</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* General Feedback */}
                  {selectedFeedback.generalFeedback && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">General Feedback</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap">{selectedFeedback.generalFeedback}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Comments */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Comments ({selectedFeedback.comments.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedFeedback.comments.map((comment) => (
                        <div key={comment.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {getCommentTypeIcon(comment.type)}
                              <Badge className={getCommentTypeColor(comment.type)}>
                                {comment.type}
                              </Badge>
                              {getStatusIcon(comment.status)}
                            </div>
                            <Select
                              value={comment.status}
                              onValueChange={(value) => 
                                updateCommentStatus(selectedFeedback._id, comment.id, value as any)
                              }
                              disabled={updating}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="addressed">Addressed</SelectItem>
                                <SelectItem value="ignored">Ignored</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <p className="mb-2">{comment.content}</p>
                          {comment.position && (
                            <div className="text-sm text-muted-foreground">
                              <p>Highlighted text: &quot;{comment.position.text}&quot;</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant={selectedFeedback.isResolved ? 'outline' : 'default'}
                      onClick={() => markFeedbackResolved(selectedFeedback._id, !selectedFeedback.isResolved)}
                      disabled={updating}
                    >
                      {selectedFeedback.isResolved ? 'Mark as Pending' : 'Mark as Resolved'}
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedFeedback(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>

      {/* AI Feedback Refinement Modal */}
      <AIFeedbackRefinementModal
        open={aiRefinementOpen}
        onOpenChange={setAiRefinementOpen}
        document={document}
        feedback={feedback}
        onContentRefined={handleAIRefinement}
      />
    </Dialog>
  );
}