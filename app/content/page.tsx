import { Metadata } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
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
  searchParams: {
    type?: string;
    category?: string;
    tag?: string;
    search?: string;
    page?: string;
  };
}

export default async function ContentPage({ searchParams }: ContentPageProps) {
  await connectToDatabase();
  
  const page = parseInt(searchParams.page || '1');
  const limit = 12;
  const skip = (page - 1) * limit;
  
  // Build query for published content only
  const query: any = { status: 'published' };
  
  if (searchParams.type) query.type = searchParams.type;
  if (searchParams.category) query.categories = { $in: [searchParams.category] };
  if (searchParams.tag) query.tags = { $in: [searchParams.tag] };
  
  if (searchParams.search) {
    query.$or = [
      { title: { $regex: searchParams.search, $options: 'i' } },
      { content: { $regex: searchParams.search, $options: 'i' } },
      { excerpt: { $regex: searchParams.search, $options: 'i' } },
      { tags: { $in: [new RegExp(searchParams.search, 'i')] } }
    ];
  }
  
  // Get content with pagination
  const [content, total] = await Promise.all([
    Content.find(query)
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Content.countDocuments(query)
  ]);
  
  // Get content statistics
  const [blogCount, opportunityCount, eventCount] = await Promise.all([
    Content.countDocuments({ type: 'blog', status: 'published' }),
    Content.countDocuments({ type: 'opportunity', status: 'published' }),
    Content.countDocuments({ type: 'event', status: 'published' })
  ]);
  
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
              currentType={searchParams.type}
              currentCategory={searchParams.category}
              currentTag={searchParams.tag}
              currentSearch={searchParams.search}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Results Header */}
            {searchParams.search && (
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">
                  Search Results for "{searchParams.search}"
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
                  <ContentCard key={item._id} content={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <BookOpen className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No content found</h3>
                <p className="text-gray-600 mb-6">
                  {searchParams.search 
                    ? `No results found for "${searchParams.search}". Try adjusting your search terms.`
                    : 'No content available at the moment. Check back soon!'
                  }
                </p>
                {searchParams.search && (
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
                        const params = new URLSearchParams(searchParams);
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
                        const params = new URLSearchParams(searchParams);
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