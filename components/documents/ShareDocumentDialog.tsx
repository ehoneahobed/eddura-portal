'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, Mail, Link, Copy, Check, Calendar, User, MessageSquare, Loader2 } from 'lucide-react';
import { Document } from '@/types/documents';
import { DocumentShare } from '@/types/feedback';
import { toast } from 'sonner';

interface ShareDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document;
  onShareCreated?: (share: DocumentShare) => void;
}

export default function ShareDocumentDialog({
  open,
  onOpenChange,
  document,
  onShareCreated
}: ShareDocumentDialogProps) {
  const [activeTab, setActiveTab] = useState<'email' | 'link'>('email');
  const [loading, setLoading] = useState(false);
  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [copyingStates, setCopyingStates] = useState<{ [key: string]: boolean }>({});
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  // Email sharing form
  const [emailForm, setEmailForm] = useState({
    email: '',
    reviewerName: '',
    message: '',
    canComment: true,
    canEdit: false,
    canDownload: true,
    expiresAt: ''
  });

  // Link sharing form
  const [linkForm, setLinkForm] = useState({
    canComment: true,
    canEdit: false,
    canDownload: true,
    expiresAt: ''
  });

  // Load existing shares when dialog opens
  const loadShares = useCallback(async () => {
    if (!open) return;
    
    setLoadingShares(true);
    try {
      const response = await fetch(`/api/documents/${document._id}/share`);
      if (response.ok) {
        const data = await response.json();
        setShares(data.shares || []);
      }
    } catch (error) {
      console.error('Error loading shares:', error);
    } finally {
      setLoadingShares(false);
    }
  }, [open, document._id]);

  // Load shares when dialog opens
  useEffect(() => {
    if (open) {
      loadShares();
    }
  }, [open, loadShares]);

  const handleEmailShare = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/documents/${document._id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shareType: 'email',
          ...emailForm,
          expiresAt: emailForm.expiresAt || undefined
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Document shared successfully via email');
        onShareCreated?.(data.share);
        setEmailForm({
          email: '',
          reviewerName: '',
          message: '',
          canComment: true,
          canEdit: false,
          canDownload: true,
          expiresAt: ''
        });
        loadShares(); // Refresh shares list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to share document');
      }
    } catch (error) {
      console.error('Error sharing document:', error);
      toast.error('Failed to share document');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkShare = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/documents/${document._id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shareType: 'link',
          ...linkForm,
          expiresAt: linkForm.expiresAt || undefined
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Share link created successfully');
        onShareCreated?.(data.share);
        setLinkForm({
          canComment: true,
          canEdit: false,
          canDownload: true,
          expiresAt: ''
        });
        loadShares(); // Refresh shares list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create share link');
      }
    } catch (error) {
      console.error('Error creating share link:', error);
      toast.error('Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, shareId: string) => {
    // Set copying state for this specific share
    setCopyingStates(prev => ({ ...prev, [shareId]: true }));
    
    try {
      await navigator.clipboard.writeText(text);
      
      // Show success feedback
      toast.success('Share link copied to clipboard!', {
        description: 'You can now paste this link anywhere to share your document.',
        duration: 3000,
      });
      
      // Set copied state for visual feedback
      setCopiedStates(prev => ({ ...prev, [shareId]: true }));
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [shareId]: false }));
      }, 2000);
      
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link to clipboard', {
        description: 'Please try selecting and copying the link manually.',
        duration: 4000,
      });
    } finally {
      // Reset copying state
      setCopyingStates(prev => ({ ...prev, [shareId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getShareTypeIcon = (shareType: string) => {
    return shareType === 'email' ? <Mail className="h-4 w-4" /> : <Link className="h-4 w-4" />;
  };

  const getShareTypeLabel = (shareType: string) => {
    return shareType === 'email' ? 'Email Share' : 'Link Share';
  };

  const getCopyButtonContent = (shareId: string) => {
    const isCopying = copyingStates[shareId];
    const isCopied = copiedStates[shareId];
    
    if (isCopying) {
      return (
        <>
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Copying...
        </>
      );
    }
    
    if (isCopied) {
      return (
        <>
          <Check className="h-3 w-3 mr-1" />
          Copied!
        </>
      );
    }
    
    return (
      <>
        <Copy className="h-3 w-3 mr-1" />
        Copy Link
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Document for Feedback
          </DialogTitle>
          <DialogDescription>
            Share &quot;{document.title}&quot; with others to get feedback and reviews
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'email' | 'link')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Share via Email
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Create Share Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="reviewer@example.com"
                    value={emailForm.email}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="reviewerName">Reviewer Name</Label>
                  <Input
                    id="reviewerName"
                    placeholder="John Doe"
                    value={emailForm.reviewerName}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, reviewerName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Add a personal message for the reviewer..."
                    value={emailForm.message}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={emailForm.expiresAt}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Permissions</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Comments</Label>
                    <p className="text-sm text-muted-foreground">Reviewer can add comments and feedback</p>
                  </div>
                  <Switch
                    checked={emailForm.canComment}
                    onCheckedChange={(checked) => setEmailForm(prev => ({ ...prev, canComment: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Editing</Label>
                    <p className="text-sm text-muted-foreground">Reviewer can edit the document</p>
                  </div>
                  <Switch
                    checked={emailForm.canEdit}
                    onCheckedChange={(checked) => setEmailForm(prev => ({ ...prev, canEdit: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Download</Label>
                    <p className="text-sm text-muted-foreground">Reviewer can download the document</p>
                  </div>
                  <Switch
                    checked={emailForm.canDownload}
                    onCheckedChange={(checked) => setEmailForm(prev => ({ ...prev, canDownload: checked }))}
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleEmailShare} 
              disabled={loading || !emailForm.email.trim()}
              className="w-full"
            >
              {loading ? 'Sharing...' : 'Share via Email'}
            </Button>
          </TabsContent>

          <TabsContent value="link" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="linkExpiresAt">Expires At (Optional)</Label>
                  <Input
                    id="linkExpiresAt"
                    type="datetime-local"
                    value={linkForm.expiresAt}
                    onChange={(e) => setLinkForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Permissions</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Comments</Label>
                    <p className="text-sm text-muted-foreground">Anyone with the link can add comments</p>
                  </div>
                  <Switch
                    checked={linkForm.canComment}
                    onCheckedChange={(checked) => setLinkForm(prev => ({ ...prev, canComment: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Editing</Label>
                    <p className="text-sm text-muted-foreground">Anyone with the link can edit the document</p>
                  </div>
                  <Switch
                    checked={linkForm.canEdit}
                    onCheckedChange={(checked) => setLinkForm(prev => ({ ...prev, canEdit: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Download</Label>
                    <p className="text-sm text-muted-foreground">Anyone with the link can download the document</p>
                  </div>
                  <Switch
                    checked={linkForm.canDownload}
                    onCheckedChange={(checked) => setLinkForm(prev => ({ ...prev, canDownload: checked }))}
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleLinkShare} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating...' : 'Create Share Link'}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Existing Shares */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Existing Shares
          </h3>
          
          {loadingShares ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading shares...</p>
            </div>
          ) : shares.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Share2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No shares yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {shares.map((share) => (
                <Card key={share._id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          {getShareTypeIcon(share.shareType)}
                          <Badge variant="secondary">
                            {getShareTypeLabel(share.shareType)}
                          </Badge>
                          {share.shareType === 'email' && share.email && (
                            <span className="text-sm text-muted-foreground">
                              {share.email}
                            </span>
                          )}
                        </div>
                        
                        {share.reviewerName && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            {share.reviewerName}
                          </div>
                        )}
                        
                        {share.message && (
                          <div className="flex items-start gap-1 text-sm text-muted-foreground">
                            <MessageSquare className="h-3 w-3 mt-0.5" />
                            <span className="line-clamp-2">{share.message}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Created {formatDate(share.createdAt)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {share.shareType === 'link' && (
                          <Button
                            variant={copiedStates[share._id] ? "default" : "outline"}
                            size="sm"
                            onClick={() => copyToClipboard(`${window.location.origin}/review/${share.shareToken}`, share._id)}
                            disabled={copyingStates[share._id]}
                            className={copiedStates[share._id] ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                          >
                            {getCopyButtonContent(share._id)}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}