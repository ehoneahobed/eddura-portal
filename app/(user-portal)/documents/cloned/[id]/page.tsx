"use client";

import { useParams, useRouter } from 'next/navigation';
import DocumentViewer from '@/components/library/DocumentViewer';

export default function ClonedDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const handleBack = () => {
    router.push('/documents/cloned');
  };

  return (
    <div className="container mx-auto py-6">
      <DocumentViewer 
        documentId={id} 
        onBack={handleBack}
      />
    </div>
  );
} 