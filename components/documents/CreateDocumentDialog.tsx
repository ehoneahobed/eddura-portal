'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HelpCircle, 
  Info, 
  FileText, 
  Tag, 
  Target, 
  BookOpen,
  Copy,
  Star,
  Users,
  Calendar,
  Award,
  Clock,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { DocumentType, DOCUMENT_TYPE_CONFIG } from '@/types/documents';
import { toast } from 'sonner';
import AIGenerationModal from './AIGenerationModal';

interface CreateDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentCreated: () => void;
}

// Tooltip component for field explanations
const FieldTooltip = ({ children, tooltip }: { children: React.ReactNode; tooltip: string }) => (
  <div className="group relative inline-block">
    {children}
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
      {tooltip}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
);

// Help content for different field categories
const helpContent = {
  basic: {
    title: "Basic Information",
    fields: [
      {
        name: "Document Type",
        description: "Choose the type of document you're creating. Each type has specific guidelines and typical use cases.",
        icon: <FileText className="h-4 w-4" />
      },
      {
        name: "Title",
        description: "A clear, descriptive title for your document. This helps you organize and find your documents later.",
        icon: <BookOpen className="h-4 w-4" />
      },
      {
        name: "Description",
        description: "A brief summary of what this document contains and its purpose. This is optional but helpful for organization.",
        icon: <Info className="h-4 w-4" />
      }
    ]
  },
  content: {
    title: "Content & Writing",
    fields: [
      {
        name: "Content",
        description: "The main body of your document. Write as much as you need - there are no character limits. Use the word and character counters to track your progress.",
        icon: <FileText className="h-4 w-4" />
      },
      {
        name: "Word/Character Count",
        description: "Real-time counters showing your current word and character count. Use these to ensure your document meets any requirements.",
        icon: <Copy className="h-4 w-4" />
      }
    ]
  },
  organization: {
    title: "Organization",
    fields: [
      {
        name: "Tags",
        description: "Add keywords or labels to help you categorize and find your documents later. Examples: 'scholarship', 'graduate school', 'research'.",
        icon: <Tag className="h-4 w-4" />
      },
      {
        name: "Target Program",
        description: "The specific academic program you're targeting with this document. This helps you customize the content appropriately.",
        icon: <GraduationCap className="h-4 w-4" />
      },
      {
        name: "Target Scholarship",
        description: "The specific scholarship you're applying for. This helps you tailor your document to the scholarship's requirements.",
        icon: <Award className="h-4 w-4" />
      },
      {
        name: "Target Institution",
        description: "The university or institution you're targeting. This helps you customize your document for that specific institution.",
        icon: <Users className="h-4 w-4" />
      }
    ]
  },
  versioning: {
    title: "Version Management",
    fields: [
      {
        name: "Version Control",
        description: "Documents automatically start at version 1. When you edit the content later, the version will automatically increment to track changes.",
        icon: <Clock className="h-4 w-4" />
      },
      {
        name: "Document History",
        description: "Each version preserves your complete document state, allowing you to track how your document has evolved over time.",
        icon: <Calendar className="h-4 w-4" />
      }
    ]
  }
};

