'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Scholarship } from '@/types';
import { Search, Plus, Edit, Trash2, Calendar, DollarSign, ExternalLink } from 'lucide-react';

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [filteredScholarships, setFilteredScholarships] = useState<Scholarship[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchScholarships = useCallback(async () => {
    try {
      const response = await fetch('/api/scholarships');
      const data = await response.json();
      setScholarships(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch scholarships',
        variant: 'destructive'
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  useEffect(() => {
    const filtered = scholarships.filter(scholarship =>
      scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholarship.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholarship.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredScholarships(filtered);
  }, [scholarships, searchTerm]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scholarship?')) return;

    try {
      const response = await fetch(`/api/scholarships/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Scholarship deleted successfully'
        });
        fetchScholarships();
      } else {
        throw new Error('Failed to delete scholarship');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete scholarship',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scholarships</h1>
          <p className="text-gray-600">Manage scholarship opportunities</p>
        </div>
        <Link href="/admin/scholarships/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Scholarship
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search scholarships by title, provider, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Scholarships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScholarships.map((scholarship) => (
          <Link
            key={scholarship.id}
            href={`/admin/scholarships/${scholarship.id}`}
            className="block group focus:outline-none"
            aria-label={`View details for ${scholarship.title}`}
          >
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer group-focus:ring-2 group-focus:ring-blue-500 relative"
              tabIndex={0}
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 group-hover:underline group-focus:underline">{scholarship.title}</CardTitle>
                    <div className="text-sm text-gray-600 mb-2">
                      {scholarship.provider}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{scholarship.frequency}</Badge>
                      {scholarship.numberOfAwardsPerYear && (
                        <Badge variant="secondary">
                          {scholarship.numberOfAwardsPerYear} awards/year
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1 z-10" onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                    <Link href={`/admin/scholarships/${scholarship.id}/edit`} tabIndex={-1} legacyBehavior>
                      <Button size="sm" variant="ghost" onClick={e => e.stopPropagation()}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={e => { e.stopPropagation(); handleDelete(scholarship.id); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {scholarship.value.toLocaleString()} {scholarship.currency}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    Deadline: {formatDate(scholarship.deadline)}
                  </div>

                  {scholarship.coverage.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Coverage:</div>
                      <div className="flex flex-wrap gap-1">
                        {scholarship.coverage.slice(0, 2).map((item, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                        {scholarship.coverage.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{scholarship.coverage.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {scholarship.linkedSchool && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">School:</span> {scholarship.linkedSchool}
                    </div>
                  )}

                  {scholarship.tags && scholarship.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {scholarship.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {scholarship.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{scholarship.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <a
                      href={scholarship.applicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                      onClick={e => e.stopPropagation()}
                      tabIndex={-1}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Apply
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredScholarships.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No scholarships found</div>
          <div className="text-gray-400 text-sm mt-1">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first scholarship to get started'}
          </div>
        </div>
      )}
    </div>
  );
}