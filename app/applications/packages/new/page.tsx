import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ApplicationPackageDashboard from '@/components/applications/ApplicationPackageDashboard';

export default async function NewApplicationPackagePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ApplicationPackageDashboard userId={session.user.id} />
    </div>
  );
}