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
  Edit3,
  Target,
  FileText,
  MessageSquare,
  Zap
} from 'lucide-react';
import { DocumentType, DOCUMENT_TYPE_CONFIG } from '@/types/documents';
import { toast } from 'sonner';

interface AIRefinementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContentRefined: (content: string, createNewVersion?: boolean) => void;
  existingContent: string;
  documentType?: DocumentType;
  documentId?: string;
  documentTitle?: string;
}

type RefinementType = 
  | 'improve_clarity'
  | 'make_more_compelling'
  | 'adjust_tone'
  | 'summarize'
  | 'expand'
  | 'fix_grammar'
  | 'custom'
  | '';

export default function AIRefinementModal({
  open,
  onOpenChange,
  onContentRefined,
  existingContent,
  documentType,
  documentId,
  documentTitle
}: AIRefinementModalProps) {
  const [loading, setLoading] = useState(false);
  const [createNewVersion, setCreateNewVersion] = useState(false);
  const [formData, setFormData] = useState({
    refinementType: '' as RefinementType,
    customInstruction: '',
    targetLength: '',
    specificFocus: '',
    tone: '',
    additionalContext: ''
  });

  const refinementOptions = [
    {
      value: 'improve_clarity',
      label: 'Improve Clarity',
      description: 'Make the content clearer and easier to understand',
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      value: 'make_more_compelling',
      label: 'Make More Compelling',
      description: 'Enhance the persuasive power and impact',
      icon: <Zap className="h-4 w-4" />
    },
    {
      value: 'adjust_tone',
      label: 'Adjust Tone',
      description: 'Change the overall tone and style',
      icon: <Edit3 className="h-4 w-4" />
    },
    {
      value: 'summarize',
      label: 'Summarize',
      description: 'Create a concise version while keeping key points',
      icon: <FileText className="h-4 w-4" />
    },
    {
      value: 'expand',
      label: 'Expand',
      description: 'Add more detail and depth to the content',
      icon: <Target className="h-4 w-4" />
    },
    {
      value: 'fix_grammar',
      label: 'Fix Grammar & Style',
      description: 'Correct grammar, spelling, and improve writing style',
      icon: <Edit3 className="h-4 w-4" />
    },
    {
      value: 'custom',
      label: 'Custom Instruction',
      description: 'Provide your own specific refinement instructions',
      icon: <Sparkles className="h-4 w-4" />
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.refinementType) {
      toast.error('Please select a refinement type');
      return;
    }

    if (formData.refinementType === 'custom' && !formData.customInstruction.trim()) {
      toast.error('Please provide custom refinement instructions');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          existingContent,
          documentType,
          ...formData
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (createNewVersion && documentId) {
          // Create new version
          const versionResponse = await fetch('/api/documents/version', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              originalDocumentId: documentId,
              title: documentTitle ? `${documentTitle} (Version ${Date.now()})` : `Document Version ${Date.now()}`,
              content: data.content,
            }),
          });

          if (versionResponse.ok) {
            const versionData = await versionResponse.json();
            onContentRefined(data.content, true);
            onOpenChange(false);
            toast.success('New document version created successfully!');
            resetForm();
          } else {
            const versionError = await versionResponse.json();
            toast.error(versionError.error || 'Failed to create new version');
          }
        } else {
          // Update existing document
          onContentRefined(data.content, false);
          onOpenChange(false);
          toast.success('Content refined successfully!');
          resetForm();
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to refine content');
      }
    } catch (error) {
      console.error('Error refining content:', error);
      toast.error('Failed to refine content');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      refinementType: '',
      customInstruction: '',
      targetLength: '',
      specificFocus: '',
      tone: '',
      additionalContext: ''
    });
    setCreateNewVersion(false);
  };

  const getRefinementPrompt = () => {
    const selectedOption = refinementOptions.find(opt => opt.value === formData.refinementType);
    return selectedOption?.description || '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Edit3 className="h-6 w-6 text-primary" />
            <div>
              <DialogTitle>Refine Content with AI</DialogTitle>
              <DialogDescription>
                Improve your existing content with AI assistance
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Content Preview */}
          <Card className="bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Current Content Preview</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-gray-600 max-h-32 overflow-y-auto">
                {existingContent.length > 300 
                  ? `${existingContent.substring(0, 300)}...` 
                  : existingContent
                }
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {existingContent.trim().split(/\s+/).filter(word => word.length > 0).length} words, {existingContent.length} characters
              </div>
            </CardContent>
          </Card>

          {/* Refinement Type Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              What would you like to improve? *
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {refinementOptions.map((option) => (
                <div
                  key={option.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.refinementType === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, refinementType: option.value as RefinementType }))}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-primary mt-0.5">
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Versioning Option */}
          {documentId && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                How would you like to apply the refinement?
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    !createNewVersion
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setCreateNewVersion(false)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-primary mt-0.5">
                      <Edit3 className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Update Current Document</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Replace the content in the current document
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    createNewVersion
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setCreateNewVersion(true)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-primary mt-0.5">
                      <Copy className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Create New Version</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Keep the original and create a new document version
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Custom Instruction */}
          {formData.refinementType === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customInstruction" className="flex items-center gap-2">
                Custom Refinement Instructions *
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Label>
              <Textarea
                id="customInstruction"
                value={formData.customInstruction}
                onChange={(e) => setFormData(prev => ({ ...prev, customInstruction: e.target.value }))}
                placeholder="Describe exactly how you want the content to be refined. Be specific about what changes you want..."
                rows={4}
                maxLength={1000}
              />
              <div className="text-xs text-muted-foreground">
                {formData.customInstruction.length}/1000 characters
              </div>
            </div>
          )}

          {/* Tone Selection for Adjust Tone */}
          {formData.refinementType === 'adjust_tone' && (
            <div className="space-y-2">
              <Label htmlFor="tone" className="flex items-center gap-2">
                Desired Tone *
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Label>
              <Select
                value={formData.tone}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tone: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select the desired tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional & Formal</SelectItem>
                  <SelectItem value="conversational">Conversational & Friendly</SelectItem>
                  <SelectItem value="academic">Academic & Scholarly</SelectItem>
                  <SelectItem value="persuasive">Persuasive & Convincing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Target Length for Summarize/Expand */}
          {(formData.refinementType === 'summarize' || formData.refinementType === 'expand') && (
            <div className="space-y-2">
              <Label htmlFor="targetLength" className="flex items-center gap-2">
                Target Length
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Label>
              <Input
                id="targetLength"
                type="number"
                value={formData.targetLength}
                onChange={(e) => setFormData(prev => ({ ...prev, targetLength: e.target.value }))}
                placeholder={formData.refinementType === 'summarize' ? 'e.g., 200 words' : 'e.g., 800 words'}
                min="1"
                max="10000"
              />
              <div className="text-xs text-muted-foreground">
                {formData.refinementType === 'summarize' 
                  ? 'Leave empty to create a concise summary' 
                  : 'Leave empty to expand naturally'
                }
              </div>
            </div>
          )}

          {/* Specific Focus */}
          {formData.refinementType !== 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="specificFocus" className="flex items-center gap-2">
                Specific Focus (optional)
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Label>
              <Input
                id="specificFocus"
                value={formData.specificFocus}
                onChange={(e) => setFormData(prev => ({ ...prev, specificFocus: e.target.value }))}
                placeholder="e.g., focus on leadership experience, emphasize technical skills, highlight achievements..."
                maxLength={200}
              />
              <div className="text-xs text-muted-foreground">
                Any specific aspect you want to emphasize or improve
              </div>
            </div>
          )}

          {/* Additional Context */}
          <div className="space-y-2">
            <Label htmlFor="additionalContext" className="flex items-center gap-2">
              Additional Context (optional)
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </Label>
            <Textarea
              id="additionalContext"
              value={formData.additionalContext}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalContext: e.target.value }))}
              placeholder="Any additional information that might help with the refinement..."
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground">
              {formData.additionalContext.length}/500 characters
            </div>
          </div>

          {/* AI Guidelines */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Info className="h-4 w-4" />
                How Content Refinement Works
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">1</Badge>
                  <span>AI analyzes your existing content and understands its structure</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">2</Badge>
                  <span>Applies your chosen refinement while preserving your voice and key information</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">3</Badge>
                  <span>Returns improved content that maintains the original intent and structure</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">4</Badge>
                  <span>You can review and make further adjustments as needed</span>
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
                !formData.refinementType || 
                (formData.refinementType === 'custom' && !formData.customInstruction.trim()) ||
                (formData.refinementType === 'adjust_tone' && !formData.tone)
              }
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Refining...
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Refine Content
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}