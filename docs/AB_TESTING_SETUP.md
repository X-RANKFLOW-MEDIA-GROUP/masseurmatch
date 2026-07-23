# A/B Testing Framework - Setup & Integration Guide

## Overview

This guide walks through integrating the A/B Testing framework into MasseurMatch.

## Prerequisites

- Admin user with database access
- Vercel account for cron jobs (if using Vercel deployment)
- Knowledge of Supabase RLS and policies

## Installation Steps

### 1. Run Database Migrations

Apply the three migrations in order:

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase console:
# - 20260722000001_profile_cms_audit_log.sql
# - 20260722000002_profile_cms_ab_tests.sql
# - 20260723000003_ab_test_supporting_tables.sql
```

### 2. Verify Database Tables

After migrations, verify tables are created:

```sql
SELECT tablename FROM pg_tables 
WHERE tablename IN (
  'profile_ab_tests',
  'ab_test_segment_assignments',
  'ab_test_audit_log',
  'ab_test_metrics_snapshots',
  'profile_audit_log'
);
```

All 5 tables should exist.

### 3. Set Environment Variables

Add to `.env.local`:

```bash
# Required for cron jobs
CRON_SECRET=your-secure-cron-secret-here

# Optional: Supabase service role key (already in use)
SUPABASE_SERVICE_ROLE_KEY=your-key-here
```

### 4. Configure Vercel Cron (if using Vercel)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/ab-tests-metrics",
      "schedule": "0 2 * * *"
    }
  ]
}
```

This runs metrics collection daily at 2 AM UTC.

### 5. Test Cron Endpoint Locally

```bash
# Terminal 1: Run dev server
pnpm dev

# Terminal 2: Test the endpoint
curl -H "Authorization: Bearer your-secure-cron-secret-here" \
  http://localhost:3000/api/cron/ab-tests-metrics
```

Expected response:
```json
{
  "success": true,
  "message": "Metrics collection completed successfully",
  "timestamp": "2026-07-23T02:00:00Z"
}
```

### 6. Verify Admin Access

Ensure admin users can access `/admin/ab-tests`:

```bash
# Login as admin
# Navigate to https://masseurmatch.com/admin/ab-tests
# Should see empty test list or existing tests
```

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   └── ab-tests/
│   │       ├── page.tsx                 # Main dashboard
│   │       └── _components/
│   │           ├── ABTestsClient.tsx    # Client wrapper
│   │           ├── ABTestsTable.tsx     # Test table
│   │           ├── CreateTestModal.tsx  # Create modal
│   │           ├── TestResultsModal.tsx # Results view
│   │           └── _lib/
│   │               └── profile-fields.ts# Field options
│   ├── api/
│   │   ├── admin/
│   │   │   └── ab-tests/
│   │   │       ├── create/route.ts      # Create test
│   │   │       ├── list/route.ts        # List tests
│   │   │       ├── finalize/route.ts    # Finalize test
│   │   │       ├── rollout/route.ts     # Rollout test
│   │   │       ├── revert/route.ts      # Revert test
│   │   │       └── delete/route.ts      # Delete test
│   │   └── cron/
│   │       └── ab-tests-metrics/route.ts # Metrics job
│   └── types/
│       └── ab-tests.ts                  # Type definitions
├── lib/
│   └── ab-tests/
│       ├── index.ts                     # Exports
│       ├── metrics-collector.ts         # Metrics logic
│       └── segment-assignment.ts        # Assignment logic
└── supabase/
    └── migrations/
        ├── 20260722000001_...           # Audit log table
        ├── 20260722000002_...           # AB tests table
        └── 20260723000003_...           # Supporting tables
