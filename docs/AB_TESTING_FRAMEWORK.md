# A/B Testing Framework for Profile Fields

A comprehensive A/B testing framework for MasseurMatch that allows admins to experiment with profile field changes and measure their impact on therapist visibility and engagement.

## Overview

The A/B testing framework enables:

- **Creation & Management**: Create, view, and manage A/B tests through an intuitive admin dashboard
- **Segment Assignment**: Automatically assign profiles to test and control groups
- **Metrics Collection**: Daily collection of engagement metrics (profile views, contact clicks, completeness)
- **Results Analysis**: Side-by-side comparison of test vs control performance with statistical significance
- **Rollout & Revert**: Apply winning test values to all profiles or revert failed tests
- **Audit Trail**: Complete history of all A/B test operations and changes

## Architecture

### Database Schema

#### `profile_ab_tests`
Main table storing A/B test configurations and results.

- `id`: UUID (primary key)
- `name`: Test name (unique)
- `field_name`: Profile field being tested
- `test_value`: Value to test
- `control_value`: Current/control value
- `test_segment_percent`: Percentage of profiles in test group (0-100)
- `started_at`: When test started
- `ended_at`: When test completed
- `results`: JSONB with metrics and comparisons
- `status`: draft | running | completed | rolled_back
- `reason`: Why this test was created
- `created_by`: Admin user ID
- `created_at`: Creation timestamp

#### `ab_test_segment_assignments`
Tracks which segment each profile belongs to in each test.

- `id`: UUID (primary key)
- `test_id`: Reference to profile_ab_tests
- `profile_id`: Reference to profiles
- `segment`: "test" or "control"
- `assigned_at`: Assignment timestamp
- Unique constraint on (test_id, profile_id)

#### `ab_test_audit_log`
Complete audit trail of all A/B test operations.

- `id`: UUID (primary key)
- `test_id`: Reference to profile_ab_tests
- `user_id`: Admin user ID
- `action`: created | started | finalized | rolled_out | reverted | deleted
- `details`: JSONB with operation details
- `created_at`: When operation occurred
- `ip_address`: Admin IP address

#### `ab_test_metrics_snapshots`
Daily metrics snapshots for each profile segment.

- `id`: UUID (primary key)
- `test_id`: Reference to profile_ab_tests
- `profile_id`: Reference to profiles
- `segment`: "test" or "control"
- `profile_views`: View count
- `contact_clicks`: Click count
- `profile_completeness`: Completeness score (0-100)
- `snapshot_date`: Date of snapshot
- `created_at`: When snapshot was created

### Frontend Components

#### `/app/admin/ab-tests/page.tsx`
Main A/B tests dashboard showing all tests and their status.

#### `ABTestsClient.tsx`
Client component managing test list, refresh, and modal state.

#### `ABTestsTable.tsx`
Table displaying all A/B tests with columns:
- Name
- Field
- Test Segment %
- Status (draft, running, completed, rolled_back)
- Actions (Results for completed, Delete for draft)

#### `CreateTestModal.tsx`
Modal for creating new A/B tests with fields:
- Test Name
- Field Selection (from profile fields dropdown)
- Current Value (read-only)
- Test Value
- Segment % (slider 0-100)
- Reason (textarea)
- Preview showing estimated profile count

#### `TestResultsModal.tsx`
Results dashboard showing:
- Metrics comparison cards (profile views, contact clicks, completeness)
- Daily metrics line chart
- Test duration and statistical significance
- Recommendation
- Roll Out / Revert buttons

### API Routes

#### `POST /api/admin/ab-tests/create`
Create a new A/B test.

Request:
```json
{
  "name": "Test new bio format",
  "field_name": "bio",
  "test_value": "Experienced massage therapist...",
  "test_segment_percent": 50,
  "reason": "Testing shorter bio descriptions"
}
```

Response:
```json
{
  "success": true,
  "test": {
    "id": "uuid...",
    "status": "running",
    "profiles_in_test": 5000
  }
}
```

#### `GET /api/admin/ab-tests/list`
Get all A/B tests.

Response:
```json
{
  "tests": [...]
}
```

#### `POST /api/admin/ab-tests/finalize`
Finalize a running test and calculate results.

Request:
```json
{
  "test_id": "uuid...",
  "notes": "Optional notes"
}
```

Response includes calculated metrics, comparison, and recommendation.

#### `POST /api/admin/ab-tests/rollout`
Apply test value to all remaining control group profiles.

Request:
```json
{
  "test_id": "uuid...",
  "gradual": false
}
```

#### `POST /api/admin/ab-tests/revert`
Revert test group profiles back to control value.

