'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Bookmark, 
  Search, 
  // Filter, 
  Calendar, 
  DollarSign, 
  MapPin,
  GraduationCap,
  // Target,
  Edit3,
  Trash2,
  Share2,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
  // Clock,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Link from 'next/link';
import { ResponsiveContainer } from '@/components/ui/responsive-container';

interface SavedScholarship {
  _id: string;
  scholarshipId: {
    _id: string;
    title: string;
    provider: string;
    value?: number;
    currency?: string;
    deadline: string;
    frequency?: string;
    linkedSchool?: string;
    tags?: string[];
    eligibility?: {
      degreeLevels?: string[];
      minGPA?: string;
    };
  };
  savedAt: string;
  notes?: string;
  status: 'saved' | 'applied' | 'interested' | 'not-interested';
  reminderDate?: string;
  isReminderSet: boolean;
}

interface SavedScholarshipsResponse {
  savedScholarships: SavedScholarship[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function SavedScholarshipsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [savedScholarships, setSavedScholarships] = useState<SavedScholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingScholarship, setEditingScholarship] = useState<SavedScholarship | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('saved');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchSavedScholarships = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/user/saved-scholarships?${params}`);
      if (response.ok) {
        const data: SavedScholarshipsResponse = await response.json();
        setSavedScholarships(data.savedScholarships);
      } else {
        toast.error('Failed to fetch saved scholarships');
      }
    } catch (error) {
      console.error('Error fetching saved scholarships:', error);
      toast.error('Failed to fetch saved scholarships');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user?.id) {
      router.push('/auth/signin');
      return;
    }

    fetchSavedScholarships();
  }, [session, status, router, fetchSavedScholarships]);

  const handleUnsave = async (scholarshipId: string) => {
    try {
      const response = await fetch(`/api/user/saved-scholarships/${scholarshipId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSavedScholarships((prev: SavedScholarship[]) => 
          prev.filter((s: SavedScholarship) => s.scholarshipId._id !== scholarshipId)
        );
        toast.success('Scholarship removed from saved list');
      } else {
        toast.error('Failed to remove scholarship');
      }
    } catch (error) {
      console.error('Error unsaving scholarship:', error);
      toast.error('Failed to remove scholarship');
    }
  };

  const handleUpdate = async () => {
    if (!editingScholarship) return;

    try {
      const response = await fetch(`/api/user/saved-scholarships/${editingScholarship.scholarshipId._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: editNotes,
          status: editStatus
        })
      });

      if (response.ok) {
        setSavedScholarships((prev: SavedScholarship[]) => 
          prev.map((s: SavedScholarship) => 
            s.scholarshipId._id === editingScholarship.scholarshipId._id
              ? { ...s, notes: editNotes, status: editStatus as any }
              : s
          )
        );
        toast.success('Scholarship updated successfully');
        setIsEditDialogOpen(false);
        setEditingScholarship(null);
      } else {
        toast.error('Failed to update scholarship');
      }
    } catch (error) {
      console.error('Error updating scholarship:', error);
      toast.error('Failed to update scholarship');
    }
  };

  const handleShare = async (scholarship: SavedScholarship) => {
    const url = `${window.location.origin}/scholarships/${scholarship.scholarshipId._id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: scholarship.scholarshipId.title,
          text: `Check out this scholarship: ${scholarship.scholarshipId.title}`,
          url: url
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Scholarship link copied to clipboard!', {
          description: 'You can now share this link with others.',
          duration: 3000,
        });
      } catch (error) {
        console.error('Failed to copy scholarship link:', error);
        toast.error('Failed to copy link to clipboard', {
          description: 'Please try selecting and copying the link manually.',
          duration: 4000,
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800';
      case 'interested':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800';
      case 'not-interested':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-[var(--eddura-primary-800)] dark:text-white dark:border-[var(--eddura-primary-700)]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return CheckCircle;
      case 'interested': return Star;
      case 'not-interested': return AlertCircle;
      default: return Bookmark;
    }
  };

  const formatCurrency = (value: number | string, currency: string = 'USD') => {
    if (typeof value === 'string') return value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays <= 7) {
      return `${diffDays} days left`;
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    }
  };

  const filteredScholarships = savedScholarships.filter(scholarship => {
    const matchesSearch = scholarship.scholarshipId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholarship.scholarshipId.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (scholarship.notes && scholarship.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session?.user?.id) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <ResponsiveContainer maxWidth="8xl" padding="md" className="py-4 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[var(--eddura-primary-50)] dark:bg-[var(--eddura-primary-800)]">
            <Bookmark className="h-7 w-7 text-[var(--eddura-primary-700)] dark:text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--eddura-primary-900)] dark:text-white">Saved Scholarships</h1>
            <p className="text-[var(--eddura-primary-700)] dark:text-[var(--eddura-primary-300)]">Manage your saved scholarships and track your applications</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[var(--eddura-primary-300)]" />
            <Input
              placeholder="Search scholarships, providers, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-[var(--eddura-primary-800)]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-white border-gray-200 text-gray-700 dark:bg-[var(--eddura-primary-900)] dark:border-[var(--eddura-primary-700)] dark:text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900 border-gray-200 dark:bg-[var(--eddura-primary-900)] dark:text-white dark:border-[var(--eddura-primary-700)]">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="saved">Saved</SelectItem>
              <SelectItem value="interested">Interested</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="not-interested">Not Interested</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--eddura-primary-600)] dark:text-white" />
        </div>
      ) : filteredScholarships.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300 dark:border-[var(--eddura-primary-700)] bg-white dark:bg-[var(--eddura-primary-900)]">
          <CardContent className="p-12 text-center">
            <Bookmark className="h-12 w-12 text-gray-400 dark:text-[var(--eddura-primary-300)] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--eddura-primary-900)] dark:text-white mb-2">No saved scholarships</h3>
            <p className="text-gray-600 dark:text-[var(--eddura-primary-300)] mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'No scholarships match your current filters.'
                : 'Start saving scholarships to track them here.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link href="/scholarships">
                <Button>
                  Browse Scholarships
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredScholarships.map((savedScholarship) => {
            const scholarship = savedScholarship.scholarshipId;
            const StatusIcon = getStatusIcon(savedScholarship.status);
            
            return (
              <motion.div
                key={savedScholarship._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full hover:shadow-eddura-lg transition-shadow border border-gray-200 dark:border-[var(--eddura-primary-800)] bg-white dark:bg-[var(--eddura-primary-900)] rounded-2xl overflow-hidden">
                  {/* Brand accent top bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-[var(--eddura-primary)] via-[var(--eddura-primary-light)] to-[var(--eddura-accent)]" />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold line-clamp-2 mb-1 text-[var(--eddura-primary-900)] dark:text-white">
                          {scholarship.title}
                        </CardTitle>
                        <CardDescription className="text-sm text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">
                          {scholarship.provider}
                        </CardDescription>
                      </div>
                      <Badge className={`flex items-center gap-1 px-2 py-1 text-xs font-medium border ${getStatusColor(savedScholarship.status)}`}>
                        <StatusIcon className="h-3 w-3" />
                        {savedScholarship.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>

                  {/* Soft divider */}
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-[var(--eddura-primary-800)]" />
                  
                  <CardContent className="space-y-4">
                    {/* Key Info */}
                    <div className="space-y-2">
                      {scholarship.value && (
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium">{formatCurrency(scholarship.value, scholarship.currency)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-700 dark:text-[var(--eddura-primary-200)]">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{formatDeadline(scholarship.deadline)}</span>
                      </div>
                      {scholarship.linkedSchool && (
                        <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{scholarship.linkedSchool}</span>
                        </div>
                      )}
                      {scholarship.eligibility?.degreeLevels && (
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                          <GraduationCap className="h-4 w-4" />
                          <span className="text-sm">{scholarship.eligibility.degreeLevels.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {scholarship.tags && scholarship.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {scholarship.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {scholarship.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{scholarship.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {savedScholarship.notes && (
                      <div className="bg-gray-50 dark:bg-[var(--eddura-primary-800)] p-3 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-[var(--eddura-primary-200)] line-clamp-2">
                          {savedScholarship.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-2 pt-4 -mx-6 px-6 border-t border-gray-100 dark:border-[var(--eddura-primary-800)] bg-[var(--eddura-primary-50)]/40 dark:bg-transparent rounded-b-2xl flex items-center gap-2">
                      <Link href={`/scholarships/${scholarship._id}`}>
                        <Button size="sm" variant="outline" className="flex-1 bg-[var(--eddura-primary)] hover:bg-[var(--eddura-primary-dark)] text-white border-[var(--eddura-primary)]">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleShare(savedScholarship)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingScholarship(savedScholarship);
                          setEditNotes(savedScholarship.notes || '');
                          setEditStatus(savedScholarship.status);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUnsave(scholarship._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Saved Scholarship</DialogTitle>
            <DialogDescription>
              Update your notes and status for this scholarship.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saved">Saved</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="not-interested">Not Interested</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Add your notes about this scholarship..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ResponsiveContainer>
  );
}