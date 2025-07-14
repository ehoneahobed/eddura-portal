'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import ApplicationTemplateForm from '@/components/forms/ApplicationTemplateForm';
import { ApplicationTemplate } from '@/types';
import { createApplicationTemplate } from '@/hooks/use-application-templates';
import { toast } from 'sonner';

export default function CreateApplicationTemplatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);

  // Get scholarshipId from URL parameters
  const scholarshipId = searchParams.get('scholarshipId');

  const handleSubmit = async (data: Partial<ApplicationTemplate>) => {
    if (!data.scholarshipId) {
      toast.error('Please select a scholarship first');
      return;
    }

    setIsCreating(true);
    try {
      const templateData = data as ApplicationTemplate;
      await createApplicationTemplate(templateData);
      toast.success('Application template created successfully');
      router.push('/admin/application-templates');
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create application template');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/application-templates');
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Create Application Template</h1>
        <p className="text-gray-600 mt-2">
          Create a new application form template for a scholarship
        </p>
      </div>

      <ApplicationTemplateForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isCreating}
        allowScholarshipChange={true}
        scholarshipId={scholarshipId || undefined}
      />
    </div>
  );
} 