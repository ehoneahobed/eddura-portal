'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Filter, 
  Link as LinkIcon, 
  Unlink, 
  Eye, 
  Download, 
  Share2, 
  Copy, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Calendar,
  User,
  Tag,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Document {
  _id: string;
  title: string;
  type: string;
  category: string;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  sharedForFeedback?: boolean;
  feedbackReceived?: boolean;
  linkedToRequirements?: string[];
  fileSize?: number;
  fileType?: string;
  uploadedBy?: string;
  tags?: string[];
}

interface Requirement {
  _id: string;
  name: string;
  description?: string;
  category: string;
  requirementType: string;
  status: 'pending' | 'in_progress' | 'completed' | 'waived' | 'not_applicable';
  isRequired: boolean;
  isOptional: boolean;
  linkedDocumentId?: string;
  linkedDocument?: Document;
  notes?: string;
  deadline?: string;
}

interface DocumentLinkerProps {
  applicationId: string;
  requirements: Requirement[];
  documents: Document[];
  onDocumentLink: (requirementId: string, documentId: string) => Promise<void>;
  onDocumentUnlink: (requirementId: string) => Promise<void>;
  onClose: () => void;
}

export default function DocumentLinker({ 
  applicationId, 
  requirements, 
  documents, 
  onDocumentLink, 
  onDocumentUnlink, 
  onClose 
}: DocumentLinkerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRequirement, setSelectedRequirement] = useState<string>('all');
  const [showLinkedOnly, setShowLinkedOnly] = useState(false);
  const [showUnlinkedOnly, setShowUnlinkedOnly] = useState(false);
  const [expandedRequirements, setExpandedRequirements] = useState<Set<string>>(new Set());
  const [isLinking, setIsLinking] = useState(false);





  // Get unique categories and statuses for filters
  const categories = Array.from(new Set(documents.map(doc => doc.category)));
  const statuses = Array.from(new Set(documents.map(doc => doc.status)));

  // Filter documents based on search and filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
    
    const isLinked = doc.linkedToRequirements && doc.linkedToRequirements.length > 0;
    const matchesLinkedFilter = !showLinkedOnly || isLinked;
    const matchesUnlinkedFilter = !showUnlinkedOnly || !isLinked;

    return matchesSearch && matchesCategory && matchesStatus && matchesLinkedFilter && matchesUnlinkedFilter;
  });

  // Get requirements that need documents (only document and test_score types)
  const requirementsNeedingDocuments = requirements.filter(req => 
    (req.requirementType === 'document' || req.requirementType === 'test_score') &&
    !req.linkedDocumentId && 
    req.status !== 'waived' && 
    req.status !== 'not_applicable'
  );

  // Get linked documents
  const linkedDocuments = documents.filter(doc => 
    doc.linkedToRequirements && doc.linkedToRequirements.length > 0
  );



  const toggleRequirementExpansion = (requirementId: string) => {
    const newExpanded = new Set(expandedRequirements);
    if (newExpanded.has(requirementId)) {
      newExpanded.delete(requirementId);
    } else {
      newExpanded.add(requirementId);
    }
    setExpandedRequirements(newExpanded);
  };

  const handleLinkDocument = async (requirementId: string, documentId: string) => {
    try {
      setIsLinking(true);
      await onDocumentLink(requirementId, documentId);
      
      // Find the requirement and document names for better feedback
      const requirement = requirements.find(r => r._id === requirementId);
      const document = documents.find(d => d._id === documentId);
      
      toast.success(
        `"${document?.title}" linked to "${requirement?.name}" successfully!`
      );
    } catch (error) {
      toast.error('Failed to link document');
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkDocument = async (requirementId: string) => {
    try {
      setIsLinking(true);
      await onDocumentUnlink(requirementId);
      toast.success('Document unlinked successfully');
    } catch (error) {
      toast.error('Failed to unlink document');
    } finally {
      setIsLinking(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="h-4 w-4" />;
      case 'review': return <AlertCircle className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Link Documents to Requirements
          </DialogTitle>
          <DialogDescription>
            Connect your documents to specific requirements to track completion and readiness
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="linked-only"
                  checked={showLinkedOnly}
                  onCheckedChange={(checked) => {
                    setShowLinkedOnly(checked as boolean);
                    if (checked) setShowUnlinkedOnly(false);
                  }}
                />
                <label htmlFor="linked-only" className="text-sm">Linked Only</label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unlinked-only"
                  checked={showUnlinkedOnly}
                  onCheckedChange={(checked) => {
                    setShowUnlinkedOnly(checked as boolean);
                    if (checked) setShowLinkedOnly(false);
                  }}
                />
                <label htmlFor="unlinked-only" className="text-sm">Unlinked Only</label>
              </div>

              <Button variant="outline" size="sm" onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
                setShowLinkedOnly(false);
                setShowUnlinkedOnly(false);
              }}>
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6 flex-1 overflow-y-auto px-1">
            {/* Requirements and Documents Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Requirements Needing Documents
                    <Badge variant="secondary">{requirementsNeedingDocuments.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {requirementsNeedingDocuments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                      <p>All document requirements have documents linked!</p>
                    </div>
                  ) : (
                    requirementsNeedingDocuments.map(requirement => (
                      <div key={requirement._id} className="p-3 border rounded-lg bg-orange-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{requirement.name}</h4>
                            <p className="text-sm text-gray-600">{requirement.category}</p>
                            {requirement.isRequired && (
                              <Badge variant="destructive" className="text-xs mt-1">Required</Badge>
                            )}
                          </div>
                          <Badge className={cn(
                            'text-xs',
                            requirement.status === 'completed' ? 'bg-green-100 text-green-800' :
                            requirement.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          )}>
                            {requirement.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-green-500" />
                    Currently Linked
                    <Badge variant="secondary">
                      {requirements.filter(req => req.linkedDocumentId).length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {requirements.filter(req => req.linkedDocumentId).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No documents linked yet</p>
                    </div>
                  ) : (
                    requirements.filter(req => req.linkedDocumentId).map(requirement => {
                      const linkedDocument = documents.find(doc => doc._id === requirement.linkedDocumentId);
                      return (
                        <div key={requirement._id} className="p-3 border rounded-lg bg-green-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{requirement.name}</h4>
                              {linkedDocument && (
                                <div className="mt-1 p-2 bg-white rounded border">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    <span className="font-medium text-sm">{linkedDocument.title}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {linkedDocument.type}
                                    </Badge>
                                  </div>
                                </div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnlinkDocument(requirement._id)}
                              disabled={isLinking}
                            >
                              <Unlink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Available Documents for Linking */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Available Documents for Linking
                  <Badge variant="secondary">{filteredDocuments.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Click &ldquo;Link Document&rdquo; next to any requirement to connect your document to it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No documents found matching your filters</p>
                    <p className="text-sm">Create some documents first to link them to requirements</p>
                  </div>
                ) : (
                  filteredDocuments.map(doc => {
                    const isLinked = documents.some(d => d._id === doc._id && d.linkedToRequirements && d.linkedToRequirements.length > 0);
                    return (
                      <div key={doc._id} className={`p-4 border rounded-lg transition-colors ${isLinked ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'}`}>
                        {isLinked && (
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Already Linked</span>
                          </div>
                        )}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{doc.title}</h4>
                            <Badge className={getStatusColor(doc.status)}>
                              {getStatusIcon(doc.status)}
                              <span className="ml-1">{doc.status}</span>
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Type:</span> {doc.type}
                            </div>
                            <div>
                              <span className="font-medium">Category:</span> {doc.category}
                            </div>
                            <div>
                              <span className="font-medium">Created:</span> {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                            </div>
                            <div>
                              <span className="font-medium">Status:</span> {doc.status}
                            </div>
                          </div>

                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {doc.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Link to Requirements */}
                      {requirementsNeedingDocuments.length > 0 && (
                        <div className="space-y-3">
                          <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <LinkIcon className="h-4 w-4" />
                            Link to Requirements:
                          </h5>
                          <div className="space-y-2">
                            {requirementsNeedingDocuments.map(requirement => (
                              <div key={requirement._id} className="flex items-center justify-between p-3 bg-gray-50 rounded border hover:bg-gray-100 transition-colors">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-medium">{requirement.name}</p>
                                    {requirement.isRequired && (
                                      <Badge variant="destructive" className="text-xs">Required</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600">{requirement.category} • {requirement.requirementType}</p>
                                  {requirement.description && (
                                    <p className="text-xs text-gray-500 mt-1">{requirement.description}</p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleLinkDocument(requirement._id, doc._id)}
                                  disabled={isLinking}
                                  className="ml-2 hover:bg-blue-50 hover:border-blue-300"
                                >
                                  {isLinking ? (
                                    <>
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                      Linking...
                                    </>
                                  ) : (
                                    <>
                                      <LinkIcon className="h-3 w-3 mr-1" />
                                      Link Document
                                    </>
                                  )}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <div className="text-sm text-gray-600">
              {filteredDocuments.length} document(s) found
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 