Request:
```json
{
  "test_id": "uuid..."
}
```

#### `POST /api/admin/ab-tests/delete`
Delete a draft test.

Request:
```json
{
  "test_id": "uuid..."
}
```

### Background Jobs

#### Daily Metrics Collection
Scheduled job that runs daily to collect metrics for all running tests:

```typescript
import { runDailyMetricsJob } from "@/lib/ab-tests";

// Called daily by cron/scheduler
await runDailyMetricsJob();
```

This job:
1. Fetches all running tests
2. Samples 100 profiles from each segment
3. Collects metrics from analytics
4. Calculates profile completeness
5. Updates test results with new metrics

## Usage Guide

### Creating a Test

1. Navigate to `/admin/ab-tests`
2. Click "Create New Test"
3. Fill in test details:
   - Choose descriptive name
   - Select profile field to test
   - Enter test value
   - Adjust segment % (50% is standard A/B test)
   - Provide reason for testing
4. Click "Start Test"

The system will:
- Create the test record with "running" status
- Randomly assign ~50% of profiles to test group
- Assign remaining profiles to control group
- Start collecting daily metrics

### Monitoring Results

Tests auto-collect metrics daily. To view results before finalizing:
1. Open the test
2. Check status - when enough data is collected, finalize

### Finalizing Tests

Once sufficient data is collected (recommend 7+ days):

1. Click the test's "Results" button
2. Review metrics comparison
3. Check statistical significance
4. Read recommendation
5. Choose action:
   - **Roll Out to All**: Apply test value to control group
   - **Revert**: Revert test group back to control value

### Best Practices

1. **Test One Field at a Time**: Isolate variables for clear results
2. **Run for 7+ Days**: Ensure sufficient data collection
3. **Monitor Statistical Significance**: Look for >85% confidence
4. **Document Reasons**: Always explain why you're testing
5. **Check Metrics Trends**: Look at daily trends, not just finals
6. **Consider Seasonality**: Account for day-of-week effects

## Metrics Explained

### Profile Views
Number of times the profile appeared in search results or was directly visited.

### Contact Clicks
Number of times users clicked to contact the therapist (phone/email/messaging).

### Profile Completeness
Score (0-100) based on filled profile fields:
- Display name, bio, services (required)
- Phone, email, photo (required)
- Website, certifications, rates (optional)

### Statistical Significance
Confidence level that results are not due to chance (0-100%).
- >85%: Strong confidence in results
- 70-85%: Moderate confidence
- <70%: Insufficient data, continue test

## Troubleshooting

### No Metrics Appearing
- Verify daily background job is running
- Check analytics tables have data for profile dates
- Ensure profiles have analytics events

### Incorrect Segment Assignments
- All assignments happen at test creation
- Verify ab_test_segment_assignments table has entries
- Check that ~correct percentage are in each segment

### Rollout Failing
- Verify test status is "completed"
- Check that control_value exists in test record
- Ensure field_name is valid profile column

## Configuration

### Metrics Collection Job
Set up cron job to run daily metrics collection:

```bash
# Example using Vercel Cron (vercel.json)
{
  "crons": [
    {
      "path": "/api/cron/ab-tests-metrics",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Create `/app/api/cron/ab-tests-metrics/route.ts`:

```typescript
import { runDailyMetricsJob } from "@/lib/ab-tests";

export async function GET(request: Request) {
  // Verify cron secret
  if (request.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  await runDailyMetricsJob();
  return new Response("OK");
}
```

## Future Enhancements

1. **Multi-variant Tests**: Test more than 2 values (A/B/C)
2. **Gradual Rollouts**: Phase in changes over time
3. **Segment Targeting**: Run tests on specific therapist segments
4. **Power Analysis**: Recommend minimum test duration
5. **Export Reports**: PDF/CSV test results
6. **Scheduled Tests**: Schedule tests to start/stop automatically
7. **Mobile Optimization**: Test mobile-specific changes
8. **Funnel Analysis**: Track full user journey, not just views

## Database Setup

Run migrations to set up required tables:

```bash
supabase migration up
```

Or apply migrations manually:

1. `20260722000001_profile_cms_audit_log.sql` - Audit log table
2. `20260722000002_profile_cms_ab_tests.sql` - AB tests table
3. `20260723000003_ab_test_supporting_tables.sql` - Segment assignments, audit logs, metrics

## API Errors

- `400`: Invalid request body or test state
- `401`: User not authenticated or not admin
- `404`: Test or profile not found
- `500`: Database or server error

All errors return JSON with error message and details.
