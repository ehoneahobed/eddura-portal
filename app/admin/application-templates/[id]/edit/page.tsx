'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useApplicationTemplate } from '@/hooks/use-application-templates';
import ApplicationTemplateForm from '@/components/forms/ApplicationTemplateForm';
import { ApplicationTemplate } from '@/types';
import { updateApplicationTemplate } from '@/hooks/use-application-templates';
import { toast } from 'sonner';

interface EditApplicationTemplatePageProps {
  params: Promise<{ id: string }>;
}

export default function EditApplicationTemplatePage({ params }: EditApplicationTemplatePageProps) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState<string | null>(null);
  const { template, error, isLoading } = useApplicationTemplate(templateId || '');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setTemplateId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  const handleSubmit = async (data: Partial<ApplicationTemplate>) => {
    console.log('=== EDIT PAGE HANDLE SUBMIT ===');
    console.log('Edit page handleSubmit called with data:', data);
    console.log('Template ID:', templateId);
    console.log('Template data:', template);
    
    if (!templateId) {
      console.error('❌ No templateId available');
      return;
    }
    
    console.log('🔄 Setting isUpdating to true');
    setIsUpdating(true);
    
    try {
      console.log('📞 Calling updateApplicationTemplate with:', templateId, data);
      const result = await updateApplicationTemplate(templateId, data);
      console.log('✅ Update result:', result);
      toast.success('Application template updated successfully');
      console.log('🔄 Redirecting to template view...');
      router.push(`/admin/application-templates/${templateId}`);
    } catch (error) {
      console.error('❌ Error updating template:', error);
      toast.error('Failed to update application template');
    } finally {
      console.log('🔄 Setting isUpdating to false');
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/application-templates');
  };

  // Show loading state while params are being resolved
  if (!templateId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">
              {error ? `Error loading template: ${error.message}` : 'Template not found'}
            </p>
            <Button
              onClick={() => router.push('/admin/application-templates')}
              className="mt-4"
            >
              Back to Templates
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/application-templates')}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Templates
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Application Template</h1>
        <p className="text-gray-600 mt-2">
          Update the application form template for {template.title}
        </p>
      </div>

      <ApplicationTemplateForm
        template={template}
        scholarshipId={template.scholarshipId}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isUpdating}
        allowScholarshipChange={true}
      />
    </div>
  );
} 