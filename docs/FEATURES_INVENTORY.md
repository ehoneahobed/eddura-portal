## Overview

This document inventories all user-facing and admin-facing features discovered in the codebase to inform monetization and token system design. It is organized by domain areas and mapped to concrete pages (`app/*`), API routes (`app/api/*`), models (`models/*`), services (`lib/services/*`), and components (`components/*`).

### Tech Stack Reference
- Next.js App Router, React, TypeScript, Tailwind, shadcn/ui
- MongoDB via Mongoose models
- NextAuth authentication
- AWS S3 for file storage


## User-facing Modules

### Authentication & Account
- Email/password signup, login, verify, error handling
  - Pages: `app/auth/register`, `app/auth/login`, `app/auth/signin`, `app/auth/verify`, `app/auth/error`
  - API: `app/api/auth/register`, `app/api/auth/login`, `app/api/auth/[...nextauth]`, `app/api/auth/verify`
- Session tracking, login metrics (`models/User`, `models/UserSession`, `lib/auth.ts`)

### Dashboard
- Personalized dashboard with stats
  - Page: `app/(user-portal)/dashboard/page.tsx`
  - API: `app/api/dashboard/stats`
  - Hooks: `hooks/use-dashboard.ts`

### Applications Management
- Create/manage applications (schools, scholarships, external)
  - Pages: `app/(user-portal)/applications/*` (list, detail, view, form, templates, packages)
  - API: `app/api/applications/*` (create, get, update, submit, sections complete, submission status, follow-ups, download pdf/word)
  - Models: `models/Application`, `models/ApplicationRequirement`, `models/Interview`
- Requirements management with templates, status, and progress
  - API: `app/api/application-requirements/*`, `app/api/applications/[id]/requirements/*`
  - Services: `lib/services/RequirementsService.ts`, `lib/services/RequirementsTemplateService.ts`, `lib/services/progressTracker.ts`
  - Docs: `docs/requirements-management-system.md`
- Application templates (create/apply)
  - API: `app/api/application-templates/*`
  - Pages: `app/(user-portal)/applications/templates`
- Interviews scheduling/tracking
  - API: `app/api/applications/[id]/interviews/*`
- Package management
  - Pages: `app/(user-portal)/applications/packages`

### Documents
- Document creation (text and upload types), editing (markdown editor), versioning, metadata, tags
  - Pages: `app/(user-portal)/documents/*`
  - Components: `components/ui/markdown-editor.tsx`, `components/ui/expandable-textarea.tsx`
  - Models: `models/Document`, `models/DocumentClone`, `models/DocumentFeedback`, `models/DocumentRating`, `models/DocumentView`, `models/DocumentTemplate`
  - API: `app/api/documents/*` (CRUD, types, versioning, download Word/PDF, share, feedback, upload to S3)
  - Storage: AWS S3 via `lib/s3.ts`; config in README
- Document library (curated examples to clone/edit)
  - Paid plans only (Free can view landing/teasers, cannot clone)
  - User page: `app/(user-portal)/library/page.tsx`
  - Admin: `app/admin/library/*` (documents, templates, publish, review, analytics)
  - API: `app/api/library/documents/*` (+ rate, download)
- Sharing & feedback
  - API: `app/api/documents/[id]/share`, `app/api/documents/[id]/feedback`
  - Models: `models/DocumentShare`, `models/DocumentFeedback`

### AI & Automation
- AI content generation/refinement and reviews (token-gated; not included on Free without purchased tokens)
  - API: `app/api/ai/generate`, `app/api/ai/refine`, `app/api/ai/refine-with-feedback`, `app/api/ai/review-application`, `app/api/ai/quiz-analysis`
  - Lib: `lib/ai-utils.ts`, `lib/ai-review-utils.ts`, `lib/ai-recommendations.ts`
  - Docs: `AI_*` docs in repo

### Recommendations System (Letters)
- Manage recommendation requests and recipients, generate/refine letters, secure token links for uploads/views/downloads
  - Pages: `app/recommendation/[token]`, `app/review/[token]`
  - User pages: `app/(user-portal)/recommendations/*`
  - API: `app/api/recommendations/*` (requests, recipients, generate draft, refine, download, upload fallback, view)
  - Email: `lib/email/recommendation-email.ts`, `RESEND_SETUP.md`
  - Models: `models/RecommendationRequest`, `models/Recipient`, `models/RecommendationLetter`

### Scholarships, Programs, Schools
- Browse, filter, manage and import CSVs
  - User pages: `app/(user-portal)/scholarships/*`, `app/(user-portal)/programs/*`
  - Saved scholarships: `app/(user-portal)/saved-scholarships`
  - API: `app/api/scholarships/*`, `app/api/programs/*`, `app/api/schools/*` (+ csv-import, csv-template, list, without-application-forms)
  - Models: `models/Scholarship`, `models/Program`, `models/School`, `models/SavedScholarship`

