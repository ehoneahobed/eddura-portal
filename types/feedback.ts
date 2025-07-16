/**
 * Document sharing types
 */
export interface DocumentShare {
  _id: string;
  documentId: string;
  userId: string;
  shareType: 'email' | 'link';
  email?: string;
  shareToken: string;
  isActive: boolean;
  expiresAt?: string;
  canComment: boolean;
  canEdit: boolean;
  canDownload: boolean;
  message?: string;
  reviewerName?: string;
  createdAt: string;
  updatedAt: string;
  shareUrl?: string;
}

/**
 * Document feedback types
 */
export interface FeedbackComment {
  id: string;
  content: string;
  position?: {
    start: number;
    end: number;
    text: string;
  };
  type: 'general' | 'suggestion' | 'correction' | 'question';
  status: 'pending' | 'addressed' | 'ignored';
  createdAt: string;
  updatedAt: string;
}

export interface DocumentFeedback {
  _id: string;
  documentId: string;
  documentShareId: string;
  reviewerName: string;
  reviewerEmail?: string;
  comments: FeedbackComment[];
  overallRating?: number;
  generalFeedback?: string;
  isResolved: boolean;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Document with feedback summary
 */
export interface DocumentWithFeedback extends Document {
  shares: DocumentShare[];
  feedbackCount: number;
  pendingFeedbackCount: number;
  averageRating?: number;
}

/**
 * API request/response types
 */
export interface ShareDocumentRequest {
  documentId: string;
  shareType: 'email' | 'link';
  email?: string;
  reviewerName?: string;
  message?: string;
  canComment?: boolean;
  canEdit?: boolean;
  canDownload?: boolean;
  expiresAt?: string;
}

export interface CreateFeedbackRequest {
  documentShareId: string;
  reviewerName: string;
  reviewerEmail?: string;
  comments: Omit<FeedbackComment, 'id' | 'createdAt' | 'updatedAt'>[];
  overallRating?: number;
  generalFeedback?: string;
}

export interface UpdateFeedbackRequest {
  feedbackId: string;
  comments?: FeedbackComment[];
  overallRating?: number;
  generalFeedback?: string;
  isResolved?: boolean;
}

/**
 * Feedback statistics
 */
export interface FeedbackStats {
  totalFeedback: number;
  pendingFeedback: number;
  resolvedFeedback: number;
  averageRating: number;
  feedbackByType: Record<string, number>;
  recentFeedback: DocumentFeedback[];
}

/**
 * Share link response
 */
export interface ShareLinkResponse {
  shareUrl: string;
  shareToken: string;
  expiresAt?: string;
}

/**
 * Document review page data
 */
export interface DocumentReviewData {
  document: Document;
  share: DocumentShare;
  existingFeedback?: DocumentFeedback;
}