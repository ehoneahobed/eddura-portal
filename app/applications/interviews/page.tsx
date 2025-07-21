import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import InterviewManager from '@/components/applications/InterviewManager';

export default async function InterviewsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <InterviewManager userId={session.user.id} />
    </div>
  );
}