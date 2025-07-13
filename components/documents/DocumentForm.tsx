'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ExpandableTextarea } from '@/components/ui/expandable-textarea';
import { HelpCircle, Plus, X, FileText, Info, Save, ArrowLeft } from 'lucide-react';

const documentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['cv', 'resume', 'personal_statement', 'essay', 'cover_letter', 'recommendation', 'transcript', 'certificate', 'other']),
  category: z.enum(['academic', 'professional', 'personal', 'certification', 'other']),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed'),
  language: z.string().default('en'),
  isPublic: z.boolean().default(false)
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface DocumentFormProps {
  initialData?: Partial<DocumentFormData>;
  mode?: 'create' | 'edit';
  documentId?: string;
}

const documentTypes = [
  { value: 'cv', label: 'CV/Curriculum Vitae', description: 'Comprehensive academic or professional resume' },
  { value: 'resume', label: 'Resume', description: 'Concise professional summary for job applications' },
  { value: 'personal_statement', label: 'Personal Statement', description: 'Personal narrative for applications' },
  { value: 'essay', label: 'Essay', description: 'Academic or creative writing piece' },
  { value: 'cover_letter', label: 'Cover Letter', description: 'Letter accompanying job applications' },
  { value: 'recommendation', label: 'Recommendation Letter', description: 'Reference letter from others' },
  { value: 'transcript', label: 'Transcript', description: 'Academic record or certificate' },
  { value: 'certificate', label: 'Certificate', description: 'Achievement or qualification certificate' },
  { value: 'other', label: 'Other', description: 'Other type of document' }
];

const documentCategories = [
  { value: 'academic', label: 'Academic', description: 'Educational and research documents' },
  { value: 'professional', label: 'Professional', description: 'Work and career-related documents' },
  { value: 'personal', label: 'Personal', description: 'Personal and creative documents' },
  { value: 'certification', label: 'Certification', description: 'Certificates and qualifications' },
  { value: 'other', label: 'Other', description: 'Other categories' }
];

const fieldHelpText = {
  title: 'Give your document a clear, descriptive title that will help you identify it later.',
  description: 'Optional brief description of what this document contains or its purpose.',
  content: 'The main content of your document. You can write as much as you need - there are no character limits.',
  type: 'Select the type that best describes your document. This helps with organization and search.',
  category: 'Choose a category to group similar documents together.',
  tags: 'Add relevant tags to make your document easier to find later. Separate tags with commas.',
  language: 'The primary language of your document content.',
  isPublic: 'If enabled, this document can be shared with others (when you choose to share it).'
};

export default function DocumentForm({ initialData, mode = 'create', documentId }: DocumentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      content: initialData?.content || '',
      type: initialData?.type || 'other',
      category: initialData?.category || 'other',
      tags: initialData?.tags || [],
      language: initialData?.language || 'en',
      isPublic: initialData?.isPublic || false
    }
  });

  const watchedTags = watch('tags');
  const watchedContent = watch('content');

  const addTag = () => {
    if (newTag.trim() && !watchedTags.includes(newTag.trim()) && watchedTags.length < 10) {
      setValue('tags', [...watchedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: DocumentFormData) => {
    setIsSubmitting(true);
    try {
      const url = mode === 'edit' && documentId 
        ? `/api/documents/${documentId}` 
        : '/api/documents';
      
      const method = mode === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to save document');
      }

      const result = await response.json();
      router.push('/documents');
    } catch (error) {
      console.error('Error saving document:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue('content', e.target.value);
  };

  return (
    <TooltipProvider>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-2xl font-bold">
              {mode === 'create' ? 'Create New Document' : 'Edit Document'}
            </h1>
          </div>
          
          <Dialog open={showHelpModal} onOpenChange={setShowHelpModal}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <HelpCircle className="h-4 w-4" />
                <span>Field Help</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Document Field Explanations</DialogTitle>
                <DialogDescription>
                  Learn what each field is for and how to use it effectively.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {Object.entries(fieldHelpText).map(([field, help]) => (
                  <div key={field} className="space-y-2">
                    <h3 className="font-semibold capitalize">{field.replace(/([A-Z])/g, ' $1')}</h3>
                    <p className="text-sm text-gray-600">{help}</p>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>
                Start with the essential details about your document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="title">Title *</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{fieldHelpText.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter document title"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="description">Description</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{fieldHelpText.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Brief description of your document"
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              {/* Type and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="type">Document Type *</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{fieldHelpText.type}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={watch('type')} onValueChange={(value) => setValue('type', value as any)}>
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
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="category">Category *</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{fieldHelpText.category}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={watch('category')} onValueChange={(value) => setValue('category', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div>
                            <div className="font-medium">{category.label}</div>
                            <div className="text-xs text-gray-500">{category.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>
                Write your document content. You can write as much as you need.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="content">Content *</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{fieldHelpText.content}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{watchedContent?.length || 0} characters</span>
                    <span>{watchedContent?.trim().split(/\s+/).filter(word => word.length > 0).length || 0} words</span>
                  </div>
                </div>
                <ExpandableTextarea
                  {...register('content')}
                  placeholder="Write your document content here..."
                  showCharacterCount={true}
                  showWordCount={true}
                  expandable={true}
                  defaultExpanded={false}
                  className={errors.content ? 'border-red-500' : ''}
                  onChange={handleContentChange}
                />
                {errors.content && (
                  <p className="text-sm text-red-500">{errors.content.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
              <CardDescription>
                Add tags and set visibility to help organize your documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tags */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{fieldHelpText.tags}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm" disabled={!newTag.trim() || watchedTags.length >= 10}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {watchedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {watchedTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{tag}</span>
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
                {errors.tags && (
                  <p className="text-sm text-red-500">{errors.tags.message}</p>
                )}
              </div>

              {/* Language and Visibility */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="language">Language</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{fieldHelpText.language}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={watch('language')} onValueChange={(value) => setValue('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="isPublic">Visibility</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{fieldHelpText.isPublic}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={watch('isPublic') ? 'public' : 'private'} onValueChange={(value) => setValue('isPublic', value === 'public')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private (Only you)</SelectItem>
                      <SelectItem value="public">Public (Can be shared)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Document' : 'Update Document'}</span>
            </Button>
          </div>
        </form>
      </div>
    </TooltipProvider>
  );
}