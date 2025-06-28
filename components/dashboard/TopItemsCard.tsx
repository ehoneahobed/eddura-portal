import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { MapPin, DollarSign, Calendar, Users } from 'lucide-react';

interface TopSchool {
  id: string;
  name: string;
  country: string;
  programCount: number;
  globalRanking?: number;
}

interface TopProgram {
  id: string;
  name: string;
  schoolName: string;
  degreeType: string;
  fieldOfStudy: string;
  tuitionFees: {
    international: number;
    currency: string;
  };
}

interface TopScholarship {
  id: string;
  title: string;
  provider: string;
  value: number | string;
  currency?: string;
  deadline: string;
}

interface TopItemsCardProps {
  title: string;
  type: 'schools' | 'programs' | 'scholarships';
  items: TopSchool[] | TopProgram[] | TopScholarship[];
  isLoading?: boolean;
}

const getCurrencySymbol = (code: string) => {
  switch (code) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'CAD': return 'C$';
    case 'AUD': return 'A$';
    case 'JPY': return '¥';
    case 'CNY': return '¥';
    case 'INR': return '₹';
    case 'ZAR': return 'R';
    case 'NGN': return '₦';
    case 'GHS': return '₵';
    default: return code;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export function TopItemsCard({ title, type, items, isLoading = false }: TopItemsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No {type} found
            </div>
          ) : (
            items.slice(0, 5).map((item, index) => {
              const href = `/admin/${type}/${item.id}`;
              
              if (type === 'schools') {
                const school = item as TopSchool;
                return (
                  <Link key={item.id} href={href} className="block group">
                    <div className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm group-hover:text-blue-600">
                          {school.name}
                        </h4>
                        {school.globalRanking && (
                          <Badge variant="secondary" className="text-xs">
                            #{school.globalRanking}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {school.country}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {school.programCount} programs
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              }
              
              if (type === 'programs') {
                const program = item as TopProgram;
                return (
                  <Link key={item.id} href={href} className="block group">
                    <div className="p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm group-hover:text-green-600">
                          {program.name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {program.degreeType}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {program.schoolName}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <div>{program.fieldOfStudy}</div>
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {getCurrencySymbol(program.tuitionFees.currency)}
                          {program.tuitionFees.international.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              }
              
              if (type === 'scholarships') {
                const scholarship = item as TopScholarship;
                return (
                  <Link key={item.id} href={href} className="block group">
                    <div className="p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm group-hover:text-purple-600">
                          {scholarship.title}
                        </h4>
                        <div className="text-xs text-gray-500">
                          {scholarship.provider}
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {typeof scholarship.value === 'number' 
                            ? `${scholarship.value.toLocaleString()} ${scholarship.currency || ''}`
                            : scholarship.value
                          }
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(scholarship.deadline)}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              }
              
              return null;
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
} 