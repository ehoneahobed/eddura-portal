import { Metadata } from 'next';
import GlobalLeaderboard from '@/components/leaderboards/GlobalLeaderboard';

export const metadata: Metadata = {
  title: 'Global Leaderboard - Eddura',
  description: 'See how you rank against other users on the platform. Compete in tokens, activity, referrals, and achievements.',
  keywords: 'leaderboard, rankings, competition, tokens, activity, referrals, achievements, Eddura',
};

export default function LeaderboardPage() {
  return <GlobalLeaderboard />;
}