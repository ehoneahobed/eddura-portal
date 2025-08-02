import { Metadata } from 'next';
import SquadDetail from '@/components/squads/SquadDetail';

export const metadata: Metadata = {
  title: 'Squad Details - Eddura',
  description: 'View squad details, progress, and member information for your collaborative group.',
  keywords: 'squad details, progress tracking, member information, collaborative groups, Eddura',
};

interface SquadPageProps {
  params: Promise<{ id: string }>;
}

export default async function SquadPage({ params }: SquadPageProps) {
  const { id } = await params;
  
  return <SquadDetail squadId={id} />;
}