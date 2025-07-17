import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CreateScholarshipApplicationForm from '@/components/applications/CreateScholarshipApplicationForm';

export default async function NewScholarshipApplicationPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CreateScholarshipApplicationForm userId={session.user.id} />
    </div>
  );
}