import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ScholarshipApplicationManager from '@/components/applications/ScholarshipApplicationManager';

export default async function ScholarshipApplicationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ScholarshipApplicationManager userId={session.user.id} />
    </div>
  );
}