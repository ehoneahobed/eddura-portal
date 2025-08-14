'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernCard, StatCard, FeatureCard } from '@/components/ui/modern-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner, CardSkeleton } from '@/components/ui/enhanced-loading';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveStack } from '@/components/ui/responsive-container';
import { 
  Plus, 
  FileText, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Download,
  Folder,
  TrendingUp,
  Calendar,
  Sparkles,
  BookOpen,
  Briefcase,
  GraduationCap,
  Award,
  Upload,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  Star
} from 'lucide-react';
import { DocumentType, DOCUMENT_TYPE_CONFIG, Document } from '@/types/documents';
import CreateDocumentDialog from '@/components/documents/CreateDocumentDialog';
import DocumentCard from '@/components/documents/DocumentCard';
import DocumentErrorBoundary from '@/components/documents/DocumentErrorBoundary';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePageTranslation, useNotificationTranslation } from '@/hooks/useTranslation';


export default function DocumentsPage() {
  const { data: session } = useSession();
  const { t } = usePageTranslation('documents');
  const { t: tNotification } = useNotificationTranslation();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');


  // Fetch documents
  const fetchDocuments = async () => {
    try {
      console.log('Fetching documents...');
      const response = await fetch('/api/documents');
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Documents API response:', data);
        setDocuments(data.documents || []);
      } else {
        const errorData = await response.json();
        console.error('Documents API error:', errorData);
        toast.error(tNotification('error.fetchFailed'));
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error(tNotification('error.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchDocuments();
    }
  }, [session]);

  // Group documents by category
  const documentsByCategory = documents.reduce((acc, doc) => {
    const category = DOCUMENT_TYPE_CONFIG[doc.type]?.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  // Get all categories
  const categories = Object.keys(documentsByCategory);
  if (categories.length === 0) {
    categories.push('personal', 'professional', 'academic', 'experience', 'reference', 'upload');
  }

  const handleDocumentCreated = () => {
    setCreateDialogOpen(false);
    fetchDocuments();
    toast.success(tNotification('success.documentCreated'));
  };

  const handleDocumentDeleted = (documentId: string) => {
    setDocuments(docs => docs.filter(doc => doc._id !== documentId));
    toast.success(tNotification('success.documentDeleted'));
  };

  const handleDocumentUpdated = (updatedDocument: Document) => {
    setDocuments(docs => 
      docs.map(doc => 
        doc._id === updatedDocument._id ? updatedDocument : doc
      )
    );
    toast.success(tNotification('success.documentUpdated'));
  };



  if (loading) {
    return (
      <ResponsiveContainer maxWidth="8xl" padding="lg" className="py-8">
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-eddura-200 dark:bg-eddura-700 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-eddura-100 dark:bg-eddura-800 rounded w-1/2 mb-8"></div>
          </div>
          <ResponsiveGrid cols={{ default: 1, md: 2, lg: 4 }} gap="lg">
            {[1, 2, 3, 4].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </ResponsiveGrid>
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
    <DocumentErrorBoundary
      onRetry={fetchDocuments}
      onCreateNew={() => setCreateDialogOpen(true)}
    >
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
                  <Folder className="h-8 w-8 text-eddura-600 dark:text-eddura-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-eddura-900 dark:text-eddura-100">
                    {t('title')}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <span className="text-eddura-600 dark:text-eddura-400 font-medium">
                      {documents.length} documents • {documents.reduce((sum, doc) => sum + (doc.wordCount || 0), 0).toLocaleString()} words
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-lg text-eddura-700 dark:text-eddura-300 max-w-2xl">
                {t('subtitle')}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                size="lg"
                className="border-eddura-300 text-eddura-700 hover:bg-eddura-50 dark:border-eddura-600 dark:text-eddura-300 dark:hover:bg-eddura-800"
              >
                <Upload className="h-5 w-5 mr-2" />
                {t('empty.importExisting')}
              </Button>
              <Button 
                size="lg" 
                onClick={() => setCreateDialogOpen(true)}
                className="bg-eddura-500 hover:bg-eddura-600 shadow-eddura"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t('quickActions.createNew')}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <ResponsiveGrid cols={{ default: 2, md: 4 }} gap="lg">
            <StatCard
              label={t('stats.totalDocuments')}
              value={documents.length.toString()}
              icon={<FileText className="h-6 w-6 text-eddura-500" />}
              change={{ value: t('stats.inYourLibrary'), trend: "neutral" }}
            />
            <StatCard
              label={t('stats.activeDocuments')}
              value={documents.filter(doc => doc.isActive).length.toString()}
              icon={<CheckCircle className="h-6 w-6 text-green-500" />}
              change={{ 
                value: `${Math.round((documents.filter(doc => doc.isActive).length / Math.max(documents.length, 1)) * 100)}% ${t('stats.active')}`, 
                trend: "up" 
              }}
            />
            <StatCard
              label={t('stats.totalWords')}
              value={documents.reduce((sum, doc) => sum + (doc.wordCount || 0), 0).toLocaleString()}
              icon={<Edit className="h-6 w-6 text-blue-500" />}
              change={{ value: t('stats.wordsWritten'), trend: "neutral" }}
            />
            <StatCard
              label={t('stats.categories')}
              value={categories.length.toString()}
              icon={<Folder className="h-6 w-6 text-purple-500" />}
              change={{ value: t('stats.documentTypes'), trend: "neutral" }}
            />
          </ResponsiveGrid>
        </motion.div>

        {/* Enhanced Category Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-8">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-eddura-100 dark:bg-eddura-800 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-eddura-600 dark:text-eddura-400" />
                </div>
                <h2 className="text-xl font-semibold text-eddura-900 dark:text-eddura-100">
                  {t('categories.title')}
                </h2>
              </div>
              
              <TabsList className="grid w-full grid-cols-7 bg-eddura-50 dark:bg-eddura-800 p-1 rounded-xl border border-accent/20">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-accent data-[state=active]:text-white dark:data-[state=active]:bg-accent data-[state=active]:shadow-lg font-medium"
                >
                  {t('categories.all')}
                </TabsTrigger>
                <TabsTrigger 
                  value="personal"
                  className="data-[state=active]:bg-accent data-[state=active]:text-white dark:data-[state=active]:bg-accent data-[state=active]:shadow-lg font-medium"
                >
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {t('categories.personal')}
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="professional"
                  className="data-[state=active]:bg-accent data-[state=active]:text-white dark:data-[state=active]:bg-accent data-[state=active]:shadow-lg font-medium"
                >
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {t('categories.professional')}
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="academic"
                  className="data-[state=active]:bg-accent data-[state=active]:text-white dark:data-[state=active]:bg-accent data-[state=active]:shadow-lg font-medium"
                >
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    {t('categories.academic')}
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="experience"
                  className="data-[state=active]:bg-accent data-[state=active]:text-white dark:data-[state=active]:bg-accent data-[state=active]:shadow-lg font-medium"
                >
                  <div className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {t('categories.experience')}
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="reference"
                  className="data-[state=active]:bg-accent data-[state=active]:text-white dark:data-[state=active]:bg-accent data-[state=active]:shadow-lg font-medium"
                >
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {t('categories.reference')}
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="upload"
                  className="data-[state=active]:bg-accent data-[state=active]:text-white dark:data-[state=active]:bg-accent data-[state=active]:shadow-lg font-medium"
                >
                  <div className="flex items-center gap-1">
                    <Upload className="h-3 w-3" />
                    {t('categories.upload')}
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="space-y-8">
              <AnimatePresence mode="wait">
                {categories.length === 0 || documents.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <ModernCard variant="outlined" className="text-center py-16">
                      <div className="space-y-6">
                        <div className="mx-auto w-24 h-24 bg-eddura-100 dark:bg-eddura-800 rounded-full flex items-center justify-center">
                          <FileText className="h-12 w-12 text-eddura-500 dark:text-eddura-400" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold text-eddura-900 dark:text-eddura-100">
                            {t('empty.title')}
                          </h3>
                          <p className="text-eddura-600 dark:text-eddura-400 max-w-md mx-auto">
                            {t('empty.description')}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button 
                            size="lg" 
                            onClick={() => setCreateDialogOpen(true)}
                            className="bg-eddura-500 hover:bg-eddura-600"
                          >
                            <Plus className="h-5 w-5 mr-2" />
                            {t('empty.createFirst')}
                          </Button>
                          <Button variant="outline" size="lg">
                            <Upload className="h-5 w-5 mr-2" />
                            {t('empty.importExisting')}
                          </Button>
                        </div>
                      </div>
                    </ModernCard>
                  </motion.div>
                ) : (
                  <div className="space-y-8">
                    {categories.map((category, categoryIndex) => (
                      <motion.div 
                        key={category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: categoryIndex * 0.1 }}
                        className="space-y-4"
                      >
                        <div className="relative">
                          {/* Orange accent divider */}
                          <div className="absolute -top-4 left-0 right-0 h-0.5 bg-gradient-to-r from-accent via-accent/50 to-transparent"></div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-eddura-100 to-accent/10 dark:from-eddura-800 dark:to-accent/20 rounded-lg border border-accent/20">
                                {category === 'personal' && <Users className="h-4 w-4 text-eddura-600 dark:text-eddura-400" />}
                                {category === 'professional' && <Briefcase className="h-4 w-4 text-eddura-600 dark:text-eddura-400" />}
                                {category === 'academic' && <GraduationCap className="h-4 w-4 text-eddura-600 dark:text-eddura-400" />}
                                {category === 'experience' && <Award className="h-4 w-4 text-eddura-600 dark:text-eddura-400" />}
                                {category === 'reference' && <BookOpen className="h-4 w-4 text-eddura-600 dark:text-eddura-400" />}
                                {category === 'upload' && <Upload className="h-4 w-4 text-eddura-600 dark:text-eddura-400" />}
                                {!['personal', 'professional', 'academic', 'experience', 'reference', 'upload'].includes(category) && 
                                  <FileText className="h-4 w-4 text-eddura-600 dark:text-eddura-400" />}
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold text-eddura-900 dark:text-eddura-100 capitalize">
                                  {t(`categories.${category}`)} Documents
                                </h3>
                                <div className="w-12 h-0.5 bg-accent mt-1 rounded-full"></div>
                              </div>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className="bg-accent/10 border border-accent/20 text-accent-dark dark:text-accent-light font-medium"
                            >
                              {documentsByCategory[category]?.length || 0} documents
                            </Badge>
                          </div>
                        </div>
                        <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap="lg">
                          {documentsByCategory[category]?.map((document, index) => (
                            <motion.div
                              key={document._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: (categoryIndex * 0.1) + (index * 0.05) }}
                            >
                              <DocumentCard
                                document={document}
                                onDelete={handleDocumentDeleted}
                                onUpdate={handleDocumentUpdated}
                              />
                            </motion.div>
                          ))}
                        </ResponsiveGrid>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </TabsContent>

            {categories.map(category => (
              <TabsContent key={category} value={category} className="space-y-6">
                <AnimatePresence mode="wait">
                  {documentsByCategory[category]?.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <ModernCard variant="outlined" className="text-center py-16">
                        <div className="space-y-6">
                          <div className="mx-auto w-20 h-20 bg-eddura-100 dark:bg-eddura-800 rounded-full flex items-center justify-center">
                            {category === 'personal' && <Users className="h-10 w-10 text-eddura-500 dark:text-eddura-400" />}
                            {category === 'professional' && <Briefcase className="h-10 w-10 text-eddura-500 dark:text-eddura-400" />}
                            {category === 'academic' && <GraduationCap className="h-10 w-10 text-eddura-500 dark:text-eddura-400" />}
                            {category === 'experience' && <Award className="h-10 w-10 text-eddura-500 dark:text-eddura-400" />}
                            {category === 'reference' && <BookOpen className="h-10 w-10 text-eddura-500 dark:text-eddura-400" />}
                            {category === 'upload' && <Upload className="h-10 w-10 text-eddura-500 dark:text-eddura-400" />}
                            {!['personal', 'professional', 'academic', 'experience', 'reference', 'upload'].includes(category) && 
                              <FileText className="h-10 w-10 text-eddura-500 dark:text-eddura-400" />}
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-eddura-900 dark:text-eddura-100">
                              {t('categoryEmpty.title', { category: t(`categories.${category}`) })}
                            </h3>
                            <p className="text-eddura-600 dark:text-eddura-400 max-w-md mx-auto">
                              {t('categoryEmpty.description', { category: t(`categories.${category}`) })}
                            </p>
                          </div>
                          <Button 
                            size="lg" 
                            onClick={() => setCreateDialogOpen(true)}
                            className="bg-eddura-500 hover:bg-eddura-600"
                          >
                            <Plus className="h-5 w-5 mr-2" />
                            {t('categoryEmpty.create', { category: t(`categories.${category}`) })}
                          </Button>
                        </div>
                      </ModernCard>
                    </motion.div>
                  ) : (
                    <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap="lg">
                      {documentsByCategory[category]?.map((document, index) => (
                        <motion.div
                          key={document._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <DocumentCard
                            document={document}
                            onDelete={handleDocumentDeleted}
                            onUpdate={handleDocumentUpdated}
                          />
                        </motion.div>
                      ))}
                    </ResponsiveGrid>
                  )}
                </AnimatePresence>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>

        {/* Quick Actions Section */}
        {documents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <ModernCard variant="gradient" className="p-8 border-t-4 border-t-accent">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-accent" />
                    <h3 className="text-xl font-semibold text-eddura-900 dark:text-eddura-100">
                      {t('quickActions.title')}
                    </h3>
                  </div>
                  <p className="text-eddura-700 dark:text-eddura-300 max-w-2xl">
                    {t('quickActions.description')}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    className="bg-white/80 dark:bg-eddura-800/80 border-eddura-300 dark:border-eddura-600"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    {t('quickActions.browseTemplates')}
                  </Button>
                  <Button 
                    onClick={() => setCreateDialogOpen(true)}
                    className="bg-eddura-500 hover:bg-eddura-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('quickActions.createNew')}
                  </Button>
                </div>
              </div>
            </ModernCard>
          </motion.div>
        )}

        {/* Create Document Dialog */}
        <CreateDocumentDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onDocumentCreated={handleDocumentCreated}
        />

      </ResponsiveContainer>
    </DocumentErrorBoundary>
  );
}