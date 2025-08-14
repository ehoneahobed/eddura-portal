# Pricing Strategy

Goal: Design pricing and packaging that nudges most buyers to select the middle plan, while keeping an accessible free plan and a compelling high-end option.

## Plans

- Free — Kickstart
  - $0/month
  - Who: new users exploring Eddura
  - Limits: 3 active apps, uploads disabled, library access disabled, 1 primary squad, 1 recommendation request (total), 0 AI tokens

- Starter — Essentials (Least Favorite by design)
  - $7/month (anchor low)
  - Who: light users who only need basics beyond free
  - Includes: 10 active apps, uploads enabled (1GB, 25MB/file), library access (20 clones/mo), join 3 squads, 5 recommendation requests/mo, 150 AI tokens/mo
  - Pay-as-you-go tokens available

- Plus — Recommended (Middle, target choice)
  - $12/month (visibly better value)
  - Who: typical applicant applying to several schools and scholarships
  - Includes: 30 active apps, uploads (5GB, 100MB/file), create 1 squad + join 5, library access (100 clones/mo), 20 recommendation requests/mo, 700 AI tokens/mo
  - Extras: Document export (PDF/Word) included up to 20/month
  - Pay-as-you-go tokens available (discounted bundles)

- Pro — Power (Top tier)
  - $20/month (cap highest price)
  - Who: power users, counselors, heavy applications
  - Includes: 100 active apps, uploads (20GB, 500MB/file), create 3 squads + join 10, library access (500 clones/mo), 100 recommendation requests/mo, 2,000 AI tokens/mo
  - Extras: Document export included up to 200/month, priority support, advanced analytics
  - Future: B2B plan for coaches/counselors with multi-seat support (separate pricing)

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
- Storage total: N/A (Free) / 1GB / 5GB / 20GB
- File size: N/A (Free) / 25MB / 100MB / 500MB
- Squads: 1 primary / join 3 / create 1 + join 5 / create 3 + join 10
- Library clones per month: 0 / 20 / 100 / 500
- Recommendation requests per month: 1 / 5 / 20 / 100
- AI tokens per month: 0 / 150 / 700 / 2,000
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