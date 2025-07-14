"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Edit, 
  Save, 
  X, 
  Copy, 
  Download, 
  Share2, 
  Bookmark,
  Eye,
  Calendar,
  FileText,
  Star,
  Users,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface DocumentViewerProps {
  documentId: string;
  onBack?: () => void;
}

interface ClonedDocument {
  _id: string;
  originalDocument: {
    _id: string;
    title: string;
    type: string;
    description: string;
    category: string;
    tags: string[];
  };
  clonedContent: string;
  customizations: {
    title?: string;
    description?: string;
    tags?: string[];
  };
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
  accessCount: number;
  isBookmarked: boolean;
}

export default function DocumentViewer({ documentId, onBack }: DocumentViewerProps) {
  const [document, setDocument] = useState<ClonedDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  const fetchDocument = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/user/cloned-documents/${documentId}`);
      if (response.ok) {
        const data = await response.json();
        setDocument(data.document);
        setEditedContent(data.document.clonedContent);
        setEditedTitle(data.document.customizations?.title || data.document.originalDocument.title);
        setEditedDescription(data.document.customizations?.description || data.document.originalDocument.description);
        setEditedTags(data.document.customizations?.tags || data.document.originalDocument.tags);
      } else {
        toast.error('Failed to fetch document');
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      toast.error('Failed to fetch document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/user/cloned-documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clonedContent: editedContent,
          customizations: {
            title: editedTitle,
            description: editedDescription,
            tags: editedTags
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDocument(data.document);
        setIsEditing(false);
        toast.success('Document saved successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save document');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBookmark = async () => {
    if (!document) return;
    
    try {
      const response = await fetch(`/api/user/cloned-documents/${documentId}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isBookmarked: !document.isBookmarked }),
      });

      if (response.ok) {
        const data = await response.json();
        setDocument(prev => prev ? { ...prev, isBookmarked: data.document.isBookmarked } : null);
        toast.success(data.message || 'Bookmark status updated');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update bookmark status');
      }
    } catch (error) {
      console.error('Error updating bookmark status:', error);
      toast.error('Failed to update bookmark status');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !editedTags.includes(newTag.trim())) {
      setEditedTags([...editedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditedTags(editedTags.filter(tag => tag !== tagToRemove));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharacterCount = (text: string) => {
    return text.length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Document not found</h3>
        <p className="text-gray-500 mb-4">
          The document you're looking for doesn't exist or you don't have access to it.
        </p>
        {onBack && (
          <Button onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditing ? editedTitle : (document.customizations?.title || document.originalDocument.title)}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? editedDescription : (document.customizations?.description || document.originalDocument.description)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleBookmark}
            className={document.isBookmarked ? "bg-yellow-50 border-yellow-200" : ""}
          >
            <Bookmark className={`h-4 w-4 mr-2 ${document.isBookmarked ? "fill-current text-yellow-600" : ""}`} />
            {document.isBookmarked ? "Bookmarked" : "Bookmark"}
          </Button>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={() => setIsEditing(false)} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Document Info */}
      <Card>
        <CardHeader>
          <CardTitle>Document Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Type</Label>
              <Badge variant="outline">{document.originalDocument.type}</Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <Badge variant="outline">{document.originalDocument.category}</Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Cloned</Label>
              <div className="text-sm text-gray-600">{formatDate(document.createdAt)}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Last Accessed</Label>
              <div className="text-sm text-gray-600">
                {document.lastAccessedAt ? formatDate(document.lastAccessedAt) : 'Never'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editedTags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {document.customizations?.tags?.length ? 
                document.customizations.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                )) :
                document.originalDocument.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
          <CardDescription>
            {isEditing ? (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{getWordCount(editedContent)} words</span>
                <span>{getCharacterCount(editedContent)} characters</span>
              </div>
            ) : (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{getWordCount(document.clonedContent)} words</span>
                <span>{getCharacterCount(document.clonedContent)} characters</span>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Document title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Document description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  placeholder="Document content"
                  className="min-h-[400px] font-mono text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
                {document.clonedContent}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Copy Content
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 