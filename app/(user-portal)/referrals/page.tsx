import { Metadata } from 'next';
import ReferralDashboard from '@/components/referrals/ReferralDashboard';

export const metadata: Metadata = {
  title: 'Referral Program - Eddura',
  description: 'Invite friends to join Eddura and earn tokens together. Track your referral statistics and rewards.',
  keywords: 'referrals, referral program, tokens, rewards, invite friends, Eddura',
};

export default function ReferralsPage() {
  return <ReferralDashboard />;
}