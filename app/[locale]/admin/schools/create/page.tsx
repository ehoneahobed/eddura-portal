'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { School } from '@/types';
import SchoolForm from '@/components/forms/SchoolForm';
import { ArrowLeft } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function CreateSchoolPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCreate = async (data: Partial<School>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'School created successfully'
        });
        router.push('/admin/schools');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create school (${response.status})`);
      }
    } catch (error) {
      console.error('Error creating school:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create school',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/schools');
  };

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/schools')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Schools</span>
          </Button>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Create New School</h1>
          <p className="text-gray-600">
            Add a new educational institution to the platform
          </p>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-xl text-gray-900">School Information</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <SchoolForm
              onSubmit={handleCreate}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}