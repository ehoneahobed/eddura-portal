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


export default function DocumentsPage() {
  const { data: session } = useSession();
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
        toast.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
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
    toast.success('Document created successfully');
  };

  const handleDocumentDeleted = (documentId: string) => {
    setDocuments(docs => docs.filter(doc => doc._id !== documentId));
    toast.success('Document deleted successfully');
  };

  const handleDocumentUpdated = (updatedDocument: Document) => {
    setDocuments(docs => 
      docs.map(doc => 
        doc._id === updatedDocument._id ? updatedDocument : doc
      )
    );
    toast.success('Document updated successfully');
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
                    My Documents
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
                Create and manage your academic and professional documents. Build your portfolio of essays, 
                statements, and applications with our powerful document editor.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                size="lg"
                className="border-eddura-300 text-eddura-700 hover:bg-eddura-50 dark:border-eddura-600 dark:text-eddura-300 dark:hover:bg-eddura-800"
              >
                <Upload className="h-5 w-5 mr-2" />
                Import Document
              </Button>
              <Button 
                size="lg" 
                onClick={() => setCreateDialogOpen(true)}
                className="bg-eddura-500 hover:bg-eddura-600 shadow-eddura"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Document
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
              label="Total Documents"
              value={documents.length.toString()}
              icon={<FileText className="h-6 w-6 text-eddura-500" />}
              change={{ value: "In your library", trend: "neutral" }}
            />
            <StatCard
              label="Active Documents"
              value={documents.filter(doc => doc.isActive).length.toString()}
              icon={<CheckCircle className="h-6 w-6 text-green-500" />}
              change={{ 
                value: `${Math.round((documents.filter(doc => doc.isActive).length / Math.max(documents.length, 1)) * 100)}% active`, 
                trend: "up" 
              }}
            />
            <StatCard
              label="Total Words"
              value={documents.reduce((sum, doc) => sum + (doc.wordCount || 0), 0).toLocaleString()}
              icon={<Edit className="h-6 w-6 text-blue-500" />}
              change={{ value: "Words written", trend: "neutral" }}
            />
            <StatCard
              label="Categories"
              value={categories.length.toString()}
              icon={<Folder className="h-6 w-6 text-purple-500" />}
              change={{ value: "Document types", trend: "neutral" }}
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
                  Document Categories
                </h2>
              </div>
              
              <TabsList className="grid w-full grid-cols-7 bg-eddura-50 dark:bg-eddura-800 p-1 rounded-xl border border-accent/20">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-accent data-[state=active]:text-white dark:data-[state=active]:bg-accent data-[state=active]:shadow-lg font-medium"
                >
                  All
                </TabsTrigger>
                <TabsTrigger 
                  value="personal"
                  className="data-[state=active]:bg-accent data-[state=active]:text-white dark:data-[state=active]:bg-accent data-[state=active]:shadow-lg font-medium"
                >
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Personal
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="professional"
                  className="data-[state=active]:bg-accent data-[state=active]:text-white dark:data-[state=active]:bg-accent data-[state=active]:shadow-lg font-medium"
                >
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    Professional
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="academic"
                  className="data-[state=active]:bg-accent data-[state=active]:text-white dark:data-[state=active]:bg-accent data-[state=active]:shadow-lg font-medium"
                >
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    Academic
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="experience"
                  className="data-[state=active]:bg-accent data-[state=active]:text-white dark:data-[state=active]:bg-accent data-[state=active]:shadow-lg font-medium"
                >
                  <div className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    Experience
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="reference"
                  className="data-[state=active]:bg-accent data-[state=active]:text-white dark:data-[state=active]:bg-accent data-[state=active]:shadow-lg font-medium"
                >
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    Reference
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="upload"
                  className="data-[state=active]:bg-accent data-[state=active]:text-white dark:data-[state=active]:bg-accent data-[state=active]:shadow-lg font-medium"
                >
                  <div className="flex items-center gap-1">
                    <Upload className="h-3 w-3" />
                    Uploads
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
                            No documents yet
                          </h3>
                          <p className="text-eddura-600 dark:text-eddura-400 max-w-md mx-auto">
                            Start building your document library with essays, personal statements, 
                            cover letters, and more. Our AI-powered editor will help you craft compelling content.
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button 
                            size="lg" 
                            onClick={() => setCreateDialogOpen(true)}
                            className="bg-eddura-500 hover:bg-eddura-600"
                          >
                            <Plus className="h-5 w-5 mr-2" />
                            Create Your First Document
                          </Button>
                          <Button variant="outline" size="lg">
                            <Upload className="h-5 w-5 mr-2" />
                            Import Existing Document
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
                                  {category} Documents
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
                              No {category} documents
                            </h3>
                            <p className="text-eddura-600 dark:text-eddura-400 max-w-md mx-auto">
                              Create your first {category} document to get started with this category.
                            </p>
                          </div>
                          <Button 
                            size="lg" 
                            onClick={() => setCreateDialogOpen(true)}
                            className="bg-eddura-500 hover:bg-eddura-600"
                          >
                            <Plus className="h-5 w-5 mr-2" />
                            Create {category.charAt(0).toUpperCase() + category.slice(1)} Document
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
                      Ready to create more content?
                    </h3>
                  </div>
                  <p className="text-eddura-700 dark:text-eddura-300 max-w-2xl">
                    Keep building your document library. Our AI-powered editor helps you create 
                    compelling essays, statements, and applications that stand out.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    className="bg-white/80 dark:bg-eddura-800/80 border-eddura-300 dark:border-eddura-600"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Templates
                  </Button>
                  <Button 
                    onClick={() => setCreateDialogOpen(true)}
                    className="bg-eddura-500 hover:bg-eddura-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Document
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