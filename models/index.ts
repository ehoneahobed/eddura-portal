/**
 * Models Index
 * 
 * This file ensures all Mongoose models are properly registered in the correct order.
 * Models that reference other models (like Program referencing School) must be imported
 * after their dependencies to ensure proper schema registration.
 */

// Import models in dependency order
// 1. Base models (no dependencies)
import './User';
import './Admin';
import './School';
import './Scholarship';
import './Content';
import './Document';
import './DocumentTemplate';
import './DocumentRating';
import './DocumentFeedback';
import './DocumentShare';
import './DocumentClone';
import './LibraryDocument';
import './DocumentView';
import './MediaFile';
import './Message';
import './Task';
import './SavedScholarship';
import './ApplicationFormRequest';
import './ApplicationTemplate';

// 2. Models that reference other models (import after dependencies)
import './Program';
import './Application';
import './ApplicationRequirement';
import './RequirementsTemplate';

// Export all models for convenience
export { default as User } from './User';
export { default as Admin } from './Admin';
export { default as School } from './School';
export { default as Program } from './Program';
export { default as Scholarship } from './Scholarship';
export { default as Content } from './Content';
export { default as Document } from './Document';
export { default as DocumentTemplate } from './DocumentTemplate';
export { default as DocumentRating } from './DocumentRating';
export { default as DocumentFeedback } from './DocumentFeedback';
export { default as DocumentShare } from './DocumentShare';
export { default as DocumentClone } from './DocumentClone';
export { default as LibraryDocument } from './LibraryDocument';
export { default as DocumentView } from './DocumentView';
export { default as MediaFile } from './MediaFile';
export { default as Message } from './Message';
export { default as Task } from './Task';
export { default as SavedScholarship } from './SavedScholarship';
export { default as ApplicationFormRequest } from './ApplicationFormRequest';
export { default as ApplicationTemplate } from './ApplicationTemplate';
export { default as Application } from './Application';
export { default as ApplicationRequirement } from './ApplicationRequirement';
export { default as RequirementsTemplate } from './RequirementsTemplate'; 