### Referrals
- Referral codes, usage, and stats
  - User page: `app/(user-portal)/referrals/page.tsx`
  - API: `app/api/referrals/*` (create, use, validate, stats)
  - Models: `models/Referral`

### Squads & Leaderboards (Social/Collaboration)
- Create/join squads by code, goals, progress, leaderboard
  - Free: 1 primary squad only
  - Paid: create additional squads, advanced goals/analytics
  - Referral tokens for inviting new users who sign up
  - Pages: `app/(user-portal)/squads/*`, `app/join/[code]`
  - Components: `components/squads/*`, `components/leaderboards/GlobalLeaderboard.tsx`
  - API: `app/api/squads/*`, `app/api/leaderboard/global`
  - Models: `models/Squad`
  - Services: `lib/services/progressTracker.ts`, `lib/services/activityTracker.ts`, `lib/services/achievementService.ts`

### Task Management
- Personal tasks management UI
  - Page: `app/(user-portal)/task-management/page.tsx`
  - Components: `components/task-management/*`
  - API: `app/api/tasks/route.ts`
  - Model: `models/Task`

### Quiz & Career Discovery
- Quiz flow and results with AI analysis
  - Pages: `app/(user-portal)/quiz/*`
  - API: `app/api/quiz/submit`, `app/api/quiz/results`, `app/api/ai/quiz-analysis`
  - User model fields: `quizResponses`, `quizCompleted`, `careerPreferences`, `aiAnalysis`

### Notifications & Activity
- In-app notifications and activity logging
  - API: `app/api/notifications/route.ts`, `app/api/activity/track`
  - Components: `components/ui/notification-bell.tsx`
  - Models: `models/Notification`, `models/UserActivity`, `models/UserEvent`

### Analytics & Telemetry
- Page views, heartbeat, events, session management, admin analytics and realtime
  - API: `app/api/analytics/*`
  - Admin pages: `app/admin/analytics`, `app/admin/analytics/realtime`
  - Models: `models/PageView`, `models/UserSession`
  - Components: `app/providers/AnalyticsProvider.tsx`, `components/analytics/*`

### Content (CMS-like)
- Content CRUD with analytics, versions, filters
  - User pages: `app/content/*`
  - Admin pages: `app/admin/content/*`
  - API: `app/api/content/*` (filters, id, analytics, versions)
  - Models: `models/Content`

### Media & Storage
- Media upload (S3) and document upload (S3 presigned)
  - Paid plans only (uploads disabled on Free)
  - API: `app/api/media/upload`, `app/api/documents/upload`, `app/api/test-s3-upload`
  - Lib: `lib/s3.ts`

### SEO & Growth
- Sitemap, robots, rich SEO components
  - Files: `app/sitemap.ts`, `app/robots.ts`
  - Components: `components/seo/*`


## Admin Tools & Operations
- Admin authentication and profile
  - Pages: `app/admin-auth/login`, `app/admin/profile`
  - API: `app/api/admin/*` (admins CRUD, reset password, analytics, settings, messages, invites)
  - Model: `models/Admin`
- Data management consoles
  - Schools, Programs, Scholarships, Applications, Templates, Library Docs/Templates, Content
  - Pages under `app/admin/*`
- Active users monitoring and debug sessions
  - Pages: `app/admin/active-users`, `app/admin/debug-sessions`
  - API: `app/api/admin/active-users`, `app/api/admin/debug-sessions`
- CSV import/export utilities for schools/programs/scholarships/templates


## UI Component System
- Extensive shadcn/ui-based components under `components/ui/*` (tables, forms, inputs, dialogs, editors, toasts, charts, etc.)
- Layout and responsive components (`components/ui/responsive-*`, `components/layout/*`)


## Integrations
- Email: Resend (`lib/email/*`, `RESEND_SETUP.md`)
- AWS S3: uploads/downloads
- NextAuth: authentication provider


## Quality, Testing, Demos
- Tests: unit, integration, performance (`tests/*`, `cypress/*`)
- Demos: `app/demo-*` (UI, markdown editor, word count, expandable textarea)
- Scripts: seeders and maintenance in `scripts/*`


## Security & Performance Aids
- Input validation patterns, auth guards in API routes
- Caching and invalidation helpers (`lib/cache-invalidation.ts`)
- Rate-limit readiness mentioned in README


## Feature Gaps or TBD (from docs/backlog)
- Full application package ZIP export (mentioned as idea)
- Some advanced collaboration in-doc co-editing (partially planned in docs)
- Payment/monetization absent in code (to be added per monetization specs)


## Notes for Monetization Mapping
- Resource-heavy features suitable for tokenization: AI generation/refinement/review, recommendation letter generation and emailing, document exports (PDF/Word), large-file storage/transfer, template application at scale, advanced analytics.
- Core value features we likely keep free or lightly gated: basic document creation/editing, saving scholarships, basic applications tracking, joining squads, viewing content.