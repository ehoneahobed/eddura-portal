'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Program } from '@/types';
import ProgramForm from '@/components/forms/ProgramForm';
import { ArrowLeft } from 'lucide-react';

export default function CreateProgramPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCreate = async (data: Partial<Program>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Program created successfully'
        });
        router.push('/admin/programs');
      } else {
        throw new Error('Failed to create program');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create program',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/programs');
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Create New Program</h1>
        <p className="text-gray-600">
          Add a new academic program to the platform
        </p>
      </div>

      {/* Form Card */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <CardTitle className="text-xl text-gray-900">Program Information</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <ProgramForm
            onSubmit={handleCreate}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}