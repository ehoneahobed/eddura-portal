'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Scholarship } from '@/types';
import ScholarshipForm from '@/components/forms/ScholarshipForm';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface EditScholarshipPageProps {
  params: { id: string };
}

export default function EditScholarshipPage({ params }: EditScholarshipPageProps) {
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchScholarship();
  }, [params.id]);

  const fetchScholarship = async () => {
    try {
      const response = await fetch(`/api/scholarships/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setScholarship(data);
      } else {
        throw new Error('Failed to fetch scholarship');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch scholarship data',
        variant: 'destructive'
      });
      router.push('/admin/scholarships');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleUpdate = async (data: Partial<Scholarship>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/scholarships/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Scholarship updated successfully'
        });
        router.push('/admin/scholarships');
      } else {
        throw new Error('Failed to update scholarship');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update scholarship',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/scholarships');
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading scholarship data...</span>
        </div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">Scholarship not found</div>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-gray-900">Edit Scholarship</h1>
        <p className="text-gray-600">
          Update information for {scholarship.title}
        </p>
      </div>

      {/* Form Card */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
          <CardTitle className="text-xl text-gray-900">Scholarship Information</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <ScholarshipForm
            scholarship={scholarship}
            onSubmit={handleUpdate}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}