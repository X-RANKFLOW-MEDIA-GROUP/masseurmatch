# Profile Migration — End-to-End Testing Guide

## Pre-Testing Checklist

- [ ] Database migration applied to Supabase (run the SQL from `supabase/migrations/20250710_add_imported_reviews.sql`)
- [ ] Supabase Edge Function deployed (`supabase/functions/process-migrations/index.ts`)
- [ ] Dev server running locally (`pnpm run dev`)
- [ ] Test admin account created with `admin` role in Supabase

## Test Scenarios

### Test 1: Signup Flow with Migration Page

**Objective**: Verify migration page appears in signup flow and URLs are collected

**Steps**:
1. Navigate to http://localhost:5000/signup
2. Complete signup steps: Start → Plan → Account → Verify → Profile
3. At Profile step, click "Continue to Review"
4. **Expected**: Should land on Migration page (`/signup/migration`)
5. Verify:
   - [ ] Migration page displays title "Bring Your Reviews & Reputation"
   - [ ] Benefits cards show (Keep Your Reviews, We Handle It, You Get Notified)
   - [ ] Platform selector shows all 4 platforms (RubMaps, 4Corners, NuruMap, Other)
   - [ ] Disclaimers section is visible with all 8 sections
   - [ ] Skip button works and goes to review page

**URL Validation**:
1. Select "RubMaps" platform
2. Enter invalid URL: `invalid-url` → Should show error "URL must start with http:// or https://"
3. Enter valid URL: `https://rubmaps.com/provider/test123`
4. Click "+" button → Should validate and add to list
5. Verify:
   - [ ] URL appears in "Profiles to migrate" section with checkmark
   - [ ] URL is validated before adding
   - [ ] Can remove URLs with trash icon
   - [ ] Can add multiple URLs from different platforms

**Submission**:
1. Add 1-2 test URLs
2. Click "Continue to Review"
3. Verify:
   - [ ] No errors shown
   - [ ] Router navigates to `/signup/review`
   - [ ] Confirmation email sent to test email address

### Test 2: Database Storage (Manual Database Check)

**Objective**: Verify migration request is stored in database correctly

**Steps**:
1. After Test 1, open Supabase SQL Editor
2. Run query:
   ```sql
   SELECT * FROM profile_migrations 
   ORDER BY created_at DESC LIMIT 1;
   ```
3. Verify:
   - [ ] `email` matches test therapist email
   - [ ] `platform` = "rubmaps" (or selected platform)
   - [ ] `source_url` = URL entered
   - [ ] `status` = "pending"
   - [ ] `created_at` timestamp is recent
   - [ ] `profile_id` is NULL (not linked yet since account not fully created)

### Test 3: Background Job Processing

**Objective**: Verify Edge Function processes pending migrations

**Prerequisites**: Complete Test 1 first

**Steps**:
1. Trigger Edge Function manually:
   ```bash
   curl -X POST http://localhost:54321/functions/v1/process-migrations \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d {}
   ```

2. Check Supabase logs for function execution
3. Query database:
   ```sql
   SELECT * FROM profile_migrations WHERE status = 'completed';
   SELECT * FROM imported_reviews LIMIT 5;
   ```

4. Verify:
   - [ ] Migration status changed to "completed"
   - [ ] `imported_review_count` updated (or 0 if no reviews found)
   - [ ] `imported_reviews` table has entries if scraping was successful
   - [ ] All imported reviews have `is_public = false` initially

### Test 4: Admin Review Interface

**Objective**: Verify admin can review and approve migrations

**Prerequisites**: Complete Tests 1-3, and have admin account

**Steps**:
1. Login as admin
2. Navigate to http://localhost:5000/admin/migrations
3. Verify:
   - [ ] Admin page loads without errors
   - [ ] Lists pending migrations from Test 1
   - [ ] Shows therapist email, platform, and review count
   - [ ] Badge shows "Pending" status

4. Click on a migration card to expand it
5. Verify:
   - [ ] Shows all imported reviews (if any)
   - [ ] Each review displays: reviewer name, rating (stars), text, date
   - [ ] Check/X buttons to approve/reject each review
   - [ ] Text field for admin notes on each review
   - [ ] "Approve Migration" button at bottom

6. Test approval workflow:
   - [ ] Click checkmark to approve a review (should highlight green)
   - [ ] Click X to reject a review (should highlight red)
   - [ ] Add admin notes
   - [ ] Click "Approve Migration" button
   - [ ] Should show loading state
   - [ ] Should return to migration list

### Test 5: API Review Endpoint

**Objective**: Verify `/api/migrate/review` endpoint works correctly

**Prerequisites**: Have migration ID from Test 1 and admin auth token

**Steps**:
1. Call API endpoint:
   ```bash
   curl -X PUT http://localhost:5000/api/migrate/review \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d {
       "migrationId": "MIGRATION_UUID",
       "reviews": [
         {
           "reviewId": "REVIEW_UUID",
           "approved": true,
           "notes": "Approved - authentic source"
         }
       ]
     }
   ```

2. Check response:
   - [ ] HTTP 200 status
   - [ ] Response message shows "X reviews approved and published"
   - [ ] No errors in logs

3. Verify database changes:
   ```sql
   SELECT * FROM imported_reviews 
   WHERE migration_id = 'MIGRATION_UUID';
   ```
   - [ ] `is_public` = true for approved reviews
   - [ ] `reviewed_at` timestamp populated
   - [ ] `review_notes` shows admin comments
   - [ ] `reviewed_by` shows admin user_id

