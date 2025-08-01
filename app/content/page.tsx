import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import Content from '@/models/Content';
import ContentCard from '@/components/content/ContentCard';
import ContentFilters from '@/components/content/ContentFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Content Hub - Educational Resources, Opportunities & Events',
  description: 'Discover educational resources, scholarship opportunities, fellowships, events, and expert insights to advance your academic and professional journey.',
  keywords: [
    'educational resources',
    'scholarships',
    'fellowships',
    'educational events',
    'academic opportunities',
    'student resources',
    'higher education',
    'study abroad',
    'academic grants'
  ],
  openGraph: {
    title: 'Content Hub - Educational Resources, Opportunities & Events',
    description: 'Discover educational resources, scholarship opportunities, fellowships, events, and expert insights.',
    type: 'website',
  },
};

interface ContentPageProps {
  searchParams: Promise<{
    type?: string;
    category?: string;
    tag?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function ContentPage({ searchParams }: ContentPageProps) {
  let content: any[] = [];
  let total = 0;
  let blogCount = 0;
  let opportunityCount = 0;
  let eventCount = 0;
  const limit = 12;
  
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1');
  const skip = (page - 1) * limit;
  
  try {
    await connectDB();
    
    // Build query for published content only
    const query: any = { status: 'published' };
    
    if (resolvedSearchParams.type) query.type = resolvedSearchParams.type;
    if (resolvedSearchParams.category) query.categories = { $in: [resolvedSearchParams.category] };
    if (resolvedSearchParams.tag) query.tags = { $in: [resolvedSearchParams.tag] };
    
    if (resolvedSearchParams.search) {
      query.$or = [
        { title: { $regex: resolvedSearchParams.search, $options: 'i' } },
        { content: { $regex: resolvedSearchParams.search, $options: 'i' } },
        { excerpt: { $regex: resolvedSearchParams.search, $options: 'i' } },
        { tags: { $in: [new RegExp(resolvedSearchParams.search, 'i')] } }
      ];
    }
    
    // Get content with pagination
    [content, total] = await Promise.all([
      Content.find(query)
        .sort({ publishDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Content.countDocuments(query)
    ]);
    
    // Get content statistics
    [blogCount, opportunityCount, eventCount] = await Promise.all([
      Content.countDocuments({ type: 'blog', status: 'published' }),
      Content.countDocuments({ type: 'opportunity', status: 'published' }),
      Content.countDocuments({ type: 'event', status: 'published' })
    ]);
  } catch (error) {
    console.error('Error loading content page:', error);
    // Continue with empty data for build time
  }
  
  const totalPages = Math.ceil(total / limit);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Educational Content Hub
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Discover valuable resources, opportunities, and insights to advance your educational journey
            </p>
            
            {/* Content Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{blogCount}</div>
                  <div className="text-sm opacity-90">Blog Posts</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <Award className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{opportunityCount}</div>
                  <div className="text-sm opacity-90">Opportunities</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{eventCount}</div>
                  <div className="text-sm opacity-90">Events</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <ContentFilters 
              currentType={resolvedSearchParams.type}
              currentCategory={resolvedSearchParams.category}
              currentTag={resolvedSearchParams.tag}
              currentSearch={resolvedSearchParams.search}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Results Header */}
            {resolvedSearchParams.search && (
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">
                  Search Results for &quot;{resolvedSearchParams.search}&quot;
                </h2>
                <p className="text-gray-600">
                  Found {total} result{total !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Content Grid */}
            {content.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {content.map((item) => (
                  <ContentCard 
                    key={item._id?.toString() || item.slug} 
                    content={{
                      _id: item._id?.toString() || '',
                      title: item.title,
                      slug: item.slug,
                      excerpt: item.excerpt,
                      type: item.type,
                      author: item.author,
                      publishDate: item.publishDate?.toISOString(),
                      categories: item.categories,
                      tags: item.tags,
                      viewCount: item.viewCount,
                      featuredImage: item.featuredImage,
                      eventDate: item.eventDate?.toISOString(),
                      eventLocation: item.eventLocation,
                      eventType: item.eventType,
                      registrationLink: item.registrationLink,
                      opportunityType: item.opportunityType,
                      deadline: item.deadline?.toISOString(),
                      value: item.value,
                      applicationLink: item.applicationLink,
                    }} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <BookOpen className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No content found</h3>
                <p className="text-gray-600 mb-6">
                  {resolvedSearchParams.search 
                    ? `No results found for &quot;${resolvedSearchParams.search}&quot;. Try adjusting your search terms.`
                    : 'No content available at the moment. Check back soon!'
                  }
                </p>
                {resolvedSearchParams.search && (
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/content'}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex gap-2">
                  {page > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const params = new URLSearchParams(resolvedSearchParams);
                        params.set('page', (page - 1).toString());
                        window.location.href = `/content?${params.toString()}`;
                      }}
                    >
                      Previous
                    </Button>
                  )}
                  
                  <div className="flex items-center px-4">
                    Page {page} of {totalPages}
                  </div>
                  
                  {page < totalPages && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const params = new URLSearchParams(resolvedSearchParams);
                        params.set('page', (page + 1).toString());
                        window.location.href = `/content?${params.toString()}`;
                      }}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}