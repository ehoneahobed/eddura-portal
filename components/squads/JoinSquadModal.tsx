'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  BookOpen,
  Search,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface JoinSquadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SquadPreview {
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
  memberCount: number;
  activityLevel: 'high' | 'medium' | 'low';
  completionPercentage: number;
}

export default function JoinSquadModal({ isOpen, onClose }: JoinSquadModalProps) {
  const { data: session } = useSession();
  const [shortcode, setShortcode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [squadPreview, setSquadPreview] = useState<SquadPreview | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const handleSearch = async () => {
    if (!shortcode.trim()) {
      toast.error('Please enter a shortcode');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/squads/search-by-code?code=${shortcode.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find squad');
      }

      setSquadPreview(data.squad);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to find squad');
      setSquadPreview(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!squadPreview) return;

    setIsJoining(true);
    try {
      const response = await fetch(`/api/squads/${squadPreview._id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: shortcode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join squad');
      }

      toast.success('Successfully joined squad!');
      setShortcode('');
      setSquadPreview(null);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to join squad');
    } finally {
      setIsJoining(false);
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Join Squad with Shortcode
          </DialogTitle>
          <DialogDescription>
            Enter a squad shortcode to join and start collaborating with peers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Shortcode Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shortcode">Squad Shortcode</Label>
              <div className="flex gap-2">
                <Input
                  id="shortcode"
                  placeholder="Enter 6-character code (e.g., ABC123)"
                  value={shortcode}
                  onChange={(e) => setShortcode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="font-mono text-center text-lg tracking-widest"
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading || !shortcode.trim()}
                  size="sm"
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>
          </div>

          {/* Squad Preview */}
          {squadPreview && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{squadPreview.name}</CardTitle>
                      <Badge variant={squadPreview.squadType === 'primary' ? 'default' : 'secondary'}>
                        {squadPreview.squadType}
                      </Badge>
                      <span className="text-lg">{getVisibilityIcon(squadPreview.visibility)}</span>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {squadPreview.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Squad Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{squadPreview.memberCount}/{squadPreview.maxMembers} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>{squadPreview.goals.length} goals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>{squadPreview.completionPercentage}% complete</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getActivityColor(squadPreview.activityLevel)}>
                      {squadPreview.activityLevel} activity
                    </Badge>
                  </div>
                </div>

                {/* Progress Overview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Overall Progress</span>
                    <span className="font-medium">{squadPreview.completionPercentage}%</span>
                  </div>
                  <Progress value={squadPreview.completionPercentage} className="h-2" />
                </div>

                {/* Creator Info */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Created by</h4>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={squadPreview.creatorId.profilePicture} />
                      <AvatarFallback className="text-xs">
                        {squadPreview.creatorId.firstName[0]}{squadPreview.creatorId.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {squadPreview.creatorId.firstName} {squadPreview.creatorId.lastName}
                    </span>
                  </div>
                </div>

                {/* Formation Info */}
                {squadPreview.formationType !== 'general' && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {squadPreview.formationType === 'academic_level' && <BookOpen className="h-3 w-3" />}
                    {squadPreview.formationType === 'geographic' && <MapPin className="h-3 w-3" />}
                    <span className="capitalize">{squadPreview.formationType.replace('_', ' ')}</span>
                  </div>
                )}

                {/* Join Button */}
                <Button 
                  onClick={handleJoin}
                  disabled={isJoining}
                  className="w-full"
                >
                  {isJoining ? 'Joining...' : 'Join Squad'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">How to get a shortcode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Ask a squad creator to send you an invitation email</p>
              <p>• The email will contain a 6-character shortcode</p>
              <p>• Enter the shortcode above to join the squad</p>
              <p>• Shortcodes are case-insensitive</p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}