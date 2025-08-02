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
  UserPlus
} from 'lucide-react';
import SquadLeaderboard from './SquadLeaderboard';
import InviteMemberModal from './InviteMemberModal';
import ManageSquadModal from './ManageSquadModal';
import SquadGoalsModal from './SquadGoalsModal';
import { toast } from 'sonner';

interface SquadDetailProps {
  squadId: string;
}

export default function SquadDetail({ squadId }: SquadDetailProps) {
  const { data: session } = useSession();
  const { squad, isLoading, error } = useSquad(squadId);
  const { squad: squadWithProgress, progressSummary } = useSquadProgress(squadId);
  const [activeTab, setActiveTab] = useState('overview');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);

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

  if (error || !squad) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Squad not found</h2>
          <p className="text-muted-foreground">The squad you're looking for doesn't exist or you don't have access.</p>
        </div>
      </div>
    );
  }

  const isMember = squad.memberIds.some((member: any) => (member._id as any) === session?.user?.id);
  const isCreator = (squad.creatorId._id as any) === session?.user?.id;

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
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">{squad.name}</h1>
            <Badge variant={squad.squadType === 'primary' ? 'default' : 'secondary'}>
              {squad.squadType}
            </Badge>
            <span className="text-lg">{getVisibilityIcon(squad.visibility)}</span>
          </div>
          <p className="text-muted-foreground">{squad.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {isCreator && (
            <Button variant="outline" size="sm" onClick={() => setShowManageModal(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Manage Squad
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowGoalsModal(true)}>
            <Target className="w-4 h-4 mr-2" />
            Manage Goals
          </Button>
          {!isMember && squad.visibility !== 'private' && (
            <Button size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Join Squad
            </Button>
          )}
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
            <div className="text-2xl font-bold">{squad.memberCount}</div>
            <p className="text-xs text-muted-foreground">
              {squad.memberCount}/{squad.maxMembers} capacity
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
              Overall completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge className={getActivityColor(squad.activityLevel)}>
                {squad.activityLevel}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {squad.averageActivityScore}% active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Squad Info */}
          <Card>
            <CardHeader>
              <CardTitle>Squad Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Formation Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>Type: {squad.formationType.replace('_', ' ')}</span>
                    </div>
                    {squad.academicLevel && squad.academicLevel.length > 0 && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Levels: {squad.academicLevel.join(', ')}</span>
                      </div>
                    )}
                    {squad.fieldOfStudy && squad.fieldOfStudy.length > 0 && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>Fields: {squad.fieldOfStudy.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Activity Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div>Total Applications: {squad.totalApplications}</div>
                    <div>Total Documents: {squad.totalDocuments}</div>
                    <div>Total Reviews: {squad.totalReviews}</div>
                    <div>Average Activity: {squad.averageActivityScore}%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {squad.goals.map((goal: any) => (
                  <div key={goal.type} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="text-lg">
                        {goal.type === 'applications_started' && '📝'}
                        {goal.type === 'documents_created' && '📄'}
                        {goal.type === 'peer_reviews_provided' && '👥'}
                        {goal.type === 'days_active' && '📅'}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{goal.type.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {goal.currentProgress}/{goal.target} completed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{goal.progressPercentage}%</div>
                      <div className="text-xs text-muted-foreground">
                        {goal.daysRemaining} days left
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {squad.goals.map((goal: any) => (
              <Card key={goal.type}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {goal.type.replace('_', ' ').replace(/\b\w/g, (l: any) => l.toUpperCase())}
                  </CardTitle>
                  <CardDescription>
                    {goal.description || `Complete ${goal.target} ${goal.type.replace('_', ' ')}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{goal.progressPercentage}%</span>
                    </div>
                    <Progress value={goal.progressPercentage} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{goal.currentProgress}/{goal.target}</span>
                      <span>{goal.daysRemaining} days remaining</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Member Progress</h4>
                    <div className="space-y-1">
                      {goal.memberProgress.map((memberProgress: any) => {
                        const member = squad.memberIds.find((m: any) => (m._id as any) === memberProgress.userId);
                        if (!member) return null;

                        return (
                          <div key={memberProgress.userId} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={member.profilePicture} />
                                <AvatarFallback className="text-xs">
                                  {member.firstName[0]}{member.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span>{member.firstName} {member.lastName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{memberProgress.percentage}%</span>
                              {memberProgress.needsHelp && (
                                <Badge variant="destructive" className="text-xs">
                                  Needs Help
                                </Badge>
                              )}
                              {memberProgress.isOnTrack && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Squad Members</span>
                {isCreator && (
                  <Button size="sm" onClick={() => setShowInviteModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Invite Member
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {squad.memberIds.map((member: any) => (
                  <div key={member._id as any} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.profilePicture} />
                        <AvatarFallback>
                          {member.firstName[0]}{member.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        {(member._id as any) === (squad.creatorId._id as any) && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Creator
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        {member.platformStats?.daysActive || 0} active days
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last active: {member.platformStats?.lastActive ? 
                          new Date(member.platformStats.lastActive).toLocaleDateString() : 
                          'Never'
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <SquadLeaderboard squad={squad} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        squadId={squadId}
        squadName={squad?.name || ''}
      />
      
      <ManageSquadModal
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
        squad={squad}
        onUpdate={() => {
          // Refresh the squad data
          window.location.reload();
        }}
      />
      
      <SquadGoalsModal
        isOpen={showGoalsModal}
        onClose={() => setShowGoalsModal(false)}
        squadId={squadId}
        squadName={squad?.name || ''}
        isCreator={isCreator}
      />
    </div>
  );
}