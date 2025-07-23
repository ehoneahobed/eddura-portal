'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { School } from '@/types';
import SchoolForm from '@/components/forms/SchoolForm';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface EditSchoolPageProps {
  params: Promise<{ id: string }>;
}

export default function EditSchoolPage({ params }: EditSchoolPageProps) {
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const fetchSchool = useCallback(async () => {
    if (!schoolId) return;
    
    try {
      const response = await fetch(`/api/schools/${schoolId}`);
      if (response.ok) {
        const data = await response.json();
        setSchool(data);
      } else {
        throw new Error('Failed to fetch school');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch school data',
        variant: 'destructive'
      });
      router.push('/admin/schools');
    } finally {
      setIsLoadingData(false);
    }
  }, [schoolId, toast, router]);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setSchoolId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (schoolId) {
      fetchSchool();
    }
  }, [schoolId, fetchSchool]);

  const handleUpdate = async (data: Partial<School>) => {
    if (!schoolId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/schools/${schoolId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'School updated successfully'
        });
        router.push('/admin/schools');
      } else {
        throw new Error('Failed to update school');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update school',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/schools');
  };

  // Show loading state while params are being resolved
  if (!schoolId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading school data...</span>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">School not found</div>
      </div>
    );
  }

  return (
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
        <h1 className="text-3xl font-bold text-gray-900">Edit School</h1>
        <p className="text-gray-600">
          Update information for {school.name}
        </p>
      </div>

      {/* Form Card */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-xl text-gray-900">School Information</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <SchoolForm
            school={school}
            onSubmit={handleUpdate}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}