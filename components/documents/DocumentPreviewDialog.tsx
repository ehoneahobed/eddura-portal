'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  FileText, 
  Calendar, 
  Edit, 
  Download, 
  FileDown, 
  Copy, 
  Share2, 
  MessageSquare,
  Eye,
  Clock,
  User,
  Sparkles
} from 'lucide-react';
import { Document } from '@/types/documents';
import { toast } from 'sonner';

interface DocumentPreviewDialogProps {
  document: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onDownload?: (format: 'pdf' | 'docx') => void;
  onShare?: () => void;
  onViewFeedback?: () => void;
}

export default function DocumentPreviewDialog({
  document,
  open,
  onOpenChange,
  onEdit,
  onDownload,
  onShare,
  onViewFeedback
}: DocumentPreviewDialogProps) {
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(document.content || '');
      toast.success('Document content copied to clipboard!', {
        description: 'You can now paste the content anywhere you need it.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to copy content:', error);
      toast.error('Failed to copy content to clipboard', {
        description: 'Please try selecting and copying the content manually.',
        duration: 4000,
      });
    }
  };

  const handleDownload = async (format: 'pdf' | 'docx') => {
    if (!onDownload) return;
    setLoading(true);
    try {
      await onDownload(format);
    } catch (error) {
      toast.error(`Failed to download as ${format.toUpperCase()}`);
    } finally {
      setLoading(false);
    }
  };

  const wordCount = document.content?.trim().split(/\s+/).filter(word => word.length > 0).length || 0;
  const characterCount = document.content?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            Document Preview
          </DialogTitle>
          <DialogDescription className="text-base">
            Review your document: &quot;{document.title}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Document Information - Simplified Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Document Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Type</span>
                      <Badge variant="secondary" className="text-xs">{document.type}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Status</span>
                      <Badge variant={document.isActive ? 'default' : 'secondary'} className="text-xs">
                        {document.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Version</span>
                      <span className="text-sm font-mono">v{document.version}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-blue-900">Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Words</span>
                      <span className="text-lg font-bold text-blue-900">{wordCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Characters</span>
                      <span className="text-lg font-bold text-blue-900">{characterCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Target Set</span>
                      <span className="text-lg font-bold text-blue-900">
                        {document.targetProgram || document.targetScholarship || document.targetInstitution ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Middle Column - Dates */}
            <div className="space-y-4">
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Created</div>
                      <div className="text-sm">{formatDate(document.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Last Edited</div>
                      <div className="text-sm">{formatDate(document.lastEditedAt || document.createdAt)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              {document.tags && document.tags.length > 0 && (
                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {document.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Description */}
            <div className="space-y-4">
              {document.description && (
                <Card className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{document.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Target Information */}
              {(document.targetProgram || document.targetScholarship || document.targetInstitution) && (
                <Card className="border-l-4 border-l-teal-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                      Target Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {document.targetProgram && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Program</div>
                        <div className="text-sm">{document.targetProgram}</div>
                      </div>
                    )}
                    {document.targetScholarship && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Scholarship</div>
                        <div className="text-sm">{document.targetScholarship}</div>
                      </div>
                    )}
                    {document.targetInstitution && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Institution</div>
                        <div className="text-sm">{document.targetInstitution}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Document Content - Full Width */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                Document Content
              </CardTitle>
              <CardDescription className="text-base">
                {wordCount} words, {characterCount.toLocaleString()} characters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 border rounded-lg p-6 max-h-[500px] overflow-y-auto">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-base">
                  {document.content || 'No content available.'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons - Improved Layout */}
          <div className="flex flex-wrap gap-3 justify-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="flex items-center gap-2 bg-white hover:bg-gray-50"
            >
              <Copy className="h-4 w-4" />
              Copy Content
            </Button>
            
            {onEdit && (
              <Button
                variant="outline"
                onClick={onEdit}
                className="flex items-center gap-2 bg-white hover:bg-gray-50"
              >
                <Edit className="h-4 w-4" />
                Edit Document
              </Button>
            )}

            {onDownload && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleDownload('pdf')}
                  disabled={loading}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50"
                >
                  <FileDown className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownload('docx')}
                  disabled={loading}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  Download Word
                </Button>
              </>
            )}

            {onShare && (
              <Button
                variant="outline"
                onClick={onShare}
                className="flex items-center gap-2 bg-white hover:bg-gray-50"
              >
                <Share2 className="h-4 w-4" />
                Share for Feedback
              </Button>
            )}

            {onViewFeedback && (
              <Button
                variant="outline"
                onClick={onViewFeedback}
                className="flex items-center gap-2 bg-white hover:bg-gray-50"
              >
                <MessageSquare className="h-4 w-4" />
                View Feedback
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2 bg-white hover:bg-gray-50"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 