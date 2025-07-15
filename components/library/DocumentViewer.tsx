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
  Eye,
  Calendar,
  FileText,
  Star,
  Users,
  ArrowLeft,
  Loader2,
  Sparkles,
  Edit3
} from "lucide-react";
import { toast } from "sonner";
import AIGenerationModal from "../documents/AIGenerationModal";
import AIRefinementModal from "../documents/AIRefinementModal";

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
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiRefinementModalOpen, setAiRefinementModalOpen] = useState(false);

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

  const addTag = () => {
    if (newTag.trim() && !editedTags.includes(newTag.trim())) {
      setEditedTags([...editedTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditedTags(editedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleAIContentGenerated = (content: string) => {
    setEditedContent(content);
  };

  const handleAIContentRefined = (content: string) => {
    setEditedContent(content);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Document not found</p>
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
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Type</Label>
              <p className="text-sm text-muted-foreground">{document.originalDocument.type}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Category</Label>
              <p className="text-sm text-muted-foreground">{document.originalDocument.category}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Created</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(document.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Last Accessed</Label>
              <p className="text-sm text-muted-foreground">
                {document.lastAccessedAt 
                  ? new Date(document.lastAccessedAt).toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Access Count</Label>
              <p className="text-sm text-muted-foreground">{document.accessCount}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Word Count</Label>
              <p className="text-sm text-muted-foreground">
                {document.clonedContent.split(/\s+/).filter(word => word.length > 0).length}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-sm font-medium">Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {(document.customizations?.tags || document.originalDocument.tags).map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
          <CardDescription>
            {isEditing ? 'Edit the document content below' : 'View the document content'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Document title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Document description"
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="tags"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag"
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editedTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="content">Content</Label>
                  <div className="flex gap-2">
                    {editedContent.trim() && (
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
                <Textarea
                  id="content"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  placeholder="Document content"
                  className="min-h-[400px]"
                />
              </div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">{document.clonedContent}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Generation Modal */}
      <AIGenerationModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        onContentGenerated={handleAIContentGenerated}
      />

      {/* AI Refinement Modal */}
      <AIRefinementModal
        open={aiRefinementModalOpen}
        onOpenChange={setAiRefinementModalOpen}
        onContentRefined={handleAIContentRefined}
        existingContent={editedContent}
      />
    </div>
  );
} 