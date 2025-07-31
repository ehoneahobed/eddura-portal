import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Lightbulb, 
  TrendingUp,
  Clock,
  Star,
  Target,
  FileText,
  MessageSquare,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AIReviewFeedback {
  type: 'positive' | 'negative' | 'suggestion' | 'warning' | 'improvement';
  category: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestions?: string[];
  examples?: string[];
}

interface AIReviewSummary {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  overallAssessment: string;
}

interface AIReviewScores {
  overall: number;
  contentQuality: number;
  completeness: number;
  relevance: number;
  formatting: number;
  clarity: number;
  strength: number;
}

interface AIReview {
  _id: string;
  applicationId: string;
  requirementId: string;
  documentId?: string;
  reviewType: 'document_review' | 'requirement_compliance' | 'overall_package';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  scores: AIReviewScores;
  feedback: AIReviewFeedback[];
  summary: AIReviewSummary;
  aiModel: string;
  aiProvider: string;
  processingTime?: number;
  createdAt: string;
  reviewedAt?: string;
  requirement?: {
    name: string;
    description?: string;
    category: string;
    requirementType: string;
  };
  document?: {
    title: string;
    type: string;
  };
}

interface AIReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  requirementId: string;
  onReviewComplete?: (review: AIReview) => void;
}

export default function AIReviewModal({
  open,
  onOpenChange,
  applicationId,
  requirementId,
  onReviewComplete
}: AIReviewModalProps) {
  const [review, setReview] = useState<AIReview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchReview = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/ai/review-application?applicationId=${applicationId}&requirementId=${requirementId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.reviews && data.reviews.length > 0) {
          setReview(data.reviews[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching review:', error);
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, requirementId]);

  // Fetch existing review on mount
  useEffect(() => {
    if (open && applicationId && requirementId) {
      fetchReview();
    }
  }, [open, applicationId, requirementId, fetchReview]);

  const generateReview = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/review-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          requirementId,
          reviewType: 'document_review'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setReview(data.review);
        onReviewComplete?.(data.review);
        toast.success('AI review completed successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate review');
      }
    } catch (error) {
      console.error('Error generating review:', error);
      toast.error('Failed to generate review');
    } finally {
      setIsGenerating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'negative': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'suggestion': return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'improvement': return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content_quality': return <FileText className="h-4 w-4" />;
      case 'completeness': return <CheckCircle className="h-4 w-4" />;
      case 'relevance': return <Target className="h-4 w-4" />;
      case 'formatting': return <FileText className="h-4 w-4" />;
      case 'clarity': return <MessageSquare className="h-4 w-4" />;
      case 'strength': return <Zap className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      content_quality: 'Content Quality',
      completeness: 'Completeness',
      relevance: 'Relevance',
      formatting: 'Formatting',
      clarity: 'Clarity',
      strength: 'Strength',
      overall: 'Overall'
    };
    // Return the mapped label or format the category name nicely
    return labels[category] || category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Review</DialogTitle>
            <DialogDescription>
              Loading review data...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            AI Review Results
          </DialogTitle>
          <DialogDescription>
            {review ? (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Generated on {format(new Date(review.reviewedAt || review.createdAt), 'MMM d, yyyy h:mm a')}</span>
                <span>•</span>
                <span>{review.aiProvider} ({review.aiModel})</span>
                {review.processingTime && (
                  <>
                    <span>•</span>
                    <span>Processed in {review.processingTime}ms</span>
                  </>
                )}
              </div>
            ) : (
              'Generate an AI review for this document against the requirement'
            )}
          </DialogDescription>
        </DialogHeader>

        {!review ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  Generate AI Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Get an AI-powered review of your document against the scholarship requirements. 
                  The AI will analyze content quality, completeness, relevance, and provide specific feedback.
                </p>
                <Button 
                  onClick={generateReview} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Review...
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      Generate AI Review
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Overall Assessment</span>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={review.scores.overall >= 80 ? 'default' : review.scores.overall >= 60 ? 'secondary' : 'destructive'}
                      className="text-lg px-3 py-1"
                    >
                      {review.scores.overall}/100
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Score</span>
                      <span className={`text-sm font-bold ${getScoreColor(review.scores.overall)}`}>
                        {review.scores.overall}/100
                      </span>
                    </div>
                    <Progress value={review.scores.overall} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(review.scores).map(([key, score]) => {
                      // Skip non-score fields like _id, __v, etc.
                      if (key === 'overall' || key.startsWith('_') || typeof score !== 'number') return null;
                      return (
                        <div key={key} className={`p-3 rounded-lg ${getScoreBgColor(score)}`}>
                          <div className="flex items-center gap-2 mb-1">
                            {getCategoryIcon(key)}
                            <span className="text-xs font-medium">{getCategoryLabel(key)}</span>
                          </div>
                          <div className={`text-lg font-bold ${getScoreColor(score)}`}>
                            {score}/100
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Review */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {review.summary.strengths.map((strength, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-1">
                        {review.summary.weaknesses.map((weakness, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Overall Assessment</h4>
                      <p className="text-sm text-gray-700">{review.summary.overallAssessment}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="feedback" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {review.feedback.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            {getFeedbackIcon(item.type)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{item.title}</h4>
                                <Badge variant="outline" className={getSeverityColor(item.severity)}>
                                  {item.severity}
                                </Badge>
                                <Badge variant="outline">
                                  {getCategoryLabel(item.category)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                              
                              {item.suggestions && item.suggestions.length > 0 && (
                                <div className="mt-3">
                                  <h5 className="text-sm font-medium mb-1">Suggestions:</h5>
                                  <ul className="space-y-1">
                                    {item.suggestions.map((suggestion, idx) => (
                                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                        <span className="text-blue-500 mt-1">•</span>
                                        {suggestion}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {item.examples && item.examples.length > 0 && (
                                <div className="mt-3">
                                  <h5 className="text-sm font-medium mb-1">Examples:</h5>
                                  <ul className="space-y-1">
                                    {item.examples.map((example, idx) => (
                                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                        <span className="text-purple-500 mt-1">•</span>
                                        {example}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {review.summary.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                          <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />
                          <span className="text-sm text-gray-700">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Review Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Review Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Review Type:</span>
                            <div className="font-medium">{review.reviewType.replace('_', ' ').toUpperCase()}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <div className="font-medium">{review.status}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">AI Provider:</span>
                            <div className="font-medium">{review.aiProvider}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Model:</span>
                            <div className="font-medium">{review.aiModel}</div>
                          </div>
                          {review.processingTime && (
                            <div>
                              <span className="text-gray-600">Processing Time:</span>
                              <div className="font-medium">{review.processingTime}ms</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {review.requirement && (
                        <div>
                          <h4 className="font-medium mb-2">Requirement Details</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600">Name:</span>
                              <div className="font-medium">{review.requirement.name}</div>
                            </div>
                            {review.requirement.description && (
                              <div>
                                <span className="text-gray-600">Description:</span>
                                <div className="font-medium">{review.requirement.description}</div>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-600">Category:</span>
                              <div className="font-medium">{review.requirement.category}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Type:</span>
                              <div className="font-medium">{review.requirement.requirementType}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {review.document && (
                        <div>
                          <h4 className="font-medium mb-2">Document Details</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600">Title:</span>
                              <div className="font-medium">{review.document.title}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Type:</span>
                              <div className="font-medium">{review.document.type}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={generateReview} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Regenerate Review'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 