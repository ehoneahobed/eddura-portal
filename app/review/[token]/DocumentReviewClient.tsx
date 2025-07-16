'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent } from '@/components/ui/drawer'; // Assume a Drawer component exists or will be created
import { Popover, PopoverContent } from '@/components/ui/popover';
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

// Helper to split content into segments with highlights
function getHighlightedSegments(content: string, comments: FormComment[]) {
  if (!comments || comments.length === 0) return [{ text: content }];
  // Sort comments by start index
  const sorted = [...comments]
    .filter(c => c.position && typeof c.position.start === 'number' && typeof c.position.end === 'number')
    .sort((a, b) => {
      if (!a.position && !b.position) return 0;
      if (!a.position) return 1;
      if (!b.position) return -1;
      return a.position.start - b.position.start;
    });
  let lastIndex = 0;
  const segments = [];
  for (const comment of sorted) {
    if (!comment.position) continue; // null check
    const { start, end, text } = comment.position;
    if (start > lastIndex) {
      segments.push({ text: content.slice(lastIndex, start) });
    }
    segments.push({
      text: content.slice(start, end),
      highlight: true,
      comment
    });
    lastIndex = end;
  }
  if (lastIndex < content.length) {
    segments.push({ text: content.slice(lastIndex) });
  }
  return segments;
}

