import { Metadata } from 'next';
import SquadDetail from '@/components/squads/SquadDetail';

export const metadata: Metadata = {
  title: 'Squad Details - Eddura',
  description: 'View detailed information about your squad, progress, and member activities.',
  keywords: 'squad details, progress tracking, member activities, Eddura',
};

interface SquadPageProps {
  params: Promise<{ id: string }>;
}

export default async function SquadDetailPage({ params }: SquadPageProps) {
  const { id } = await params;
  return <SquadDetail squadId={id} />;
}