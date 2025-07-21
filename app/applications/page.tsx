import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EnhancedApplicationDashboard from '@/components/applications/EnhancedApplicationDashboard';

export default async function ApplicationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EnhancedApplicationDashboard userId={session.user.id} />
    </div>
  );
}