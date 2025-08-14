# Token Cost Table

| Feature / Action | Unit Cost (tokens) | Notes |
|---|---:|---|
| AI Generate (<=300 words) | 2 | +1 token per additional 300 words (rounded up) |
| AI Refine (<=300 words) | 1 | +1 per additional 300 words |
| AI Refine with Feedback (<=800 words) | 3 | +1 per additional 300 words beyond 800 |
| AI Review Application (per section up to 1,000 words) | 5 | Scale +1 per additional 300 words |
| Quiz AI Analysis | 5 | Fixed per submission |
| Recommendation Draft Generation | 10 | Initial draft per recipient/request |
| Recommendation Refine | 3 | Per refinement action |
| Export to PDF | 2 | Per document exported |
| Export to Word | 2 | Per document exported |
| Clone Library Document | 1 | Per cloned document |
| Large Upload Bandwidth | 2 | Per extra 100MB in a billing cycle |
| Bulk Template Apply | 2 | Per target application (>10 reqs) |
| Recommendation Email Send | 1 | Per email sent via platform |

Guidelines:
- Always show an estimate before deduction and require user confirmation.
- Deduct grant tokens first, then purchased tokens.
- Enforce daily soft caps (plan-dependent) and cooldowns to prevent abuse.