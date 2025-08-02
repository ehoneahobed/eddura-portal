import { Metadata } from 'next';
import SquadsDashboard from '@/components/squads/SquadsDashboard';

export const metadata: Metadata = {
  title: 'Eddura Squads - Eddura',
  description: 'Join collaborative squads to support your application journey with peer accountability and progress tracking.',
  keywords: 'squads, collaboration, peer support, application buddies, progress tracking, Eddura',
};

export default function SquadsPage() {
  return <SquadsDashboard />;
}