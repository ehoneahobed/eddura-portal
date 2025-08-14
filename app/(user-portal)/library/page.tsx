'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDataFetching } from '@/hooks/useDataFetching';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernCard, StatCard, FeatureCard } from '@/components/ui/modern-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, CardSkeleton } from '@/components/ui/enhanced-loading';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveStack } from '@/components/ui/responsive-container';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Filter, 
  Eye,
  Copy,
  Star,
  Calendar,
  Loader2,
  BookOpen,
  FileText,
  GraduationCap,
  Award,
  Users,
  Clock,
  Check,
  ExternalLink,
  Download,
  FileDown,
  Library,
  Sparkles,
  // TrendingUp,
  Search,
  Heart,
  // Bookmark,
  // Share2,
  // BarChart3,
  Zap,
  Target,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import AdvancedSearchFilters from '@/components/library/AdvancedSearchFilters';
import DocumentErrorBoundary from '@/components/documents/DocumentErrorBoundary';
import { usePageTranslation, useNotificationTranslation } from '@/hooks/useTranslation';

interface LibraryDocument {
  _id: string;
  title: string;
  type: string;
  description: string;
  category: string;
  subcategory?: string;
  content: string;
  wordCount: number;
  characterCount: number;
  targetAudience: string;
  tags: string[];
  viewCount: number;
  cloneCount: number;
  averageRating: number;
  ratingCount: number;
  author?: string;
  source?: string;
  publishedAt?: string;
  createdAt: string;
  isCloned?: boolean;
}

