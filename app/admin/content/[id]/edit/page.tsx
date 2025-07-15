'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, Eye, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { MarkdownEditor } from '@/components/ui/markdown-editor';

const contentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().min(1, 'Excerpt is required').max(300),
  type: z.enum(['blog', 'opportunity', 'event']),
  status: z.enum(['draft', 'published', 'archived']),
  author: z.string().min(1, 'Author is required'),
  
  // SEO Fields
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  keywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().url().optional().or(z.literal('')),
  
  // Content Specific Fields
  featuredImage: z.string().optional(),
  publishDate: z.string().optional(),
  scheduledDate: z.string().optional(),
  
  // Categories and Tags
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  
  // Event Specific Fields
  eventDate: z.string().optional(),
  eventEndDate: z.string().optional(),
  eventLocation: z.string().optional(),
  eventType: z.enum(['online', 'in-person', 'hybrid']).optional(),
  registrationLink: z.string().url().optional().or(z.literal('')),
  
  // Opportunity Specific Fields
  opportunityType: z.enum(['scholarship', 'fellowship', 'internship', 'job', 'grant']).optional(),
  deadline: z.string().optional(),
  value: z.string().optional(),
  eligibility: z.string().optional(),
  applicationLink: z.string().url().optional().or(z.literal('')),
  
  // CTA Configuration
  cta: z.object({
    enabled: z.boolean(),
    title: z.string().max(100),
    description: z.string().max(200),
    buttonText: z.string().max(50),
    buttonLink: z.string(),
    position: z.enum(['top', 'bottom', 'sidebar', 'inline']),
    style: z.enum(['primary', 'secondary', 'outline'])
  }),
  
  // Social Media
  socialShareImage: z.string().optional(),
  socialTitle: z.string().max(100).optional(),
  socialDescription: z.string().max(200).optional()
});

type ContentFormData = z.infer<typeof contentSchema>;

