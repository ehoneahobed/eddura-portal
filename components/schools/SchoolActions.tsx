"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, Edit } from 'lucide-react';
import React, { useState } from 'react';

interface SchoolActionsProps {
  schoolId: string;
}

/**
 * SchoolActions renders View and Delete buttons for a school.
 * Delete requires typing 'delete' to confirm. Redirects on success.
 */
const SchoolActions: React.FC<SchoolActionsProps> = ({ schoolId }) => {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await fetch(`/api/schools/${schoolId}`, { method: 'DELETE' });
    setLoading(false);
    if (res.ok) {
      router.push('/admin/schools');
    } else {
      alert('Failed to delete school');
    }
  };

  return (
    <div className="flex gap-2">
      <Link href={`/admin/schools/${schoolId}/edit`}>
        <Button size="sm" variant="outline" className="flex items-center gap-1"><Edit className="w-4 h-4" />Edit</Button>
      </Link>
      <Button size="sm" variant="destructive" className="flex items-center gap-1" onClick={() => setShowConfirm(true)}><Trash2 className="w-4 h-4" />Delete</Button>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Confirm Delete</h2>
            <p className="mb-4 text-sm text-gray-700">Type <span className="font-mono font-bold">delete</span> to confirm deletion of this school. This action cannot be undone.</p>
            <input
              type="text"
              className="border rounded px-3 py-2 w-full mb-4"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="Type 'delete' to confirm"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={() => { setShowConfirm(false); setConfirmText(""); }} disabled={loading}>Cancel</Button>
              <Button size="sm" variant="destructive" onClick={handleDelete} disabled={confirmText !== 'delete' || loading}>
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolActions; 