export default function LibraryPage() {
  const { data: session } = useSession();
  const { t } = usePageTranslation('library');
  const { t: tNotification } = useNotificationTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [targetAudienceFilter, setTargetAudienceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedDocument, setSelectedDocument] = useState<LibraryDocument | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState<boolean>(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCloning, setIsCloning] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const fetchDocuments = useCallback(async (params?: { page?: number; limit?: number }) => {
    console.log('🔍 Library Page - fetchDocuments called with params:', params);
    console.log('🔍 Library Page - session?.user?.id:', session?.user?.id);
    console.log('🔍 Library Page - Current filter state:', {
      searchTerm,
      categoryFilter,
      typeFilter,
      targetAudienceFilter,
      sortBy
    });
    
    if (!session?.user?.id) {
      console.log('❌ Library Page - No session user ID, returning null');
      return null;
    }
    
    const page = params?.page || pagination.page;
    const limit = params?.limit || pagination.limit;
    
    console.log('🔍 Library Page - Making API request with page:', page, 'limit:', limit);
    
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: searchTerm,
      category: categoryFilter,
      type: typeFilter,
      targetAudience: targetAudienceFilter,
      sortBy: sortBy,
    });

    console.log('🔍 Library Page - API request URL:', `/api/library/documents?${searchParams}`);
    console.log('🔍 Library Page - Search parameters being sent:', Object.fromEntries(searchParams.entries()));

    const response = await fetch(`/api/library/documents?${searchParams}`);
    
    console.log('🔍 Library Page - Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Library Page - API request failed:', errorText);
      throw new Error(`Failed to fetch documents: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('🔍 Library Page - API response data:', data);
    console.log('🔍 Library Page - Response structure:', {
      hasDocuments: !!data.documents,
      documentsLength: data.documents?.length || 0,
      hasPagination: !!data.pagination,
      hasUserStats: !!data.userStats,
      pagination: data.pagination,
      userStats: data.userStats
    });
    
    setPagination(data.pagination || pagination);
    return data;
  }, [session?.user?.id, searchTerm, categoryFilter, typeFilter, targetAudienceFilter, sortBy, pagination]);

  const { data, loading: isLoading, error, refetch } = useDataFetching({
    fetchFunction: fetchDocuments,
    dependencies: [session?.user?.id, searchTerm, categoryFilter, typeFilter, targetAudienceFilter, sortBy],
    debounceMs: 300
  });

  // Handle errors from the custom hook
  useEffect(() => {
    if (error) {
      toast.error(tNotification('error.fetchFailed'));
    }
  }, [error, tNotification]);

  // Handle pagination changes separately
  useEffect(() => {
    if (session?.user?.id && pagination.page > 1) {
      refetch();
    }
  }, [pagination.page, pagination.limit, session?.user?.id, refetch]);

  console.log('🔍 Library Page - Data structure:', {
    hasData: !!data,
    dataKeys: data ? Object.keys(data) : [],
    documentsLength: data?.documents?.length || 0,
    rawData: data
  });

  const documents = data?.documents || [];
  console.log('🔍 Library Page - Documents array:', {
    length: documents.length,
    documents: documents.map((doc: LibraryDocument) => ({
      id: doc._id,
      title: doc.title,
      type: doc.type,
      category: doc.category,
      isCloned: doc.isCloned
    }))
  });
  
  // Debug: Log the first document to see its structure
  if (documents.length > 0) {
    console.log('🔍 Library Page - First document structure:', {
      id: documents[0]._id,
      title: documents[0].title,
      type: documents[0].type,
      documentType: documents[0].documentType,
      category: documents[0].category,
      description: documents[0].description,
      allKeys: Object.keys(documents[0])
    });
  }
  
  const userStats = data?.userStats || {
    totalCloned: 0,
    recentlyCloned: 0,
    favoriteCategory: '',
    totalRated: 0
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    refetch();
  };

  const handleCloneDocument = async (documentId: string) => {
    setIsCloning(documentId);
    try {
      const response = await fetch(`/api/library/documents/${documentId}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(tNotification('success.documentCloned'));
        
        // Refresh the data to get updated clone counts
        refetch();
        
        // Also update the selected document if it's the same one
        if (selectedDocument && selectedDocument._id === documentId) {
          setSelectedDocument(prev => prev ? { ...prev, isCloned: true } : null);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || tNotification('error.documentCloneFailed'));
      }
    } catch (error) {
      console.error('Error cloning document:', error);
      toast.error(tNotification('error.documentCloneFailed'));
    } finally {
      setIsCloning(undefined);
    }
  };

  const handleRateDocument = async (documentId: string, rating: number) => {
    try {
      const response = await fetch(`/api/library/documents/${documentId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(tNotification('success.ratingSubmitted'));
        // Refresh the data to get updated ratings
        refetch();
      } else {
        const error = await response.json();
        toast.error(error.error || tNotification('error.ratingFailed'));
      }
    } catch (error) {
      console.error('Error rating document:', error);
      toast.error(tNotification('error.ratingFailed'));
    }
  };

  const downloadDocument = async (doc: LibraryDocument, format: 'pdf' | 'docx') => {
    try {
      // Show loading toast
      const loadingToast = toast.loading(tNotification(`loading.generating${format.toUpperCase()}`));
      
      console.log(`[LIBRARY_DOWNLOAD] Starting ${format} download for document:`, doc._id);
      
      const response = await fetch(`/api/library/documents/${doc._id}/download?format=${format}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      console.log(`[LIBRARY_DOWNLOAD] Response status:`, response.status);
      console.log(`[LIBRARY_DOWNLOAD] Response headers:`, Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const blob = await response.blob();
        console.log(`[LIBRARY_DOWNLOAD] Blob received, size:`, blob.size, 'bytes');
        
        // Check if blob is valid
        if (blob.size === 0) {
          toast.dismiss(loadingToast);
          toast.error(tNotification('error.emptyFile', { format: format.toUpperCase() }));
          console.error(`[LIBRARY_DOWNLOAD] Empty blob received for ${format}`);
          return;
        }
        
        // Check content type
        if (format === 'pdf' && !blob.type.includes('pdf')) {
          toast.dismiss(loadingToast);
          toast.error(tNotification('error.invalidFile', { expected: 'PDF', actual: blob.type }));
          console.error(`[LIBRARY_DOWNLOAD] Invalid content type:`, blob.type);
          return;
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = globalThis.document.createElement('a');
        a.href = url;
        a.download = `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}_${doc.type}.${format}`;
        a.style.display = 'none';
        
        globalThis.document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          globalThis.document.body.removeChild(a);
        }, 100);
        
        toast.dismiss(loadingToast);
        toast.success(tNotification('success.downloadComplete', { format: format.toUpperCase() }));
        console.log(`[LIBRARY_DOWNLOAD] ${format} download completed successfully`);
      } else {
        const errorText = await response.text();
        console.error(`[LIBRARY_DOWNLOAD] Server error:`, response.status, errorText);
        
        let errorMessage = `Failed to download ${format.toUpperCase()}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
          if (errorData.details) {
            console.error(`[LIBRARY_DOWNLOAD] Error details:`, errorData.details);
          }
        } catch (e) {
          console.error(`[LIBRARY_DOWNLOAD] Could not parse error response:`, errorText);
        }
        
        toast.dismiss(loadingToast);
        toast.error(tNotification('error.downloadFailed', { format: format.toUpperCase() }));
      }
    } catch (error) {
      console.error(`[LIBRARY_DOWNLOAD] Network error downloading ${format}:`, error);
      toast.error(tNotification('error.networkError'));
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'personal':
        return <Users className="h-4 w-4" />;
      case 'professional':
        return <FileText className="h-4 w-4" />;
      case 'academic':
        return <GraduationCap className="h-4 w-4" />;
      case 'experience':
        return <Clock className="h-4 w-4" />;
      case 'reference':
        return <Award className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'personal':
        return 'bg-blue-100 text-blue-800';
      case 'professional':
        return 'bg-green-100 text-green-800';
      case 'academic':
        return 'bg-purple-100 text-purple-800';
      case 'experience':
        return 'bg-orange-100 text-orange-800';
      case 'reference':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };



  return (
    <DocumentErrorBoundary
      onRetry={fetchDocuments}
      onCreateNew={() => setCreateDialogOpen(true)}
    >
      <ResponsiveContainer maxWidth="8xl" padding="md" className="py-4 sm:py-8">
      {/* Enhanced Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-12"
      >
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-eddura-100 dark:bg-eddura-800 rounded-lg sm:rounded-xl">
                <Library className="h-6 w-6 sm:h-8 sm:w-8 text-eddura-600 dark:text-eddura-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-4xl font-bold text-eddura-900 dark:text-eddura-100">
                  {t('title')}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-eddura-500" />
                  <span className="text-sm sm:text-base text-eddura-600 dark:text-eddura-400 font-medium">
                    {pagination.total} documents • {userStats.totalCloned} cloned
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm sm:text-lg text-eddura-700 dark:text-eddura-300">
              {t('subtitle')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              size="default"
              onClick={() => window.open('/documents', '_blank')}
              className="border-eddura-300 text-eddura-700 hover:bg-eddura-50 dark:border-eddura-600 dark:text-eddura-300 dark:hover:bg-eddura-800 h-11 sm:h-12"
            >
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {t('quickActions.myDocuments.action')}
            </Button>
            <Button 
              variant="outline" 
              size="default"
              onClick={() => window.open('/documents/cloned', '_blank')}
              className="border-eddura-300 text-eddura-700 hover:bg-eddura-50 dark:border-eddura-600 dark:text-eddura-300 dark:hover:bg-eddura-800 h-11 sm:h-12"
            >
              <Copy className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {t('quickActions.myClonedDocuments.action')}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 sm:mb-8"
      >
        <ResponsiveGrid cols={{ default: 2, md: 4 }} gap="md">
          <StatCard
            label={t('stats.availableDocuments')}
            value={pagination.total.toString()}
            icon={<BookOpen className="h-6 w-6 text-eddura-500" />}
            change={{ value: t('stats.inLibrary'), trend: "neutral" }}
          />
          <StatCard
            label={t('stats.myClonedDocuments')}
            value={userStats.totalCloned.toString()}
            icon={<Copy className="h-6 w-6 text-green-500" />}
            change={{ 
              value: `${userStats.recentlyCloned} ${t('stats.thisWeek')}`, 
              trend: userStats.recentlyCloned > 0 ? "up" : "neutral" 
            }}
          />
          <StatCard
            label={t('stats.favoriteCategory')}
            value={userStats.favoriteCategory || 'None'}
            icon={<Heart className="h-6 w-6 text-red-500" />}
            change={{ value: t('stats.mostCloned'), trend: "neutral" }}
          />
          <StatCard
            label={t('stats.documentsRated')}
            value={userStats.totalRated.toString()}
            icon={<Star className="h-6 w-6 text-yellow-500" />}
            change={{ value: t('stats.reviewsGiven'), trend: "neutral" }}
          />
        </ResponsiveGrid>
      </motion.div>

      {/* Enhanced Quick Actions */}
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
          <h2 className="text-lg sm:text-xl font-semibold text-eddura-900 dark:text-eddura-100">
            {t('quickActions.title')}
          </h2>
        </div>
        
        <ResponsiveGrid cols={{ default: 1, md: 3 }} gap="md">
          <FeatureCard
            icon={<Copy className="h-6 w-6 text-eddura-500" />}
            title={t('quickActions.myClonedDocuments.title')}
            description={t('quickActions.myClonedDocuments.description', { count: userStats.totalCloned })}
            action={{ 
              label: t('quickActions.myClonedDocuments.action'), 
              onClick: () => window.open('/documents/cloned', '_blank')
            }}
          />
          <FeatureCard
            icon={<FileText className="h-6 w-6 text-eddura-500" />}
            title={t('quickActions.myDocuments.title')}
            description={t('quickActions.myDocuments.description')}
            action={{ 
              label: t('quickActions.myDocuments.action'), 
              onClick: () => window.open('/documents', '_blank')
            }}
          />
          <FeatureCard
            icon={<Target className="h-6 w-6 text-eddura-500" />}
            title={t('quickActions.applicationManagement.title')}
            description={t('quickActions.applicationManagement.description')}
            action={{ 
              label: t('quickActions.applicationManagement.action'), 
              onClick: () => window.open('/applications/manage', '_blank')
            }}
          />
        </ResponsiveGrid>
      </motion.div>

      {/* Enhanced Search Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6 sm:mb-8"
      >
        <ModernCard variant="elevated" className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 bg-eddura-100 dark:bg-eddura-800 rounded-lg">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-eddura-600 dark:text-eddura-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-eddura-900 dark:text-eddura-100">
              {t('search.title')}
            </h2>
          </div>
          
          <AdvancedSearchFilters
            onFiltersChange={(filters) => {
              console.log('🔍 Library Page - AdvancedSearchFilters onFiltersChange called with:', filters);
              setSearchTerm(filters.searchTerm);
              // For now, we'll use documentType for both category and type filters
              // In the future, we should separate these properly
              const newCategoryFilter = filters.documentType.length > 0 ? filters.documentType[0] : 'all';
              const newTypeFilter = filters.documentType.length > 0 ? filters.documentType[0] : 'all';
              const newTargetAudienceFilter = filters.targetAudience.length > 0 ? filters.targetAudience[0] : 'all';
              
              console.log('🔍 Library Page - Setting filters:', {
                searchTerm: filters.searchTerm,
                categoryFilter: newCategoryFilter,
                typeFilter: newTypeFilter,
                targetAudienceFilter: newTargetAudienceFilter,
                sortBy: filters.sortBy
              });
              
              setCategoryFilter(newCategoryFilter);
              setTypeFilter(newTypeFilter);
              setTargetAudienceFilter(newTargetAudienceFilter);
              setSortBy(filters.sortBy);
            }}
            onSearch={handleSearch}
            isLoading={isLoading}
          />
        </ModernCard>
      </motion.div>

      {/* Enhanced Documents Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="space-y-8">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <p className="text-eddura-600 dark:text-eddura-400 mt-4">
                    Loading documents...
                  </p>
                </div>
              </div>
            </div>
          ) : documents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ModernCard variant="outlined" className="text-center py-16">
                <div className="space-y-6">
                  <div className="mx-auto w-24 h-24 bg-eddura-100 dark:bg-eddura-800 rounded-full flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-eddura-500 dark:text-eddura-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-eddura-900 dark:text-eddura-100">
                      {t('search.noResults')}
                    </h3>
                    <p className="text-eddura-600 dark:text-eddura-400 max-w-md mx-auto">
                      {t('search.noResultsDescription')}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setCategoryFilter('all');
                        setTypeFilter('all');
                        setTargetAudienceFilter('all');
                        handleSearch();
                      }}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {t('search.clearFilters')}
                    </Button>
                    <Button onClick={() => window.open('/documents', '_blank')}>
                      <FileText className="h-4 w-4 mr-2" />
                      {t('search.createYourOwn')}
                    </Button>
                  </div>
                </div>
              </ModernCard>
            </motion.div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-eddura-100 dark:bg-eddura-800 rounded-lg">
                    <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-eddura-600 dark:text-eddura-400" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-eddura-900 dark:text-eddura-100">
                    {t('documents.title')}
                  </h2>
                </div>
                <Badge 
                  variant="secondary" 
                  className="bg-eddura-100 dark:bg-eddura-800 text-eddura-700 dark:text-eddura-300 text-xs sm:text-sm"
                >
                  {documents.length} results
                </Badge>
              </div>
              
              <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap="md">
                {documents.map((document: LibraryDocument, index: number) => (
                  <motion.div
                    key={document._id}
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
                      
                      <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-eddura-900 dark:text-eddura-100 text-base sm:text-lg line-clamp-2 flex-1">
                              {document.title}
                            </h3>
                            {document.isCloned && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs shrink-0">
                                <Check className="h-3 w-3 mr-1" />
                                {t('documents.cloned')}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={`${getCategoryColor(document.category)} text-xs`}>
                              {getCategoryIcon(document.category)}
                              <span className="ml-1 capitalize">{document.category}</span>
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-accent/10 border-accent/30 text-accent-dark dark:text-accent-light">
                              {document.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-eddura-600 dark:text-eddura-400 line-clamp-2 sm:line-clamp-3">
                            {truncateText(document.description, 120)}
                          </p>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-eddura-500 dark:text-eddura-400">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{document.viewCount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Copy className="h-3 w-3" />
                              <span>{document.cloneCount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              <span>{document.averageRating.toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="text-xs text-eddura-500 dark:text-eddura-400">
                            {document.wordCount} words
                          </div>
                        </div>

                        {/* Tags */}
                        {document.tags && document.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {document.tags.slice(0, 2).map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {document.tags.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{document.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDocument(document);
                              setIsPreviewDialogOpen(true);
                            }}
                            className="flex-1 h-9 text-xs sm:text-sm"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            {t('documents.previewDocument')}
                          </Button>
                          {document.isCloned ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open('/documents/cloned', '_blank')}
                              className="flex-1 h-9 text-xs sm:text-sm"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {t('documents.viewMore')}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleCloneDocument(document._id)}
                              disabled={isCloning === document._id}
                              className="flex-1 bg-eddura-500 hover:bg-eddura-600 h-9 text-xs sm:text-sm"
                            >
                              {isCloning === document._id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <>
                                  <Copy className="h-3 w-3 mr-1" />
                                  {t('documents.cloneDocument')}
                                </>
                              )}
                            </Button>
                          )}
                        </div>

                        {/* Interactive Rating */}
                        <div className="flex items-center justify-center gap-1 pt-2 border-t border-eddura-100 dark:border-eddura-700">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRateDocument(document._id, star)}
                              className="text-eddura-300 dark:text-eddura-600 hover:text-yellow-400 transition-colors p-1"
                            >
                              <Star 
                                className={`h-4 w-4 ${
                                  star <= document.averageRating ? 'text-yellow-400 fill-current' : ''
                                }`} 
                              />
                            </button>
                          ))}
                          <span className="ml-2 text-xs text-eddura-500 dark:text-eddura-400">
                            ({document.ratingCount})
                          </span>
                        </div>
                      </CardContent>
                    </ModernCard>
                  </motion.div>
                ))}
              </ResponsiveGrid>
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.title}</DialogTitle>
            <DialogDescription>
              {selectedDocument?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDocument && (
              <>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Published: {formatDate(selectedDocument.publishedAt || selectedDocument.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>{selectedDocument.wordCount} words</span>
                  </div>
                  {selectedDocument.author && (
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>By: {selectedDocument.author}</span>
                    </div>
                  )}
                </div>
                <div className="border-t pt-4">
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {selectedDocument.content}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedDocument && downloadDocument(selectedDocument, 'pdf')}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  {t('documents.downloadPDF')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedDocument && downloadDocument(selectedDocument, 'docx')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('documents.downloadDOCX')}
                </Button>
              </div>
              <div>
                {selectedDocument?.isCloned ? (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <Check className="h-4 w-4 mr-2" /> {t('documents.alreadyCloned')}
                    </Badge>
                    <Button
                      variant="outline"
                      onClick={() => window.open('/documents/cloned', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t('documents.viewMore')}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => selectedDocument && handleCloneDocument(selectedDocument._id)}
                    disabled={!!(selectedDocument && isCloning === selectedDocument._id)}
                  >
                    {selectedDocument && isCloning === selectedDocument._id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    {t('documents.cloneDocument')}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </ResponsiveContainer>
    </DocumentErrorBoundary>
  );
} 