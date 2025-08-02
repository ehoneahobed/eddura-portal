'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Users, Target, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { useSquads } from '@/hooks/use-squads';
import Link from 'next/link';

// Define the Squad interface locally to match the hook's interface
interface Squad {
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
    type: 'applications_started' | 'applications_completed' | 'documents_created' | 'peer_reviews_provided' | 'days_active' | 'streak_days' | 'squad_activity';
    target: number;
    timeframe: 'weekly' | 'monthly' | 'quarterly' | 'ongoing';
    startDate: string;
    endDate: string;
    description?: string;
    individualTarget?: number;
    currentProgress: number;
    progressPercentage: number;
    daysRemaining: number;
    isOnTrack: boolean;
    memberProgress: Array<{
      userId: string;
      progress: number;
      target: number;
      percentage: number;
      lastActivity: string;
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
    platformStats?: {
      documentsCreated: number;
      applicationsStarted: number;
      peerReviewsProvided: number;
      daysActive: number;
      lastActive: string;
    };
  }>;
  totalApplications: number;
  totalDocuments: number;
  totalReviews: number;
  averageActivityScore: number;
  memberCount: number;
  activityLevel: 'high' | 'medium' | 'low';
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export default function SquadWidget() {
  const { data: session } = useSession();
  const { squads, isLoading } = useSquads('all');
  const [showAll, setShowAll] = useState(false);

  if (!session) return null;

  const primarySquad = squads.find((squad: Squad) => squad.squadType === 'primary');
  const secondarySquads = squads.filter((squad: Squad) => squad.squadType === 'secondary');
  const displayedSquads = showAll ? squads : squads.slice(0, 2);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Eddura Squads
          </CardTitle>
          <CardDescription>Loading your squads...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (squads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Eddura Squads
          </CardTitle>
          <CardDescription>Join collaborative groups for support</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No squads yet</h3>
            <p className="text-muted-foreground mb-4">
              Join or create your first squad to start collaborating with peers
            </p>
            <Link href="/squads">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Squad
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Eddura Squads
            </CardTitle>
            <CardDescription>
              {squads.length} squad{squads.length !== 1 ? 's' : ''} • {primarySquad ? '1 Primary' : '0 Primary'} • {secondarySquads.length} Secondary
            </CardDescription>
          </div>
          <Link href="/squads">
            <Button variant="ghost" size="sm">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedSquads.map((squad: Squad) => (
            <div key={squad._id} className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Users className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{squad.name}</h4>
                    <Badge variant={squad.squadType === 'primary' ? 'default' : 'secondary'} className="text-xs">
                      {squad.squadType}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{squad.memberCount} members</span>
                    <span>{squad.goals.length} goals</span>
                    <span>{squad.completionPercentage}% complete</span>
                  </div>
                </div>
              </div>
              <Link href={`/squads/${squad._id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ))}

          {squads.length > 2 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `Show ${squads.length - 2} More`}
            </Button>
          )}

          <div className="pt-2 border-t">
            <Link href="/squads">
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create New Squad
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}