export default function CreateDocumentDialog({
  open,
  onOpenChange,
  onDocumentCreated
}: CreateDocumentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: '' as DocumentType | '',
    content: '',
    description: '',
    tags: [] as string[],
    targetProgram: '',
    targetScholarship: '',
    targetInstitution: ''
  });

  const [tagInput, setTagInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.type || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onDocumentCreated();
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create document');
      }
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Failed to create document');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: '',
      content: '',
      description: '',
      tags: [],
      targetProgram: '',
      targetScholarship: '',
      targetInstitution: ''
    });
    setTagInput('');
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleAIContentGenerated = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const selectedTypeConfig = formData.type ? DOCUMENT_TYPE_CONFIG[formData.type] : null;
  const wordCount = formData.content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const characterCount = formData.content.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Create New Document</DialogTitle>
              <DialogDescription>
                Create a new document to help with your applications and career development.
              </DialogDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              {showHelp ? 'Hide Help' : 'Show Help'}
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Document Type Selection */}
              <div className="space-y-2">
                <FieldTooltip tooltip="Choose the type of document you're creating. Each type has specific guidelines and typical use cases.">
                  <Label htmlFor="type" className="flex items-center gap-2">
                    Document Type *
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </Label>
                </FieldTooltip>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as DocumentType }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOCUMENT_TYPE_CONFIG).map(([type, config]) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex flex-col">
                          <span className="font-medium">{config.label}</span>
                          <span className="text-xs text-muted-foreground">{config.description}</span>
                          {config.comingSoon && (
                            <Badge variant="secondary" className="text-xs mt-1 w-fit">
                              Coming Soon
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTypeConfig?.comingSoon && (
                  <p className="text-sm text-muted-foreground">
                    This document type will be available soon. You&apos;ll be able to upload files for this type.
                  </p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <FieldTooltip tooltip="A clear, descriptive title for your document. This helps you organize and find your documents later.">
                  <Label htmlFor="title" className="flex items-center gap-2">
                    Title *
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </Label>
                </FieldTooltip>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter document title"
                  maxLength={200}
                />
                <div className="text-xs text-muted-foreground">
                  {formData.title.length}/200 characters
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <FieldTooltip tooltip="A brief summary of what this document contains and its purpose. This is optional but helpful for organization.">
                  <Label htmlFor="description" className="flex items-center gap-2">
                    Description
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </Label>
                </FieldTooltip>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this document"
                  maxLength={500}
                  rows={2}
                />
                <div className="text-xs text-muted-foreground">
                  {formData.description.length}/500 characters
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FieldTooltip tooltip="The main body of your document. Write as much as you need - there are no character limits. Use the word and character counters to track your progress. You can also use AI generation to create content.">
                    <Label htmlFor="content" className="flex items-center gap-2">
                      Content
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </Label>
                  </FieldTooltip>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">{wordCount}</span> words, <span className="font-medium">{characterCount.toLocaleString()}</span> characters
                      {selectedTypeConfig?.maxWords && (
                        <span className={wordCount > selectedTypeConfig.maxWords ? 'text-red-500' : 'text-green-600'}>
                          {' '}/ {selectedTypeConfig.maxWords} recommended
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAiModalOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate with AI
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={selectedTypeConfig?.placeholder || "Write your document content here, or use AI generation to create content..."}
                  rows={15}
                  className="font-mono text-sm resize-y"
                />
                {!formData.content && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded-md">
                    <Info className="h-4 w-4 inline mr-1" />
                    <strong>Tip:</strong> You can leave content empty and use the "Generate with AI" button to create content, or write your own content manually.
                  </div>
                )}
                {selectedTypeConfig?.maxWords && wordCount > selectedTypeConfig.maxWords && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
                    <Info className="h-4 w-4 inline mr-1" />
                    Your document exceeds the recommended {selectedTypeConfig.maxWords} words for {selectedTypeConfig.label.toLowerCase()}s. 
                    Consider editing for conciseness, but you can still save the document.
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <FieldTooltip tooltip="Add keywords or labels to help you categorize and find your documents later. Examples: 'scholarship', 'graduate school', 'research'.">
                  <Label htmlFor="tags" className="flex items-center gap-2">
                    Tags
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </Label>
                </FieldTooltip>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add tags (press Enter)"
                    maxLength={50}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Target Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <FieldTooltip tooltip="The specific academic program you're targeting with this document. This helps you customize the content appropriately.">
                    <Label htmlFor="targetProgram" className="flex items-center gap-2">
                      Target Program
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </Label>
                  </FieldTooltip>
                  <Input
                    id="targetProgram"
                    value={formData.targetProgram}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetProgram: e.target.value }))}
                    placeholder="e.g., Master's in Computer Science"
                    maxLength={200}
                  />
                </div>
                <div className="space-y-2">
                  <FieldTooltip tooltip="The specific scholarship you're applying for. This helps you tailor your document to the scholarship's requirements.">
                    <Label htmlFor="targetScholarship" className="flex items-center gap-2">
                      Target Scholarship
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </Label>
                  </FieldTooltip>
                  <Input
                    id="targetScholarship"
                    value={formData.targetScholarship}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetScholarship: e.target.value }))}
                    placeholder="e.g., Fulbright Scholarship"
                    maxLength={200}
                  />
                </div>
                <div className="space-y-2">
                  <FieldTooltip tooltip="The university or institution you're targeting. This helps you customize your document for that specific institution.">
                    <Label htmlFor="targetInstitution" className="flex items-center gap-2">
                      Target Institution
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </Label>
                  </FieldTooltip>
                  <Input
                    id="targetInstitution"
                    value={formData.targetInstitution}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetInstitution: e.target.value }))}
                    placeholder="e.g., Harvard University"
                    maxLength={200}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !formData.title || !formData.type}>
                  {loading ? 'Creating...' : 'Create Document'}
                </Button>
              </div>
            </form>
          </div>

          {/* Help Panel */}
          {showHelp && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Field Help
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="basic">Basic</TabsTrigger>
                      <TabsTrigger value="content">Content</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4">
                      <div className="space-y-3">
                        {helpContent.basic.fields.map((field, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              {field.icon}
                              {field.name}
                            </div>
                            <p className="text-xs text-muted-foreground">{field.description}</p>
                          </div>
                        ))}
                        {helpContent.organization.fields.map((field, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              {field.icon}
                              {field.name}
                            </div>
                            <p className="text-xs text-muted-foreground">{field.description}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="content" className="space-y-4">
                      <div className="space-y-3">
                        {helpContent.content.fields.map((field, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              {field.icon}
                              {field.name}
                            </div>
                            <p className="text-xs text-muted-foreground">{field.description}</p>
                          </div>
                        ))}
                        {helpContent.versioning.fields.map((field, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              {field.icon}
                              {field.name}
                            </div>
                            <p className="text-xs text-muted-foreground">{field.description}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* AI Generation Modal */}
        <AIGenerationModal
          open={aiModalOpen}
          onOpenChange={setAiModalOpen}
          onContentGenerated={handleAIContentGenerated}
          selectedDocumentType={formData.type || undefined}
        />
      </DialogContent>
    </Dialog>
  );
}