export default function DocumentReviewClient({ initialData }: DocumentReviewClientProps) {
  // State for document review data, initialized from props
  const [data, setData] = useState<DocumentReviewData>(initialData);
  const [submitting, setSubmitting] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [commentPopoverOpen, setCommentPopoverOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null);
  const [hoveredComment, setHoveredComment] = useState<FormComment | null>(null);
  const [hoveredAnchor, setHoveredAnchor] = useState<HTMLSpanElement | null>(null);
  const [isResolved, setIsResolved] = useState(initialData.existingFeedback?.isResolved || false);
  const [feedbackSidebarOpen, setFeedbackSidebarOpen] = useState(false);
  const canEdit = initialData.share.canComment && !isResolved && (!initialData.share.expiresAt || new Date() < new Date(initialData.share.expiresAt));

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

  const [selectionInfo, setSelectionInfo] = useState<{
    text: string;
    start: number;
    end: number;
    top: number;
    left: number;
  } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Add Comment function (move this above all usages)
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
        position: newComment.position ? { ...newComment.position } : null,
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

  // Handle text selection in the document content
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setSelectionInfo(null);
        return;
      }
      const selectedText = selection.toString();
      if (!selectedText.trim()) {
        setSelectionInfo(null);
        return;
      }
      // Find start and end index in the document content
      const content = data.document.content;
      const anchorNode = selection.anchorNode;
      const focusNode = selection.focusNode;
      if (!anchorNode || !focusNode) {
        setSelectionInfo(null);
        return;
      }
      // Only support selection within the content div
      if (!contentRef.current || !contentRef.current.contains(anchorNode) || !contentRef.current.contains(focusNode)) {
        setSelectionInfo(null);
        return;
      }
      // Find the first occurrence of the selected text in the content
      const start = content.indexOf(selectedText);
      if (start === -1) {
        setSelectionInfo(null);
        return;
      }
      const end = start + selectedText.length;
      // Get the bounding rect for the selection
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionInfo({
        text: selectedText,
        start,
        end,
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX
      });
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [data.document.content]);

  const handleAddSelectionComment = () => {
    if (!selectionInfo) return;
    setNewComment({
      content: '',
      type: 'general',
      position: {
        start: selectionInfo.start,
        end: selectionInfo.end,
        text: selectionInfo.text
      }
    });
    setPopoverPosition({ top: selectionInfo.top, left: selectionInfo.left });
    setCommentPopoverOpen(true);
    setSelectionInfo(null);
  };

  const handlePopoverAddComment = () => {
    if (!newComment.content.trim()) {
      toast.error('Comment content is required');
      return;
    }
    addComment();
    setCommentPopoverOpen(false);
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
          comments: form.comments.map(({ content, type, position }) =>
            position && position.start !== undefined && position.end !== undefined && position.text !== undefined
              ? { content, type, position }
              : { content, type }
          ),
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

  // Destructure document, share, and existingFeedback from current data state
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
      {!canEdit && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
          Commenting is closed for this document.
        </div>
      )}
      
      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 ${
          feedbackSidebarOpen ? 'lg:max-w-[calc(100%-400px)]' : 'lg:max-w-full'
        }`}>
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
          
          {/* Document Content */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showContent ? (
                <div className="prose max-w-none">
                  <div
                    ref={contentRef}
                    className="whitespace-pre-wrap bg-muted p-4 rounded-lg max-h-96 overflow-y-auto relative"
                    style={{ position: 'relative' }}
                  >
                    {/* Render highlighted segments with popover on hover */}
                    {getHighlightedSegments(document.content, form.comments).map((seg, i) =>
                      seg.highlight ? (
                        <Popover
                          key={i}
                          open={hoveredComment === seg.comment}
                          onOpenChange={(open) => {
                            if (!open) setHoveredComment(null);
                          }}
                        >
                          <span
                            ref={el => {
                              if (hoveredComment === seg.comment) setHoveredAnchor(el);
                            }}
                            className="bg-yellow-200 cursor-pointer transition-colors duration-200 hover:bg-yellow-300 rounded px-0.5"
                            onMouseEnter={() => setHoveredComment(seg.comment)}
                            onMouseLeave={() => setHoveredComment(null)}
                          >
                            {seg.text}
                          </span>
                          <PopoverContent side="top" align="center">
                            <div className="mb-1 text-xs text-muted-foreground">
                              <Badge className={getCommentTypeColor(seg.comment.type)}>
                                {seg.comment.type}
                              </Badge>
                            </div>
                            <div className="text-sm">{seg.comment.content}</div>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <span key={i}>{seg.text}</span>
                      )
                    )}
                    {selectionInfo && (
                      <button
                        style={{
                          position: 'absolute',
                          top: selectionInfo.top - (contentRef.current?.getBoundingClientRect().top || 0) - 40,
                          left: selectionInfo.left - (contentRef.current?.getBoundingClientRect().left || 0),
                          zIndex: 10
                        }}
                        className="bg-primary text-white px-2 py-1 rounded shadow"
                        onClick={handleAddSelectionComment}
                      >
                        Add Comment
                      </button>
                    )}
                    {/* Popover for comment input */}
                    {popoverPosition && (
                      <Popover open={commentPopoverOpen} onOpenChange={setCommentPopoverOpen}>
                        <PopoverContent
                          side="right"
                          align="start"
                          style={{
                            position: 'absolute',
                            top: popoverPosition.top - (contentRef.current?.getBoundingClientRect().top || 0),
                            left: popoverPosition.left - (contentRef.current?.getBoundingClientRect().left || 0),
                            zIndex: 20
                          }}
                        >
                          <div className="mb-2 text-xs text-muted-foreground">
                            Commenting on: <span className="font-semibold">"{newComment.position?.text}"</span>
                          </div>
                          <div className="mb-2">
                            <Label htmlFor="popoverCommentContent">Comment *</Label>
                            <Textarea
                              id="popoverCommentContent"
                              placeholder="Add your comment here..."
                              value={newComment.content}
                              onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
                              rows={3}
                            />
                          </div>
                          <div className="mb-2">
                            <Label htmlFor="popoverCommentType">Type</Label>
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
                            onClick={handlePopoverAddComment}
                            disabled={!newComment.content.trim()}
                            size="sm"
                            className="w-full mt-2"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Add Comment
                          </Button>
                        </PopoverContent>
                      </Popover>
                    )}
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

          {/* Toggle Drawer Button */}
          <div className="flex flex-col items-end">
            <Button onClick={() => setDrawerOpen((open) => !open)} variant="outline" size="sm">
              {drawerOpen ? 'Hide Comments' : 'Show Comments'}
            </Button>
          </div>

          {/* Comments Drawer */}
          {drawerOpen && (
            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
              <DrawerContent className="w-96">
                <div className="p-4">
                  <h2 className="text-lg font-semibold mb-4">Comments</h2>
                  {/* Comments List (move from main area) */}
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
              </DrawerContent>
            </Drawer>
          )}
        </div>

        {/* Feedback Sidebar (Desktop) */}
        {!existingFeedback && (
          <div className={`hidden lg:block transition-all duration-300 ${
            feedbackSidebarOpen ? 'w-96' : 'w-0 overflow-hidden'
          }`}>
            <div className="sticky top-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Provide Feedback
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFeedbackSidebarOpen(false)}
                      className="h-8 w-8 p-0"
                    >
                      ×
                    </Button>
                  </div>
                  <CardDescription>
                    Share your thoughts and suggestions for this document
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Reviewer Info */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="sidebarReviewerName">Your Name *</Label>
                      <Input
                        id="sidebarReviewerName"
                        placeholder="John Doe"
                        value={form.reviewerName}
                        onChange={(e) => setForm(prev => ({ ...prev, reviewerName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sidebarReviewerEmail">Email (Optional)</Label>
                      <Input
                        id="sidebarReviewerEmail"
                        type="email"
                        placeholder="john@example.com"
                        value={form.reviewerEmail}
                        onChange={(e) => setForm(prev => ({ ...prev, reviewerEmail: e.target.value }))}
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
                    <Label htmlFor="sidebarGeneralFeedback">General Feedback (Optional)</Label>
                    <Textarea
                      id="sidebarGeneralFeedback"
                      placeholder="Share your overall thoughts about this document..."
                      value={form.generalFeedback}
                      onChange={(e) => setForm(prev => ({ ...prev, generalFeedback: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  {/* Comments */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Comments ({form.comments.length})</Label>
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
                    </div>

                    {/* New Comment Form */}
                    <div className="border rounded-lg p-4 space-y-3">
                      <div>
                        <Label htmlFor="sidebarCommentContent">Comment *</Label>
                        <Textarea
                          id="sidebarCommentContent"
                          placeholder="Add your comment here..."
                          value={newComment.content}
                          onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <Label htmlFor="sidebarCommentType">Type</Label>
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

                    {/* Comments List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {form.comments.map((comment, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                          {getCommentTypeIcon(comment.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getCommentTypeColor(comment.type)}>
                                {comment.type}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeComment(index)}
                                className="h-6 w-6 p-0"
                              >
                                ×
                              </Button>
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
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !form.reviewerName.trim() || form.comments.length === 0}
                    className="w-full"
                  >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Feedback Drawer (Mobile) */}
        {!existingFeedback && (
          <Drawer open={feedbackSidebarOpen} onOpenChange={setFeedbackSidebarOpen}>
            <DrawerContent className="h-[90vh]">
              <div className="p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Provide Feedback</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFeedbackSidebarOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>
                <div className="space-y-4">
                  {/* Reviewer Info */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="mobileReviewerName">Your Name *</Label>
                      <Input
                        id="mobileReviewerName"
                        placeholder="John Doe"
                        value={form.reviewerName}
                        onChange={(e) => setForm(prev => ({ ...prev, reviewerName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="mobileReviewerEmail">Email (Optional)</Label>
                      <Input
                        id="mobileReviewerEmail"
                        type="email"
                        placeholder="john@example.com"
                        value={form.reviewerEmail}
                        onChange={(e) => setForm(prev => ({ ...prev, reviewerEmail: e.target.value }))}
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
                    <Label htmlFor="mobileGeneralFeedback">General Feedback (Optional)</Label>
                    <Textarea
                      id="mobileGeneralFeedback"
                      placeholder="Share your overall thoughts about this document..."
                      value={form.generalFeedback}
                      onChange={(e) => setForm(prev => ({ ...prev, generalFeedback: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  {/* Comments */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Comments ({form.comments.length})</Label>
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
                    </div>

                    {/* New Comment Form */}
                    <div className="border rounded-lg p-4 space-y-3">
                      <div>
                        <Label htmlFor="mobileCommentContent">Comment *</Label>
                        <Textarea
                          id="mobileCommentContent"
                          placeholder="Add your comment here..."
                          value={newComment.content}
                          onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <Label htmlFor="mobileCommentType">Type</Label>
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeComment(index)}
                                className="h-6 w-6 p-0"
                              >
                                ×
                              </Button>
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
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !form.reviewerName.trim() || form.comments.length === 0}
                    className="w-full"
                  >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </Button>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      {!existingFeedback && (
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setFeedbackSidebarOpen(true)}
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Desktop Toggle Button */}
      {!existingFeedback && (
        <div className="hidden lg:block fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setFeedbackSidebarOpen(!feedbackSidebarOpen)}
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>
      )}

      {canEdit && (
        <div className="flex gap-2 mt-4 justify-end">
          <Button
            variant="outline"
            onClick={async () => {
              setIsResolved(true);
              toast.success('Feedback marked as done. Commenting is now closed.');
            }}
          >
            Mark as Done
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              toast.info('You can continue adding comments.');
            }}
          >
            Keep Open
          </Button>
        </div>
      )}
    </>
  );
}