'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Loader2, 
  Info, 
  HelpCircle,
  Target,
  GraduationCap,
  Award,
  Users,
  FileText
} from 'lucide-react';
import { DocumentType, DOCUMENT_TYPE_CONFIG } from '@/types/documents';
import { toast } from 'sonner';

interface AIGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContentGenerated: (content: string) => void;
  selectedDocumentType?: DocumentType;
}

export default function AIGenerationModal({
  open,
  onOpenChange,
  onContentGenerated,
  selectedDocumentType
}: AIGenerationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    documentType: selectedDocumentType || '',
    context: '',
    targetProgram: '',
    targetScholarship: '',
    targetInstitution: '',
    additionalInfo: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.documentType || !formData.context) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        onContentGenerated(data.content);
        onOpenChange(false);
        toast.success('Content generated successfully!');
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      documentType: selectedDocumentType || '',
      context: '',
      targetProgram: '',
      targetScholarship: '',
      targetInstitution: '',
      additionalInfo: ''
    });
  };

  const selectedTypeConfig = formData.documentType ? DOCUMENT_TYPE_CONFIG[formData.documentType as DocumentType] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <div>
              <DialogTitle>Generate with AI</DialogTitle>
              <DialogDescription>
                Let AI help you create compelling content for your document
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="documentType" className="flex items-center gap-2">
              Document Type *
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </Label>
            <Select
              value={formData.documentType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, documentType: value as DocumentType }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DOCUMENT_TYPE_CONFIG)
                  .filter(([_, config]) => !config.comingSoon)
                  .map(([type, config]) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex flex-col">
                        <span className="font-medium">{config.label}</span>
                        <span className="text-xs text-muted-foreground">{config.description}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Context Input */}
          <div className="space-y-2">
            <Label htmlFor="context" className="flex items-center gap-2">
              Tell us about yourself and what you want to achieve *
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </Label>
            <Textarea
              id="context"
              value={formData.context}
              onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
              placeholder="Describe your background, experiences, goals, and what makes you unique. The more specific you are, the better the AI can help you create compelling content..."
              rows={6}
              maxLength={2000}
            />
            <div className="text-xs text-muted-foreground">
              {formData.context.length}/2000 characters
            </div>
            {selectedTypeConfig && (
              <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
                <Info className="h-4 w-4 inline mr-1" />
                <strong>Tip:</strong> For a {selectedTypeConfig.label.toLowerCase()}, focus on {selectedTypeConfig.guidelines?.toLowerCase()}
              </div>
            )}
          </div>

          {/* Target Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetProgram" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Target Program
              </Label>
              <Input
                id="targetProgram"
                value={formData.targetProgram}
                onChange={(e) => setFormData(prev => ({ ...prev, targetProgram: e.target.value }))}
                placeholder="e.g., Master's in Computer Science"
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetScholarship" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Target Scholarship
              </Label>
              <Input
                id="targetScholarship"
                value={formData.targetScholarship}
                onChange={(e) => setFormData(prev => ({ ...prev, targetScholarship: e.target.value }))}
                placeholder="e.g., Fulbright Scholarship"
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetInstitution" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Target Institution
              </Label>
              <Input
                id="targetInstitution"
                value={formData.targetInstitution}
                onChange={(e) => setFormData(prev => ({ ...prev, targetInstitution: e.target.value }))}
                placeholder="e.g., Harvard University"
                maxLength={200}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-2">
            <Label htmlFor="additionalInfo" className="flex items-center gap-2">
              Additional Information
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
              placeholder="Any other relevant information that might help generate better content (optional)"
              rows={3}
              maxLength={1000}
            />
            <div className="text-xs text-muted-foreground">
              {formData.additionalInfo.length}/1000 characters
            </div>
          </div>

          {/* AI Guidelines */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4" />
                How AI Generation Works
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">1</Badge>
                  <span>AI analyzes your context and creates personalized content</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">2</Badge>
                  <span>Content is written in your voice, as if you wrote it yourself</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">3</Badge>
                  <span>You can edit and refine the generated content as needed</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">4</Badge>
                  <span>Generated content follows best practices for your document type</span>
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
              disabled={loading || !formData.documentType || !formData.context}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}