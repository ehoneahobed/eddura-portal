import { useSession } from 'next-auth/react';

export type ActivityType = 'document_created' | 'document_edited' | 'application_started' | 'application_updated' | 'application_completed' | 'peer_review_provided' | 'platform_activity' | 'quiz_completed' | 'profile_updated' | 'search_performed' | 'content_shared';

interface ActivityMetadata {
  documentId?: string;
  applicationId?: string;
  reviewId?: string;
  [key: string]: any;
}

export function useActivityTracker() {
  const { data: session } = useSession();

  const trackActivity = async (activityType: ActivityType, metadata?: ActivityMetadata) => {
    if (!session) {
      console.warn('Cannot track activity: user not authenticated');
      return;
    }

    try {
      const response = await fetch('/api/activity/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityType,
          metadata
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to track activity:', error);
      }
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  const trackDocumentCreated = (documentId: string) => {
    return trackActivity('document_created', { documentId });
  };

  const trackApplicationStarted = (applicationId: string) => {
    return trackActivity('application_started', { applicationId });
  };

  const trackApplicationCompleted = (applicationId: string) => {
    return trackActivity('application_completed', { applicationId });
  };

  const trackPeerReviewProvided = (reviewId: string) => {
    return trackActivity('peer_review_provided', { reviewId });
  };

  const trackPlatformActivity = () => {
    return trackActivity('platform_activity');
  };

  return {
    trackActivity,
    trackDocumentCreated,
    trackApplicationStarted,
    trackApplicationCompleted,
    trackPeerReviewProvided,
    trackPlatformActivity
  };
}