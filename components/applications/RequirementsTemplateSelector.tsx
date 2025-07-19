'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  FileText, 
  Users, 
  Star,
  Plus,
  CheckCircle,
  Clock
} from 'lucide-react';
import { TemplateCategory } from '@/types/requirements';

interface Template {
  _id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  requirements: any[];
  usageCount: number;
  isSystemTemplate: boolean;
  createdBy?: {
    name: string;
  };
}

interface RequirementsTemplateSelectorProps {
  applicationId?: string;
  onTemplateApplied: (templateId: string) => void;
}

export const RequirementsTemplateSelector: React.FC<RequirementsTemplateSelectorProps> = ({
  applicationId,
  onTemplateApplied
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      console.log('Fetching requirements templates...');
      const response = await fetch('/api/requirements-templates?isSystemTemplate=true');
      const data = await response.json();
      console.log('Requirements templates response:', response.status, data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch templates');
      }

      console.log('Templates data:', data.data);
      setTemplates(data.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
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
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Apply template
  const applyTemplate = async (templateId: string) => {
    setIsApplying(true);
    try {
      // For now, just store the template ID without making API call
      // The template will be applied when the actual application is created
      console.log('Template selected:', templateId);
      
      onTemplateApplied(templateId);
      setShowPreview(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error selecting template:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const getCategoryIcon = (category: TemplateCategory) => {
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

  const getCategoryColor = (category: TemplateCategory) => {
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Requirements Templates
          </CardTitle>
          <p className="text-sm text-gray-600">
            Select a template to automatically add requirements to your application
          </p>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <Label htmlFor="search" className="sr-only">Search templates</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value as TemplateCategory | 'all')}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="graduate">Graduate</SelectItem>
                <SelectItem value="undergraduate">Undergraduate</SelectItem>
                <SelectItem value="scholarship">Scholarship</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No templates found</p>
                <p className="mb-4">
                  {loading ? 'Loading templates...' : 'No templates match your criteria or no templates exist yet.'}
                </p>
                {!loading && (
                  <div className="space-y-3">
                    <p className="text-sm">You can:</p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/requirements-templates/setup-system', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' }
                            });
                            
                            if (response.ok) {
                              console.log('System templates created successfully');
                              // Refresh the templates
                              fetchTemplates();
                            } else {
                              console.error('Failed to create system templates');
                            }
                          } catch (error) {
                            console.error('Error creating system templates:', error);
                          }
                        }}
                      >
                        Create Default Templates
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <Card key={template._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
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
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users className="h-3 w-3" />
                    {template.usageCount}
                  </div>
                </div>

                <h3 className="font-medium text-gray-900 mb-2">{template.name}</h3>
                
                {template.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {template.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <FileText className="h-3 w-3" />
                  <span>{template.requirements.length} requirements</span>
                </div>

                <div className="flex gap-2">
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
                    onClick={() => applyTemplate(template._id)}
                    className="flex-1"
                  >
                    Apply
                  </Button>
                </div>

                {template.createdBy && !template.isSystemTemplate && (
                  <p className="text-xs text-gray-500 mt-2">
                    Created by {template.createdBy.name}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Template Preview Modal */}
      {showPreview && selectedTemplate && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
                  Cancel
                </Button>
                <Button
                  onClick={() => applyTemplate(selectedTemplate._id)}
                  disabled={isApplying}
                >
                  {isApplying ? 'Applying...' : 'Apply Template'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}; 