import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CreateInterestForm from '@/components/applications/CreateInterestForm';

export default async function CreateInterestPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return <CreateInterestForm userId={session.user.id} />;
}