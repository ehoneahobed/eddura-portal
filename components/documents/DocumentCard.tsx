'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MoreVertical, Edit, Trash2, Eye, Copy, Download, Calendar, FileText } from 'lucide-react';
import { DocumentType, DOCUMENT_TYPE_CONFIG } from '@/models/Document';
import { toast } from 'sonner';

interface Document {
  _id: string;
  title: string;
  type: DocumentType;
  content: string;
  version: number;
  isActive: boolean;
  description?: string;
  tags?: string[];
  targetProgram?: string;
  targetScholarship?: string;
  targetInstitution?: string;
  wordCount?: number;
  characterCount?: number;
  lastEditedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentCardProps {
  document: Document;
  onDelete: (documentId: string) => void;
  onUpdate: (document: Document) => void;
}

export default function DocumentCard({ document, onDelete, onUpdate }: DocumentCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    title: document.title,
    content: document.content,
    description: document.description || '',
    tags: document.tags || [],
    targetProgram: document.targetProgram || '',
    targetScholarship: document.targetScholarship || '',
    targetInstitution: document.targetInstitution || '',
    isActive: document.isActive
  });

  const [tagInput, setTagInput] = useState('');

  const typeConfig = DOCUMENT_TYPE_CONFIG[document.type];
  const wordCount = document.wordCount || 0;
  const characterCount = document.characterCount || 0;

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
      await navigator.clipboard.writeText(document.content);
      toast.success('Content copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy content');
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
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate">
                {document.title}
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
                <DropdownMenuItem onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Content
                </DropdownMenuItem>
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
            <Badge variant="outline">
              v{document.version}
            </Badge>
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
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {wordCount} words
              </span>
              <span>{characterCount} chars</span>
            </div>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(document.lastEditedAt)}
            </span>
          </div>

          {(document.targetProgram || document.targetScholarship || document.targetInstitution) && (
            <div className="text-xs text-muted-foreground space-y-1">
              {document.targetProgram && (
                <div>Program: {document.targetProgram}</div>
              )}
              {document.targetScholarship && (
                <div>Scholarship: {document.targetScholarship}</div>
              )}
              {document.targetInstitution && (
                <div>Institution: {document.targetInstitution}</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>
              Update your document content and metadata.
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={editData.content}
                onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                rows={12}
                className="font-mono text-sm"
              />
            </div>

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
              Are you sure you want to delete "{document.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}