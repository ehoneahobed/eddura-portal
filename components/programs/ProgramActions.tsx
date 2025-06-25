"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface ProgramActionsProps {
  programId: string;
}

/**
 * ProgramActions renders Edit and Delete buttons for a program.
 * Handles delete confirmation and redirect on success.
 */
const ProgramActions: React.FC<ProgramActionsProps> = ({ programId }) => {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this program?')) return;
    const res = await fetch(`/api/programs/${programId}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin/programs');
    } else {
      alert('Failed to delete program');
    }
  };

  return (
    <div className="flex gap-2">
      <Link href={`/admin/programs/${programId}/edit`}>
        <Button size="sm" variant="outline" className="flex items-center gap-1"><Edit className="w-4 h-4" />Edit</Button>
      </Link>
      <Button size="sm" variant="destructive" className="flex items-center gap-1" onClick={handleDelete}><Trash2 className="w-4 h-4" />Delete</Button>
    </div>
  );
};

export default ProgramActions; 