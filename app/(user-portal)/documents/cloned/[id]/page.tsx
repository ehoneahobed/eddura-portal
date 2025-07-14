"use client";

import { useRouter } from 'next/navigation';
import DocumentViewer from '@/components/library/DocumentViewer';

interface ClonedDocumentPageProps {
  params: {
    id: string;
  };
}

export default function ClonedDocumentPage({ params }: ClonedDocumentPageProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/documents/cloned');
  };

  return (
    <div className="container mx-auto py-6">
      <DocumentViewer 
        documentId={params.id} 
        onBack={handleBack}
      />
    </div>
  );
} 