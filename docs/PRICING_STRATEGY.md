# Pricing Strategy

Goal: Design pricing and packaging that nudges most buyers to select the middle plan, while keeping an accessible free plan and a compelling high-end option.

## Plans

- Free — Kickstart
  - $0/month
  - Who: new users exploring Eddura
  - Limits: 3 active apps, 100MB storage, 5MB/file, join 1 squad, 2 library clones/mo, 1 recommendation request/mo, 10 AI tokens/mo

- Starter — Essentials (Least Favorite by design)
  - $6/month (anchor low)
  - Who: light users who only need basics beyond free
  - Includes: 10 active apps, 1GB storage, 25MB/file, join 3 squads, 20 library clones/mo, 5 recommendation requests/mo, 200 AI tokens/mo
  - Pay-as-you-go tokens available

- Plus — Recommended (Middle, target choice)
  - $15/month (visibly better value)
  - Who: typical applicant applying to several schools and scholarships
  - Includes: 30 active apps, 5GB storage, 100MB/file, create 1 squad + join 5, 100 library clones/mo, 20 recommendation requests/mo, 1,000 AI tokens/mo
  - Extras: Document export (PDF/Word) included up to 20/month
  - Pay-as-you-go tokens available (discounted bundles)

- Pro — Power (Top tier)
  - $49/month
  - Who: power users, counselors, heavy applications
  - Includes: 100 active apps, 20GB storage, 500MB/file, create 3 squads + join 10, 500 library clones/mo, 100 recommendation requests/mo, 5,000 AI tokens/mo
  - Extras: Document export included up to 200/month, priority support, advanced analytics
  - Team add-on (future): seat-based pricing

## Price Psychology Tactics
- Contrast effect: Starter is priced close to Plus but materially less value
- Center-stage: Plus is highlighted and carries “Most Popular” badge
- Decoy effects: Export inclusions and token grants make Plus stand out
- Rollover and token packs reduce fear of waste, increasing conversion

## Token Packs (Add-on)
- 100 tokens: $5
- 250 tokens: $10
- 1,000 tokens: $30
- 5,000 tokens: $120

## Feature Allocation by Plan
- Applications: 3 / 10 / 30 / 100
- Storage total: 100MB / 1GB / 5GB / 20GB
- File size: 5MB / 25MB / 100MB / 500MB
- Squads: join 1 / join 3 / create 1 + join 5 / create 3 + join 10
- Library clones per month: 2 / 20 / 100 / 500
- Recommendation requests per month: 1 / 5 / 20 / 100
- AI tokens per month: 10 / 200 / 1,000 / 5,000
- Document exports included: 0 / 0 / 20 / 200 (then tokens apply)

## Gating & Metering
- Hard limits trigger upgrade modals
- Token-eligible bursts allow temporary overage without upgrading
- Admin-configurable in `PricingConfig`

## Launch Assets
- Pricing page with comparison table and “Recommended” highlight on Plus
- In-product upsell modals for AI, exports, and limits
- Billing page for subscriptions, token packs, and usage history

## KPIs to Monitor
- Free→Plus conversion rate (primary)
- Token ARPU (add-on revenue)
- Churn by plan
- Overage prompts → token pack conversions
- AI feature adoption vs token consumption