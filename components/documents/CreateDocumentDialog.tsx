'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DocumentType, DOCUMENT_TYPE_CONFIG } from '@/types/documents';
import { toast } from 'sonner';

interface CreateDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentCreated: () => void;
}

export default function CreateDocumentDialog({
  open,
  onOpenChange,
  onDocumentCreated
}: CreateDocumentDialogProps) {
  const [loading, setLoading] = useState(false);
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

  const selectedTypeConfig = formData.type ? DOCUMENT_TYPE_CONFIG[formData.type] : null;
  const wordCount = formData.content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const characterCount = formData.content.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
          <DialogDescription>
            Create a new document to help with your applications and career development.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="type">Document Type *</Label>
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
                This document type will be available soon. You'll be able to upload files for this type.
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter document title"
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this document"
              maxLength={500}
              rows={2}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Content *</Label>
              <div className="text-sm text-muted-foreground">
                {wordCount} words, {characterCount} characters
                {selectedTypeConfig?.maxWords && (
                  <span className={wordCount > selectedTypeConfig.maxWords ? 'text-red-500' : ''}>
                    {' '}/ {selectedTypeConfig.maxWords} max
                  </span>
                )}
              </div>
            </div>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder={selectedTypeConfig?.placeholder || "Write your document content here..."}
              rows={12}
              className="font-mono text-sm"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
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
              <Label htmlFor="targetProgram">Target Program</Label>
              <Input
                id="targetProgram"
                value={formData.targetProgram}
                onChange={(e) => setFormData(prev => ({ ...prev, targetProgram: e.target.value }))}
                placeholder="e.g., Master's in Computer Science"
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetScholarship">Target Scholarship</Label>
              <Input
                id="targetScholarship"
                value={formData.targetScholarship}
                onChange={(e) => setFormData(prev => ({ ...prev, targetScholarship: e.target.value }))}
                placeholder="e.g., Fulbright Scholarship"
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetInstitution">Target Institution</Label>
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
            <Button type="submit" disabled={loading || !formData.title || !formData.type || !formData.content}>
              {loading ? 'Creating...' : 'Create Document'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}