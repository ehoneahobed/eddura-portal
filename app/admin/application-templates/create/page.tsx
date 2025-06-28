'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, FileText } from 'lucide-react';
import { useScholarships } from '@/hooks/use-scholarships';
import ApplicationTemplateForm from '@/components/forms/ApplicationTemplateForm';
import { ApplicationTemplate } from '@/types';
import { createApplicationTemplate } from '@/hooks/use-application-templates';
import { toast } from 'sonner';

export default function CreateApplicationTemplatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedScholarshipId, setSelectedScholarshipId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  const { scholarships, isLoading: scholarshipsLoading } = useScholarships({
    page: 1,
    limit: 100
  });

  // Handle scholarshipId from URL query parameter
  useEffect(() => {
    const scholarshipIdFromUrl = searchParams.get('scholarshipId');
    if (scholarshipIdFromUrl) {
      setSelectedScholarshipId(scholarshipIdFromUrl);
    }
  }, [searchParams]);

  const handleScholarshipSelect = (scholarshipId: string) => {
    setSelectedScholarshipId(scholarshipId);
  };

  const handleSubmit = async (data: Partial<ApplicationTemplate>) => {
    if (!selectedScholarshipId) {
      toast.error('Please select a scholarship first');
      return;
    }

    setIsCreating(true);
    try {
      const templateData = {
        ...data,
        scholarshipId: selectedScholarshipId
      } as ApplicationTemplate;

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

  if (scholarshipsLoading) {
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

      {!selectedScholarshipId ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Select Scholarship
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Choose the scholarship for which you want to create an application template:
              </p>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Scholarship *
                </label>
                <Select onValueChange={handleScholarshipSelect} value={selectedScholarshipId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a scholarship" />
                  </SelectTrigger>
                  <SelectContent>
                    {scholarships.map((scholarship) => (
                      <SelectItem key={scholarship.id} value={scholarship.id}>
                        <div>
                          <div className="font-medium">{scholarship.title}</div>
                          <div className="text-sm text-gray-500">{scholarship.provider}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {scholarships.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No scholarships found</h3>
                  <p className="text-gray-600 mb-4">
                    You need to create a scholarship first before creating an application template.
                  </p>
                  <Button
                    onClick={() => router.push('/admin/scholarships/create')}
                    className="flex items-center gap-2"
                  >
                    Create Scholarship
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <ApplicationTemplateForm
          scholarshipId={selectedScholarshipId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isCreating}
        />
      )}
    </div>
  );
} 