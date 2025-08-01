"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Search, 
  Filter, 
  X, 
  Save, 
  Bookmark,
  Clock,
  Star,
  FileText,
  GraduationCap,
  Users,
  Target,
  Zap
} from "lucide-react";

interface SearchFilters {
  searchTerm: string;
  documentType: string[];
  academicLevel: string[];
  fieldOfStudy: string[];
  difficultyLevel: string[];
  targetAudience: string[];
  tags: string[];
  minRating: number;
  maxReadingTime: number;
  isTemplate: boolean;
  allowCloning: boolean;
  sortBy: 'relevance' | 'newest' | 'oldest' | 'rating' | 'views' | 'clones';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  isLoading?: boolean;
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

const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

const TARGET_AUDIENCES = ["undergraduate", "graduate", "professional", "all"];

export default function AdvancedSearchFilters({ onFiltersChange, onSearch, isLoading }: AdvancedSearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    documentType: [],
    academicLevel: [],
    fieldOfStudy: [],
    difficultyLevel: [],
    targetAudience: [],
    tags: [],
    minRating: 0,
    maxReadingTime: 60,
    isTemplate: false,
    allowCloning: true,
    sortBy: 'relevance',
    sortOrder: 'desc'
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SearchFilters[]>([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    console.log('🔍 AdvancedSearchFilters - Filters changed:', filters);
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleArrayFilterChange = (key: keyof SearchFilters, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked 
        ? [...(prev[key] as string[]), value]
        : (prev[key] as string[]).filter(item => item !== value)
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      documentType: [],
      academicLevel: [],
      fieldOfStudy: [],
      difficultyLevel: [],
      targetAudience: [],
      tags: [],
      minRating: 0,
      maxReadingTime: 60,
      isTemplate: false,
      allowCloning: true,
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
  };

  const addTag = () => {
    if (newTag.trim() && !filters.tags.includes(newTag.trim())) {
      handleFilterChange('tags', [...filters.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleFilterChange('tags', filters.tags.filter(tag => tag !== tagToRemove));
  };

  const saveCurrentFilters = () => {
    const filterName = prompt('Enter a name for these filters:');
    if (filterName) {
      const newSavedFilter = { ...filters, name: filterName };
      setSavedFilters(prev => [...prev, newSavedFilter]);
      localStorage.setItem('savedLibraryFilters', JSON.stringify([...savedFilters, newSavedFilter]));
    }
  };

  const loadSavedFilters = (savedFilter: SearchFilters & { name: string }) => {
    const { name, ...filterData } = savedFilter;
    setFilters(filterData);
  };

  const getActiveFiltersCount = () => {
    return [
      filters.documentType.length,
      filters.academicLevel.length,
      filters.fieldOfStudy.length,
      filters.difficultyLevel.length,
      filters.targetAudience.length,
      filters.tags.length,
      filters.minRating > 0,
      filters.maxReadingTime < 60,
      filters.isTemplate,
      !filters.allowCloning
    ].filter(Boolean).length;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents by title, description, content, or tags..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={onSearch} disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {isExpanded && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Advanced Filters
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={saveCurrentFilters}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Document Types */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Document Types
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {DOCUMENT_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={filters.documentType.includes(type)}
                      onCheckedChange={(checked) => 
                        handleArrayFilterChange('documentType', type, checked as boolean)
                      }
                    />
                    <Label htmlFor={`type-${type}`} className="text-sm">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic Levels */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Academic Levels
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ACADEMIC_LEVELS.map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={`level-${level}`}
                      checked={filters.academicLevel.includes(level)}
                      onCheckedChange={(checked) => 
                        handleArrayFilterChange('academicLevel', level, checked as boolean)
                      }
                    />
                    <Label htmlFor={`level-${level}`} className="text-sm">
                      {level}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Fields of Study */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Fields of Study
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {FIELDS_OF_STUDY.map((field) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={`field-${field}`}
                      checked={filters.fieldOfStudy.includes(field)}
                      onCheckedChange={(checked) => 
                        handleArrayFilterChange('fieldOfStudy', field, checked as boolean)
                      }
                    />
                    <Label htmlFor={`field-${field}`} className="text-sm">
                      {field}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty and Target Audience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Difficulty Level
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {DIFFICULTY_LEVELS.map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={`difficulty-${level}`}
                        checked={filters.difficultyLevel.includes(level)}
                        onCheckedChange={(checked) => 
                          handleArrayFilterChange('difficultyLevel', level, checked as boolean)
                        }
                      />
                      <Label htmlFor={`difficulty-${level}`} className="text-sm">
                        {level}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Target Audience
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {TARGET_AUDIENCES.map((audience) => (
                    <div key={audience} className="flex items-center space-x-2">
                      <Checkbox
                        id={`audience-${audience}`}
                        checked={filters.targetAudience.includes(audience)}
                        onCheckedChange={(checked) => 
                          handleArrayFilterChange('targetAudience', audience, checked as boolean)
                        }
                      />
                      <Label htmlFor={`audience-${audience}`} className="text-sm capitalize">
                        {audience}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rating and Reading Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Minimum Rating: {filters.minRating}+
                </Label>
                <Slider
                  value={[filters.minRating]}
                  onValueChange={(value) => handleFilterChange('minRating', value[0])}
                  max={5}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Max Reading Time: {filters.maxReadingTime} min
                </Label>
                <Slider
                  value={[filters.maxReadingTime]}
                  onValueChange={(value) => handleFilterChange('maxReadingTime', value[0])}
                  max={120}
                  min={5}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Custom Tags */}
            <div className="space-y-3">
              <Label>Custom Tags</Label>
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
              {filters.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
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
              )}
            </div>

            {/* Document Settings */}
            <div className="space-y-3">
              <Label>Document Settings</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isTemplate"
                    checked={filters.isTemplate}
                    onCheckedChange={(checked) => handleFilterChange('isTemplate', checked)}
                  />
                  <Label htmlFor="isTemplate">Templates only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowCloning"
                    checked={filters.allowCloning}
                    onCheckedChange={(checked) => handleFilterChange('allowCloning', checked)}
                  />
                  <Label htmlFor="allowCloning">Cloneable documents only</Label>
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="views">Most Viewed</SelectItem>
                    <SelectItem value="clones">Most Cloned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange('sortOrder', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Filters */}
      {savedFilters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              Saved Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map((savedFilter, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => loadSavedFilters(savedFilter as SearchFilters & { name: string })}
                >
                  {(savedFilter as any).name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 