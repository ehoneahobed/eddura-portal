'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Share2, 
  Users, 
  TrendingUp, 
  Gift, 
  Copy, 
  CheckCircle,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  totalRewardsEarned: number;
  totalClicks: number;
  conversionRate: string;
}

interface RecentReferral {
  _id: string;
  referralCode: string;
  referralLink: string;
  isUsed: boolean;
  usedAt?: string;
  clicks: number;
  referrerReward: number;
  referredReward: number;
  createdAt: string;
}

interface ReferralDashboardProps {
  userReferralCode?: string;
  userReferralStats?: {
    totalReferrals: number;
    successfulReferrals: number;
    totalRewardsEarned: number;
    lastReferralAt?: string;
  };
}

export default function ReferralDashboard({ userReferralCode, userReferralStats }: ReferralDashboardProps) {
  const { data: session } = useSession();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [recentReferrals, setRecentReferrals] = useState<RecentReferral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchReferralStats();
    }
  }, [session]);

  const fetchReferralStats = async () => {
    try {
      const response = await fetch('/api/referrals/stats');
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats || {
          totalReferrals: 0,
          successfulReferrals: 0,
          totalRewardsEarned: 0,
          totalClicks: 0,
          conversionRate: '0'
        });
        setRecentReferrals(data.recentReferrals || []);
      } else {
        toast.error(data.error || 'Failed to load referral statistics');
        setStats({
          totalReferrals: 0,
          successfulReferrals: 0,
          totalRewardsEarned: 0,
          totalClicks: 0,
          conversionRate: '0'
        });
        setRecentReferrals([]);
      }
    } catch (error) {
      toast.error('Failed to load referral statistics');
      setStats({
        totalReferrals: 0,
        successfulReferrals: 0,
        totalRewardsEarned: 0,
        totalClicks: 0,
        conversionRate: '0'
      });
      setRecentReferrals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createReferralLink = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/referrals/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Referral link created successfully! Code: ${data.referral.code}`);
        // Copy the referral link to clipboard
        const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/join/${data.referral.code}`;
        await navigator.clipboard.writeText(referralLink);
        toast.success('Referral link copied to clipboard!');
        fetchReferralStats(); // Refresh stats
      } else {
        toast.error(data.error || 'Failed to create referral link');
      }
    } catch (error) {
      toast.error('Failed to create referral link');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(label);
      toast.success(`${label} copied to clipboard!`);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const shareReferralLink = async () => {
    if (!userReferralCode) return;

    const shareText = `Join me on Eddura! Use my referral code: ${userReferralCode}\n\nGet started with your academic journey and earn rewards together!`;
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/join/${userReferralCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Eddura with my referral code',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying
      copyToClipboard(shareUrl, 'Referral link');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading referral statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Referral Program</h1>
          <p className="text-muted-foreground">
            Invite friends to join Eddura and earn tokens together
          </p>
        </div>
        <Button onClick={shareReferralLink} disabled={!userReferralCode}>
          <Share2 className="w-4 h-4 mr-2" />
          Share Referral Link
        </Button>
      </div>

      {/* Your Referral Code */}
      {userReferralCode && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Your Referral Code
            </CardTitle>
            <CardDescription>
              Share this code with friends to earn tokens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-2xl font-mono font-bold text-primary">
                  {userReferralCode}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Referral link: {process.env.NEXT_PUBLIC_APP_URL}/join/{userReferralCode}
                </p>
              </div>
              <Button
                onClick={() => copyToClipboard(`${process.env.NEXT_PUBLIC_APP_URL}/join/${userReferralCode}`, 'Referral link')}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReferrals || 0}</div>
            <p className="text-xs text-muted-foreground">
              Links created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Referrals</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.successfulReferrals || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.conversionRate || 0}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRewardsEarned || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tokens earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalClicks || 0}</div>
            <p className="text-xs text-muted-foreground">
              Link clicks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Code</CardTitle>
          <CardDescription>
            Share this code with friends to earn tokens when they join
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userReferralCode ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="font-medium">Referral Code:</Label>
                <Badge variant="secondary" className="font-mono text-lg px-3 py-1">
                  {userReferralCode}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(userReferralCode, 'Referral code')}
                >
                  {copiedLink === 'Referral code' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Referral Link:</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={`${process.env.NEXT_PUBLIC_APP_URL}/join/${userReferralCode}`}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`${process.env.NEXT_PUBLIC_APP_URL}/join/${userReferralCode}`, 'Referral link')}
                  >
                    {copiedLink === 'Referral link' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`${process.env.NEXT_PUBLIC_APP_URL}/join/${userReferralCode}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">You earn:</span>
                  <div className="text-lg font-bold text-green-600">50 tokens</div>
                  <span className="text-muted-foreground">per successful referral</span>
                </div>
                <div>
                  <span className="font-medium">Friend earns:</span>
                  <div className="text-lg font-bold text-blue-600">25 tokens</div>
                  <span className="text-muted-foreground">when they join</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Create your first referral link to start earning tokens
              </p>
              <Button onClick={createReferralLink} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Referral Link'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      {recentReferrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Referrals
            </CardTitle>
            <CardDescription>
              Track your recent referral activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReferrals.map((referral) => (
                <div key={referral._id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="text-lg">
                      {referral.isUsed ? '✅' : '⏳'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        Code: {referral.referralCode}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {referral.isUsed 
                          ? `Used on ${new Date(referral.usedAt!).toLocaleDateString()}`
                          : `Created on ${new Date(referral.createdAt).toLocaleDateString()}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {referral.isUsed ? '+50 tokens' : 'Pending'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {referral.clicks} clicks
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`${process.env.NEXT_PUBLIC_APP_URL}/join/${referral.referralCode}`, 'Referral link')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How the Referral Program Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">1</span>
              </div>
              <h4 className="font-medium mb-1">Share Your Code</h4>
              <p className="text-sm text-muted-foreground">
                Share your unique referral code with friends
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">2</span>
              </div>
              <h4 className="font-medium mb-1">Friends Join</h4>
              <p className="text-sm text-muted-foreground">
                They use your code when signing up
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">3</span>
              </div>
              <h4 className="font-medium mb-1">Both Earn Tokens</h4>
              <p className="text-sm text-muted-foreground">
                You get 50 tokens, they get 25 tokens
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}