export default function EditContentPage() {
  const router = useRouter();
  const params = useParams();
  const contentId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [content, setContent] = useState<ContentFormData | null>(null);
  // const [editorLoaded, setEditorLoaded] = useState(false); // No longer needed
  // const [editorError, setEditorError] = useState(false); // No longer needed

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      type: 'blog',
      status: 'draft',
      categories: [],
      tags: [],
      cta: {
        enabled: true,
        title: 'Join Our Platform',
        description: 'Discover more opportunities and connect with educational institutions worldwide.',
        buttonText: 'Get Started',
        buttonLink: '/auth/signup',
        position: 'bottom',
        style: 'primary'
      }
    }
  });

  const watchedType = watch('type');
  const watchedStatus = watch('status');
  const watchedCategories = watch('categories') || [];
  const watchedTags = watch('tags') || [];
  const watchedContent = watch('content');

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/content/${contentId}`);
      
      if (!response.ok) {
        throw new Error('Content not found');
      }
      
      const data = await response.json();
      const contentData = data.data;
      
      // Format dates for form inputs
      const formattedData = {
        ...contentData,
        publishDate: contentData.publishDate ? new Date(contentData.publishDate).toISOString().split('T')[0] : '',
        scheduledDate: contentData.scheduledDate ? new Date(contentData.scheduledDate).toISOString().split('T')[0] : '',
        eventDate: contentData.eventDate ? new Date(contentData.eventDate).toISOString().split('T')[0] : '',
        eventEndDate: contentData.eventEndDate ? new Date(contentData.eventEndDate).toISOString().split('T')[0] : '',
        deadline: contentData.deadline ? new Date(contentData.deadline).toISOString().split('T')[0] : '',
      };
      
      setContent(formattedData);
      reset(formattedData);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
      router.push('/admin/content');
    } finally {
      setLoading(false);
    }
  }, [contentId, reset]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Handle editor load state
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setEditorLoaded(true);
  //   }, 100);

  //   return () => clearTimeout(timer);
  // }, []);

  const addCategory = () => {
    if (newCategory.trim() && !watchedCategories.includes(newCategory.trim())) {
      setValue('categories', [...watchedCategories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    setValue('categories', watchedCategories.filter(c => c !== category));
  };

  const addTag = () => {
    if (newTag.trim() && !watchedTags.includes(newTag.trim())) {
      setValue('tags', [...watchedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setValue('tags', watchedTags.filter(t => t !== tag));
  };

  const onSubmit = async (data: ContentFormData) => {
    try {
      setSaving(true);
      
      const response = await fetch(`/api/content/${contentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Content updated successfully');
        router.push('/admin/content');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update content');
      }
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
          <Button onClick={() => router.push('/admin/content')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Content
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/admin/content')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Edit Content</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="cta">CTA</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            {/* Basic Content Fields */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Enter content title"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    {...register('slug')}
                    placeholder="auto-generated-from-title"
                  />
                  <p className="text-gray-500 text-sm mt-1">Leave empty to auto-generate from title</p>
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt *</Label>
                  <Textarea
                    id="excerpt"
                    {...register('excerpt')}
                    placeholder="Brief description of the content"
                    rows={3}
                  />
                  {errors.excerpt && (
                    <p className="text-red-500 text-sm mt-1">{errors.excerpt.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="content">Content *</Label>
                  <MarkdownEditor
                    value={watchedContent || ''}
                    onChange={(value) => setValue('content', value || '')}
                    placeholder="Write your content here..."
                    height={400}
                    wordCount={true}
                    maxLength={10000}
                    error={errors.content?.message}
                  />
                </div>

                <div>
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    {...register('author')}
                    placeholder="Enter author name"
                  />
                  {errors.author && (
                    <p className="text-red-500 text-sm mt-1">{errors.author.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="featuredImage">Featured Image URL</Label>
                  <Input
                    id="featuredImage"
                    {...register('featuredImage')}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Type-specific Fields */}
            {watchedType === 'event' && (
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="eventDate">Event Date</Label>
                      <Input
                        id="eventDate"
                        type="date"
                        {...register('eventDate')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="eventEndDate">Event End Date</Label>
                      <Input
                        id="eventEndDate"
                        type="date"
                        {...register('eventEndDate')}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="eventLocation">Event Location</Label>
                    <Input
                      id="eventLocation"
                      {...register('eventLocation')}
                      placeholder="Enter event location"
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventType">Event Type</Label>
                    <Select value={watch('eventType')} onValueChange={(value) => setValue('eventType', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="in-person">In-Person</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="registrationLink">Registration Link</Label>
                    <Input
                      id="registrationLink"
                      {...register('registrationLink')}
                      placeholder="https://example.com/register"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {watchedType === 'opportunity' && (
              <Card>
                <CardHeader>
                  <CardTitle>Opportunity Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="opportunityType">Opportunity Type</Label>
                    <Select value={watch('opportunityType')} onValueChange={(value) => setValue('opportunityType', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select opportunity type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scholarship">Scholarship</SelectItem>
                        <SelectItem value="fellowship">Fellowship</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="job">Job</SelectItem>
                        <SelectItem value="grant">Grant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="deadline">Application Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      {...register('deadline')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="value">Value/Award</Label>
                    <Input
                      id="value"
                      {...register('value')}
                      placeholder="e.g., $50,000 per year"
                    />
                  </div>
                  <div>
                    <Label htmlFor="eligibility">Eligibility Criteria</Label>
                    <Textarea
                      id="eligibility"
                      {...register('eligibility')}
                      placeholder="Enter eligibility requirements"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="applicationLink">Application Link</Label>
                    <Input
                      id="applicationLink"
                      {...register('applicationLink')}
                      placeholder="https://example.com/apply"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    {...register('metaTitle')}
                    placeholder="SEO-optimized title (max 60 characters)"
                    maxLength={60}
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    {watch('metaTitle')?.length || 0}/60 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    {...register('metaDescription')}
                    placeholder="SEO description (max 160 characters)"
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    {watch('metaDescription')?.length || 0}/160 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    {...register('keywords')}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                  <p className="text-gray-500 text-sm mt-1">Separate keywords with commas</p>
                </div>

                <div>
                  <Label htmlFor="canonicalUrl">Canonical URL</Label>
                  <Input
                    id="canonicalUrl"
                    {...register('canonicalUrl')}
                    placeholder="https://example.com/canonical-page"
                  />
                </div>

                <div>
                  <Label htmlFor="socialTitle">Social Media Title</Label>
                  <Input
                    id="socialTitle"
                    {...register('socialTitle')}
                    placeholder="Title for social media sharing"
                  />
                </div>

                <div>
                  <Label htmlFor="socialDescription">Social Media Description</Label>
                  <Textarea
                    id="socialDescription"
                    {...register('socialDescription')}
                    placeholder="Description for social media sharing"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="socialShareImage">Social Share Image URL</Label>
                  <Input
                    id="socialShareImage"
                    {...register('socialShareImage')}
                    placeholder="https://example.com/social-image.jpg"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="type">Content Type</Label>
                  <Select value={watchedType} onValueChange={(value) => setValue('type', value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">Blog Post</SelectItem>
                      <SelectItem value="opportunity">Opportunity</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={watchedStatus} onValueChange={(value) => setValue('status', value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="publishDate">Publish Date</Label>
                  <Input
                    id="publishDate"
                    type="date"
                    {...register('publishDate')}
                  />
                </div>

                <div>
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    {...register('scheduledDate')}
                  />
                </div>

                <div>
                  <Label>Categories</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Add new category"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                      />
                      <Button type="button" onClick={addCategory} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {watchedCategories.map((category) => (
                        <Badge key={category} variant="secondary" className="flex items-center gap-1">
                          {category}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeCategory(category)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add new tag"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {watchedTags.map((tag) => (
                        <Badge key={tag} variant="outline" className="flex items-center gap-1">
                          {tag}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cta" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Call-to-Action Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="cta-enabled"
                    checked={watch('cta.enabled')}
                    onCheckedChange={(checked) => setValue('cta.enabled', checked)}
                  />
                  <Label htmlFor="cta-enabled">Enable CTA</Label>
                </div>

                {watch('cta.enabled') && (
                  <>
                    <div>
                      <Label htmlFor="cta-title">CTA Title</Label>
                      <Input
                        id="cta-title"
                        {...register('cta.title')}
                        placeholder="Enter CTA title"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cta-description">CTA Description</Label>
                      <Textarea
                        id="cta-description"
                        {...register('cta.description')}
                        placeholder="Enter CTA description"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cta-button-text">Button Text</Label>
                      <Input
                        id="cta-button-text"
                        {...register('cta.buttonText')}
                        placeholder="Enter button text"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cta-button-link">Button Link</Label>
                      <Input
                        id="cta-button-link"
                        {...register('cta.buttonLink')}
                        placeholder="Enter button link"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cta-position">CTA Position</Label>
                      <Select value={watch('cta.position')} onValueChange={(value) => setValue('cta.position', value as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                          <SelectItem value="sidebar">Sidebar</SelectItem>
                          <SelectItem value="inline">Inline</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="cta-style">CTA Style</Label>
                      <Select value={watch('cta.style')} onValueChange={(value) => setValue('cta.style', value as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">Primary</SelectItem>
                          <SelectItem value="secondary">Secondary</SelectItem>
                          <SelectItem value="outline">Outline</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
} 