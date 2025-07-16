import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  MessageSquare, 
  Star, 
  User, 
  Calendar, 
  Edit3, 
  AlertCircle, 
  HelpCircle,
  Send,
  Download,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { Document } from '@/types/documents';
import { DocumentShare, DocumentFeedback, FeedbackComment } from '@/types/feedback';
import connectDB from '@/lib/mongodb';
import DocumentModel from '@/models/Document';
import DocumentShareModel from '@/models/DocumentShare';
import DocumentFeedbackModel from '@/models/DocumentFeedback';
import { notFound } from 'next/navigation';
import DocumentReviewClient from './DocumentReviewClient';

interface DocumentReviewData {
  document: Document;
  share: DocumentShare;
  existingFeedback?: DocumentFeedback;
}

async function getDocumentReviewData(token: string): Promise<DocumentReviewData> {
  await connectDB();

  // Find the share
  const share = await DocumentShareModel.findOne({
    shareToken: token,
    isActive: true
  });

  if (!share) {
    notFound();
  }

  // Check if share has expired
  if (share.expiresAt && new Date() > share.expiresAt) {
    notFound();
  }

  // Get the document
  const document = await DocumentModel.findById(share.documentId);
  if (!document) {
    notFound();
  }

  // Check if feedback already exists for this share
  const existingFeedback = await DocumentFeedbackModel.findOne({
    documentShareId: share._id
  });

  return {
    document: {
      _id: document._id.toString(),
      title: document.title,
      type: document.type,
      content: document.content,
      description: document.description,
      wordCount: document.wordCount,
      characterCount: document.characterCount,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    },
    share: {
      _id: share._id.toString(),
      shareType: share.shareType,
      email: share.email,
      reviewerName: share.reviewerName,
      message: share.message,
      canComment: share.canComment,
      canEdit: share.canEdit,
      canDownload: share.canDownload,
      expiresAt: share.expiresAt,
      createdAt: share.createdAt
    },
    existingFeedback: existingFeedback ? {
      _id: existingFeedback._id.toString(),
      reviewerName: existingFeedback.reviewerName,
      reviewerEmail: existingFeedback.reviewerEmail,
      comments: existingFeedback.comments,
      overallRating: existingFeedback.overallRating,
      generalFeedback: existingFeedback.generalFeedback,
      createdAt: existingFeedback.createdAt,
      updatedAt: existingFeedback.updatedAt
    } : undefined
  };
}

export default async function DocumentReviewPage({ 
  params 
}: { 
  params: Promise<{ token: string }> 
}) {
  const { token } = await params;
  const data = await getDocumentReviewData(token);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }>
          <DocumentReviewClient initialData={data} />
        </Suspense>
      </div>
    </div>
  );
}