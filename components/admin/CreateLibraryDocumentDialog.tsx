"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateLibraryDocumentDialogProps {
  onDocumentCreated: () => void;
}

const DOCUMENT_TYPES = [
  "Personal Statement",
  "Statement of Purpose",
  "Research Proposal",
  "Academic CV",
  "Cover Letter",
  "Recommendation Letter",
  "Letter of Intent",
  "Motivation Letter",
  "Academic Essay",
  "Research Paper",
  "Thesis Abstract",
  "Dissertation Proposal",
  "Grant Proposal",
  "Fellowship Application",
  "Internship Application",
  "Study Abroad Application",
  "Transfer Application",
  "Graduate School Application",
  "Undergraduate Application",
  "Scholarship Essay"
];

const ACADEMIC_LEVELS = [
  "High School",
  "Undergraduate",
  "Graduate",
  "PhD",
  "Postdoctoral",
  "Professional"
];

const FIELDS_OF_STUDY = [
  "Computer Science",
  "Engineering",
  "Business",
  "Medicine",
  "Law",
  "Arts & Humanities",
  "Social Sciences",
  "Natural Sciences",
  "Mathematics",
  "Education",
  "Public Health",
  "Environmental Science",
  "Economics",
  "Psychology",
  "Political Science",
  "International Relations",
  "Architecture",
  "Design",
  "Agriculture",
  "Veterinary Medicine"
];

export default function CreateLibraryDocumentDialog({ onDocumentCreated }: CreateLibraryDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    documentType: "",
    academicLevel: "",
    fieldOfStudy: "",
    tags: [] as string[],
    estimatedReadingTime: "",
    difficultyLevel: "Beginner",
    targetAudience: "",
    learningObjectives: "",
    prerequisites: "",
    relatedResources: "",
    authorNotes: "",
    isTemplate: false,
    allowCloning: true,
    requireReview: true
  });
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/library-documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create document");
      }

      toast({
        title: "Success",
        description: "Library document created successfully",
      });

      setFormData({
        title: "",
        description: "",
        content: "",
        documentType: "",
        academicLevel: "",
        fieldOfStudy: "",
        tags: [],
        estimatedReadingTime: "",
        difficultyLevel: "Beginner",
        targetAudience: "",
        learningObjectives: "",
        prerequisites: "",
        relatedResources: "",
        authorNotes: "",
        isTemplate: false,
        allowCloning: true,
        requireReview: true
      });
      setOpen(false);
      onDocumentCreated();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create library document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Document
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create New Library Document
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter document title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type *</Label>
                  <Select value={formData.documentType} onValueChange={(value) => handleInputChange("documentType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="academicLevel">Academic Level</Label>
                  <Select value={formData.academicLevel} onValueChange={(value) => handleInputChange("academicLevel", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic level" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACADEMIC_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fieldOfStudy">Field of Study</Label>
                  <Select value={formData.fieldOfStudy} onValueChange={(value) => handleInputChange("fieldOfStudy", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field of study" />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELDS_OF_STUDY.map((field) => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Brief description of the document"
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Content</h3>
              <div className="space-y-2">
                <Label htmlFor="content">Document Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  placeholder="Enter the document content..."
                  rows={12}
                  required
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Metadata & Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficultyLevel">Difficulty Level</Label>
                  <Select value={formData.difficultyLevel} onValueChange={(value) => handleInputChange("difficultyLevel", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedReadingTime">Estimated Reading Time (minutes)</Label>
                  <Input
                    id="estimatedReadingTime"
                    type="number"
                    value={formData.estimatedReadingTime}
                    onChange={(e) => handleInputChange("estimatedReadingTime", e.target.value)}
                    placeholder="e.g., 15"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange("targetAudience", e.target.value)}
                    placeholder="e.g., Computer Science students applying to graduate programs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prerequisites">Prerequisites</Label>
                  <Input
                    id="prerequisites"
                    value={formData.prerequisites}
                    onChange={(e) => handleInputChange("prerequisites", e.target.value)}
                    placeholder="e.g., Basic programming knowledge, Calculus I"
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="learningObjectives">Learning Objectives</Label>
                <Textarea
                  id="learningObjectives"
                  value={formData.learningObjectives}
                  onChange={(e) => handleInputChange("learningObjectives", e.target.value)}
                  placeholder="What will students learn from this document?"
                  rows={3}
                />
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="relatedResources">Related Resources</Label>
                <Textarea
                  id="relatedResources"
                  value={formData.relatedResources}
                  onChange={(e) => handleInputChange("relatedResources", e.target.value)}
                  placeholder="Links to related articles, books, or resources"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Tags</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Document Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isTemplate"
                    checked={formData.isTemplate}
                    onChange={(e) => handleInputChange("isTemplate", e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="isTemplate">Mark as template document</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowCloning"
                    checked={formData.allowCloning}
                    onChange={(e) => handleInputChange("allowCloning", e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="allowCloning">Allow users to clone this document</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requireReview"
                    checked={formData.requireReview}
                    onChange={(e) => handleInputChange("requireReview", e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="requireReview">Require review before publishing</Label>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="authorNotes">Author Notes (Internal)</Label>
                <Textarea
                  id="authorNotes"
                  value={formData.authorNotes}
                  onChange={(e) => handleInputChange("authorNotes", e.target.value)}
                  placeholder="Internal notes for other admins..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Document"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 