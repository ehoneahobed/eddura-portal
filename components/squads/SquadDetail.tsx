'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSquad, useSquadProgress } from '@/hooks/use-squads';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Calendar,
  MapPin,
  BookOpen,
  Settings,
  Plus,
  UserPlus,
  Share2,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface SquadDetailProps {
  squadId: string;
}

export default function SquadDetail({ squadId }: SquadDetailProps) {
  const { data: session } = useSession();
  const { squad, isLoading, refetch } = useSquad(squadId);
  const { progressSummary } = useSquadProgress(squadId);
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading squad details...</p>
        </div>
      </div>
    );
  }

  if (!squad) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Squad not found</h2>
          <p className="text-muted-foreground">The squad you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  const isMember = squad.memberIds.some(member => member._id === session?.user?.id);
  const isCreator = squad.creatorId._id === session?.user?.id;

  const getActivityColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return '🌍';
      case 'private': return '🔒';
      case 'invite_only': return '📧';
      default: return '👥';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">{squad.name}</h1>
            <Badge variant={squad.squadType === 'primary' ? 'default' : 'secondary'}>
              {squad.squadType}
            </Badge>
            <span className="text-lg">{getVisibilityIcon(squad.visibility)}</span>
          </div>
          <p className="text-muted-foreground text-lg">{squad.description}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {isCreator && (
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Edit Squad
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{squad.memberCount}/{squad.maxMembers}</div>
            <p className="text-xs text-muted-foreground">
              {squad.memberCount === squad.maxMembers ? 'Full squad' : 'Spots available'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{squad.goals.length}</div>
            <p className="text-xs text-muted-foreground">
              {progressSummary?.onTrackGoals || 0} on track
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{squad.completionPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {progressSummary?.completedGoals || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
            <Badge className={getActivityColor(squad.activityLevel)}>
              {squad.activityLevel}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{squad.averageActivityScore}%</div>
            <p className="text-xs text-muted-foreground">
              Average member activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Squad Info */}
            <Card>
              <CardHeader>
                <CardTitle>Squad Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span>
                    <p className="capitalize">{squad.formationType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="font-medium">Visibility:</span>
                    <p className="capitalize">{squad.visibility.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>
                    <p>{new Date(squad.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>
                    <p>{new Date(squad.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {squad.academicLevel && squad.academicLevel.length > 0 && (
                  <div>
                    <span className="font-medium text-sm">Academic Levels:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {squad.academicLevel.map((level, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {squad.fieldOfStudy && squad.fieldOfStudy.length > 0 && (
                  <div>
                    <span className="font-medium text-sm">Fields of Study:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {squad.fieldOfStudy.map((field, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Squad progress updated</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New member joined</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Goal deadline approaching</p>
                      <p className="text-xs text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          {squad.goals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No goals set</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Set goals for your squad to track progress and motivate members
                </p>
                {isCreator && (
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Goal
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {squad.goals.map((goal, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="capitalize">{goal.type.replace('_', ' ')}</CardTitle>
                        <CardDescription>
                          Target: {goal.target} • Due: {new Date(goal.endDate).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {goal.isOnTrack ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                        <Badge variant={goal.isOnTrack ? 'default' : 'secondary'}>
                          {goal.progressPercentage}%
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{goal.currentProgress} / {goal.target}</span>
                        </div>
                        <Progress value={goal.progressPercentage} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Days Remaining:</span>
                          <p>{goal.daysRemaining}</p>
                        </div>
                        <div>
                          <span className="font-medium">Timeframe:</span>
                          <p className="capitalize">{goal.timeframe}</p>
                        </div>
                      </div>

                      {goal.memberProgress.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Member Progress</h4>
                          <div className="space-y-2">
                            {goal.memberProgress.map((member, memberIndex) => (
                              <div key={memberIndex} className="flex items-center justify-between text-xs">
                                <span>{member.userId}</span>
                                <div className="flex items-center gap-2">
                                  <span>{member.percentage}%</span>
                                  {member.needsHelp && (
                                    <AlertCircle className="h-3 w-3 text-red-500" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Squad Members</h3>
            {isCreator && (
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {squad.memberIds.map((member) => (
              <Card key={member._id}>
                <CardContent className="flex items-center gap-3 p-4">
                  <Avatar>
                    <AvatarImage src={member.profilePicture} />
                    <AvatarFallback>
                      {member.firstName[0]}{member.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{member.firstName} {member.lastName}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    {member.platformStats && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {member.platformStats.documentsCreated} docs
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {member.platformStats.applicationsStarted} apps
                        </span>
                      </div>
                    )}
                  </div>
                  {member._id === squad.creatorId._id && (
                    <Badge variant="outline" className="text-xs">Creator</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Squad Activity</CardTitle>
              <CardDescription>
                Track overall squad performance and member engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{squad.totalApplications}</div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{squad.totalDocuments}</div>
                  <p className="text-sm text-muted-foreground">Documents</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{squad.totalReviews}</div>
                  <p className="text-sm text-muted-foreground">Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}