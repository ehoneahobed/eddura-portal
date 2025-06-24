"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import React from 'react';

interface ScholarshipActionsProps {
  scholarshipId: string;
}

/**
 * ScholarshipActions renders Edit and Delete buttons for a scholarship.
 * Handles delete confirmation and redirect on success.
 */
const ScholarshipActions: React.FC<ScholarshipActionsProps> = ({ scholarshipId }) => {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this scholarship?')) return;
    const res = await fetch(`/api/scholarships/${scholarshipId}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin/scholarships');
    } else {
      alert('Failed to delete scholarship');
    }
  };

  return (
    <div className="flex gap-2">
      <Link href={`/admin/scholarships/${scholarshipId}/edit`}>
        <Button size="sm" variant="outline" className="flex items-center gap-1"><Edit className="w-4 h-4" />Edit</Button>
      </Link>
      <Button size="sm" variant="destructive" className="flex items-center gap-1" onClick={handleDelete}><Trash2 className="w-4 h-4" />Delete</Button>
    </div>
  );
};

export default ScholarshipActions; 