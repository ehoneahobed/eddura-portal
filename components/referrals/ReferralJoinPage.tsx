'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Gift, 
  Users, 
  TrendingUp, 
  CheckCircle,
  Star,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface ReferralInfo {
  code: string;
  referrerName: string;
  referrerEmail: string;
  referrerProfilePicture?: string;
  referrerReward: number;
  referredReward: number;
  isValid: boolean;
}

interface ReferralJoinPageProps {
  referralCode: string;
}

export default function ReferralJoinPage({ referralCode }: ReferralJoinPageProps) {
  const { data: session } = useSession();
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    validateReferralCode();
  }, [referralCode]);

  const validateReferralCode = async () => {
    setIsValidating(true);
    try {
      const response = await fetch(`/api/referrals/validate?code=${referralCode}`);
      const data = await response.json();

      if (response.ok) {
        setReferralInfo(data.referral);
      } else {
        setReferralInfo({
          code: referralCode,
          referrerName: 'Unknown',
          referrerEmail: '',
          referrerReward: 50,
          referredReward: 25,
          isValid: false
        });
      }
    } catch (error) {
      setReferralInfo({
        code: referralCode,
        referrerName: 'Unknown',
        referrerEmail: '',
        referrerReward: 50,
        referredReward: 25,
        isValid: false
      });
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  };

  const handleSignup = () => {
    // Store referral code in session storage for signup process
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('referralCode', referralCode);
    }
    
    // Redirect to signup page
    window.location.href = '/auth/signup';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Validating referral code...</p>
        </div>
      </div>
    );
  }

  if (!referralInfo?.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl">Invalid Referral Code</CardTitle>
            <CardDescription>
              The referral code "{referralCode}" is not valid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                You can still join Eddura without a referral code and start earning tokens through activities.
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/signup">
                  Join Eddura
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome to Eddura!
            </h1>
            <p className="text-xl text-gray-600">
              You've been invited by a friend to join the platform
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Referral Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-green-600" />
                  Referral Bonus
                </CardTitle>
                <CardDescription>
                  You'll receive bonus tokens when you join using this referral code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Referrer Info */}
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={referralInfo.referrerProfilePicture} />
                    <AvatarFallback>
                      {referralInfo.referrerName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{referralInfo.referrerName}</p>
                    <p className="text-sm text-muted-foreground">invited you to join</p>
                  </div>
                </div>

                {/* Referral Code */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Referral Code:</p>
                  <Badge variant="secondary" className="font-mono text-lg px-4 py-2">
                    {referralInfo.code}
                  </Badge>
                </div>

                {/* Rewards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      +{referralInfo.referredReward}
                    </div>
                    <p className="text-sm text-muted-foreground">Tokens for you</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      +{referralInfo.referrerReward}
                    </div>
                    <p className="text-sm text-muted-foreground">Tokens for {referralInfo.referrerName.split(' ')[0]}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Why Join Eddura?</CardTitle>
                <CardDescription>
                  Discover the benefits of joining our academic platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Collaborative Squads</h4>
                      <p className="text-sm text-muted-foreground">
                        Join study groups and collaborate with peers on applications
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Gift className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Earn Tokens</h4>
                      <p className="text-sm text-muted-foreground">
                        Complete activities and earn tokens for rewards
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Track Progress</h4>
                      <p className="text-sm text-muted-foreground">
                        Monitor your application progress and achievements
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Achievement System</h4>
                      <p className="text-sm text-muted-foreground">
                        Unlock achievements and compete on leaderboards
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-4">
                  <Button onClick={handleSignup} className="w-full" size="lg">
                    Join with Referral Bonus
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    By joining, you'll automatically receive {referralInfo.referredReward} bonus tokens
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>How the Referral Program Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <h4 className="font-medium mb-1">Sign Up</h4>
                  <p className="text-sm text-muted-foreground">
                    Create your account using this referral code
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <h4 className="font-medium mb-1">Get Bonus</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive {referralInfo.referredReward} tokens immediately
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <h4 className="font-medium mb-1">Start Earning</h4>
                  <p className="text-sm text-muted-foreground">
                    Complete activities to earn more tokens
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}