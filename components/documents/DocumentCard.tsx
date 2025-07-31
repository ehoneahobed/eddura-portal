'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MoreVertical, Edit, Trash2, Eye, Copy, Download, Calendar, FileText, HelpCircle, Clock, Sparkles, FileDown, Edit3, Share2, MessageSquare } from 'lucide-react';
import { DocumentType, DOCUMENT_TYPE_CONFIG, Document } from '@/types/documents';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import AIGenerationModal from './AIGenerationModal';
import AIRefinementModal from './AIRefinementModal';
import ShareDocumentDialog from './ShareDocumentDialog';
import DocumentFeedbackViewer from './DocumentFeedbackViewer';
import DocumentPreviewDialog from './DocumentPreviewDialog';
import Image from 'next/image';

// Tooltip component for version explanation
const VersionTooltip = ({ children }: { children: React.ReactNode }) => (
  <div className="group relative inline-block">
    {children}
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
      Version automatically increments when content is modified
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
);

interface DocumentCardProps {
  document: Document;
  onDelete: (documentId: string) => void;
  onUpdate: (document: Document) => void;
  onPreview?: (document: Document) => void;
}

export default function DocumentCard({ document, onDelete, onUpdate, onPreview }: DocumentCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiRefinementModalOpen, setAiRefinementModalOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    title: document.title || '',
    content: document.content || '',
    description: document.description || '',
    tags: document.tags || [],
    targetProgram: document.targetProgram || '',
    targetScholarship: document.targetScholarship || '',
    targetInstitution: document.targetInstitution || '',
    isActive: document.isActive ?? true
  });

  const [tagInput, setTagInput] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  const typeConfig = DOCUMENT_TYPE_CONFIG[document.type];
  const wordCount = document.wordCount || 0;
  const characterCount = document.characterCount || 0;

  const isUploadBased = !!document.fileUrl;

  const handleEdit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/documents/${document._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const updatedDocument = await response.json();
        onUpdate(updatedDocument.document);
        setEditDialogOpen(false);
        toast.success('Document updated successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update document');
      }
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Failed to update document');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/documents/${document._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDelete(document._id);
        setDeleteDialogOpen(false);
        toast.success('Document deleted successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !editData.tags.includes(tagInput.trim())) {
      setEditData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(document.content || '');
      toast.success('Document content copied to clipboard!', {
        description: 'You can now paste the content anywhere you need it.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to copy content:', error);
      toast.error('Failed to copy content to clipboard', {
        description: 'Please try selecting and copying the content manually.',
        duration: 4000,
      });
    }
  };

  const downloadDocument = async (format: 'pdf' | 'docx') => {
    try {
      setLoading(true);
      
      // Show loading toast
      const loadingToast = toast.loading(`Generating ${format.toUpperCase()}...`);
      
      console.log(`[DOWNLOAD] Starting ${format} download for document:`, document._id);
      
      const response = await fetch(`/api/documents/${document._id}/download?format=${format}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      console.log(`[DOWNLOAD] Response status:`, response.status);
      console.log(`[DOWNLOAD] Response headers:`, Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const blob = await response.blob();
        console.log(`[DOWNLOAD] Blob received, size:`, blob.size, 'bytes');
        
        // Check if blob is valid
        if (blob.size === 0) {
          toast.dismiss(loadingToast);
          toast.error(`Generated ${format.toUpperCase()} file is empty. Please try again.`);
          console.error(`[DOWNLOAD] Empty blob received for ${format}`);
          return;
        }
        
        // Check content type
        if (format === 'pdf' && !blob.type.includes('pdf')) {
          toast.dismiss(loadingToast);
          toast.error(`Invalid file type received. Expected PDF but got ${blob.type}`);
          console.error(`[DOWNLOAD] Invalid content type:`, blob.type);
          return;
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = globalThis.document.createElement('a');
        a.href = url;
        a.download = `${document.title.replace(/[^a-zA-Z0-9]/g, '_')}_${document.type}.${format}`;
        a.style.display = 'none';
        
        globalThis.document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          globalThis.document.body.removeChild(a);
        }, 100);
        
        toast.dismiss(loadingToast);
        toast.success(`Document downloaded as ${format.toUpperCase()}`);
        console.log(`[DOWNLOAD] ${format} download completed successfully`);
      } else {
        const errorText = await response.text();
        console.error(`[DOWNLOAD] Server error:`, response.status, errorText);
        
        let errorMessage = `Failed to download ${format.toUpperCase()}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
          if (errorData.details) {
            console.error(`[DOWNLOAD] Error details:`, errorData.details);
          }
        } catch (e) {
          console.error(`[DOWNLOAD] Could not parse error response:`, errorText);
        }
        
        toast.dismiss(loadingToast);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error(`[DOWNLOAD] Network error downloading ${format}:`, error);
      toast.error(`Network error downloading ${format.toUpperCase()}. Please check your connection and try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDownload = useCallback(async () => {
    if (!document.fileUrl) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${document._id}`);
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to get download link');
        return;
      }
      const { presignedUrl } = await res.json();
      if (!presignedUrl) {
        toast.error('No download URL received');
        return;
      }
      // Trigger download
      const a = window.document.createElement('a');
      a.href = presignedUrl;
      a.download = document.title || 'document';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      window.document.body.appendChild(a);
      a.click();
      setTimeout(() => window.document.body.removeChild(a), 100);
      toast.success('Download started');
    } catch (err) {
      toast.error('Failed to download file');
    } finally {
      setLoading(false);
    }
  }, [document]);

  // Document preview logic
  const handlePreview = async () => {
    if (onPreview) {
      onPreview(document);
      return;
    }
    
    if (isUploadBased) {
      // For upload-based documents, open file in new browser tab
      if (!document.fileUrl) return;
      
      setPreviewLoading(true);
      try {
        // Get presigned URL for preview (without download headers)
        const res = await fetch(`/api/documents/${document._id}?preview=true`);
        if (!res.ok) {
          const err = await res.json();
          toast.error(err.error || 'Failed to get preview link');
          return;
        }
        const { presignedUrl } = await res.json();
        console.log('Opening presigned URL:', presignedUrl);
        // Open file directly in new browser tab
        window.open(presignedUrl, '_blank');
      } catch (err) {
        console.error('Preview error:', err);
        toast.error('Failed to load file preview');
      } finally {
        setPreviewLoading(false);
      }
    } else {
      // For text-based documents, open preview dialog
      setPreviewDialogOpen(true);
    }
  };



  const handleAIContentGenerated = (content: string) => {
    setEditData(prev => ({ ...prev, content }));
  };

  const handleAIContentRefined = (content: string) => {
    setEditData(prev => ({ ...prev, content }));
  };



  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold truncate flex items-center gap-2">
                  {document.title}
                  {isUploadBased && (
                    <Badge variant="outline" className="text-xs">
                      <FileDown className="h-3 w-3 mr-1" />
                      File
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {typeConfig?.label}
                </CardDescription>
              </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                
                {/* Text-based document options */}
                {!isUploadBased && (
                  <>
                    <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share for Feedback
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFeedbackDialogOpen(true)}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Feedback
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={copyToClipboard}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Content
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => downloadDocument('pdf')} disabled={loading}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Download as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => downloadDocument('docx')} disabled={loading}>
                      <Download className="h-4 w-4 mr-2" />
                      Download as Word
                    </DropdownMenuItem>
                  </>
                )}
                
                {/* Upload-based document options */}
                {isUploadBased && (
                  <>
                    <DropdownMenuItem onClick={handlePreview} disabled={previewLoading}>
                      <Eye className="h-4 w-4 mr-2" />
                      {previewLoading ? 'Loading...' : 'Preview File'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleFileDownload} disabled={loading}>
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </DropdownMenuItem>
                  </>
                )}

                {/* Text-based document options */}
                {!isUploadBased && (
                  <>
                    <DropdownMenuItem onClick={handlePreview}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Document
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {document.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {document.description}
            </p>
          )}

          <div className="flex items-center gap-2 mb-3">
            <Badge variant={document.isActive ? "default" : "secondary"}>
              {document.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <VersionTooltip>
              <Badge variant="outline" className="flex items-center gap-1 cursor-help">
                <Clock className="h-3 w-3" />
                v{document.version}
                <HelpCircle className="h-3 w-3" />
              </Badge>
            </VersionTooltip>
            {typeConfig && (
              <Badge variant="outline" className="capitalize">
                {typeConfig.category}
              </Badge>
            )}
          </div>

          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {document.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {document.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{document.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-4">
              {isUploadBased ? (
                <>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span className="font-medium">{document.fileType || 'Unknown'}</span>
                  </span>
                  {document.fileSize && (
                    <span><span className="font-medium">{(document.fileSize / 1024 / 1024).toFixed(1)}</span> MB</span>
                  )}
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span className="font-medium">{wordCount.toLocaleString()}</span> words
                  </span>
                  <span><span className="font-medium">{characterCount.toLocaleString()}</span> chars</span>
                </>
              )}
            </div>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(document.lastEditedAt || document.createdAt)}
            </span>
          </div>

          {(document.targetProgram || document.targetScholarship || document.targetInstitution) && (
            <div className="text-xs text-muted-foreground space-y-1">
              {document.targetProgram && (
                <div className="truncate">Program: {document.targetProgram}</div>
              )}
              {document.targetScholarship && (
                <div className="truncate">Scholarship: {document.targetScholarship}</div>
              )}
              {document.targetInstitution && (
                <div className="truncate">Institution: {document.targetInstitution}</div>
              )}
            </div>
          )}

          {/* Download Actions */}
          <div className="flex gap-2 mt-4 pt-3 border-t">
            {isUploadBased ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  disabled={previewLoading}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {previewLoading ? 'Loading...' : 'Preview'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFileDownload}
                  disabled={loading}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadDocument('pdf')}
                  disabled={loading}
                  className="flex-1"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadDocument('docx')}
                  disabled={loading}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Word
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>
              Update your document content and metadata. Note: Changing the content will automatically increment the version number.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                maxLength={200}
              />
              <div className="text-xs text-muted-foreground">
                {editData.title.length}/200 characters
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                maxLength={500}
                rows={2}
              />
              <div className="text-xs text-muted-foreground">
                {editData.description.length}/500 characters
              </div>
            </div>

            {/* Content editing section - only for text-based documents */}
            {!isUploadBased && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-content">Content</Label>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">{editData.content?.trim().split(/\s+/).filter(word => word.length > 0).length || 0}</span> words, 
                      <span className="font-medium"> {editData.content?.length.toLocaleString() || 0}</span> characters
                    </div>
                    <div className="flex gap-2">
                      {editData.content?.trim() && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setAiRefinementModalOpen(true)}
                          className="flex items-center gap-2"
                        >
                          <Edit3 className="h-4 w-4" />
                          Refine with AI
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAiModalOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        Generate with AI
                      </Button>
                    </div>
                  </div>
                </div>
                <Textarea
                  id="edit-content"
                  value={editData.content || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                  rows={12}
                  className="font-mono text-sm resize-y"
                />
                {editData.content !== document.content && editData.content !== undefined && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Changing the content will increment the version number from v{document.version} to v{document.version + 1}
                  </div>
                )}
              </div>
            )}

            {/* File information section - only for upload-based documents */}
            {isUploadBased && (
              <div className="space-y-2">
                <Label>File Information</Label>
                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">File Type:</span>
                    <span className="text-sm">{document.fileType || 'Unknown'}</span>
                  </div>
                  {document.fileSize && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">File Size:</span>
                      <span className="text-sm">{(document.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Upload Date:</span>
                    <span className="text-sm">{formatDate(document.createdAt)}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  File content cannot be edited. You can only modify metadata like title, description, and tags.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add tags (press Enter)"
                  maxLength={50}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              {editData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-targetProgram">Target Program</Label>
                <Input
                  id="edit-targetProgram"
                  value={editData.targetProgram}
                  onChange={(e) => setEditData(prev => ({ ...prev, targetProgram: e.target.value }))}
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-targetScholarship">Target Scholarship</Label>
                <Input
                  id="edit-targetScholarship"
                  value={editData.targetScholarship}
                  onChange={(e) => setEditData(prev => ({ ...prev, targetScholarship: e.target.value }))}
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-targetInstitution">Target Institution</Label>
                <Input
                  id="edit-targetInstitution"
                  value={editData.targetInstitution}
                  onChange={(e) => setEditData(prev => ({ ...prev, targetInstitution: e.target.value }))}
                  maxLength={200}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={editData.isActive}
                onChange={(e) => setEditData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={loading}>
                {loading ? 'Updating...' : 'Update Document'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{document.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={loading} variant="destructive">
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Generation Modal */}
      <AIGenerationModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        onContentGenerated={handleAIContentGenerated}
        selectedDocumentType={document.type}
      />

      {/* AI Refinement Modal */}
      <AIRefinementModal
        open={aiRefinementModalOpen}
        onOpenChange={setAiRefinementModalOpen}
        onContentRefined={handleAIContentRefined}
        existingContent={editData.content}
        documentType={document.type}
      />

      {/* Share Document Dialog */}
      <ShareDocumentDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        document={document}
      />

      {/* Document Feedback Viewer */}
      <DocumentFeedbackViewer
        open={feedbackDialogOpen}
        onOpenChange={setFeedbackDialogOpen}
        document={document}
      />

      {/* Document Preview Dialog for Text-based Documents */}
      <DocumentPreviewDialog
        document={document}
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        onEdit={() => setEditDialogOpen(true)}
        onDownload={downloadDocument}
        onShare={() => setShareDialogOpen(true)}
        onViewFeedback={() => setFeedbackDialogOpen(true)}
      />

    </>
  );
}