'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import NextImage from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Image, 
  X, 
  Copy, 
  ExternalLink, 
  Search,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';
import { toast } from 'sonner';

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  alt?: string;
  caption?: string;
}

interface MediaUploadProps {
  onSelect: (url: string) => void;
  currentValue?: string;
  className?: string;
}

export default function MediaUpload({ onSelect, currentValue, className = '' }: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 5MB`);
          continue;
        }

        // Step 1: Get presigned URL from backend
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          const { presignedUrl, data } = result;
          // Step 2: Upload file directly to S3
          const s3Upload = await fetch(presignedUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type,
            },
          });
          if (!s3Upload.ok) {
            toast.error(`Failed to upload ${file.name} to S3`);
            continue;
          }
          // Step 3: Update UI
          const newFile: MediaFile = {
            id: data.id,
            filename: data.filename,
            originalName: file.name,
            url: data.url,
            mimeType: file.type,
            size: file.size,
            uploadedAt: new Date(),
          };
          setMediaFiles(prev => [newFile, ...prev]);
          toast.success(`${file.name} uploaded successfully`);
        } else {
          const error = await response.json();
          toast.error(`Failed to upload ${file.name}: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (file: MediaFile) => {
    onSelect(file.url);
    setIsDialogOpen(false);
    toast.success('Image selected');
  };

  const copyImageUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Image URL copied to clipboard!', {
        description: 'You can now paste this URL anywhere you need it.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to copy image URL:', error);
      toast.error('Failed to copy image URL to clipboard', {
        description: 'Please try selecting and copying the URL manually.',
        duration: 4000,
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = mediaFiles.filter(file =>
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.alt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={className}>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Image className="w-4 h-4 mr-2" aria-label="Image icon" />
            {currentValue ? 'Change Image' : 'Select Image'}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Media Library</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col h-full">
            {/* Upload Section */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Upload New Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file-upload">Choose Files</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      ref={fileInputRef}
                      disabled={isUploading}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB
                    </p>
                  </div>
                  {isUploading && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Uploading...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Search and Filters */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
              </Button>
            </div>

            {/* Media Grid/List */}
            <div className="flex-1 overflow-auto">
              {filteredFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Image className="w-12 h-12 mx-auto mb-4 text-gray-300" aria-label="No images icon" />
                  <p>No images found</p>
                  {searchTerm && (
                    <p className="text-sm">Try adjusting your search terms</p>
                  )}
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2'}>
                  {filteredFiles.map((file) => (
                    <Card
                      key={file.id}
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        currentValue === file.url ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleFileSelect(file)}
                    >
                      <CardContent className="p-2">
                        {viewMode === 'grid' ? (
                          <div className="space-y-2">
                            <div className="aspect-square relative overflow-hidden rounded">
                              <NextImage
                                src={file.url}
                                alt={file.alt || file.originalName}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium truncate" title={file.originalName}>
                                {file.originalName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 relative overflow-hidden rounded">
                              <NextImage
                                src={file.url}
                                alt={file.alt || file.originalName}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" title={file.originalName}>
                                {file.originalName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyImageUrl(file.url);
                                }}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(file.url, '_blank');
                                }}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Current Image Preview */}
      {currentValue && (
        <div className="mt-2">
          <Label>Current Image</Label>
          <div className="relative inline-block">
            <NextImage
              src={currentValue}
              alt="Selected image"
              width={128}
              height={128}
              className="object-cover rounded border"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 w-6 h-6 p-0"
              onClick={() => onSelect('')}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 