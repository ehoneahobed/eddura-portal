# Monetization & Subscription Specification

## Objectives
- Introduce sustainable pricing with a free plan and three paid tiers
- Add a token economy for AI and resource-intensive operations
- Keep core academic planning usable for free to drive growth

## Personas
- Student applicant (primary)
- Recommender (external, invited)
- Admin (internal content/ops)

## Plans Overview
- Free: Onboarding, core tracking, no AI included (pay-as-you-go tokens allowed)
- Starter (Tier 1)
- Plus (Tier 2) — target most users
- Pro (Tier 3)
- Pay-as-you-go tokens applicable across all plans

## Free vs Premium Feature Matrix

Free (always-on):
- Account, authentication, profile
- Discover: scholarships, programs, schools (browse/search)
- Save scholarships, basic application list (up to 3 active apps)
- Documents: create/edit text docs, basic templates (limited)
- Requirements checklist: basic, manual add, progress tracking
- Squads: 1 primary squad (join/create one primary only), view leaderboard
- Referrals: generate code, basic stats; earn tokens when invited non-users sign up
- Notifications: essential
- Analytics: basic dashboard stats
- Content viewing
- AI: not included (requires tokens)
- File uploads: paid plans only
- Library access: paid plans only
- Recommendations: 1 request total to showcase value (more on paid)


Premium adds (and scales by tier):
- Applications: higher active app limits, interviews tracking, follow-ups
- Templates: apply system templates, create custom templates, bulk apply
- Documents: library cloning, advanced feedback, version history, export to PDF/Word
- Recommendation system: requests, recipient portal, email sends
- AI: generate/refine/review with higher monthly token grants
- Storage: increased total uploads, per-file size, library downloads
- Squads: create/manage squads, goals, analytics
- Analytics: advanced insights
- CSV imports/exports where relevant

## Tokenized Actions (cross-plan)
- AI generate/refine/review/quiz-analysis
- Recommendation draft generation/refinement
- Export document to PDF/Word
- Library document clone
- Large file upload bandwidth increments
- Bulk operations: apply template to many requirements/applications

## User Stories & Acceptance Criteria

1) As a student, I can buy token packs to run AI features when my monthly grant runs out.
- Given I am authenticated, when I navigate to Billing, I can purchase token packs of preset sizes
- After successful payment, my `User.tokens` increases immediately and a receipt is emailed

2) As a student, my monthly plan grants tokens that auto-renew.
- Given I have an active subscription, on cycle reset my `User.tokens` increases by plan grant
- Remaining tokens roll over up to one cycle cap per plan

3) As a student, I see token cost before confirming an action.
- When I trigger AI refine, I’m shown an estimated token cost and current balance
- If I accept and have sufficient tokens, the action proceeds and tokens are deducted
- If insufficient, I’m prompted to buy tokens or upgrade

4) As a student, pay-as-you-go coexists with subscriptions.
- If monthly grant is exhausted, my purchased tokens are used automatically
- If both are insufficient, the action is blocked with an upsell modal

5) As a student, my app/feature limits depend on plan.
- Creating applications beyond plan limit prompts upgrade
- Exceeding storage limits prompts upgrade or tokenized burst expansion

6) As an admin, I can configure token costs and plan limits.
- There’s an admin settings page with editable values and feature flags; changes persist and propagate to the pricing estimator UI

7) As a student, I can simulate costs.
- A pricing estimator shows estimated monthly token usage based on selected features and frequency

## Acceptance Criteria (System)
- Persistent fields for subscription status, plan, token balance, token ledger
- Middleware that checks plan/limits, token availability, and deducts tokens atomically per action
- Admin-editable configuration for token costs and limits
- Idempotent token deductions for retried requests
- Metering with per-action audit logs

## Data Model Additions
- `User`:
  - `plan: 'free' | 'starter' | 'plus' | 'pro'`
  - `planRenewsAt: Date`, `planStartedAt: Date`
  - `monthlyTokenGrant: number`
  - `tokens: number` (already present)
  - `totalTokensEarned`, `totalTokensSpent` (already present)
- `TokenLedger` (new):
  - `userId`, `delta`, `balanceAfter`, `reason`, `metadata`, `createdAt`
- `Subscription` (new):
  - `userId`, `provider`, `status`, `plan`, `currentPeriodStart`, `currentPeriodEnd`, `cancelAtPeriodEnd`, `priceId`, `customerId`
- `PricingConfig` (new, admin editable):
  - `tokenCosts` map by action
  - `planLimits` map by plan

## API/Middleware Additions
- Billing: `POST /api/billing/token-purchase`, `GET /api/billing/usage`, `GET /api/billing/pricing` (public config)
- Webhooks: `/api/webhooks/billing` (Stripe/Paystack/etc.)
- Token guard: server utilities wrapping AI, export, bulk actions
- Admin: `GET/PUT /api/admin/settings` extended for pricing config

## Free vs Paid Limits (Initial Defaults)
- Applications: Free 3, Starter 10, Plus 30, Pro 100
- Storage total: Free N/A (uploads disabled), Starter 1GB, Plus 5GB, Pro 20GB
- Per-file size: Free N/A (uploads disabled), Starter 25MB, Plus 100MB, Pro 500MB
- Squads: Free join 1, Starter join 3, Plus create 1+join 5, Pro create 3+join 10
- Library clone/month: Free 0 (access disabled), Starter 20, Plus 100, Pro 500
- Recommendation requests/month: Free 1, Starter 5, Plus 20, Pro 100
- AI monthly tokens grant: Free 0, Starter 150, Plus 700, Pro 2,000

## Token Costs (Initial Defaults)
- AI generate (short, up to 300 words): 2 tokens
- AI refine (short): 1 token
- AI refine with feedback (medium): 3 tokens
- AI review application (per section): 5 tokens
- Quiz analysis: 5 tokens
- Recommendation draft generate: 10 tokens
- Recommendation refine: 3 tokens
- Export to PDF: 2 tokens/document
- Export to Word: 2 tokens/document
- Library clone: 1 token/document
- Large upload bandwidth increment (per extra 100MB beyond plan): 2 tokens (expiring monthly)
- Apply template to application (bulk > 10 requirements): 2 tokens/application

## Pricing Psychology & Tiering (summary)
- Starter is minimally attractive (anchoring low but visibly underpowered)
- Plus shows the best value per $ and fits most users’ needs — highlighted as Recommended
- Pro is premium with clear power-user value (high caps and tokens)

## Rollout Plan
- Phase 1: Read-only pricing page and estimator; instrument usage metrics
- Phase 2: Token ledger, token guard, deduct for AI endpoints & exports
- Phase 3: Subscriptions + webhooks; monthly grants & rollover
- Phase 4: In-product upsell modals and admin pricing console