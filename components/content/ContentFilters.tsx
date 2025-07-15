'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, X } from 'lucide-react';

interface ContentFiltersProps {
  currentType?: string;
  currentCategory?: string;
  currentTag?: string;
  currentSearch?: string;
}

interface FilterData {
  categories: string[];
  tags: string[];
}

export default function ContentFilters({
  currentType,
  currentCategory,
  currentTag,
  currentSearch
}: ContentFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(currentSearch || '');
  const [filterData, setFilterData] = useState<FilterData>({ categories: [], tags: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilterData();
  }, []);

  const fetchFilterData = async () => {
    try {
      const response = await fetch('/api/content/filters');
      if (response.ok) {
        const data = await response.json();
        setFilterData(data);
      }
    } catch (error) {
      console.error('Error fetching filter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    // Reset to page 1 when filters change
    params.delete('page');
    
    router.push(`/content?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm || undefined });
  };

  const clearFilters = () => {
    setSearchTerm('');
    router.push('/content');
  };

  const hasActiveFilters = currentType || currentCategory || currentTag || currentSearch;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-3">
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" className="w-full">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {hasActiveFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Active Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentType && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Type: {currentType}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => updateFilters({ type: undefined })}
                  />
                </Badge>
              )}
              {currentCategory && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {currentCategory}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => updateFilters({ category: undefined })}
                  />
                </Badge>
              )}
              {currentTag && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Tag: {currentTag}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => updateFilters({ tag: undefined })}
                  />
                </Badge>
              )}
              {currentSearch && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: &quot;{currentSearch}&quot;
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => updateFilters({ search: undefined })}
                  />
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full mt-3"
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Type Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Content Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { value: 'blog', label: 'Blog Posts', count: 0 },
              { value: 'opportunity', label: 'Opportunities', count: 0 },
              { value: 'event', label: 'Events', count: 0 }
            ].map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={currentType === type.value}
                  onCheckedChange={(checked) => {
                    updateFilters({ type: checked ? type.value : undefined });
                  }}
                />
                <Label
                  htmlFor={`type-${type.value}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {type.label}
                </Label>
                <Badge variant="outline" className="text-xs">
                  {type.count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categories Filter */}
      {filterData.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filterData.categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={currentCategory === category}
                    onCheckedChange={(checked) => {
                      updateFilters({ category: checked ? category : undefined });
                    }}
                  />
                  <Label
                    htmlFor={`category-${category}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Tags */}
      {filterData.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Popular Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filterData.tags.slice(0, 10).map((tag) => (
                <Badge
                  key={tag}
                  variant={currentTag === tag ? "default" : "outline"}
                  className="cursor-pointer hover:bg-blue-50"
                  onClick={() => updateFilters({ tag: currentTag === tag ? undefined : tag })}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => updateFilters({ type: 'opportunity' })}
            >
              Latest Opportunities
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => updateFilters({ type: 'event' })}
            >
              Upcoming Events
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => updateFilters({ type: 'blog' })}
            >
              Educational Resources
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}