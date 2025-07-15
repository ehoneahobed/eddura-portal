'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { 
  Calendar, 
  User, 
  Clock, 
  BookOpen, 
  Award, 
  MapPin,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

interface ContentCardProps {
  content: {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    type: 'blog' | 'opportunity' | 'event';
    author: string;
    publishDate?: string;
    categories: string[];
    tags: string[];
    viewCount: number;
    featuredImage?: string;
    eventDate?: string;
    eventLocation?: string;
    eventType?: string;
    registrationLink?: string;
    opportunityType?: string;
    deadline?: string;
    value?: string;
    applicationLink?: string;
  };
}

export default function ContentCard({ content }: ContentCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return <BookOpen className="w-4 h-4" />;
      case 'opportunity': return <Award className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
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

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200 group">
      <CardContent className="p-6 h-full flex flex-col">
        {/* Featured Image */}
        {content.featuredImage && (
          <div className="mb-4 -mx-6 -mt-6">
            <Image
              src={content.featuredImage}
              alt={content.title}
              width={400}
              height={200}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        )}
        
        {/* Type and Categories */}
        <div className="flex items-center gap-2 mb-3">
          <Badge className={getTypeColor(content.type)}>
            <div className="flex items-center gap-1">
              {getTypeIcon(content.type)}
              {content.type}
            </div>
          </Badge>
          {content.categories.slice(0, 2).map((category) => (
            <Badge key={category} variant="outline" className="text-xs">
              {category}
            </Badge>
          ))}
          {content.categories.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{content.categories.length - 2}
            </Badge>
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          <a href={`/content/${content.slug}`}>
            {content.title}
          </a>
        </h3>
        
        {/* Excerpt */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
          {content.excerpt}
        </p>
        
        {/* Type-specific Information */}
        {content.type === 'event' && content.eventDate && (
          <div className="mb-4 p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-orange-800">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">
                {format(new Date(content.eventDate), 'MMM dd, yyyy')}
              </span>
            </div>
            {content.eventLocation && (
              <div className="flex items-center gap-2 text-sm text-orange-700 mt-1">
                <MapPin className="w-3 h-3" />
                <span>{content.eventLocation}</span>
              </div>
            )}
            {content.registrationLink && (
              <Button asChild size="sm" className="mt-2 w-full">
                <a href={content.registrationLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Register
                </a>
              </Button>
            )}
          </div>
        )}
        
        {content.type === 'opportunity' && content.deadline && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-purple-800">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">
                Deadline: {format(new Date(content.deadline), 'MMM dd, yyyy')}
              </span>
            </div>
            {content.value && (
              <div className="text-sm text-purple-700 mt-1">
                <span className="font-medium">Value:</span> {content.value}
              </div>
            )}
            {content.applicationLink && (
              <Button asChild size="sm" className="mt-2 w-full">
                <a href={content.applicationLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Apply Now
                </a>
              </Button>
            )}
          </div>
        )}
        
        {/* Meta Information */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {content.author}
            </div>
            {content.publishDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(content.publishDate), 'MMM dd')}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {getReadingTime(content.excerpt)} min
            </div>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {content.viewCount}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}