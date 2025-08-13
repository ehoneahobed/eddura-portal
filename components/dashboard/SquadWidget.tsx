"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, ArrowRight, Trophy, Target } from 'lucide-react';
import Link from 'next/link';

interface Squad {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  goals: string[];
  isActive: boolean;
}

export default function SquadWidget() {
  const { data: session, status } = useSession();
  const [squads, setSquads] = useState<Squad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.email) {
      setIsLoading(false);
      setLoadError('');
      return;
    }
    fetchSquads(session.user.email);
  }, [session, status]);

  const fetchSquads = async (userEmail: string) => {
    try {
      // Query squads where the current user is a member
      const response = await fetch(`/api/squads?userId=${encodeURIComponent(userEmail)}`);
      if (!response.ok) {
        setLoadError('Failed to load squads');
        setSquads([]);
        return;
      }
      const data = await response.json();
      const squadsArray: any[] = Array.isArray(data?.squads) ? data.squads : [];
      setSquads(squadsArray as Squad[]);
      setLoadError(null);
    } catch (error) {
      console.error('Error fetching squads:', error);
      setLoadError('Failed to load squads');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-800)] shadow-lg bg-white dark:bg-[var(--eddura-primary-900)]">
        <CardHeader>
          <CardTitle className="text-lg text-[var(--eddura-primary-900)] dark:text-white">Eddura Squads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-700)] border-t-[var(--eddura-primary)] rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-800)] shadow-lg bg-white dark:bg-[var(--eddura-primary-900)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-[var(--eddura-primary-900)] dark:text-white">Eddura Squads</CardTitle>
        <CardDescription className="text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">
          Join collaborative squads for support
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadError ? (
          <div className="text-center py-6">
            <p className="text-sm text-[var(--eddura-error-dark)] dark:text-[var(--eddura-error-light)]">{loadError}</p>
          </div>
        ) : squads.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-[var(--eddura-primary-100)] dark:bg-[var(--eddura-primary-800)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-[var(--eddura-primary-400)] dark:text-[var(--eddura-primary-500)]" />
            </div>
            <p className="text-lg text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)] mb-2">No squads yet</p>
            <p className="text-sm text-[var(--eddura-primary-500)] dark:text-[var(--eddura-primary-400)] mb-4">
              Join or create a squad to collaborate with other students
            </p>
            <Link href="/squads">
              <Button className="bg-[var(--eddura-primary)] hover:bg-[var(--eddura-primary-600)] text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                Create Squad
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {squads.slice(0, 2).map((squad) => (
              <div
                key={squad.id}
                className="p-4 bg-[var(--eddura-primary-50)] dark:bg-[var(--eddura-primary-800)] rounded-xl border border-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-700)] hover:bg-[var(--eddura-primary-100)] dark:hover:bg-[var(--eddura-primary-700)] transition-all duration-200"
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-[var(--eddura-primary)] text-white text-sm">
                      {squad.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[var(--eddura-primary-900)] dark:text-white truncate">
                      {squad.name}
                    </h4>
                    <p className="text-sm text-[var(--eddura-primary-600)] dark:text-white/80 line-clamp-2">
                      {squad.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-[var(--eddura-primary-500)] dark:text-white/80" />
                        <span className="text-xs text-[var(--eddura-primary-600)] dark:text-white/80">
                          {(squad as any).memberCount ?? (Array.isArray((squad as any).memberIds) ? (squad as any).memberIds.length : squad.memberCount)}/{squad.maxMembers}
                        </span>
                      </div>
                      
                      {Array.isArray(squad.goals) && squad.goals.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Target className="w-4 h-4 text-[var(--eddura-primary-500)] dark:text-white/80" />
                          <span className="text-xs text-[var(--eddura-primary-600)] dark:text-white/80">
                            {squad.goals.length} goal{squad.goals.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Badge className={(squad as any).isActive !== false ? "bg-[var(--eddura-success-100)] text-[var(--eddura-success-800)] dark:bg-[var(--eddura-success-900)] dark:text-[var(--eddura-success-200)]" : "bg-[var(--eddura-warning-100)] text-[var(--eddura-warning-800)] dark:bg-[var(--eddura-warning-900)] dark:text-[var(--eddura-warning-200)]"}>
                    {(squad as any).isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            ))}
            
            {squads.length > 2 && (
              <div className="text-center pt-2">
                <Link href="/squads">
                  <Button variant="outline" className="w-full border-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-700)] text-[var(--eddura-primary-700)] dark:text-[var(--eddura-primary-300)] hover:bg-[var(--eddura-primary-50)] dark:hover:bg-[var(--eddura-primary-800)] hover:border-[var(--eddura-primary-300)] dark:hover:border-[var(--eddura-primary-600)] transition-all duration-200">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    View All Squads ({squads.length})
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}