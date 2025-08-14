'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernCard, StatCard, FeatureCard } from '@/components/ui/modern-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, CardSkeleton } from '@/components/ui/enhanced-loading';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveStack } from '@/components/ui/responsive-container';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Building, 
  User,
  Filter,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Users,
  GraduationCap,
  MessageSquare,
  TrendingUp,
  Calendar,
  MapPin,
  Star,
  Award,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import AddRecipientModal from '@/components/recommendations/AddRecipientModal';
import EditRecipientModal from '@/components/recommendations/EditRecipientModal';
import { usePageTranslation, useNotificationTranslation } from '@/hooks/useTranslation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Recipient {
  _id: string;
  name: string;
  emails: string[];
  primaryEmail: string;
  title: string;
  institution: string;
  department?: string;
  phoneNumber?: string;
  officeAddress?: string;
  prefersDrafts: boolean;
  preferredCommunicationMethod: string;
  createdAt: string;
  updatedAt: string;
}

export default function RecipientsPage() {
  const { t } = usePageTranslation('recommendations');
  const { t: tNotification } = useNotificationTranslation();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterInstitution, setFilterInstitution] = useState('all');
  const [filterPreference, setFilterPreference] = useState('all');
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);
  const [deletingRecipient, setDeletingRecipient] = useState<string | null>(null);

  const fetchRecipients = useCallback(async () => {
    try {
      const response = await fetch('/api/recommendations/recipients');
      const data = await response.json();
      if (response.ok) {
        setRecipients(data.recipients);
      }
    } catch (error) {
      console.error('Error fetching recipients:', error);
      toast.error(tNotification('error.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [tNotification]);

  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  const handleRecipientAdded = (newRecipient: Recipient) => {
    setRecipients(prev => [newRecipient, ...prev]);
    toast.success(tNotification('success.recipientAdded'));
  };

  const handleRecipientUpdated = (updatedRecipient: Recipient) => {
    setRecipients(prev => 
      prev.map(r => r._id === updatedRecipient._id ? updatedRecipient : r)
    );
    setEditingRecipient(null);
    toast.success(tNotification('success.recipientUpdated'));
  };

  const handleDeleteRecipient = async (recipientId: string) => {
    if (!confirm(`${t('actions.confirmDelete')} ${t('actions.deleteWarning')}`)) {
      return;
    }

    setDeletingRecipient(recipientId);
    try {
      const response = await fetch(`/api/recommendations/recipients/${recipientId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRecipients(prev => prev.filter(r => r._id !== recipientId));
        toast.success(tNotification('success.recipientDeleted'));
      } else {
        const data = await response.json();
        toast.error(data.error || tNotification('error.recipientDeleteFailed'));
      }
    } catch (error) {
      console.error('Error deleting recipient:', error);
      toast.error(tNotification('error.recipientDeleteFailed'));
    } finally {
      setDeletingRecipient(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(tNotification('success.copiedToClipboard'));
  };

  const filteredRecipients = recipients.filter(recipient => {
    const matchesSearch = 
      recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipient.emails.some(email => email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      recipient.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipient.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (recipient.department && recipient.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesInstitution = filterInstitution === 'all' || recipient.institution === filterInstitution;
    const matchesPreference = filterPreference === 'all' || 
      (filterPreference === 'drafts' && recipient.prefersDrafts) ||
      (filterPreference === 'no-drafts' && !recipient.prefersDrafts);

    return matchesSearch && matchesInstitution && matchesPreference;
  });

  const institutions = Array.from(new Set(recipients.map(r => r.institution))).sort();

  if (loading) {
    return (
      <ResponsiveContainer maxWidth="8xl" padding="lg" className="py-8">
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-eddura-200 dark:bg-eddura-700 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-eddura-100 dark:bg-eddura-800 rounded w-1/2 mb-8"></div>
          </div>
          <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap="lg">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </ResponsiveGrid>
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer maxWidth="8xl" padding="lg" className="py-8">
      {/* Enhanced Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-eddura-100 to-accent/10 dark:from-eddura-800 dark:to-accent/20 rounded-xl border border-accent/20">
                <Users className="h-8 w-8 text-eddura-600 dark:text-eddura-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-eddura-900 dark:text-eddura-100">
                  {t('title')}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span className="text-eddura-600 dark:text-eddura-400 font-medium">
                    {t('header.totalCount', { count: recipients.length })}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-lg text-eddura-700 dark:text-eddura-300 max-w-2xl">
              {t('subtitle')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <AddRecipientModal 
              onRecipientAdded={handleRecipientAdded}
              trigger={
                <Button size="lg" className="bg-eddura-500 hover:bg-eddura-600 shadow-eddura">
                  <Plus className="h-5 w-5 mr-2" />
                  {t('actions.addRecipient')}
                </Button>
              }
            />
          </div>
        </div>
      </motion.div>

      {/* Enhanced Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <ModernCard variant="elevated" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-eddura-100 dark:bg-eddura-800 rounded-lg">
              <Filter className="h-5 w-5 text-eddura-600 dark:text-eddura-400" />
            </div>
            <h2 className="text-xl font-semibold text-eddura-900 dark:text-eddura-100">
              {t('search.title')}
            </h2>
          </div>
          
          <ResponsiveGrid cols={{ default: 1, md: 3 }} gap="lg">
            <div className="space-y-2">
              <label className="text-sm font-medium text-eddura-700 dark:text-eddura-300">
                {t('search.searchRecipientsLabel')}
              </label>
              <Input
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="bg-white dark:bg-eddura-800"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-eddura-700 dark:text-eddura-300">
                {t('search.filterByInstitution')}
              </label>
              <Select value={filterInstitution} onValueChange={setFilterInstitution}>
                <SelectTrigger className="bg-white dark:bg-eddura-800">
                  <SelectValue placeholder={t('search.allInstitutions')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('search.allInstitutions')}</SelectItem>
                  {institutions.map((institution) => (
                    <SelectItem key={institution} value={institution}>
                      {institution}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-eddura-700 dark:text-eddura-300">
                {t('search.filterByPreference')}
              </label>
              <Select value={filterPreference} onValueChange={setFilterPreference}>
                <SelectTrigger className="bg-white dark:bg-eddura-800">
                  <SelectValue placeholder={t('search.allPreferences')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('search.allPreferences')}</SelectItem>
                  <SelectItem value="drafts">{t('search.prefersDrafts')}</SelectItem>
                  <SelectItem value="no-drafts">{t('search.prefersEmail')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </ResponsiveGrid>
          
          {/* Filter Summary */}
          {(searchQuery || filterInstitution !== 'all' || filterPreference !== 'all') && (
            <div className="mt-4 pt-4 border-t border-eddura-200 dark:border-eddura-700">
              <div className="flex items-center gap-2 text-sm text-eddura-600 dark:text-eddura-400">
                <CheckCircle className="h-4 w-4" />
                {t('search.showing', { count: filteredRecipients.length, total: recipients.length })}
              </div>
            </div>
          )}
        </ModernCard>
      </motion.div>

      {/* Recipients Grid */}
      <AnimatePresence mode="wait">
        {filteredRecipients.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <ModernCard variant="outlined" className="text-center py-16">
              <div className="space-y-6">
                <div className="mx-auto w-24 h-24 bg-eddura-100 dark:bg-eddura-800 rounded-full flex items-center justify-center">
                  <User className="h-12 w-12 text-eddura-500 dark:text-eddura-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-eddura-900 dark:text-eddura-100">
                    {recipients.length === 0 ? t('empty.title') : t('empty.filter.title')}
                  </h3>
                  <p className="text-eddura-600 dark:text-eddura-400 max-w-md mx-auto">
                    {recipients.length === 0 
                      ? t('empty.description')
                      : t('empty.filter.description')
                    }
                  </p>
                </div>
                {recipients.length === 0 && (
                  <AddRecipientModal 
                    onRecipientAdded={handleRecipientAdded}
                    trigger={
                      <Button size="lg" className="bg-eddura-500 hover:bg-eddura-600">
                        <Plus className="h-5 w-5 mr-2" />
                        {t('empty.addFirst')}
                      </Button>
                    }
                  />
                )}
              </div>
            </ModernCard>
          </motion.div>
        ) : (
          <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap="lg">
            {filteredRecipients.map((recipient, index) => (
              <motion.div
                key={recipient._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ModernCard 
                  variant="elevated" 
                  hover="lift" 
                  className="h-full group relative overflow-hidden"
                >
                  {/* Gradient accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-eddura-500 to-eddura-600"></div>
                  
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-eddura-100 dark:bg-eddura-800 rounded-lg">
                          <GraduationCap className="h-5 w-5 text-eddura-600 dark:text-eddura-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-eddura-900 dark:text-eddura-100 truncate">
                            {recipient.name}
                          </h3>
                          <p className="text-sm text-eddura-600 dark:text-eddura-400 mt-1">
                            {recipient.title}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingRecipient(recipient)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t('recipient.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyToClipboard(recipient.primaryEmail)}>
                            <Copy className="h-4 w-4 mr-2" />
                            {t('recipient.copyEmail')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteRecipient(recipient._id)}
                            className="text-red-600"
                            disabled={deletingRecipient === recipient._id}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deletingRecipient === recipient._id ? t('actions.deleting') : t('recipient.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Contact Information */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-eddura-500" />
                        <span className="text-sm text-eddura-700 dark:text-eddura-300 font-medium truncate">
                          {recipient.primaryEmail}
                        </span>
                        <Badge variant="outline" className="text-xs">{t('recipient.primaryEmail')}</Badge>
                      </div>
                      
                      {recipient.emails.length > 1 && (
                        <div className="ml-6 text-xs text-eddura-600 dark:text-eddura-400">
                          {t('recipient.moreEmails', { count: recipient.emails.length - 1 })}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-eddura-500" />
                        <span className="text-sm text-eddura-700 dark:text-eddura-300 truncate">
                          {recipient.institution}
                        </span>
                      </div>

                      {recipient.department && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-eddura-500" />
                          <span className="text-sm text-eddura-600 dark:text-eddura-400 truncate">
                            {recipient.department}
                          </span>
                        </div>
                      )}

                      {recipient.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-eddura-500" />
                          <span className="text-sm text-eddura-700 dark:text-eddura-300">
                            {recipient.phoneNumber}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Preferences */}
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant={recipient.prefersDrafts ? 'default' : 'secondary'}
                        className={recipient.prefersDrafts ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                      >
                        {recipient.prefersDrafts ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {t('recipient.prefersDrafts')}
                          </>
                        ) : (
                          t('recipient.noDrafts')
                        )}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {recipient.preferredCommunicationMethod}
                      </Badge>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-eddura-100 dark:border-eddura-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-eddura-500 dark:text-eddura-400">
                          <Calendar className="h-3 w-3" />
                          {t('recipient.addedOn', { date: format(new Date(recipient.createdAt), 'MMM dd, yyyy') })}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingRecipient(recipient)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(recipient.primaryEmail)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </ModernCard>
              </motion.div>
            ))}
          </ResponsiveGrid>
        )}
      </AnimatePresence>

      {/* Enhanced Stats */}
      {recipients.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-eddura-900 dark:text-eddura-100 mb-2">
              {t('overview.title')}
            </h2>
            <p className="text-eddura-600 dark:text-eddura-400">
              {t('overview.subtitle')}
            </p>
          </div>
          
          <ResponsiveGrid cols={{ default: 2, md: 4 }} gap="lg">
            <StatCard
              label={t('overview.cards.totalRecipients')}
              value={recipients.length.toString()}
              icon={<Users className="h-6 w-6 text-eddura-500" />}
              change={{ value: t('overview.activeNetwork'), trend: "neutral" }}
            />
            <StatCard
              label={t('overview.cards.prefersDrafts')}
              value={recipients.filter(r => r.prefersDrafts).length.toString()}
              icon={<Edit className="h-6 w-6 text-green-500" />}
              change={{ 
                value: t('overview.percentOfTotal', { percent: Math.round((recipients.filter(r => r.prefersDrafts).length / recipients.length) * 100) }), 
                trend: "up" 
              }}
            />
            <StatCard
              label={t('overview.cards.institutions')}
              value={institutions.length.toString()}
              icon={<Building className="h-6 w-6 text-blue-500" />}
              change={{ value: t('overview.cards.uniqueInstitutions'), trend: "neutral" }}
            />
            <StatCard
              label={t('overview.cards.withPhone')}
              value={recipients.filter(r => r.phoneNumber).length.toString()}
              icon={<Phone className="h-6 w-6 text-purple-500" />}
              change={{ 
                value: t('overview.percentHavePhone', { percent: Math.round((recipients.filter(r => r.phoneNumber).length / recipients.length) * 100) }), 
                trend: recipients.filter(r => r.phoneNumber).length > recipients.length / 2 ? "up" : "neutral" 
              }}
            />
          </ResponsiveGrid>

          {/* Quick Actions */}
          <div className="mt-8">
            <ModernCard variant="gradient" className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-eddura-900 dark:text-eddura-100">
                    {t('cta.title')}
                  </h3>
                  <p className="text-eddura-600 dark:text-eddura-400">
                    {t('cta.description')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="bg-white/80 dark:bg-eddura-800/80">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {t('cta.viewRecommendations')}
                  </Button>
                  <Button className="bg-eddura-500 hover:bg-eddura-600">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('cta.newRequest')}
                  </Button>
                </div>
              </div>
            </ModernCard>
          </div>
        </motion.div>
      )}

      {/* Edit Modal */}
      {editingRecipient && (
        <EditRecipientModal
          recipient={editingRecipient}
          onRecipientUpdated={handleRecipientUpdated}
          onCancel={() => setEditingRecipient(null)}
        />
      )}
    </ResponsiveContainer>
  );
} 