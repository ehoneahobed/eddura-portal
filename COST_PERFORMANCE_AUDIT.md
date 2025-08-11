### Cost and Performance Deep-Dive

This document summarizes a full audit of the app’s hot paths and why resources are spiking on Vercel (Edge Requests, Function Invocations, CPU) and MongoDB Atlas (connection pressure). It includes concrete evidence with file/line citations and a prioritized plan to cut costs while improving UX.

---

## TL;DR

- The client-side analytics system is extremely chatty:
  - Sends a heartbeat every 30s for every active tab.
  - Logs a page view on load and again on unload.
  - Tracks every click and form submit as a separate POST.
- Multiple UI polling loops run every 30s (notifications, admin active users, real-time analytics).
- Each client request triggers a serverless function that opens a MongoDB connection. With high request volume, this fans out to many concurrent connections in Atlas (especially on M0/M2 tiers).
- Anonymous session reuse on the server is incorrect and causes many users to “share” one sessionId, amplifying write contention and noise.
- Using both Mongoose and a separate MongoClient (NextAuth adapter) multiplies the number of pools and connections.

Immediate savings: Gate analytics behind a feature flag + reduce/aggregate events + increase polling intervals. Expect a 70–90% reduction in function invocations and DB writes under normal traffic.

---

## Evidence

### 1) Client analytics generates very high request volume

- Heartbeat every 30s per tab, indefinitely:

```1:140:/workspace/lib/analytics.ts
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isPageActive) {
        this.sendHeartbeat();
      }
    }, 30000); // Send heartbeat every 30 seconds
  }
```

- Page view logged on load and again on unload:

```49:86:/workspace/lib/analytics.ts
  // Track page load performance -> then send initial page view in initializeAnalytics()
```

```128:139:/workspace/lib/analytics.ts
  private trackPageExit() {
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Math.round((Date.now() - this.currentPageStartTime) / 1000);
      this.updatePageView({ timeOnPage, isBounce: true });
      // Sends another page view
      this.sendPageView();
    });
  }
```

- Every click anywhere on the page posts a user event:

```141:160:/workspace/lib/analytics.ts
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    ...
    this.trackEvent({ eventType: 'click', eventCategory: 'interaction', eventName: 'page_click', ... });
  });
```

- All analytics are globally enabled for every page via the root layout:

```99:107:/workspace/app/layout.tsx
  <SWRProvider>
    <AnalyticsProvider>
      {children}
      <Toaster />
    </AnalyticsProvider>
  </SWRProvider>
```

- Server routes persist all analytics to MongoDB:
  - Session creation: `POST /api/analytics/session`
  - Heartbeat: `POST /api/analytics/heartbeat`
  - Page view: `POST /api/analytics/pageview`
  - Event: `POST /api/analytics/event`

```10:46:/workspace/app/api/analytics/session/route.ts
await connectDB();
// Creates a new UserSession document
```

```6:23:/workspace/app/api/analytics/heartbeat/route.ts
await connectDB();
await UserSession.findOneAndUpdate({ sessionId }, { updatedAt: new Date(), isActive: true });
```

```7:53:/workspace/app/api/analytics/pageview/route.ts
await connectDB();
const pageView = new PageView(pageViewData);
await pageView.save();
```

```7:49:/workspace/app/api/analytics/event/route.ts
await connectDB();
const userEvent = new UserEvent(eventData);
await userEvent.save();
```

Net effect: A single engaged user can generate dozens to hundreds of writes per session. With bots, multiple tabs, and real-time admin views, request volume explodes.

### 2) Polling loops add recurring traffic

- Notifications UI polls every 30s:

```161:168:/workspace/components/ui/notification-bell.tsx
if (session) {
  fetchNotifications();
  const interval = setInterval(fetchNotifications, 30000);
  return () => clearInterval(interval);
}
```

- Admin active users hook polls every 30s:

```83:90:/workspace/hooks/use-active-users.ts
useEffect(() => {
  fetchActiveUsers();
  const interval = setInterval(fetchActiveUsers, 30000);
  return () => clearInterval(interval);
}, [minutes]);
```

- Admin analytics dashboard refreshes every 30s in “today” mode:

```110:116:/workspace/components/analytics/UserAnalyticsDashboard.tsx
if (timeRange === 'today') {
  setIsRealTime(true);
  interval = setInterval(() => { fetchUserAnalyticsSilently(); }, 30000);
}
```

Each of these endpoints hits MongoDB and runs queries. If a few admins keep the dashboard open, the DB sees constant load.

