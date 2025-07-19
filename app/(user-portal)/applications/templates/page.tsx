'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  Filter,
  FileText,
  Users,
  Star,
  Plus,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RequirementsTemplateSelector } from '@/components/applications/RequirementsTemplateSelector';
import { AddRequirementModal } from '@/components/applications/AddRequirementModal';

interface Template {
  _id: string;
  name: string;
  description?: string;
  category: 'graduate' | 'undergraduate' | 'scholarship' | 'custom';
  requirements: any[];
  usageCount: number;
  isSystemTemplate: boolean;
  isActive: boolean;
  createdBy?: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function RequirementsTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/requirements-templates');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch templates');
      }

      setTemplates(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesType = typeFilter === 'all' || 
                       (typeFilter === 'system' && template.isSystemTemplate) ||
                       (typeFilter === 'custom' && !template.isSystemTemplate);
    return matchesSearch && matchesCategory && matchesType;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'graduate':
        return <FileText className="h-4 w-4" />;
      case 'undergraduate':
        return <FileText className="h-4 w-4" />;
      case 'scholarship':
        return <Star className="h-4 w-4" />;
      case 'custom':
        return <Users className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'graduate':
        return 'bg-blue-100 text-blue-800';
      case 'undergraduate':
        return 'bg-green-100 text-green-800';
      case 'scholarship':
        return 'bg-yellow-100 text-yellow-800';
      case 'custom':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleTemplateCreated = () => {
    setShowCreateModal(false);
    fetchTemplates(); // Refresh the list
  };

  const handleTemplateApplied = () => {
    // This would typically redirect to the application packages page
    // or show a success message
    console.log('Template applied successfully');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Templates</h2>
              <p className="mb-4">{error}</p>
              <Button onClick={fetchTemplates}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Requirements Templates</h1>
          <p className="text-gray-600 mt-2">
            Browse and manage requirements templates for your applications
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Search:</span>
            </div>
            
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="graduate">Graduate</SelectItem>
                <SelectItem value="undergraduate">Undergraduate</SelectItem>
                <SelectItem value="scholarship">Scholarship</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="system">System Templates</SelectItem>
                <SelectItem value="custom">Custom Templates</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {templates.length === 0 ? 'No Templates Available' : 'No templates found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {templates.length === 0 
                ? 'System templates will be available once they are set up by administrators.'
                : 'Try adjusting your search or filters.'
              }
            </p>
            {templates.length === 0 && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Template
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(template.category)}
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                    {template.isSystemTemplate && (
                      <Badge variant="secondary" className="text-xs">
                        System
                      </Badge>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setSelectedTemplate(template);
                        setShowPreview(true);
                      }}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      {!template.isSystemTemplate && (
                        <>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Template
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{template.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="h-4 w-4" />
                  <span>{template.requirements.length} requirements</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="h-4 w-4" />
                  <span>{template.usageCount} applications</span>
                </div>

                {template.createdBy && !template.isSystemTemplate && (
                  <div className="text-xs text-gray-500">
                    Created by {template.createdBy.name}
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Updated {formatDate(template.updatedAt)}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowPreview(true);
                    }}
                    className="flex-1"
                  >
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      // This would typically open the template selector for applying
                      console.log('Apply template:', template._id);
                    }}
                    className="flex-1"
                  >
                    Apply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Template Preview Modal */}
      {showPreview && selectedTemplate && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Template Preview: {selectedTemplate.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Template Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Category:</span> {selectedTemplate.category}
                  </div>
                  <div>
                    <span className="font-medium">Requirements:</span> {selectedTemplate.requirements.length}
                  </div>
                  <div>
                    <span className="font-medium">Usage Count:</span> {selectedTemplate.usageCount}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {selectedTemplate.isSystemTemplate ? 'System' : 'Custom'}
                  </div>
                </div>
                {selectedTemplate.description && (
                  <p className="text-sm text-gray-600 mt-2">{selectedTemplate.description}</p>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-3">Requirements Preview</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedTemplate.requirements.map((req, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{req.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {req.requirementType}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {req.category}
                        </Badge>
                        {req.isRequired && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                      </div>
                      {req.description && (
                        <p className="text-sm text-gray-600">{req.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    // This would typically open the template selector for applying
                    console.log('Apply template:', selectedTemplate._id);
                    setShowPreview(false);
                  }}
                >
                  Apply Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Requirements Template</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-gray-600 mb-4">
                Create a new requirements template that can be reused across multiple applications.
              </p>
              {/* Here you would typically have a form for creating templates */}
              <div className="space-y-4">
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Template Creation Form</h3>
                  <p className="text-gray-600 mb-4">
                    This would contain a form for creating new templates with requirements.
                  </p>
                  <Button variant="outline">
                    Create Template Form
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 