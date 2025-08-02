'use client';

import { useState } from 'react';
import { Trophy, Medal, Award, Users, TrendingUp, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SquadMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  platformStats?: {
    documentsCreated: number;
    applicationsStarted: number;
    peerReviewsProvided: number;
    daysActive: number;
    lastActive: string;
  };
}

interface SquadGoal {
  type: string;
  target: number;
  currentProgress: number;
  progressPercentage: number;
  memberProgress: Array<{
    userId: string;
    progress: number;
    percentage: number;
    lastActivity: string;
    needsHelp: boolean;
    isOnTrack: boolean;
  }>;
}

interface SquadLeaderboardProps {
  squad: {
    _id: string;
    name: string;
    memberIds: SquadMember[];
    goals: SquadGoal[];
    totalApplications: number;
    totalDocuments: number;
    totalReviews: number;
    averageActivityScore: number;
  };
}

export default function SquadLeaderboard({ squad }: SquadLeaderboardProps) {
  const [activeTab, setActiveTab] = useState('overall');

  const getMemberStats = (member: SquadMember) => {
    const stats = member.platformStats || {
      documentsCreated: 0,
      applicationsStarted: 0,
      peerReviewsProvided: 0,
      daysActive: 0
    };

    return {
      ...stats,
      totalScore: stats.documentsCreated * 10 + stats.applicationsStarted * 15 + stats.peerReviewsProvided * 20 + stats.daysActive * 5
    };
  };

  const getGoalProgress = (memberId: string, goalType: string) => {
    const goal = squad.goals.find(g => g.type === goalType);
    if (!goal) return { progress: 0, percentage: 0 };

    const memberProgress = goal.memberProgress.find(mp => mp.userId === memberId);
    return memberProgress || { progress: 0, percentage: 0 };
  };

  const sortedMembers = [...squad.memberIds].sort((a, b) => {
    const statsA = getMemberStats(a);
    const statsB = getMemberStats(b);
    return statsB.totalScore - statsA.totalScore;
  });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>;
    }
  };

  const getActivityLevel = (score: number) => {
    if (score >= 80) return { level: 'High', color: 'bg-green-100 text-green-800' };
    if (score >= 50) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'Low', color: 'bg-red-100 text-red-800' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Squad Leaderboard
        </CardTitle>
        <CardDescription>
          Track member performance and achievements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="contributions">Contributions</TabsTrigger>
          </TabsList>

          <TabsContent value="overall" className="space-y-4">
            <div className="space-y-3">
              {sortedMembers.map((member, index) => {
                const stats = getMemberStats(member);
                return (
                  <div key={member._id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      {getRankIcon(index)}
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.profilePicture} />
                        <AvatarFallback>
                          {member.firstName[0]}{member.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {stats.totalScore} points
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
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {squad.goals.map((goal) => (
                <Card key={goal.type}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm capitalize">
                      {goal.type.replace('_', ' ')} Goal
                    </CardTitle>
                    <CardDescription>
                      {goal.currentProgress}/{goal.target} ({goal.progressPercentage}%)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {goal.memberProgress
                        .sort((a, b) => b.percentage - a.percentage)
                        .map((progress, index) => {
                          const member = squad.memberIds.find(m => m._id === progress.userId);
                          if (!member) return null;

                          return (
                            <div key={progress.userId} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getRankIcon(index)}
                                <span className="text-sm">
                                  {member.firstName} {member.lastName}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-medium">
                                  {progress.percentage}%
                                </span>
                                {progress.needsHelp && (
                                  <Badge variant="destructive" className="ml-2 text-xs">
                                    Needs Help
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="space-y-3">
              {squad.memberIds
                .sort((a, b) => {
                  const statsA = getMemberStats(a);
                  const statsB = getMemberStats(b);
                  return statsB.daysActive - statsA.daysActive;
                })
                .map((member, index) => {
                  const stats = getMemberStats(member);
                  const activityLevel = getActivityLevel(stats.daysActive);
                  
                  return (
                    <div key={member._id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        {getRankIcon(index)}
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.profilePicture} />
                          <AvatarFallback>
                            {member.firstName[0]}{member.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {stats.daysActive} active days
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={activityLevel.color}>
                              {activityLevel.level}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </TabsContent>

          <TabsContent value="contributions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Documents Created
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {squad.memberIds
                      .sort((a, b) => {
                        const statsA = getMemberStats(a);
                        const statsB = getMemberStats(b);
                        return statsB.documentsCreated - statsA.documentsCreated;
                      })
                      .slice(0, 5)
                      .map((member, index) => {
                        const stats = getMemberStats(member);
                        return (
                          <div key={member._id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getRankIcon(index)}
                              <span className="text-sm">
                                {member.firstName} {member.lastName}
                              </span>
                            </div>
                            <span className="text-sm font-medium">
                              {stats.documentsCreated}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Applications Started
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {squad.memberIds
                      .sort((a, b) => {
                        const statsA = getMemberStats(a);
                        const statsB = getMemberStats(b);
                        return statsB.applicationsStarted - statsA.applicationsStarted;
                      })
                      .slice(0, 5)
                      .map((member, index) => {
                        const stats = getMemberStats(member);
                        return (
                          <div key={member._id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getRankIcon(index)}
                              <span className="text-sm">
                                {member.firstName} {member.lastName}
                              </span>
                            </div>
                            <span className="text-sm font-medium">
                              {stats.applicationsStarted}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Peer Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {squad.memberIds
                      .sort((a, b) => {
                        const statsA = getMemberStats(a);
                        const statsB = getMemberStats(b);
                        return statsB.peerReviewsProvided - statsA.peerReviewsProvided;
                      })
                      .slice(0, 5)
                      .map((member, index) => {
                        const stats = getMemberStats(member);
                        return (
                          <div key={member._id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getRankIcon(index)}
                              <span className="text-sm">
                                {member.firstName} {member.lastName}
                              </span>
                            </div>
                            <span className="text-sm font-medium">
                              {stats.peerReviewsProvided}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}