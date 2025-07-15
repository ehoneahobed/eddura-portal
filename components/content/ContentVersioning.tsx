'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  History, 
  RotateCcw, 
  Eye, 
  User, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  ArrowUpDown
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ContentVersion {
  id: string;
  version: number;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  createdAt: Date;
  changes: string[];
  isCurrent: boolean;
}

interface ContentVersioningProps {
  contentId: string;
  currentVersion: number;
  onRestore?: (versionId: string) => Promise<void>;
  onCompare?: (version1: string, version2: string) => void;
  className?: string;
}

export default function ContentVersioning({
  contentId,
  currentVersion,
  onRestore,
  onCompare,
  className = ''
}: ContentVersioningProps) {
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ContentVersion | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersion1, setCompareVersion1] = useState<string>('');
  const [compareVersion2, setCompareVersion2] = useState<string>('');

  useEffect(() => {
    fetchVersions();
  }, [contentId]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/content/${contentId}/versions`);
      
      if (response.ok) {
        const data = await response.json();
        setVersions(data.data);
      } else {
        // Fallback to mock data
        setVersions(generateMockVersions());
      }
    } catch (error) {
      console.error('Error fetching versions:', error);
      setVersions(generateMockVersions());
    } finally {
      setLoading(false);
    }
  };

  const generateMockVersions = (): ContentVersion[] => {
    const mockVersions: ContentVersion[] = [];
    const authors = ['John Doe', 'Jane Smith', 'Admin User'];
    const changes = [
      'Updated title and meta description',
      'Fixed grammar and spelling errors',
      'Added new section about best practices',
      'Updated images and media content',
      'Improved SEO optimization',
      'Added call-to-action section'
    ];

    for (let i = currentVersion; i >= 1; i--) {
      mockVersions.push({
        id: `version-${i}`,
        version: i,
        title: `Content Title v${i}`,
        content: `This is version ${i} of the content...`,
        excerpt: `Excerpt for version ${i}`,
        author: authors[i % authors.length],
        createdAt: new Date(Date.now() - (currentVersion - i) * 24 * 60 * 60 * 1000),
        changes: changes.slice(0, Math.floor(Math.random() * 3) + 1),
        isCurrent: i === currentVersion
      });
    }

    return mockVersions;
  };

  const handleRestore = async (version: ContentVersion) => {
    if (!onRestore) return;

    setIsRestoring(true);
    
    try {
      await onRestore(version.id);
      toast.success(`Restored to version ${version.version}`);
      setIsDialogOpen(false);
      setSelectedVersion(null);
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Failed to restore version');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleCompare = () => {
    if (!compareVersion1 || !compareVersion2) {
      toast.error('Please select two versions to compare');
      return;
    }

    if (compareVersion1 === compareVersion2) {
      toast.error('Please select different versions to compare');
      return;
    }

    onCompare?.(compareVersion1, compareVersion2);
    setCompareMode(false);
    setCompareVersion1('');
    setCompareVersion2('');
  };

  const getVersionBadge = (version: ContentVersion) => {
    if (version.isCurrent) {
      return <Badge className="bg-green-100 text-green-800">Current</Badge>;
    }
    return <Badge variant="outline">v{version.version}</Badge>;
  };

  const getChangesSummary = (changes: string[]) => {
    if (changes.length === 0) return 'Minor updates';
    if (changes.length === 1) return changes[0];
    return `${changes.length} changes made`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Version History
            <Badge variant="outline">{versions.length} versions</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Version List */}
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                    version.isCurrent ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getVersionBadge(version)}
                        <span className="font-medium">{version.title}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {version.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(version.createdAt, 'MMM dd, yyyy HH:mm')}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        {getChangesSummary(version.changes)}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVersion(version)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      
                      {!version.isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(version)}
                          disabled={isRestoring}
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View Version Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Version Details</DialogTitle>
                  </DialogHeader>
                  
                  {selectedVersion && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        {getVersionBadge(selectedVersion)}
                        <span className="font-medium">{selectedVersion.title}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Author:</span> {selectedVersion.author}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {format(selectedVersion.createdAt, 'PPP p')}
                        </div>
                        <div>
                          <span className="font-medium">Version:</span> {selectedVersion.version}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> {selectedVersion.isCurrent ? 'Current' : 'Previous'}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-sm">Changes Made:</span>
                        <ul className="mt-2 space-y-1">
                          {selectedVersion.changes.map((change, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <span className="font-medium text-sm">Content Preview:</span>
                        <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-600 max-h-32 overflow-y-auto">
                          {selectedVersion.content}
                        </div>
                      </div>
                      
                      {!selectedVersion.isCurrent && (
                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            onClick={() => handleRestore(selectedVersion)}
                            disabled={isRestoring}
                            className="flex-1"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            {isRestoring ? 'Restoring...' : 'Restore This Version'}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompareMode(!compareMode)}
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Compare Versions
              </Button>
            </div>

            {/* Compare Mode */}
            {compareMode && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">Compare Versions</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-blue-800 mb-1 block">
                      Version 1
                    </label>
                    <select
                      value={compareVersion1}
                      onChange={(e) => setCompareVersion1(e.target.value)}
                      className="w-full p-2 border border-blue-300 rounded text-sm"
                    >
                      <option value="">Select version</option>
                      {versions.map((version) => (
                        <option key={version.id} value={version.id}>
                          v{version.version} - {format(version.createdAt, 'MMM dd, yyyy')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-800 mb-1 block">
                      Version 2
                    </label>
                    <select
                      value={compareVersion2}
                      onChange={(e) => setCompareVersion2(e.target.value)}
                      className="w-full p-2 border border-blue-300 rounded text-sm"
                    >
                      <option value="">Select version</option>
                      {versions.map((version) => (
                        <option key={version.id} value={version.id}>
                          v{version.version} - {format(version.createdAt, 'MMM dd, yyyy')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={handleCompare}
                    disabled={!compareVersion1 || !compareVersion2}
                    size="sm"
                  >
                    Compare
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCompareMode(false);
                      setCompareVersion1('');
                      setCompareVersion2('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 