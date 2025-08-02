import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReferralJoinPage from '@/components/referrals/ReferralJoinPage';

export const metadata: Metadata = {
  title: 'Join Eddura - Referral',
  description: 'Join Eddura using a referral code and earn bonus tokens. Start your academic journey with friends.',
  keywords: 'join, referral, signup, tokens, bonus, Eddura',
};

interface JoinPageProps {
  params: Promise<{ code: string }>;
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { code } = await params;
  
  if (!code || code.length < 6) {
    notFound();
  }

  return <ReferralJoinPage referralCode={code} />;
}