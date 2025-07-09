'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  FileText, 
  Clock,
  Users,
  Calendar
} from 'lucide-react';
import CSVImportModal from '@/components/admin/CSVImportModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApplicationTemplates } from '@/hooks/use-application-templates';
import { ApplicationTemplate, FormSection } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export default function ApplicationTemplatesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | null>(null);

  const { templates, pagination, error, isLoading, mutate } = useApplicationTemplates({
    search: searchTerm || undefined,
    isActive: isActiveFilter === null ? undefined : isActiveFilter,
    page: 1,
    limit: 20
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (value: boolean | null) => {
    setIsActiveFilter(value);
  };

  const handleCreateTemplate = () => {
    router.push('/admin/application-templates/create');
  };

  const handleEditTemplate = (template: ApplicationTemplate) => {
    router.push(`/admin/application-templates/${template.id}/edit`);
  };

  const handleViewTemplate = (template: ApplicationTemplate) => {
    router.push(`/admin/application-templates/${template.id}`);
  };

  const handleDeleteTemplate = async (template: ApplicationTemplate) => {
    if (confirm(`Are you sure you want to delete "${template.title}"?`)) {
      try {
        // Import the delete function
        const { deleteApplicationTemplate } = await import('@/hooks/use-application-templates');
        await deleteApplicationTemplate(template.id);
        mutate(); // Refresh the list
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Error loading application templates: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Templates</h1>
          <p className="text-gray-600 mt-2">
            Manage application form templates for scholarships
          </p>
        </div>
        <div className="flex gap-2">
          <CSVImportModal
            title="Import Application Templates"
            description="Upload a CSV file to import application templates. Templates must reference existing scholarships. Download the template to see the required format."
            importEndpoint="/api/application-templates/csv-import"
            templateEndpoint="/api/application-templates/csv-template"
            onImportComplete={() => {
              mutate(); // Refresh templates data after import
            }}
          />
          <Button
            onClick={handleCreateTemplate}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={isActiveFilter === null ? "default" : "outline"}
                onClick={() => handleFilterChange(null)}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={isActiveFilter === true ? "default" : "outline"}
                onClick={() => handleFilterChange(true)}
                size="sm"
              >
                Active
              </Button>
              <Button
                variant={isActiveFilter === false ? "default" : "outline"}
                onClick={() => handleFilterChange(false)}
                size="sm"
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || isActiveFilter !== null 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first application template'
              }
            </p>
            {!searchTerm && isActiveFilter === null && (
              <Button onClick={handleCreateTemplate}>
                Create Your First Template
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template: ApplicationTemplate) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                      {template.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={template.isActive ? "default" : "secondary"}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">
                        v{template.version}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewTemplate(template)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                        Edit Template
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteTemplate(template)}
                        className="text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {template.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {template.description}
                  </p>
                )}
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{template.estimatedTime} minutes</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{template.sections?.length || 0} sections</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>
                      {template.sections?.reduce((total: number, section: FormSection) => 
                        total + (section.questions?.length || 0), 0
                      ) || 0} questions
                    </span>
                  </div>
                  
                  {template.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Created {formatDistanceToNow(new Date(template.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button
                    onClick={() => handleViewTemplate(template)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    View Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevPage}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 