```

## Key Components Explained

### CreateTestModal
- Validates test name uniqueness
- Fetches current field value from sample profile
- Calculates profile count for segment
- Creates test with "running" status
- Triggers segment assignment

### ABTestsTable
- Shows all tests with status badges
- Provides actions based on status
- Results button for completed tests
- Delete button for draft tests

### TestResultsModal
- Shows 3-metric comparison cards
- Line chart of metrics over time
- Statistical significance score
- Recommendation based on results
- Roll out or Revert buttons

### Metrics Collection
- Runs daily via cron
- Fetches running tests
- Samples 100 profiles per segment
- Collects from `profile_analytics` table
- Calculates profile completeness
- Stores results in JSONB

## Integration Points

### Analytics Data Source

The framework expects analytics data in a `profile_analytics` table with:
- `profile_id`: UUID
- `date`: DATE
- `views_count`: INTEGER
- `clicks_count`: INTEGER

If your analytics table has different structure, update:
```typescript
// src/lib/ab-tests/metrics-collector.ts
const { data: testMetricsData } = await adminClient
  .from("your_analytics_table")  // ← Change this
  .select("profile_id, views_count, clicks_count")
```

### Profile Data Structure

The framework uses these profile fields:
- `display_name`, `bio`, `services_text`, `phone`, `email`, `website`, `profile_photo_url`

If your schema differs, update field list in:
```typescript
// src/lib/ab-tests/metrics-collector.ts
.select("id, display_name, bio, services_text, phone, email, website, profile_photo_url")
```

## Customization

### Changing Metrics

To track different metrics:

1. Update `ABTestMetrics` interface in `src/types/ab-tests.ts`
2. Modify collection logic in `src/lib/ab-tests/metrics-collector.ts`
3. Update dashboard in `src/app/admin/ab-tests/_components/TestResultsModal.tsx`

### Changing Segment Percentage Default

```typescript
// src/app/admin/ab-tests/_components/CreateTestModal.tsx
const [segmentPercent, setSegmentPercent] = useState(50); // ← Change 50 to your default
```

### Adjusting Sample Size

```typescript
// src/lib/ab-tests/metrics-collector.ts
const testSegment = assignments.filter(a => a.segment === "test").slice(0, 100); // ← Change 100
```

## Troubleshooting

### Tests Not Appearing in Dashboard
- Check admin user has correct role
- Verify profile_ab_tests table exists
- Check RLS policies allow SELECT for authenticated users

### No Metrics Data
- Verify cron job is running (check Vercel logs)
- Ensure CRON_SECRET is set correctly
- Check profile_analytics table has data
- Verify segment assignments exist for test

### Segment Assignment Fails
- Check ab_test_segment_assignments table is writable
- Verify profiles table has required fields
- Ensure no unique constraint violations

### Create Test API Error
- Verify admin authentication
- Check field_name is valid profile column
- Ensure test name is unique
- Verify Supabase connection

## Performance Considerations

### Large Profile Counts

For >100k profiles, adjust batch size:

```typescript
// src/lib/ab-tests/segment-assignment.ts
const batchSize = 1000; // Increase to 2000 or 5000 if needed
```

### Metrics Collection Timeout

For many tests, run collection in chunks:

```typescript
// src/app/api/cron/ab-tests-metrics/route.ts
// Process in smaller batches
const testsPerRun = 10;
const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");
await runDailyMetricsJob(offset, testsPerRun);
```

### Database Load

Create indexes for faster queries:

```sql
CREATE INDEX idx_ab_test_metrics_test_segment 
ON ab_test_metrics_snapshots(test_id, segment, snapshot_date DESC);
```

## Monitoring

### Dashboard Health Check

Monitor these metrics:
- Number of running tests
- Average metrics collection duration
- Segment assignment success rate
- Rollout/revert operation success

### Log Monitoring

Check logs for:
```
"Collecting metrics for test"
"Assigned X profiles to test, Y to control"
"Test metrics collection started"
```

## Security Considerations

### Data Privacy

- Only admin users can create/view tests
- Audit log tracks all operations
- IP addresses logged for compliance
- Results don't expose individual profile changes

### Rate Limiting

Add rate limiting to API routes:

```typescript
// src/app/api/admin/ab-tests/create/route.ts
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 tests per hour
});

const { success } = await ratelimit.limit("ab-test-create");
if (!success) return new Response("Too many requests", { status: 429 });
```

## Support

For issues or questions:
1. Check test logs in `/admin/ab-tests` results view
2. Review audit trail in `ab_test_audit_log` table
3. Check Vercel logs for cron job issues
4. Review database permissions and RLS policies

## Next Steps

1. Deploy migrations
2. Set environment variables
3. Configure cron job
4. Test creating a sample A/B test
5. Monitor metrics collection
6. Review results after 7+ days
