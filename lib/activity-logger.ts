import { ActivityType } from '@/models/UserActivity';

interface ActivityMetadata {
  quizScore?: number;
  programId?: string;
  programName?: string;
  scholarshipId?: string;
  scholarshipName?: string;
  applicationId?: string;
  applicationName?: string;
  documentType?: string;
  documentName?: string;
  recommendationType?: string;
  [key: string]: any;
}

export async function logActivity(
  type: ActivityType,
  title: string,
  description: string,
  metadata?: ActivityMetadata
): Promise<void> {
  try {
    const response = await fetch('/api/user/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        title,
        description,
        metadata
      }),
    });

    if (!response.ok) {
      console.error('Failed to log activity:', await response.text());
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// Predefined activity logging functions for common actions
export const ActivityLogger = {
  quizCompleted: (score: number) => 
    logActivity(
      'quiz_completed',
      'Quiz Completed',
      'Career discovery quiz finished',
      { quizScore: score }
    ),

  quizRetaken: () => 
    logActivity(
      'quiz_retaken',
      'Quiz Retaken',
      'Career discovery quiz retaken'
    ),

  programViewed: (programName: string, programId?: string) => 
    logActivity(
      'program_viewed',
      'Program Viewed',
      `Viewed program: ${programName}`,
      { programName, programId }
    ),

  scholarshipViewed: (scholarshipName: string, scholarshipId?: string) => 
    logActivity(
      'scholarship_viewed',
      'Scholarship Viewed',
      `Viewed scholarship: ${scholarshipName}`,
      { scholarshipName, scholarshipId }
    ),

  applicationStarted: (applicationName: string, applicationId?: string) => 
    logActivity(
      'application_started',
      'Application Started',
      `Started application: ${applicationName}`,
      { applicationName, applicationId }
    ),

  applicationSubmitted: (applicationName: string, applicationId?: string) => 
    logActivity(
      'application_submitted',
      'Application Submitted',
      `Submitted application: ${applicationName}`,
      { applicationName, applicationId }
    ),

  documentUploaded: (documentName: string, documentType: string) => 
    logActivity(
      'document_uploaded',
      'Document Uploaded',
      `Uploaded document: ${documentName}`,
      { documentName, documentType }
    ),

  profileUpdated: () => 
    logActivity(
      'profile_updated',
      'Profile Updated',
      'User profile information updated'
    ),

  recommendationViewed: (recommendationType: string) => 
    logActivity(
      'recommendation_viewed',
      'Recommendation Viewed',
      `Viewed ${recommendationType} recommendations`,
      { recommendationType }
    ),

  login: () => 
    logActivity(
      'login',
      'User Login',
      'User logged into the platform'
    )
};