### Test 6: Public Display

**Objective**: Verify approved reviews appear on public profile

**Prerequisites**: Complete Test 4-5

**Steps**:
1. Get therapist profile URL from test account
2. Navigate to therapist's public profile (e.g., `/therapist/[slug]`)
3. Scroll to reviews section
4. Verify:
   - [ ] Approved reviews are displayed
   - [ ] Each review shows: rating (stars), text, reviewer name, date
   - [ ] Shows "Imported from [Platform]" badge with source link
   - [ ] Hidden/pending reviews do NOT appear
   - [ ] Reviews are ordered by date (most recent first)

### Test 7: Therapist Dashboard

**Objective**: Verify therapist can see their migrations in dashboard

**Prerequisites**: Complete Test 1

**Steps**:
1. Login as therapist from Test 1
2. Navigate to dashboard
3. Verify:
   - [ ] Migration status visible (Pending → In Progress → Completed)
   - [ ] Shows "X reviews imported"
   - [ ] Shows "Awaiting admin review" status
   - [ ] Can view submitted URLs
   - [ ] Can see pending reviews awaiting approval

### Test 8: Email Notifications

**Objective**: Verify confirmation and completion emails are sent

**Prerequisites**: Complete Tests 1 and 4-5

**Steps**:

**Confirmation Email (sent immediately)**:
1. After Test 1 submission, check test email inbox
2. Verify:
   - [ ] Subject: "We're Importing Your Profile — Sit Back & Relax"
   - [ ] Contains therapist name
   - [ ] Lists platform and URL
   - [ ] Mentions 24-48 hour timeline
   - [ ] Support contact information visible
   - [ ] Links work and point to correct domains

**Completion Email (sent after admin approval)**:
1. After Test 4-5 approval, check test email inbox
2. Verify:
   - [ ] Subject: "Your Profile Migration is Complete — Reviews Now Live!"
   - [ ] Shows count of imported reviews
   - [ ] Contains dashboard link
   - [ ] Shows social proof ("3x more bookings")
   - [ ] Mentions next steps (add photos, set availability)
   - [ ] All links are clickable and branded

### Test 9: Error Handling

**Objective**: Verify system handles errors gracefully

**Test Cases**:

**Invalid URLs**:
1. Enter URL that doesn't exist: `https://rubmaps.com/provider/nonexistent123`
2. Should show validation error (after timeout)
3. URL should not be added to list

**Failed Migration**:
1. Use test URL that will fail scraping
2. Trigger Edge Function
3. Query database:
   ```sql
   SELECT * FROM profile_migrations WHERE status = 'failed';
   ```
4. Verify:
   - [ ] `migration_notes` contains error message
   - [ ] Therapist can retry migration
   - [ ] Admin is notified

**Database Issues**:
1. Temporarily disable database access in Edge Function
2. Trigger function
3. Verify:
   - [ ] Function returns 500 error
   - [ ] Error is logged with details
   - [ ] Migration status remains "pending" or "in_progress"

### Test 10: RLS Policies

**Objective**: Verify Row Level Security policies work correctly

**Steps**:

**Therapist Isolation**:
1. Login as therapist A
2. Query (via API or direct if possible):
   ```sql
   SELECT * FROM profile_migrations;
   ```
3. Verify: Only sees their own migration records

**Admin Access**:
1. Login as admin
2. Should see all migrations and all imported reviews

**Public Access**:
1. Anonymous user queries:
   ```sql
   SELECT * FROM imported_reviews;
   ```
2. Should only see reviews with `is_public = true`
3. Should not see admin notes or reviewer information details

## Automated Test Scenarios

Create test scripts in `/tests/profile-migration/`:

```bash
tests/profile-migration/
├── e2e-signup-flow.test.ts
├── api-validation.test.ts
├── database-storage.test.ts
├── admin-approval.test.ts
├── public-display.test.ts
└── email-notifications.test.ts
```

## Performance Benchmarks

- URL validation response time: < 2 seconds
- Migration submission: < 1 second
- Edge Function processing (10 reviews): < 30 seconds
- Admin page load: < 2 seconds
- Public profile display (with 20 reviews): < 3 seconds

## Browser Compatibility

Test on:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Accessibility Testing

- [ ] Tab navigation through all form fields
- [ ] Screen reader reads all content correctly
- [ ] Sufficient color contrast for all text
- [ ] Focus indicators visible on all interactive elements
- [ ] Forms have proper labels

## Sign-Off Checklist

- [ ] All 10 test scenarios passed
- [ ] No console errors or warnings
- [ ] Email notifications received and formatted correctly
- [ ] Database integrity verified (no orphaned records)
- [ ] RLS policies enforced correctly
- [ ] Performance within benchmarks
- [ ] Cross-browser compatibility confirmed
- [ ] Accessibility standards met
- [ ] Edge cases handled (network errors, timeouts, etc.)

## Known Limitations

1. **Scraping**: Mock implementation returns empty array. Replace `scrapeReviews()` in Edge Function with actual platform-specific scrapers
2. **Admin Dashboard**: Uses mock data. Connect to real API endpoints once backend is ready
3. **Email Templates**: Using inline HTML. Consider using template service in production
4. **Timeline**: Edge Function runs manually. Set up Supabase cron job for automatic processing

## Rollback Plan

If issues arise:
1. Set migration status to "paused" to stop processing
2. Delete `imported_reviews` table entries if data is corrupted
3. Keep `profile_migrations` records for audit trail
4. Notify affected therapists via email
5. Restore from backup if needed
