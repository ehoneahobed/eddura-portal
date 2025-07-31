/**
 * Models Registration
 * This file ensures all Mongoose models are properly imported and registered
 * in the correct order to avoid schema registration issues.
 */

// Import all models to ensure they are registered
import User from '@/models/User';
import Recipient from '@/models/Recipient';
import RecommendationRequest from '@/models/RecommendationRequest';
import RecommendationLetter from '@/models/RecommendationLetter';
import Application from '@/models/Application';
import Scholarship from '@/models/Scholarship';
import Document from '@/models/Document';
import Content from '@/models/Content';
import Program from '@/models/Program';
import School from '@/models/School';
import Admin from '@/models/Admin';
import Task from '@/models/Task';
import AIReview from '@/models/AIReview';
import ApplicationTemplate from '@/models/ApplicationTemplate';
import ApplicationRequirement from '@/models/ApplicationRequirement';
import RequirementsTemplate from '@/models/RequirementsTemplate';
import Message from '@/models/Message';
import ApplicationFormRequest from '@/models/ApplicationFormRequest';
import Interview from '@/models/Interview';
import DocumentClone from '@/models/DocumentClone';
import DocumentFeedback from '@/models/DocumentFeedback';
import DocumentRating from '@/models/DocumentRating';
import DocumentShare from '@/models/DocumentShare';
import DocumentTemplate from '@/models/DocumentTemplate';
import DocumentView from '@/models/DocumentView';
import LibraryDocument from '@/models/LibraryDocument';
import MediaFile from '@/models/MediaFile';
import SavedScholarship from '@/models/SavedScholarship';

// Export all models for easy access
export {
  User,
  Recipient,
  RecommendationRequest,
  RecommendationLetter,
  Application,
  Scholarship,
  Document,
  Content,
  Program,
  School,
  Admin,
  Task,
  AIReview,
  ApplicationTemplate,
  ApplicationRequirement,
  RequirementsTemplate,
  Message,
  ApplicationFormRequest,
  Interview,
  DocumentClone,
  DocumentFeedback,
  DocumentRating,
  DocumentShare,
  DocumentTemplate,
  DocumentView,
  LibraryDocument,
  MediaFile,
  SavedScholarship,
};

// This ensures all models are registered when this file is imported
console.log('✅ All models registered successfully'); 