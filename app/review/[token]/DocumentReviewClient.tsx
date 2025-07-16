'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  MessageSquare, 
  Star, 
  User, 
  Calendar, 
  Edit3, 
  AlertCircle, 
  HelpCircle,
  Send,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { Document } from '@/types/documents';
import { DocumentShare, DocumentFeedback, FeedbackComment } from '@/types/feedback';
import { toast } from 'sonner';

interface DocumentReviewData {
  document: Document;
  share: DocumentShare;
  existingFeedback?: DocumentFeedback;
}

interface DocumentReviewClientProps {
  initialData: DocumentReviewData;
}

// Type for form comments (without id, createdAt, updatedAt)
type FormComment = {
  content: string;
  type: 'general' | 'suggestion' | 'correction' | 'question';
  position: { start: number; end: number; text: string } | null;
  status: 'pending' | 'addressed' | 'ignored';
};

export default function DocumentReviewClient({ initialData }: DocumentReviewClientProps) {
  const [data, setData] = useState<DocumentReviewData>(initialData);
  const [submitting, setSubmitting] = useState(false);
  const [showContent, setShowContent] = useState(true);

  // Form state
  const [form, setForm] = useState({
    reviewerName: data.existingFeedback?.reviewerName || '',
    reviewerEmail: data.existingFeedback?.reviewerEmail || '',
    overallRating: data.existingFeedback?.overallRating?.toString() || '',
    generalFeedback: data.existingFeedback?.generalFeedback || '',
    comments: data.existingFeedback?.comments.map((comment: FeedbackComment) => ({
      content: comment.content,
      type: comment.type,
      position: comment.position || null,
      status: comment.status || 'pending'
    })) || [] as FormComment[]
  });

  // New comment state
  const [newComment, setNewComment] = useState({
    content: '',
    type: 'general' as 'general' | 'suggestion' | 'correction' | 'question',
    position: null as { start: number; end: number; text: string } | null
  });

  const addComment = () => {
    if (!newComment.content.trim()) {
      toast.error('Comment content is required');
      return;
    }

    setForm(prev => ({
      ...prev,
      comments: [...prev.comments, {
        content: newComment.content,
        type: newComment.type,
        position: newComment.position,
        status: 'pending'
      }]
    }));

    setNewComment({
      content: '',
      type: 'general',
      position: null
    });

    toast.success('Comment added');
  };

  const removeComment = (index: number) => {
    setForm(prev => ({
      ...prev,
      comments: prev.comments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!form.reviewerName.trim()) {
      toast.error('Your name is required');
      return;
    }

    if (form.comments.length === 0) {
      toast.error('At least one comment is required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/documents/${data.document._id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentShareId: data.share._id,
          reviewerName: form.reviewerName,
          reviewerEmail: form.reviewerEmail || undefined,
          comments: form.comments.map(({ content, type, position }) => ({ content, type, position })),
          overallRating: form.overallRating ? parseInt(form.overallRating) : undefined,
          generalFeedback: form.generalFeedback || undefined
        }),
      });

      if (response.ok) {
        toast.success('Feedback submitted successfully!');
        // Update the data to show the submitted feedback
        const feedbackData = await response.json();
        setData(prev => ({
          ...prev,
          existingFeedback: feedbackData.feedback
        }));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 cursor-pointer ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
        onClick={() => setForm(prev => ({ ...prev, overallRating: (i + 1).toString() }))}
      />
    ));
  };

  const { document, share, existingFeedback } = data;

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-3xl font-bold">Document Review</h1>
        </div>
        <p className="text-muted-foreground">
          You've been invited to review this document and provide feedback
        </p>
      </div>

      {/* Document Info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{document.title}</CardTitle>
              <CardDescription className="mt-2">
                <div className="flex items-center gap-4 text-sm">
                  <span>Type: {document.type}</span>
                  <span>Words: {document.wordCount?.toLocaleString()}</span>
                  <span>Characters: {document.characterCount?.toLocaleString()}</span>
                </div>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowContent(!showContent)}
              >
                {showContent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showContent ? 'Hide' : 'Show'} Content
              </Button>
              {share.canDownload && (
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        {share.message && (
          <CardContent className="pt-0">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{share.message}</p>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Content */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showContent ? (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                    {document.content}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <EyeOff className="h-8 w-8 mx-auto mb-2" />
                  <p>Content is hidden</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Existing Feedback */}
          {existingFeedback && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Your Previous Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {existingFeedback.overallRating && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Rating:</span>
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < existingFeedback.overallRating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {existingFeedback.generalFeedback && (
                  <div>
                    <p className="font-medium mb-2">General Feedback:</p>
                    <p className="text-sm bg-muted p-3 rounded">{existingFeedback.generalFeedback}</p>
                  </div>
                )}
                <div>
                  <p className="font-medium mb-2">Comments ({existingFeedback.comments.length}):</p>
                  <div className="space-y-2">
                    {existingFeedback.comments.map((comment, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                        {getCommentTypeIcon(comment.type)}
                        <div className="flex-1">
                          <Badge className={`${getCommentTypeColor(comment.type)} mb-1`}>
                            {comment.type}
                          </Badge>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Feedback Form */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Provide Feedback
              </CardTitle>
              <CardDescription>
                Share your thoughts and suggestions for this document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Reviewer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reviewerName">Your Name *</Label>
                  <Input
                    id="reviewerName"
                    placeholder="John Doe"
                    value={form.reviewerName}
                    onChange={(e) => setForm(prev => ({ ...prev, reviewerName: e.target.value }))}
                    disabled={!!existingFeedback}
                  />
                </div>
                <div>
                  <Label htmlFor="reviewerEmail">Email (Optional)</Label>
                  <Input
                    id="reviewerEmail"
                    type="email"
                    placeholder="john@example.com"
                    value={form.reviewerEmail}
                    onChange={(e) => setForm(prev => ({ ...prev, reviewerEmail: e.target.value }))}
                    disabled={!!existingFeedback}
                  />
                </div>
              </div>

              {/* Overall Rating */}
              <div>
                <Label>Overall Rating (Optional)</Label>
                <div className="flex items-center gap-2 mt-2">
                  {renderStars(parseInt(form.overallRating) || 0)}
                  <span className="text-sm text-muted-foreground ml-2">
                    {form.overallRating ? `${form.overallRating}/5` : 'Click to rate'}
                  </span>
                </div>
              </div>

              {/* General Feedback */}
              <div>
                <Label htmlFor="generalFeedback">General Feedback (Optional)</Label>
                <Textarea
                  id="generalFeedback"
                  placeholder="Share your overall thoughts about this document..."
                  value={form.generalFeedback}
                  onChange={(e) => setForm(prev => ({ ...prev, generalFeedback: e.target.value }))}
                  rows={4}
                  disabled={!!existingFeedback}
                />
              </div>

              {/* Comments */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Comments ({form.comments.length})</Label>
                  {!existingFeedback && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!newComment.content.trim()) {
                          toast.error('Comment content is required');
                          return;
                        }
                        addComment();
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Add Comment
                    </Button>
                  )}
                </div>

                {/* New Comment Form */}
                {!existingFeedback && (
                  <div className="border rounded-lg p-4 space-y-3">
                    <div>
                      <Label htmlFor="commentContent">Comment *</Label>
                      <Textarea
                        id="commentContent"
                        placeholder="Add your comment here..."
                        value={newComment.content}
                        onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <Label htmlFor="commentType">Type</Label>
                        <Select
                          value={newComment.type}
                          onValueChange={(value) => setNewComment(prev => ({ ...prev, type: value as any }))}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="suggestion">Suggestion</SelectItem>
                            <SelectItem value="correction">Correction</SelectItem>
                            <SelectItem value="question">Question</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={addComment}
                        disabled={!newComment.content.trim()}
                        size="sm"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-2">
                  {form.comments.map((comment, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                      {getCommentTypeIcon(comment.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getCommentTypeColor(comment.type)}>
                            {comment.type}
                          </Badge>
                          {!existingFeedback && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeComment(index)}
                              className="h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          )}
                        </div>
                        <p className="text-sm">{comment.content}</p>
                        {comment.position && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Highlighted: "{comment.position.text}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              {!existingFeedback && (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !form.reviewerName.trim() || form.comments.length === 0}
                  className="w-full"
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}