### 3) Anonymous session reuse is logically incorrect

- Server “reuse” logic only checks for a recent active session by `userId` or `adminId`, which are `null` for anonymous visitors. That makes it likely to reuse one anonymous session across many users within a 30-minute window, creating contention and noisy analytics.

```26:46:/workspace/app/api/analytics/session/route.ts
const existingSession = await UserSession.findOne({
  $or: [ { userId: userId || null }, { adminId: adminId || null } ],
  isActive: true,
  updatedAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }
});
```

### 4) Many DB connections from serverless

- Mongoose connector (used by most API routes):

```21:61:/workspace/lib/mongodb.ts
let cached = global.mongoose || { conn: null, promise: null };
...
cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
```

- Separate MongoClient for NextAuth adapter:

```1:13:/workspace/lib/mongodb-client.ts
import { MongoClient } from 'mongodb';
...
export default clientPromise; // distinct connection pool
```

With high function invocation rates, Vercel scales instances and each can open its own pools. On M0 this quickly approaches connection limits.

---

## Impact Summary

- Excessive Edge Requests and Function Invocations primarily from analytics + polling.
- Elevated MongoDB connections and writes from persistent logging and multiple connection pools.
- Elevated CPU from heavy serverless churn and aggregation queries for admin analytics.

---

## Recommended Fixes (Prioritized)

### A. Rapid cost reduction (ship today)

1) Feature flag analytics in production and default to OFF
   - Add `NEXT_PUBLIC_ANALYTICS_ENABLED=false` and hard gate initialization and all network calls.
   - Only enable for specific environments or sampled traffic.

2) Reduce polling intervals and scope
   - Notifications: from 30s -> 2–5 minutes; only poll when the popover is open or on page focus.
   - Admin active users/real-time analytics: update only when the admin analytics page is visible, and increase to 60–120s.

3) Increase sampling and batch events
   - Track only key interactions; remove global click listener or throttle to max N events per page (e.g., 10).
   - Batch events in-memory and flush on a 10–30s cadence or on unload using `navigator.sendBeacon`.

4) Disable heartbeats or extend to 3–5 minutes
   - If session “activeness” isn’t critical, remove heartbeats. Otherwise, 180–300s is adequate.

5) Cap MongoDB pool sizes
   - Add `maxPoolSize=10` to both Mongoose and MongoClient URIs to avoid runaway connections on scale-out.

6) Temporary protection via rate limiting
   - Add a lightweight IP-based rate limiter on `/api/analytics/*` endpoints (e.g., 60 req/min per IP) to mitigate bots.

### B. Correctness and stability

7) Fix anonymous session reuse
   - The server must prefer a client-provided `sessionId` (from `sessionStorage`) and never “reuse” by matching `userId=null`.
   - Fallback: always create a new session for anonymous users when no valid `sessionId` is supplied.

8) Consolidate DB clients
   - Prefer a single driver (Mongoose) where feasible, or ensure both pools are small and shared.

### C. UX-preserving optimizations

9) Fetch-on-focus instead of polling for notifications
   - Use Page Visibility API to fetch when the page regains focus.
   - Optionally add server-sent events/WebSocket later for push.

10) Cache non-sensitive GETs
   - For lists/dashboards that don’t require real-time, enable caching/revalidation.

---

## Proposed Implementation Details

### 1) Gate analytics with an env flag and sampling

- Add a simple guard in the provider and client lib:

```1:20:/workspace/components/AnalyticsProvider.tsx
const enabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
if (!enabled) return <>{children}</>;
```

```341:355:/workspace/lib/analytics.ts
if (typeof window !== 'undefined') {
  const enabled = (window as any).NEXT_PUBLIC_ANALYTICS_ENABLED === 'true' ||
                  process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
  if (enabled) { /* init */ }
}
```

- Add simple sampling, e.g., 20% of traffic:

```pseudo
const SAMPLE_RATE = Number(process.env.NEXT_PUBLIC_ANALYTICS_SAMPLE || 0.2);
if (Math.random() > SAMPLE_RATE) return; // skip analytics init
```

### 2) Reduce and batch events

- Remove the global click listener or cap events per page and batch using an in-memory queue that flushes every 15–30s or on `beforeunload` via `sendBeacon`.
- Replace heartbeat with a 5-minute interval or remove entirely.

### 3) Fix anonymous session creation

- Pass the client-generated `sessionId` in the `POST /api/analytics/session` body and require exact match for reuse.
- On the server, do not reuse by `{ userId: null }` criteria; only reuse when the provided `sessionId` exists and is recent.

