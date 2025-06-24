'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Scholarship } from '@/types';
import ScholarshipForm from '@/components/forms/ScholarshipForm';
import { ArrowLeft } from 'lucide-react';

export default function CreateScholarshipPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCreate = async (data: Partial<Scholarship>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/scholarships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Scholarship created successfully'
        });
        router.push('/admin/scholarships');
      } else {
        throw new Error('Failed to create scholarship');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create scholarship',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/scholarships');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/scholarships')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Scholarships</span>
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Create New Scholarship</h1>
        <p className="text-gray-600">
          Add a new scholarship opportunity to the platform
        </p>
      </div>

      {/* Form Card */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
          <CardTitle className="text-xl text-gray-900">Scholarship Information</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <ScholarshipForm
            onSubmit={handleCreate}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}