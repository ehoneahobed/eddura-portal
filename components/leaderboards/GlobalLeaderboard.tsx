'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Medal, 
  Award, 
  Users, 
  TrendingUp, 
  Target,
  Star,
  Crown
} from 'lucide-react';

interface LeaderboardEntry {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  tokens: number;
  totalTokensEarned: number;
  platformStats: {
    documentsCreated: number;
    applicationsStarted: number;
    peerReviewsProvided: number;
    daysActive: number;
    lastActive: string;
  };
  referralStats: {
    totalReferrals: number;
    successfulReferrals: number;
    totalRewardsEarned: number;
  };
  achievements: Array<{
    name: string;
    category: string;
    points: number;
  }>;
}

interface GlobalLeaderboardProps {
  category?: 'tokens' | 'activity' | 'referrals' | 'achievements';
}

export default function GlobalLeaderboard({ category = 'tokens' }: GlobalLeaderboardProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<string>(category);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, [activeTab]);

  const fetchLeaderboardData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/leaderboard/global?category=${activeTab}`);
      const data = await response.json();

      if (response.ok) {
        setLeaderboardData(data.leaderboard || []);
        setUserRank(data.userRank);
      } else {
        console.error('Failed to fetch leaderboard data:', data.error);
        setLeaderboardData([]);
        setUserRank(null);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error);
      setLeaderboardData([]);
      setUserRank(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'tokens': return 'Token Leaders';
      case 'activity': return 'Most Active';
      case 'referrals': return 'Top Referrers';
      case 'achievements': return 'Achievement Leaders';
      default: return 'Leaderboard';
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'tokens': return 'Users with the most tokens earned';
      case 'activity': return 'Most active users on the platform';
      case 'referrals': return 'Users who referred the most friends';
      case 'achievements': return 'Users with the most achievements';
      default: return 'Platform leaderboard';
    }
  };

  const getScoreValue = (entry: LeaderboardEntry, category: string) => {
    switch (category) {
      case 'tokens':
        return entry.tokens;
      case 'activity':
        return entry.platformStats.documentsCreated * 10 + 
               entry.platformStats.applicationsStarted * 15 + 
               entry.platformStats.peerReviewsProvided * 20 + 
               entry.platformStats.daysActive * 5;
      case 'referrals':
        return entry.referralStats.successfulReferrals;
      case 'achievements':
        return entry.achievements.reduce((sum, achievement) => sum + achievement.points, 0);
      default:
        return 0;
    }
  };

  const getScoreLabel = (category: string) => {
    switch (category) {
      case 'tokens': return 'tokens';
      case 'activity': return 'points';
      case 'referrals': return 'referrals';
      case 'achievements': return 'points';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (leaderboardData.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Leaderboard Data</h3>
          <p className="text-muted-foreground">
            No data available for this category yet. Start earning tokens and completing activities to appear on the leaderboard!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Global Leaderboard</h1>
          <p className="text-muted-foreground">
            See how you rank against other users on the platform
          </p>
        </div>
        {userRank && (
          <Badge variant="secondary" className="text-sm">
            Your Rank: #{userRank}
          </Badge>
        )}
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tokens">
            <Trophy className="h-4 w-4 mr-2" />
            Tokens
          </TabsTrigger>
          <TabsTrigger value="activity">
            <TrendingUp className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="referrals">
            <Users className="h-4 w-4 mr-2" />
            Referrals
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Star className="h-4 w-4 mr-2" />
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Token Leaders
              </CardTitle>
              <CardDescription>
                Users with the most tokens earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboardData.slice(0, 10).map((entry, index) => (
                  <div key={entry._id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      {getRankIcon(index)}
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={entry.profilePicture} />
                        <AvatarFallback>
                          {entry.firstName[0]}{entry.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {entry.firstName} {entry.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {entry.tokens} tokens
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Most Active Users
              </CardTitle>
              <CardDescription>
                Users with the highest activity scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboardData.slice(0, 10).map((entry, index) => {
                  const activityScore = getScoreValue(entry, 'activity');
                  return (
                    <div key={entry._id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        {getRankIcon(index)}
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={entry.profilePicture} />
                          <AvatarFallback>
                            {entry.firstName[0]}{entry.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {entry.firstName} {entry.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {activityScore} activity points
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">
                              #{index + 1}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Referrers
              </CardTitle>
              <CardDescription>
                Users who referred the most friends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboardData.slice(0, 10).map((entry, index) => (
                  <div key={entry._id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      {getRankIcon(index)}
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={entry.profilePicture} />
                        <AvatarFallback>
                          {entry.firstName[0]}{entry.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {entry.firstName} {entry.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {entry.referralStats.successfulReferrals} successful referrals
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Achievement Leaders
              </CardTitle>
              <CardDescription>
                Users with the most achievement points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboardData.slice(0, 10).map((entry, index) => {
                  const achievementPoints = getScoreValue(entry, 'achievements');
                  return (
                    <div key={entry._id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        {getRankIcon(index)}
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={entry.profilePicture} />
                          <AvatarFallback>
                            {entry.firstName[0]}{entry.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {entry.firstName} {entry.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {achievementPoints} achievement points
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">
                              #{index + 1}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* How to Improve */}
      <Card>
        <CardHeader>
          <CardTitle>How to Improve Your Ranking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Earn More Tokens</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Complete achievements</li>
                <li>• Refer friends to the platform</li>
                <li>• Participate in squad activities</li>
                <li>• Create and share documents</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Increase Activity</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Start more applications</li>
                <li>• Create documents regularly</li>
                <li>• Provide peer reviews</li>
                <li>• Stay active daily</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}