```24:46:/workspace/app/api/analytics/session/route.ts
// Replace existing findOne reuse logic with lookup by client sessionId if provided
```

### 4) Lower polling pressure

- Notifications: only poll when the popover is open; else fetch on demand or on window focus.
- Admin analytics: gate the 30s interval behind the active tab and page visibility; prefer 60–120s.

### 5) Cap MongoDB pool size

- Update `MONGODB_URI` to include `maxPoolSize=10&retryWrites=true&w=majority`.
- Consider enabling `serverSelectionTimeoutMS` and `socketTimeoutMS` to fail fast under load.

### 6) Minimal rate limiting

- Add a small in-memory or Upstash-based limiter on `/api/analytics/*` routes to blunt abusive traffic/bots.

---

## Expected Cost Impact

- Disabling analytics by default: up to 70–90% fewer function invocations and DB writes.
- Increasing intervals and fetch-on-focus: ~2–5x fewer requests for notifications and admin dashboards.
- Pool size caps: prevent Atlas connection exhaustion during traffic spikes.
- Session reuse fix: eliminates cross-user session contention and reduces confusing writes.

---

## Follow-up Work (Optional but Valuable)

- Move analytics to a write-optimized store (e.g., ClickHouse, BigQuery, or a queue like Kafka/Upstash/Kinesis) and backfill to Mongo in batches.
- Replace polling with server push (SSE/WebSockets) for admin-only real-time views.
- Add bot filtering and respect “Do Not Track”.

---

## Appendix: Additional Notes

- `vercel.json` currently defines a single cron for recommendation reminders. That’s fine and authenticated:

```1:8:/workspace/vercel.json
{
  "crons": [{ "path": "/api/cron/send-recommendation-reminders", "schedule": "0 9 * * *" }]
}
```

- Auth uses a separate MongoClient pool via the NextAuth adapter. Keeping `maxPoolSize` small here is important:

```1:33:/workspace/lib/mongodb-client.ts
client = new MongoClient(uri, options);
clientPromise = client.connect();
```

- Most API routes call `connectDB()` which caches per runtime instance, but high traffic creates many instances. Reducing request volume is the most impactful fix.

---

## Action Checklist

- [ ] Add `NEXT_PUBLIC_ANALYTICS_ENABLED=false` and ship.
- [ ] Increase polling intervals and fetch-on-focus for notifications and admin analytics.
- [ ] Remove/limit global click tracking; add batching + `sendBeacon`.
- [ ] Heartbeat to 180–300s or disable.
- [ ] Fix anonymous session reuse to rely on client-provided `sessionId` only.
- [ ] Add `maxPoolSize=10` to the Mongo URI(s).
- [ ] Add rate limiting on `/api/analytics/*`.
- [ ] Monitor Vercel analytics and MongoDB connection counts after deploy.

---

## Implemented Changes in This Commit

- Hard gate + sampling for analytics in `components/AnalyticsProvider.tsx` (env: `NEXT_PUBLIC_ANALYTICS_ENABLED`, `NEXT_PUBLIC_ANALYTICS_SAMPLE`).
- Converted analytics to batched writes with `sendBeacon` fallback in `lib/analytics.ts` and added `/api/analytics/batch` endpoint with bulkWrite.
- Heartbeat reduced to every 5 minutes and queued.
- Throttled click tracking (max 10 per page).
- Fixed anonymous session reuse and now prefer client-provided `sessionId` in `app/api/analytics/session/route.ts`.
- Added lightweight in-memory rate limiter `lib/rate-limit.ts` and applied to analytics endpoints.
- Reduced admin-side polling: notifications and active users now fetch on focus/visibility and every 120s; real-time dashboard refreshes every 60s only when visible.
- Capped MongoDB pool sizes and added fast timeouts in `lib/mongodb.ts` and pooled `lib/mongodb-client.ts` globally.
- Added server-side feature flag `ANALYTICS_ENABLED` and DNT/bot filtering in `api/analytics/batch`.
- Forwarded legacy single-event endpoints (`/api/analytics/event|pageview|heartbeat`) to the batch pipeline for compatibility.
- Added SSE endpoint `api/admin/analytics/realtime/stream` and migrated the admin dashboard to consume it.

### How to enable analytics

- Add to environment: `NEXT_PUBLIC_ANALYTICS_ENABLED=true` and optionally `NEXT_PUBLIC_ANALYTICS_SAMPLE=0.25` (25% sampling). Default behavior with no env is disabled.