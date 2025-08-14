'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useSquads } from '@/hooks/use-squads';
import { usePageTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, Target, TrendingUp, AlertCircle, Sparkles, Zap } from 'lucide-react';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/ui/responsive-container';
import { ModernCard, StatCard, FeatureCard } from '@/components/ui/modern-card';
import CreateSquadModal from './CreateSquadModal';
import JoinSquadModal from './JoinSquadModal';
import SquadCard from './SquadCard';

export default function SquadsDashboard() {
  const { data: session } = useSession();
  const { t } = usePageTranslation('squads');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [activeTab, setActiveTab] = useState('my-squads');
  
  const { squads: mySquads, isLoading: isLoadingMySquads } = useSquads('all');
  const { squads: publicSquads, isLoading: isLoadingPublicSquads } = useSquads('all', 'public');

  const primarySquad = mySquads.find((squad: any) => squad.squadType === 'primary');
  const secondarySquads = mySquads.filter((squad: any) => squad.squadType === 'secondary');

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t('auth.signInTitle')}</h2>
          <p className="text-muted-foreground">{t('auth.signInSubtitle')}</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer maxWidth="8xl" padding="md" className="py-4 sm:py-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-eddura-100 dark:bg-eddura-800 rounded-xl">
                <Users className="h-6 w-6 text-eddura-600 dark:text-eddura-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold text-eddura-900 dark:text-eddura-100">{t('dashboard.title')}</h1>
                <div className="flex items-center gap-2 mt-1 text-eddura-600 dark:text-eddura-400">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm sm:text-base">{t('dashboard.counts', { mine: mySquads.length, public: publicSquads.length })}</span>
                </div>
              </div>
            </div>
            <p className="text-sm sm:text-lg text-eddura-700 dark:text-eddura-300">
              {t('dashboard.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowJoinModal(true)}
              className="border-eddura-300 text-eddura-700 hover:bg-eddura-50 dark:border-eddura-600 dark:text-eddura-300 dark:hover:bg-eddura-800"
            >
              <Users className="w-4 h-4 mr-2" />
              {t('actions.joinSquad')}
            </Button>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-eddura-500 hover:bg-eddura-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('actions.createSquad')}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 sm:mb-8"
      >
        <ResponsiveGrid cols={{ default: 2, md: 4 }} gap="md">
          <StatCard
            label={t('stats.totalSquads')}
            value={mySquads.length}
            icon={<Users className="h-6 w-6 text-eddura-500" />}
            change={{ value: t('stats.primarySecondary', { primary: primarySquad ? 1 : 0, secondary: secondarySquads.length }), trend: 'neutral' }}
          />
          <StatCard
            label={t('stats.activeGoals')}
            value={mySquads.reduce((total: number, squad: any) => total + squad.goals.length, 0)}
            icon={<Target className="h-6 w-6 text-accent" />}
            change={{ value: t('stats.acrossAllSquads'), trend: 'neutral' }}
          />
          <StatCard
            label={t('stats.avgProgress')}
            value={`${mySquads.length > 0 
              ? Math.round(mySquads.reduce((total: number, squad: any) => total + squad.completionPercentage, 0) / mySquads.length)
              : 0}%`}
            icon={<TrendingUp className="h-6 w-6 text-green-500" />}
            change={{ value: t('stats.overallCompletion'), trend: 'neutral' }}
          />
          <StatCard
            label={t('stats.needHelp')}
            value={mySquads.reduce((total: number, squad: any) => 
              total + squad.goals.reduce((goalTotal: number, goal: any) => 
                goalTotal + goal.memberProgress.filter((mp: any) => mp.needsHelp).length, 0
              ), 0
            )}
            icon={<AlertCircle className="h-6 w-6 text-yellow-500" />}
            change={{ value: t('stats.membersNeedingSupport'), trend: 'neutral' }}
          />
        </ResponsiveGrid>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-2 bg-eddura-100 dark:bg-eddura-800 rounded-lg">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-eddura-600 dark:text-eddura-400" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-eddura-900 dark:text-eddura-100">{t('quick.title')}</h2>
        </div>
        <ResponsiveGrid cols={{ default: 1, md: 3 }} gap="md">
          <FeatureCard
            icon={<Users className="h-6 w-6 text-eddura-500" />}
            title={t('quick.discover.title')}
            description={t('quick.discover.description')}
            action={{ label: t('quick.discover.action'), onClick: () => setActiveTab('discover') }}
          />
          <FeatureCard
            icon={<Plus className="h-6 w-6 text-eddura-500" />}
            title={t('quick.create.title')}
            description={t('quick.create.description')}
            action={{ label: t('quick.create.action'), onClick: () => setShowCreateModal(true) }}
          />
          <FeatureCard
            icon={<Target className="h-6 w-6 text-eddura-500" />}
            title={t('quick.track.title')}
            description={t('quick.track.description')}
            action={{ label: t('quick.track.action'), onClick: () => setActiveTab('my-squads') }}
          />
        </ResponsiveGrid>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-eddura-50 dark:bg-eddura-900/40 border border-eddura-100 dark:border-eddura-800 rounded-lg">
          <TabsTrigger 
            value="my-squads"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-eddura-800 data-[state=active]:text-eddura-900 dark:data-[state=active]:text-eddura-100"
          >
            {t('tabs.mySquads')}
          </TabsTrigger>
          <TabsTrigger 
            value="discover"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-eddura-800 data-[state=active]:text-eddura-900 dark:data-[state=active]:text-eddura-100"
          >
            {t('tabs.discover')}
          </TabsTrigger>
          <TabsTrigger 
            value="create"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-eddura-800 data-[state=active]:text-eddura-900 dark:data-[state=active]:text-eddura-100"
          >
            {t('tabs.create')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-squads" className="space-y-4">
          {isLoadingMySquads ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eddura-500 mx-auto mb-2"></div>
                <p className="text-eddura-600 dark:text-eddura-400">{t('loading.mySquads')}</p>
              </div>
            </div>
          ) : mySquads.length === 0 ? (
            <ModernCard variant="outlined" className="text-center">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Users className="h-12 w-12 text-eddura-500 mb-4" />
                <h3 className="text-lg font-semibold text-eddura-900 dark:text-eddura-100 mb-2">{t('empty.title')}</h3>
                <p className="text-eddura-600 dark:text-eddura-400 text-center mb-4">
                  {t('empty.description')}
                </p>
                <Button onClick={() => setShowCreateModal(true)} className="bg-eddura-500 hover:bg-eddura-600">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('empty.createFirst')}
                </Button>
              </CardContent>
            </ModernCard>
          ) : (
            <div className="space-y-6">
              {/* Primary Squad */}
              {primarySquad && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-eddura-100 text-eddura-800 dark:bg-eddura-800 dark:text-eddura-200">{t('sections.primary.badge')}</Badge>
                    <h2 className="text-xl font-semibold text-eddura-900 dark:text-eddura-100">{t('sections.primary.heading')}</h2>
                  </div>
                  <SquadCard squad={primarySquad} />
                </div>
              )}

              {/* Secondary Squads */}
              {secondarySquads.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-eddura-50 text-eddura-800 dark:bg-eddura-800 dark:text-eddura-200">{t('sections.secondary.badge')}</Badge>
                    <h2 className="text-xl font-semibold text-eddura-900 dark:text-eddura-100">{t('sections.secondary.heading')}</h2>
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eddura-500 mx-auto mb-2"></div>
                <p className="text-eddura-600 dark:text-eddura-400">{t('loading.discover')}</p>
              </div>
            </div>
          ) : publicSquads.length === 0 ? (
            <ModernCard variant="outlined" className="text-center">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Users className="h-12 w-12 text-eddura-500 mb-4" />
                <h3 className="text-lg font-semibold text-eddura-900 dark:text-eddura-100 mb-2">{t('discover.empty.title')}</h3>
                <p className="text-eddura-600 dark:text-eddura-400 text-center">
                  {t('discover.empty.description')}
                </p>
              </CardContent>
            </ModernCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicSquads.map((squad: any) => (
                <SquadCard key={squad._id as any} squad={squad} showJoinButton />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
            <ModernCard variant="elevated">
              <CardHeader>
                <CardTitle className="text-eddura-900 dark:text-eddura-100">{t('create.title')}</CardTitle>
                <CardDescription className="text-eddura-600 dark:text-eddura-400">
                  {t('create.description')}
                </CardDescription>
              </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <h4 className="font-semibold text-eddura-900 dark:text-eddura-100">{t('create.primary.title')}</h4>
                      <p className="text-sm text-eddura-600 dark:text-eddura-400">
                        {t('create.primary.description')}
                      </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateModal(true)}
                      disabled={!!primarySquad}
                      className="border-eddura-300 text-eddura-700 hover:bg-eddura-50 dark:border-eddura-600 dark:text-eddura-300 dark:hover:bg-eddura-800"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                        {t('create.primary.button')}
                    </Button>
                  </div>
                  <div className="space-y-2">
                      <h4 className="font-semibold text-eddura-900 dark:text-eddura-100">{t('create.secondary.title')}</h4>
                      <p className="text-sm text-eddura-600 dark:text-eddura-400">
                        {t('create.secondary.description')}
                      </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateModal(true)}
                      className="border-eddura-300 text-eddura-700 hover:bg-eddura-50 dark:border-eddura-600 dark:text-eddura-300 dark:hover:bg-eddura-800"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                        {t('create.secondary.button')}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </ModernCard>
        </TabsContent>
      </Tabs>

      {/* Create Squad Modal */}
      <CreateSquadModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        primarySquadExists={!!primarySquad}
      />
      
      {/* Join Squad Modal */}
      <JoinSquadModal 
        isOpen={showJoinModal} 
        onClose={() => setShowJoinModal(false)}
      />
    </ResponsiveContainer>
  );
}