# Token Economy Design

## Goals
- Predictable and fair costs for resource-heavy features
- Simple mental model: 1 token ~ one lightweight AI or export action
- Cross-plan usability: subscriptions grant monthly tokens; token packs add-on any time

## Token Sources
- Monthly grant by plan
- One-time purchases (packs)
- Referral/achievement rewards (configurable)

## Token Sinks (Actions and Unit Costs)
- AI generate (short prompt, <=300 words): 2
- AI refine (<=300 words): 1
- AI refine with feedback (<=800 words): 3
- AI review application (per section up to 1,000 words): 5
- Quiz AI analysis: 5
- Recommendation draft generation: 10
- Recommendation refine: 3
- Export PDF: 2 per document
- Export Word: 2 per document
- Clone library document: 1 per clone
- Large upload bandwidth increment: 2 per extra 100MB within cycle
- Bulk template apply (>10 reqs): 2 per target application

Notes:
- For longer AI tasks, scale linearly by 1 token per additional 300 words (rounded up)
- Rate guard prevents accidental drains; preview shows estimated cost range

## Packs and Pricing (example)
- 100 tokens: $5
- 250 tokens: $10
- 1,000 tokens: $30
- 5,000 tokens: $120

Discounts scale with size; exact prices configurable in admin.

## Rollover Policy
- Monthly grant rollover up to the size of the monthly grant (cap at 1x grant)
- Purchased tokens do not expire

## Deduction Rules
- Always spend grant tokens first; then purchased tokens
- Atomic deduction with ledger record
- Idempotency keys for retries (per action requestId)

## Developer Integration
- Server utility `withTokens(userId, cost, reason, metadata, fn)` ensures:
  - Fetch and lock balances
  - Validate sufficient tokens
  - Deduct and append ledger entry
  - Execute `fn`
  - On failure, optionally refund via compensating ledger entry
- Apply to:
  - `app/api/ai/*`
  - Document exports `app/api/documents/[id]/download/*`
  - Library clone path
  - Bulk template apply routes

## Telemetry
- Emit `UserEvent` on deduction with reason and metadata
- Surface in `Billing Usage` UI and admin analytics

## Abuse Prevention
- Per-user daily token spend soft cap (plan-configurable)
- Cooldowns on repetitive actions
- Email alerts on anomalous spikes

## Configuration Surface
- `PricingConfig.tokenCosts`: per-action defaults and scaling factors
- `PricingConfig.planLimits`: caps and monthly grants
- Feature flags to stage rollout per route