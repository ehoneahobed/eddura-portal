import { Metadata } from 'next';
import SquadDetail from '@/components/squads/SquadDetail';

export const metadata: Metadata = {
  title: 'Squad Details - Eddura',
  description: 'View detailed information about your squad, progress, and member activities.',
  keywords: 'squad details, progress tracking, member activities, Eddura',
};

export default function SquadDetailPage({ params }: { params: { id: string } }) {
  return <SquadDetail squadId={params.id} />;
}