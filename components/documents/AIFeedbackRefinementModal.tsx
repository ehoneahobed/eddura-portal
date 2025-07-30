'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Sparkles, 
  Loader2, 
  Info, 
  HelpCircle,
  Edit3,
  MessageSquare,
  Star,
  User,
  CheckCircle,
  AlertCircle,
  Copy,
  FileText
} from 'lucide-react';
import { Document } from '@/types/documents';
import { DocumentFeedback } from '@/types/feedback';
import { toast } from 'sonner';

interface AIFeedbackRefinementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document;
  feedback: DocumentFeedback[];
  onContentRefined: (content: string, createNewVersion: boolean) => void;
}

type RefinementMode = 'replace' | 'new_version';

export default function AIFeedbackRefinementModal({
  open,
  onOpenChange,
  document,
  feedback,
  onContentRefined
}: AIFeedbackRefinementModalProps) {
  const [loading, setLoading] = useState(false);
  const [refinementMode, setRefinementMode] = useState<RefinementMode>('replace');
  const [customInstructions, setCustomInstructions] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<string[]>([]);

  // Get all pending and addressed feedback
  const actionableFeedback = feedback.filter(f => !f.isResolved || f.comments.some(c => c.status === 'pending' || c.status === 'addressed'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFeedback.length === 0) {
      toast.error('Please select at least one feedback item to incorporate');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/refine-with-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document._id,
          currentContent: document.content,
          documentType: document.type,
          feedbackIds: selectedFeedback,
          customInstructions,
          refinementMode
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onContentRefined(data.content, refinementMode === 'new_version');
        onOpenChange(false);
        toast.success(`Content ${refinementMode === 'replace' ? 'updated' : 'new version created'} successfully!`);
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to refine content with feedback');
      }
    } catch (error) {
      console.error('Error refining content with feedback:', error);
      toast.error('Failed to refine content with feedback');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRefinementMode('replace');
    setCustomInstructions('');
    setSelectedFeedback([]);
  };

  const toggleFeedbackSelection = (feedbackId: string) => {
    setSelectedFeedback(prev => 
      prev.includes(feedbackId) 
        ? prev.filter(id => id !== feedbackId)
        : [...prev, feedbackId]
    );
  };

  const getFeedbackSummary = (feedbackItem: DocumentFeedback) => {
    const pendingComments = feedbackItem.comments.filter(c => c.status === 'pending');
    const addressedComments = feedbackItem.comments.filter(c => c.status === 'addressed');
    const totalComments = feedbackItem.comments.length;
    
    return {
      pending: pendingComments.length,
      addressed: addressedComments.length,
      total: totalComments,
      rating: feedbackItem.overallRating,
      generalFeedback: feedbackItem.generalFeedback
    };
  };

  const renderFeedbackCard = (feedbackItem: DocumentFeedback) => {
    const summary = getFeedbackSummary(feedbackItem);
    const isSelected = selectedFeedback.includes(feedbackItem._id);
    
    return (
      <Card 
        key={feedbackItem._id} 
        className={`cursor-pointer transition-all ${
          isSelected 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => toggleFeedbackSelection(feedbackItem._id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm">{feedbackItem.reviewerName}</span>
              {summary.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="text-sm">{summary.rating}/5</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {summary.pending > 0 && (
                <Badge variant="default" className="text-xs">
                  {summary.pending} pending
                </Badge>
              )}
              {summary.addressed > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {summary.addressed} addressed
                </Badge>
              )}
              <div className={`w-4 h-4 rounded border-2 ${
                isSelected ? 'bg-primary border-primary' : 'border-gray-300'
              }`}>
                {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {summary.generalFeedback && (
            <div className="mb-3 p-2 bg-muted rounded text-sm">
              <p className="text-muted-foreground text-xs mb-1">General Feedback:</p>
              <p className="text-sm">{summary.generalFeedback.substring(0, 150)}...</p>
            </div>
          )}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Comments ({summary.total}): {summary.pending} pending, {summary.addressed} addressed
            </p>
            <div className="space-y-1">
              {feedbackItem.comments.slice(0, 2).map((comment) => (
                <div key={comment.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    comment.status === 'pending' ? 'bg-yellow-500' :
                    comment.status === 'addressed' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {comment.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {comment.status}
                      </span>
                    </div>
                    <p className="text-xs">{comment.content.substring(0, 100)}...</p>
                  </div>
                </div>
              ))}
              {feedbackItem.comments.length > 2 && (
                <p className="text-xs text-muted-foreground">
                  +{feedbackItem.comments.length - 2} more comments
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <div>
              <DialogTitle>Refine Document with AI Feedback</DialogTitle>
              <DialogDescription>
                Use AI to rewrite your document incorporating selected feedback
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Document Info */}
          <Card className="bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Current Document: {document.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-gray-600 max-h-32 overflow-y-auto">
                {document.content.length > 300 
                  ? `${document.content.substring(0, 300)}...` 
                  : document.content
                }
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {document.content.trim().split(/\s+/).filter(word => word.length > 0).length} words, {document.content.length} characters
              </div>
            </CardContent>
          </Card>

          {/* Refinement Mode Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              How would you like to apply the refined content? *
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </Label>
            <RadioGroup 
              value={refinementMode} 
              onValueChange={(value) => setRefinementMode(value as RefinementMode)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                refinementMode === 'replace' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="replace" id="replace" />
                  <Label htmlFor="replace" className="cursor-pointer">
                    <div className="font-medium">Replace Current Content</div>
                    <div className="text-sm text-muted-foreground">
                      Update the existing document with the refined version
                    </div>
                  </Label>
                </div>
              </div>
              <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                refinementMode === 'new_version' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new_version" id="new_version" />
                  <Label htmlFor="new_version" className="cursor-pointer">
                    <div className="font-medium">Create New Version</div>
                    <div className="text-sm text-muted-foreground">
                      Create a new document with the refined content
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Feedback Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              Select feedback to incorporate *
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </Label>
            {actionableFeedback.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-sm font-medium mb-1">No actionable feedback</h3>
                  <p className="text-xs text-muted-foreground">
                    All feedback has been resolved or ignored. Add new feedback to use this feature.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                {actionableFeedback.map(renderFeedbackCard)}
              </div>
            )}
            {selectedFeedback.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Selected {selectedFeedback.length} feedback item{selectedFeedback.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Custom Instructions */}
          <div className="space-y-2">
            <Label htmlFor="customInstructions" className="flex items-center gap-2">
              Additional Instructions (optional)
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </Label>
            <Textarea
              id="customInstructions"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Any additional instructions for how to incorporate the feedback (e.g., 'emphasize leadership experience', 'make it more concise')..."
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground">
              {customInstructions.length}/500 characters
            </div>
          </div>

          {/* AI Guidelines */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Info className="h-4 w-4" />
                How AI Feedback Refinement Works
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">1</Badge>
                  <span>AI analyzes your current document and selected feedback</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">2</Badge>
                  <span>Identifies key areas for improvement based on feedback</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">3</Badge>
                  <span>Rewrites content while preserving your voice and key information</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">4</Badge>
                  <span>Incorporates feedback suggestions and addresses concerns</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">5</Badge>
                  <span>Returns improved content that addresses the selected feedback</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                loading || 
                selectedFeedback.length === 0
              }
              className="min-w-[140px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Refining...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Refine with AI
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}