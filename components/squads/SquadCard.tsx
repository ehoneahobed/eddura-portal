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
import { mutate } from 'swr';
import { ModernCard } from '@/components/ui/modern-card';
import { usePageTranslation } from '@/hooks/useTranslation';

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
  const { t } = usePageTranslation('squads');
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const isMember = squad.memberIds.some(member => (member._id as any) === session?.user?.id);
  const isCreator = (squad.creatorId._id as any) === session?.user?.id;

  const handleJoin = async () => {
    if (!session) return;
    
    setIsJoining(true);
    try {
      await joinSquad(squad._id as any);
      // Refresh squad data
      await mutate(`/api/squads/${squad._id as any}`);
      await mutate('/api/squads');
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
      await leaveSquad(squad._id as any);
      // Refresh squad data
      await mutate(`/api/squads/${squad._id as any}`);
      await mutate('/api/squads');
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
    <ModernCard 
      variant="elevated" 
      hover="lift" 
      className="group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-eddura-500 to-eddura-600"></div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg text-eddura-900 dark:text-eddura-100">{squad.name}</CardTitle>
              <Badge variant={squad.squadType === 'primary' ? 'default' : 'secondary'}>
                {squad.squadType}
              </Badge>
              <span className="text-lg">{getVisibilityIcon(squad.visibility)}</span>
            </div>
            <CardDescription className="line-clamp-2 text-eddura-700 dark:text-eddura-300">
              {squad.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-6 pt-0">
        <div className="grid grid-cols-2 gap-4 text-sm text-eddura-700 dark:text-eddura-300">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-eddura-500" />
            <span>{t('card.members', { count: squad.memberCount, max: squad.maxMembers })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-accent" />
            <span>{t('card.goals', { count: squad.goals.length })}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span>{t('card.complete', { percent: squad.completionPercentage })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getActivityColor(squad.activityLevel)}>
              {t('card.activity', { level: squad.activityLevel })}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-eddura-800 dark:text-eddura-100">{t('card.overallProgress')}</span>
            <span className="font-medium">{squad.completionPercentage}%</span>
          </div>
          <Progress value={squad.completionPercentage} className="h-2" />
        </div>

        {squad.goals.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-eddura-800 dark:text-eddura-100">{t('card.activeGoals')}</h4>
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
                  {t('card.moreGoals', { count: squad.goals.length - 2 })}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-eddura-800 dark:text-eddura-100">{t('card.membersTitle')}</h4>
          <div className="flex items-center gap-1">
            {squad.memberIds.slice(0, 3).map((member, index) => (
              <Avatar key={member._id as any} className="h-6 w-6">
                <AvatarImage src={member.profilePicture} />
                <AvatarFallback className="text-xs">
                  {member.firstName[0]}{member.lastName[0]}
                </AvatarFallback>
              </Avatar>
            ))}
            {squad.memberIds.length > 3 && (
              <div className="text-xs text-muted-foreground">
                {t('card.moreMembers', { count: squad.memberIds.length - 3 })}
              </div>
            )}
          </div>
        </div>

        {squad.formationType !== 'general' && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {squad.formationType === 'academic_level' && <BookOpen className="h-3 w-3" />}
            {squad.formationType === 'geographic' && <MapPin className="h-3 w-3" />}
            <span className="capitalize">{squad.formationType.replace('_', ' ')}</span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <Link href={`/squads/${squad._id as any}`}>
            <Button variant="outline" size="sm" className="flex-1">
              {t('card.viewDetails')}
            </Button>
          </Link>
          
          {showJoinButton && !isMember && (
            <Button 
              size="sm" 
              onClick={handleJoin}
              disabled={isJoining}
              className="flex-1 bg-eddura-500 hover:bg-eddura-600"
            >
              {isJoining ? t('actions.joining') : t('actions.joinSquad')}
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
              {isLeaving ? t('actions.leaving') : t('actions.leaveSquad')}
            </Button>
          )}
        </div>
      </CardContent>
    </ModernCard>
  );
}