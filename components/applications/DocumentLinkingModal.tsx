'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  FileText, 
  Calendar,
  User,
  X
} from 'lucide-react';
import { RequirementType } from '@/types/requirements';

// Plain object interface for frontend use (without Mongoose Document methods)
interface RequirementData {
  _id: string;
  applicationId: string;
  requirementType: RequirementType;
  category: string;
  name: string;
  description?: string;
  isRequired: boolean;
  isOptional: boolean;
  documentType?: string;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  wordLimit?: number;
  characterLimit?: number;
  testType?: string;
  minScore?: number;
  maxScore?: number;
  scoreFormat?: string;
  applicationFeeAmount?: number;
  applicationFeeCurrency?: string;
  applicationFeeDescription?: string;
  applicationFeePaid?: boolean;
  applicationFeePaidAt?: Date;
  interviewType?: string;
  interviewDuration?: number;
  interviewNotes?: string;
  status: string;
  submittedAt?: Date;
  verifiedAt?: Date;
  notes?: string;
  linkedDocumentId?: string;
  externalUrl?: string;
  taskId?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Document {
  _id: string;
  title: string;
  description?: string;
  documentType: string;
  createdAt: string;
  createdBy: {
    name: string;
  };
}

interface DocumentLinkingModalProps {
  requirement: RequirementData;
  onClose: () => void;
  onDocumentLink: (requirementId: string, documentId: string, notes?: string) => Promise<void>;
}

export const DocumentLinkingModal: React.FC<DocumentLinkingModalProps> = ({
  requirement,
  onClose,
  onDocumentLink
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  // Fetch user's documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch documents');
      }

      setDocuments(data.data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Filter documents based on search query
  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.documentType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLinkDocument = async () => {
    if (!selectedDocumentId) return;

    setIsLinking(true);
    try {
      await onDocumentLink(requirement._id.toString(), selectedDocumentId, notes);
      onClose();
    } catch (error) {
      console.error('Error linking document:', error);
    } finally {
      setIsLinking(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Link Document to Requirement</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Requirement Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">{requirement.name}</h3>
            <div className="flex gap-2">
              <Badge variant="outline">{requirement.category}</Badge>
              <Badge variant="outline">{requirement.requirementType}</Badge>
            </div>
            {requirement.description && (
              <p className="text-sm text-gray-600 mt-2">{requirement.description}</p>
            )}
          </div>

          {/* Search Documents */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Documents</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by title, description, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Documents List */}
          <div className="space-y-2">
            <Label>Select Document</Label>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No documents found</p>
                <p className="text-sm">Create a document first to link it to this requirement</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc._id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedDocumentId === doc._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedDocumentId(doc._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <h4 className="font-medium text-gray-900">{doc.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {doc.documentType}
                          </Badge>
                        </div>
                        {doc.description && (
                          <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(doc.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {doc.createdBy?.name || 'Unknown'}
                          </div>
                        </div>
                      </div>
                      {selectedDocumentId === doc._id && (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-800">Selected</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDocumentId('');
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about linking this document..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleLinkDocument}
              disabled={!selectedDocumentId || isLinking}
            >
              {isLinking ? 'Linking...' : 'Link Document'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 