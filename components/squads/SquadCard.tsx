'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Calendar,
  MapPin,
  BookOpen
} from 'lucide-react';
import { joinSquad, leaveSquad } from '@/hooks/use-squads';

interface SquadCardProps {
  squad: {
    _id: string;
    name: string;
    description: string;
    maxMembers: number;
    visibility: 'public' | 'private' | 'invite_only';
    formationType: 'general' | 'academic_level' | 'field_of_study' | 'geographic' | 'activity_based';
    academicLevel?: string[];
    fieldOfStudy?: string[];
    geographicRegion?: string[];
    goals: Array<{
      type: string;
      target: number;
      currentProgress: number;
      progressPercentage: number;
      daysRemaining: number;
      isOnTrack: boolean;
      memberProgress: Array<{
        userId: string;
        progress: number;
        percentage: number;
        needsHelp: boolean;
        isOnTrack: boolean;
      }>;
    }>;
    squadType: 'primary' | 'secondary';
    creatorId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      profilePicture?: string;
    };
    memberIds: Array<{
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      profilePicture?: string;
    }>;
    totalApplications: number;
    totalDocuments: number;
    totalReviews: number;
    averageActivityScore: number;
    memberCount: number;
    activityLevel: 'high' | 'medium' | 'low';
    completionPercentage: number;
    createdAt: string;
  };
  showJoinButton?: boolean;
}

export default function SquadCard({ squad, showJoinButton = false }: SquadCardProps) {
  const { data: session } = useSession();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const isMember = squad.memberIds.some(member => member._id === session?.user?.id);
  const isCreator = squad.creatorId._id === session?.user?.id;

  const handleJoin = async () => {
    if (!session) return;
    
    setIsJoining(true);
    try {
      await joinSquad(squad._id);
    } catch (error) {
      console.error('Failed to join squad:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!session) return;
    
    setIsLeaving(true);
    try {
      await leaveSquad(squad._id);
    } catch (error) {
      console.error('Failed to leave squad:', error);
    } finally {
      setIsLeaving(false);
    }
  };

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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{squad.name}</CardTitle>
              <Badge variant={squad.squadType === 'primary' ? 'default' : 'secondary'}>
                {squad.squadType}
              </Badge>
              <span className="text-lg">{getVisibilityIcon(squad.visibility)}</span>
            </div>
            <CardDescription className="line-clamp-2">
              {squad.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Squad Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{squad.memberCount}/{squad.maxMembers} members</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span>{squad.goals.length} goals</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span>{squad.completionPercentage}% complete</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getActivityColor(squad.activityLevel)}>
              {squad.activityLevel} activity
            </Badge>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{squad.completionPercentage}%</span>
          </div>
          <Progress value={squad.completionPercentage} className="h-2" />
        </div>

        {/* Goals Summary */}
        {squad.goals.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Active Goals</h4>
            <div className="space-y-1">
              {squad.goals.slice(0, 2).map((goal, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="capitalize">{goal.type.replace('_', ' ')}</span>
                  <div className="flex items-center gap-1">
                    <span>{goal.progressPercentage}%</span>
                    {goal.isOnTrack ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-yellow-500" />
                    )}
                  </div>
                </div>
              ))}
              {squad.goals.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{squad.goals.length - 2} more goals
                </div>
              )}
            </div>
          </div>
        )}

        {/* Members Preview */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Members</h4>
          <div className="flex items-center gap-1">
            {squad.memberIds.slice(0, 3).map((member, index) => (
              <Avatar key={member._id} className="h-6 w-6">
                <AvatarImage src={member.profilePicture} />
                <AvatarFallback className="text-xs">
                  {member.firstName[0]}{member.lastName[0]}
                </AvatarFallback>
              </Avatar>
            ))}
            {squad.memberIds.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{squad.memberIds.length - 3} more
              </div>
            )}
          </div>
        </div>

        {/* Formation Info */}
        {squad.formationType !== 'general' && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {squad.formationType === 'academic_level' && <BookOpen className="h-3 w-3" />}
            {squad.formationType === 'geographic' && <MapPin className="h-3 w-3" />}
            <span className="capitalize">{squad.formationType.replace('_', ' ')}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Link href={`/squads/${squad._id}`}>
            <Button variant="outline" size="sm" className="flex-1">
              View Details
            </Button>
          </Link>
          
          {showJoinButton && !isMember && (
            <Button 
              size="sm" 
              onClick={handleJoin}
              disabled={isJoining}
              className="flex-1"
            >
              {isJoining ? 'Joining...' : 'Join Squad'}
            </Button>
          )}
          
          {isMember && !isCreator && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLeave}
              disabled={isLeaving}
              className="flex-1"
            >
              {isLeaving ? 'Leaving...' : 'Leave Squad'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}