import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CreateInterestForm from '@/components/applications/CreateInterestForm';

export default async function NewInterestPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CreateInterestForm userId={session.user.id} />
    </div>
  );
}