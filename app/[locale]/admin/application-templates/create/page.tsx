'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Plus } from 'lucide-react';
import ApplicationTemplateForm from '@/components/forms/ApplicationTemplateForm';
import { ApplicationTemplate } from '@/types';
import { createApplicationTemplate, ApplicationTemplateFormData } from '@/hooks/use-application-templates';
import { toast } from 'sonner';

export default function CreateApplicationTemplatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);
  const [conflictError, setConflictError] = useState<{
    message: string;
    existingTemplateId: string;
    existingTemplateTitle: string;
  } | null>(null);

  // Get scholarshipId from URL parameters
  const scholarshipId = searchParams.get('scholarshipId');

  const handleSubmit = async (data: Partial<ApplicationTemplate>) => {
    if (!data.scholarshipId) {
      toast.error('Please select a scholarship first');
      return;
    }

    setIsCreating(true);
    setConflictError(null); // Clear any previous conflict errors
    
    try {
      const templateData = data as ApplicationTemplateFormData;
      await createApplicationTemplate(templateData);
      toast.success('Application template created successfully');
      router.push('/admin/application-templates');
    } catch (error: any) {
      console.error('Error creating template:', error);
      
      // Try to parse error if it's a JSON string
      let parsedError = error;
      if (typeof error.message === 'string' && error.message.startsWith('{')) {
        try {
          parsedError = JSON.parse(error.message);
        } catch {
          // If parsing fails, use the original error
        }
      }
      
      // Check if this is a 409 conflict error
      // The error might be a JSON string with conflict information
      if ((parsedError as any).status === 409 || (error as any).status === 409 || 
          (parsedError.existingTemplateId && parsedError.error && parsedError.error.includes('already exists'))) {
        const conflictError = parsedError.existingTemplateId ? parsedError : error;
        setConflictError({
          message: conflictError.message || conflictError.error || 'An application template already exists for this scholarship',
          existingTemplateId: (conflictError as any).existingTemplateId || '',
          existingTemplateTitle: (conflictError as any).existingTemplateTitle || 'Unknown Template'
        });
        return; // Don't show toast, let the UI handle it
      }
      
      // Show backend error message if available
      if (error instanceof Error && error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create application template');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/application-templates');
  };

  const handleEditExisting = () => {
    if (conflictError?.existingTemplateId) {
      router.push(`/admin/application-templates/${conflictError.existingTemplateId}/edit`);
    }
  };

  const handleCreateNew = () => {
    setConflictError(null);
    // The form will be reset and user can try again
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

      {conflictError ? (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <span className="text-orange-600">⚠️</span>
              Template Already Exists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-4">{conflictError.message}</p>
            <div className="flex gap-3">
              <Button
                onClick={handleEditExisting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                Edit Existing Template
              </Button>
              <Button
                onClick={handleCreateNew}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create New Template
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

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