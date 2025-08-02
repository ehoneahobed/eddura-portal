'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSquads } from '@/hooks/use-squads';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, Target, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import CreateSquadModal from './CreateSquadModal';
import SquadCard from './SquadCard';

export default function SquadsDashboard() {
  const { data: session } = useSession();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('my-squads');
  
  const { squads: mySquads, isLoading: isLoadingMySquads } = useSquads('all');
  const { squads: publicSquads, isLoading: isLoadingPublicSquads } = useSquads('all', 'public');

  const primarySquad = mySquads.find((squad: any) => squad.squadType === 'primary');
  const secondarySquads = mySquads.filter((squad: any) => squad.squadType === 'secondary');

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Sign in to access Eddura Squads</h2>
          <p className="text-muted-foreground">Join collaborative groups to support your application journey</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Eddura Squads</h1>
          <p className="text-muted-foreground">
            Join collaborative groups to support your application journey
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Squad
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Squads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mySquads.length}</div>
            <p className="text-xs text-muted-foreground">
              {primarySquad ? '1 Primary' : '0 Primary'} • {secondarySquads.length} Secondary
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mySquads.reduce((total: number, squad: any) => total + squad.goals.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all squads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mySquads.length > 0 
                ? Math.round(mySquads.reduce((total: number, squad: any) => total + squad.completionPercentage, 0) / mySquads.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Help</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mySquads.reduce((total: number, squad: any) => 
                total + squad.goals.reduce((goalTotal: number, goal: any) => 
                  goalTotal + goal.memberProgress.filter((mp: any) => mp.needsHelp).length, 0
                ), 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Members needing support
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-squads">My Squads</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
        </TabsList>

        <TabsContent value="my-squads" className="space-y-4">
          {isLoadingMySquads ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading your squads...</p>
              </div>
            </div>
          ) : mySquads.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No squads yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Join or create your first squad to start collaborating with peers
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Squad
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Primary Squad */}
              {primarySquad && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="default">Primary Squad</Badge>
                    <h2 className="text-xl font-semibold">Your Main Squad</h2>
                  </div>
                  <SquadCard squad={primarySquad} />
                </div>
              )}

              {/* Secondary Squads */}
              {secondarySquads.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary">Secondary Squads</Badge>
                    <h2 className="text-xl font-semibold">Specialized Groups</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {secondarySquads.map((squad: any) => (
                      <SquadCard key={squad._id as any} squad={squad} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          {isLoadingPublicSquads ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Discovering public squads...</p>
              </div>
            </div>
          ) : publicSquads.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No public squads available</h3>
                <p className="text-muted-foreground text-center">
                  Check back later or create your own squad
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicSquads.map((squad: any) => (
                <SquadCard key={squad._id as any} squad={squad} showJoinButton />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Squad</CardTitle>
              <CardDescription>
                Start a collaborative group to support your application journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Primary Squad</h4>
                    <p className="text-sm text-muted-foreground">
                      Your main accountability group. You can only have one primary squad.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateModal(true)}
                      disabled={!!primarySquad}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Primary Squad
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Secondary Squad</h4>
                    <p className="text-sm text-muted-foreground">
                      Specialized groups for specific interests or goals.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Secondary Squad
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Squad Modal */}
      <CreateSquadModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        primarySquadExists={!!primarySquad}
      />
    </div>
  );
}