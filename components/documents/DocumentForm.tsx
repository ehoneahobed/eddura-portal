'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, FileText, Tag, Target, Building, GraduationCap, Eye, MessageCircle, Save, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Form validation schema
const documentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  type: z.enum(['cv', 'personal_statement', 'essay', 'recommendation_letter', 'transcript', 'certificate', 'portfolio', 'other']),
  category: z.enum(['academic', 'professional', 'personal', 'creative', 'other']),
  content: z.string().min(1, 'Content is required'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed'),
  targetAudience: z.string().max(200, 'Target audience must be less than 200 characters').optional(),
  targetInstitution: z.string().max(200, 'Target institution must be less than 200 characters').optional(),
  targetProgram: z.string().max(200, 'Target program must be less than 200 characters').optional(),
  status: z.enum(['draft', 'review', 'final']).default('draft'),
  isPublic: z.boolean().default(false),
  allowComments: z.boolean().default(true),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface DocumentFormProps {
  initialData?: Partial<DocumentFormData>;
  mode?: 'create' | 'edit';
  documentId?: string;
}

// Field explanations for tooltips
const fieldExplanations = {
  title: 'A clear, descriptive title for your document. This will help you identify it later.',
  type: 'The type of document you are creating. This helps with organization and templates.',
  category: 'The category helps group similar documents together.',
  content: 'The main content of your document. There is no character limit - write as much as you need.',
  description: 'A brief description of what this document is for and any important notes.',
  tags: 'Keywords that help you find and organize your documents. Separate with commas.',
  targetAudience: 'Who will be reading this document? (e.g., "Admissions Committee", "Employer")',
  targetInstitution: 'The specific institution this document is intended for.',
  targetProgram: 'The specific program or position this document targets.',
  status: 'Current status of your document. Draft = still working on it, Review = ready for feedback, Final = complete.',
  isPublic: 'If enabled, other users can view this document (useful for sharing with mentors or peers).',
  allowComments: 'If enabled, other users can leave comments and suggestions on your document.',
};

// Document type options with descriptions
const documentTypes = [
  { value: 'cv', label: 'CV/Resume', description: 'Professional summary of your experience and skills' },
  { value: 'personal_statement', label: 'Personal Statement', description: 'Narrative about your background and goals' },
  { value: 'essay', label: 'Essay', description: 'Academic or creative writing piece' },
  { value: 'recommendation_letter', label: 'Recommendation Letter', description: 'Letter of recommendation from others' },
  { value: 'transcript', label: 'Transcript', description: 'Academic record or transcript' },
  { value: 'certificate', label: 'Certificate', description: 'Professional or academic certification' },
  { value: 'portfolio', label: 'Portfolio', description: 'Collection of your best work' },
  { value: 'other', label: 'Other', description: 'Any other type of document' },
];

// Category options
const categories = [
  { value: 'academic', label: 'Academic', description: 'For educational purposes' },
  { value: 'professional', label: 'Professional', description: 'For career and work' },
  { value: 'personal', label: 'Personal', description: 'Personal development' },
  { value: 'creative', label: 'Creative', description: 'Creative writing and projects' },
  { value: 'other', label: 'Other', description: 'Other categories' },
];

export default function DocumentForm({ initialData, mode = 'create', documentId }: DocumentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [contentStats, setContentStats] = useState({ characters: 0, words: 0 });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: initialData?.title || '',
      type: initialData?.type || 'essay',
      category: initialData?.category || 'academic',
      content: initialData?.content || '',
      description: initialData?.description || '',
      tags: initialData?.tags || [],
      targetAudience: initialData?.targetAudience || '',
      targetInstitution: initialData?.targetInstitution || '',
      targetProgram: initialData?.targetProgram || '',
      status: initialData?.status || 'draft',
      isPublic: initialData?.isPublic || false,
      allowComments: initialData?.allowComments || true,
    },
  });

  const watchedContent = watch('content');
  const watchedTags = watch('tags');

  // Calculate content statistics
  useEffect(() => {
    const characters = watchedContent.length;
    const words = watchedContent.trim().split(/\s+/).filter(word => word.length > 0).length;
    setContentStats({ characters, words });
  }, [watchedContent]);

  // Add tag function
  const addTag = () => {
    if (newTag.trim() && !watchedTags.includes(newTag.trim()) && watchedTags.length < 10) {
      setValue('tags', [...watchedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  // Remove tag function
  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  // Handle form submission
  const onSubmit = async (data: DocumentFormData) => {
    setIsSubmitting(true);
    try {
      const url = mode === 'edit' ? `/api/documents` : '/api/documents';
      const method = mode === 'edit' ? 'PUT' : 'POST';
      
      const requestBody = mode === 'edit' 
        ? { ...data, documentId }
        : data;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to save document');
      }

      const result = await response.json();
      
      toast.success(
        mode === 'edit' 
          ? 'Document updated successfully!' 
          : 'Document created successfully!'
      );

      // Redirect to document library or the created document
      if (mode === 'create') {
        router.push('/documents');
      } else {
        router.push(`/documents/${documentId}`);
      }
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Field with tooltip component
  const FieldWithTooltip = ({ 
    label, 
    fieldName, 
    children, 
    required = false 
  }: { 
    label: string; 
    fieldName: keyof typeof fieldExplanations; 
    children: React.ReactNode; 
    required?: boolean;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={fieldName} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{fieldExplanations[fieldName]}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {children}
      {errors[fieldName] && (
        <p className="text-sm text-red-500">{errors[fieldName]?.message}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {mode === 'create' ? 'Create New Document' : 'Edit Document'}
          </CardTitle>
          <CardDescription>
            Fill in the details below to {mode === 'create' ? 'create' : 'update'} your document.
            Hover over the help icons for more information about each field.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FieldWithTooltip label="Document Title" fieldName="title" required>
                <Input
                  id="title"
                  placeholder="Enter document title..."
                  {...register('title')}
                />
              </FieldWithTooltip>

              <FieldWithTooltip label="Document Type" fieldName="type" required>
                <Select onValueChange={(value) => setValue('type', value as any)} defaultValue={watch('type')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldWithTooltip>

              <FieldWithTooltip label="Category" fieldName="category" required>
                <Select onValueChange={(value) => setValue('category', value as any)} defaultValue={watch('category')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div>
                          <div className="font-medium">{category.label}</div>
                          <div className="text-xs text-gray-500">{category.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldWithTooltip>

              <FieldWithTooltip label="Status" fieldName="status">
                <Select onValueChange={(value) => setValue('status', value as any)} defaultValue={watch('status')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </FieldWithTooltip>
            </div>

            {/* Content Section */}
            <FieldWithTooltip label="Document Content" fieldName="content" required>
              <div className="space-y-2">
                <Textarea
                  id="content"
                  placeholder="Start writing your document content here..."
                  className="min-h-[300px] resize-y"
                  {...register('content')}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{contentStats.words} words</span>
                  <span>{contentStats.characters} characters</span>
                </div>
              </div>
            </FieldWithTooltip>

            {/* Description */}
            <FieldWithTooltip label="Description" fieldName="description">
              <Textarea
                id="description"
                placeholder="Brief description of this document..."
                className="min-h-[100px]"
                {...register('description')}
              />
            </FieldWithTooltip>

            {/* Tags */}
            <FieldWithTooltip label="Tags" fieldName="tags">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} disabled={!newTag.trim() || watchedTags.length >= 10}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {watchedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {watchedTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  {watchedTags.length}/10 tags used
                </p>
              </div>
            </FieldWithTooltip>

            {/* Target Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FieldWithTooltip label="Target Audience" fieldName="targetAudience">
                <Input
                  id="targetAudience"
                  placeholder="e.g., Admissions Committee"
                  {...register('targetAudience')}
                />
              </FieldWithTooltip>

              <FieldWithTooltip label="Target Institution" fieldName="targetInstitution">
                <Input
                  id="targetInstitution"
                  placeholder="e.g., Stanford University"
                  {...register('targetInstitution')}
                />
              </FieldWithTooltip>

              <FieldWithTooltip label="Target Program" fieldName="targetProgram">
                <Input
                  id="targetProgram"
                  placeholder="e.g., Computer Science MS"
                  {...register('targetProgram')}
                />
              </FieldWithTooltip>
            </div>

            {/* Privacy Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  {...register('isPublic')}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isPublic" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Make document public
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{fieldExplanations.isPublic}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowComments"
                  {...register('allowComments')}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="allowComments" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Allow comments
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{fieldExplanations.allowComments}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Document' : 'Update Document'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}