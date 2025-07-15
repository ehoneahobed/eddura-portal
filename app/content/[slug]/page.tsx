import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import connectDB from '@/lib/mongodb';
import Content from '@/models/Content';
import ContentCTA from '@/components/content/ContentCTA';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  User, 
  MapPin, 
  ExternalLink, 
  Clock, 
  Award,
  Tag,
  Share2,
  BookOpen
} from 'lucide-react';
import { format } from 'date-fns';

interface ContentPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ContentPageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  
  const content = await Content.findOne({ 
    slug,
    status: 'published' 
  }).lean();
  
  if (!content) {
    return {
      title: 'Content Not Found',
      description: 'The requested content could not be found.'
    };
  }
  
  const metaTitle = content.metaTitle || content.title;
  const metaDescription = content.metaDescription || content.excerpt;
  
  return {
    title: metaTitle,
    description: metaDescription,
    keywords: content.keywords,
    openGraph: {
      title: content.socialTitle || metaTitle,
      description: content.socialDescription || metaDescription,
      type: 'article',
      images: content.socialShareImage ? [content.socialShareImage] : [],
      publishedTime: content.publishDate?.toISOString(),
      authors: [content.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: content.socialTitle || metaTitle,
      description: content.socialDescription || metaDescription,
      images: content.socialShareImage ? [content.socialShareImage] : [],
    },
    alternates: {
      canonical: content.canonicalUrl || `/content/${content.slug}`,
    },
  };
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { slug } = await params;
  await connectDB();
  
  const content = await Content.findOne({ 
    slug,
    status: 'published' 
  }).lean();
  
  if (!content) {
    notFound();
  }
  
  // Get related content
  const relatedContent = await Content.find({
    _id: { $ne: content._id },
    status: 'published',
    $or: [
      { categories: { $in: content.categories } },
      { tags: { $in: content.tags } },
      { type: content.type }
    ]
  })
  .sort({ publishDate: -1 })
  .limit(3)
  .lean();
  
  // Generate structured data
  const structuredData: any = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.title,
    description: content.excerpt,
    image: content.featuredImage,
    author: {
      '@type': 'Person',
      name: content.author
    },
    publisher: {
      '@type': 'Organization',
      name: 'Eddura',
      logo: {
        '@type': 'ImageObject',
        url: 'https://eddura.com/logo.png'
      }
    },
    datePublished: content.publishDate?.toISOString(),
    dateModified: content.updatedAt?.toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://eddura.com/content/${content.slug}`
    }
  };
  
  // Add event-specific structured data
  if (content.type === 'event' && content.eventDate) {
    structuredData['@type'] = 'Event';
    structuredData.name = content.title;
    structuredData.startDate = content.eventDate.toISOString();
    if (content.eventEndDate) {
      structuredData.endDate = content.eventEndDate.toISOString();
    }
    if (content.eventLocation) {
      structuredData.location = {
        '@type': 'Place',
        name: content.eventLocation
      };
    }
  }
  
  // Add opportunity-specific structured data
  if (content.type === 'opportunity') {
    structuredData['@type'] = 'Scholarship';
    structuredData.name = content.title;
    if (content.deadline) {
      structuredData.applicationDeadline = content.deadline.toISOString();
    }
    if (content.value) {
      structuredData.amount = content.value;
    }
  }
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return <BookOpen className="w-5 h-5" />;
      case 'opportunity': return <Award className="w-5 h-5" />;
      case 'event': return <Calendar className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blog': return 'bg-blue-100 text-blue-800';
      case 'opportunity': return 'bg-purple-100 text-purple-800';
      case 'event': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-6 py-8">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumb */}
              <nav className="text-sm text-gray-500 mb-4">
                <Link href="/content" className="hover:text-blue-600">Content Hub</Link>
                <span className="mx-2">/</span>
                <span className="capitalize">{content.type}</span>
                <span className="mx-2">/</span>
                <span>{content.title}</span>
              </nav>
              
              {/* Content Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={getTypeColor(content.type)}>
                    <div className="flex items-center gap-1">
                      {getTypeIcon(content.type)}
                      {content.type}
                    </div>
                  </Badge>
                  {content.categories.map((category) => (
                    <Badge key={category} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {content.title}
                </h1>
                
                <p className="text-xl text-gray-600 mb-6">
                  {content.excerpt}
                </p>
                
                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {content.author}
                  </div>
                  
                  {content.publishDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(content.publishDate), 'MMM dd, yyyy')}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {Math.ceil(content.content.split(/\s+/).length / 200)} min read
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {content.viewCount} views
                  </div>
                </div>
              </div>
              
              {/* Featured Image */}
              {content.featuredImage && (
                <div className="mb-8">
                  <Image
                    src={content.featuredImage}
                    alt={content.title}
                    width={800}
                    height={400}
                    className="w-full h-64 md:h-96 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Type-specific Information */}
                {content.type === 'event' && (
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Event Details</h3>
                      <div className="space-y-3">
                        {content.eventDate && (
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <div>
                              <div className="font-medium">Date & Time</div>
                              <div className="text-sm text-gray-600">
                                {format(new Date(content.eventDate), 'EEEE, MMMM dd, yyyy')}
                                {content.eventEndDate && (
                                  <> - {format(new Date(content.eventEndDate), 'EEEE, MMMM dd, yyyy')}</>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {content.eventLocation && (
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-gray-500" />
                            <div>
                              <div className="font-medium">Location</div>
                              <div className="text-sm text-gray-600">{content.eventLocation}</div>
                            </div>
                          </div>
                        )}
                        
                        {content.eventType && (
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 text-gray-500">📍</div>
                            <div>
                              <div className="font-medium">Event Type</div>
                              <div className="text-sm text-gray-600 capitalize">{content.eventType}</div>
                            </div>
                          </div>
                        )}
                        
                        {content.registrationLink && (
                          <Button asChild className="w-full mt-4">
                            <a href={content.registrationLink} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Register for Event
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {content.type === 'opportunity' && (
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Opportunity Details</h3>
                      <div className="space-y-3">
                        {content.opportunityType && (
                          <div className="flex items-center gap-3">
                            <Award className="w-5 h-5 text-gray-500" />
                            <div>
                              <div className="font-medium">Type</div>
                              <div className="text-sm text-gray-600 capitalize">{content.opportunityType}</div>
                            </div>
                          </div>
                        )}
                        
                        {content.deadline && (
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <div>
                              <div className="font-medium">Deadline</div>
                              <div className="text-sm text-gray-600">
                                {format(new Date(content.deadline), 'EEEE, MMMM dd, yyyy')}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {content.value && (
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 text-gray-500">💰</div>
                            <div>
                              <div className="font-medium">Value</div>
                              <div className="text-sm text-gray-600">{content.value}</div>
                            </div>
                          </div>
                        )}
                        
                        {content.eligibility && (
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 text-gray-500 mt-0.5">📋</div>
                            <div>
                              <div className="font-medium">Eligibility</div>
                              <div className="text-sm text-gray-600">{content.eligibility}</div>
                            </div>
                          </div>
                        )}
                        
                        {content.applicationLink && (
                          <Button asChild className="w-full mt-4">
                            <a href={content.applicationLink} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Apply Now
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Top CTA */}
                {content.cta?.enabled && content.cta.position === 'top' && (
                  <ContentCTA cta={content.cta} className="mb-6" />
                )}
                
                {/* Main Content */}
                <div className="prose prose-lg max-w-none mb-8">
                  <div dangerouslySetInnerHTML={{ __html: content.content }} />
                </div>
                
                {/* Bottom CTA */}
                {content.cta?.enabled && content.cta.position === 'bottom' && (
                  <ContentCTA cta={content.cta} className="mb-8" />
                )}
                
                {/* Tags */}
                {content.tags.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {content.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Share Buttons */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3">Share this content</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* Sidebar CTA */}
                {content.cta?.enabled && content.cta.position === 'sidebar' && (
                  <ContentCTA cta={content.cta} className="mb-6" />
                )}
                
                {/* Related Content */}
                {relatedContent.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Related Content</h3>
                      <div className="space-y-4">
                        {relatedContent.map((item) => (
                          <div key={item._id?.toString() || item.slug} className="border-b border-gray-200 pb-4 last:border-b-0">
                            <a 
                              href={`/content/${item.slug}`}
                              className="block hover:text-blue-600 transition-colors"
                            >
                              <h4 className="font-medium text-sm mb-1 line-clamp-2">
                                {item.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Badge className={getTypeColor(item.type)}>
                                  {item.type}
                                </Badge>
                                {item.publishDate && (
                                  <span>{format(new Date(item.publishDate), 'MMM dd')}</span>
                                )}
                              </div>
                            </a>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}