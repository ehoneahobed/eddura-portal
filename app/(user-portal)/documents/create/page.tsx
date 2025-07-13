import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DocumentForm from '@/components/documents/DocumentForm';

export default async function CreateDocumentPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DocumentForm mode="create" />
    </div>
  );
}