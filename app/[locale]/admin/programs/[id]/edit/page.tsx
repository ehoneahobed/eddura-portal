'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Program } from '@/types';
import ProgramForm from '@/components/forms/ProgramForm';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface EditProgramPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProgramPage({ params }: EditProgramPageProps) {
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [programId, setProgramId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setProgramId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  const fetchProgram = useCallback(async () => {
    if (!programId) return;
    
    try {
      const response = await fetch(`/api/programs/${programId}`);
      if (response.ok) {
        const data = await response.json();
        setProgram(data);
      } else {
        throw new Error('Failed to fetch program');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch program data',
        variant: 'destructive'
      });
      router.push('/admin/programs');
    } finally {
      setIsLoadingData(false);
    }
  }, [programId, toast, router]);

  useEffect(() => {
    if (programId) {
      fetchProgram();
    }
  }, [programId, fetchProgram]);

  const handleUpdate = async (data: Partial<Program>) => {
    if (!programId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/programs/${programId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Program updated successfully'
        });
        router.push('/admin/programs');
      } else {
        throw new Error('Failed to update program');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update program',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/programs');
  };

  // Show loading state while params are being resolved
  if (!programId) {
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
          <span>Loading program data...</span>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">Program not found</div>
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
          onClick={() => router.push('/admin/programs')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Programs</span>
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Edit Program</h1>
        <p className="text-gray-600">
          Update information for {program.name}
        </p>
      </div>

      {/* Form Card */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <CardTitle className="text-xl text-gray-900">Program Information</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <ProgramForm
            program={program}
            onSubmit={handleUpdate}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}