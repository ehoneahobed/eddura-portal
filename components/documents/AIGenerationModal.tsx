'use client';

import { useState, useEffect } from 'react';
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
    purpose: '' as 'scholarship' | 'school' | 'job' | 'other' | '',
    targetProgram: '',
    targetScholarship: '',
    targetInstitution: '',
    wordLimit: '',
    characterLimit: '',
    additionalInfo: ''
  });

  // Update documentType when selectedDocumentType changes
  useEffect(() => {
    if (selectedDocumentType) {
      setFormData(prev => ({ ...prev, documentType: selectedDocumentType }));
    }
  }, [selectedDocumentType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.documentType || !formData.context || !formData.purpose) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.context.length < 10) {
      toast.error('Context must be at least 10 characters long');
      return;
    }

    // Validate purpose-specific required fields
    if (formData.purpose === 'scholarship' && !formData.targetScholarship) {
      toast.error('Please provide the scholarship name');
      return;
    }
    if (formData.purpose === 'school' && !formData.targetInstitution) {
      toast.error('Please provide the institution name');
      return;
    }
    if (formData.purpose === 'job' && !formData.targetInstitution) {
      toast.error('Please provide the company/organization name');
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
      purpose: '',
      targetProgram: '',
      targetScholarship: '',
      targetInstitution: '',
      wordLimit: '',
      characterLimit: '',
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
          {/* Document Type Selection - Only show if not pre-selected */}
          {!selectedDocumentType && (
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
          )}

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
            <div className={`text-xs ${formData.context.length > 0 && formData.context.length < 10 ? 'text-red-500' : 'text-muted-foreground'}`}>
              {formData.context.length}/2000 characters (minimum 10 characters)
              {formData.context.length > 0 && formData.context.length < 10 && (
                <span className="ml-1">⚠️ Too short</span>
              )}
            </div>
            {selectedTypeConfig && (
              <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
                <Info className="h-4 w-4 inline mr-1" />
                <strong>Tip:</strong> For a {selectedTypeConfig.label.toLowerCase()}, focus on {selectedTypeConfig.guidelines?.toLowerCase()}
              </div>
            )}
          </div>

          {/* Purpose Selection */}
          <div className="space-y-2">
            <Label htmlFor="purpose" className="flex items-center gap-2">
              What is this document for? *
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </Label>
            <Select
              value={formData.purpose}
              onValueChange={(value) => setFormData(prev => ({ ...prev, purpose: value as 'scholarship' | 'school' | 'job' | 'other' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select the purpose of this document" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scholarship">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>Scholarship Application</span>
                  </div>
                </SelectItem>
                <SelectItem value="school">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>School/University Application</span>
                  </div>
                </SelectItem>
                <SelectItem value="job">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Job Application</span>
                  </div>
                </SelectItem>
                <SelectItem value="other">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Other Purpose</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic Target Information based on Purpose */}
          {formData.purpose && (
            <div className="space-y-4">
              {formData.purpose === 'scholarship' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetScholarship" className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Scholarship Name *
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
                      Institution (if applicable)
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
              )}

              {formData.purpose === 'school' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetInstitution" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Institution *
                    </Label>
                    <Input
                      id="targetInstitution"
                      value={formData.targetInstitution}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetInstitution: e.target.value }))}
                      placeholder="e.g., Harvard University"
                      maxLength={200}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetProgram" className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Program (if applicable)
                    </Label>
                    <Input
                      id="targetProgram"
                      value={formData.targetProgram}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetProgram: e.target.value }))}
                      placeholder="e.g., Master's in Computer Science"
                      maxLength={200}
                    />
                  </div>
                </div>
              )}

              {formData.purpose === 'job' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetInstitution" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Company/Organization *
                    </Label>
                    <Input
                      id="targetInstitution"
                      value={formData.targetInstitution}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetInstitution: e.target.value }))}
                      placeholder="e.g., Google Inc."
                      maxLength={200}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetProgram" className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Position/Role (if applicable)
                    </Label>
                    <Input
                      id="targetProgram"
                      value={formData.targetProgram}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetProgram: e.target.value }))}
                      placeholder="e.g., Software Engineer"
                      maxLength={200}
                    />
                  </div>
                </div>
              )}

              {formData.purpose === 'other' && (
                <div className="space-y-2">
                  <Label htmlFor="targetInstitution" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Target Organization/Institution (if applicable)
                  </Label>
                  <Input
                    id="targetInstitution"
                    value={formData.targetInstitution}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetInstitution: e.target.value }))}
                    placeholder="e.g., Research Institute, Non-profit Organization"
                    maxLength={200}
                  />
                </div>
              )}
            </div>
          )}

          {/* Word/Character Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wordLimit" className="flex items-center gap-2">
                Word Limit (optional)
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Label>
              <Input
                id="wordLimit"
                type="number"
                value={formData.wordLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, wordLimit: e.target.value }))}
                placeholder="e.g., 500"
                min="1"
                max="10000"
              />
              <div className="text-xs text-muted-foreground">
                Leave empty if no specific limit
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="characterLimit" className="flex items-center gap-2">
                Character Limit (optional)
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Label>
              <Input
                id="characterLimit"
                type="number"
                value={formData.characterLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, characterLimit: e.target.value }))}
                placeholder="e.g., 3000"
                min="1"
                max="50000"
              />
              <div className="text-xs text-muted-foreground">
                Leave empty if no specific limit
              </div>
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
                  <span>Select the purpose and provide relevant details</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">2</Badge>
                  <span>AI creates personalized content tailored to your purpose</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">3</Badge>
                  <span>Content respects word/character limits if specified</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">4</Badge>
                  <span>Content is written in your voice, ready for review and editing</span>
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
                !formData.documentType || 
                !formData.context || 
                !formData.purpose || 
                formData.context.length < 10 ||
                (formData.purpose === 'scholarship' && !formData.targetScholarship) ||
                (formData.purpose === 'school' && !formData.targetInstitution) ||
                (formData.purpose === 'job' && !formData.targetInstitution)
              }
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