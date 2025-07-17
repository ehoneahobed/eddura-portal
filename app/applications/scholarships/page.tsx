import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ScholarshipApplicationManager from '@/components/applications/ScholarshipApplicationManager';

export default async function ScholarshipApplicationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ScholarshipApplicationManager userId={session.user.id} />
    </div>
  );
}