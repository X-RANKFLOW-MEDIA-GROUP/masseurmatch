# Profile Migration — Post-Verification Workflow

## Overview

This document describes the complete lifecycle of migrated profile data from submission through public display on MasseurMatch.

## Data Storage Architecture

### 1. **profile_migrations** Table
**Purpose**: Tracks migration requests and overall status
**Contains**:
- `id`: Unique migration request ID
- `email`: Therapist's email (pre-verification)
- `profile_id`: Links to therapist's profile (post-verification)
- `platform`: Source platform (rubmaps, 4corners, nuru, custom)
- `source_url`: URL of therapist's profile on source platform
- `status`: pending → in_progress → completed → failed
- `imported_review_count`: Number of reviews imported
- `is_verified`: Admin approval status (false initially)
- `verified_at`: When admin reviewed and approved
- `verified_by`: Admin user_id who reviewed
- `created_at` / `updated_at`: Timestamps

**RLS Policy**: Only admins can manage; therapists can view their own migrations

### 2. **imported_reviews** Table
**Purpose**: Stores individual migrated reviews from all platforms
**Contains**:
- `id`: Unique review ID
- `profile_id`: Links to therapist's profile
- `migration_id`: Links to the migration request
- `source_platform`: Where review came from (rubmaps, etc.)
- `source_url`: Direct URL to review on source platform (for attribution)
- `reviewer_name`: Name as shown on source platform
- `reviewer_anonymized`: Flag if reviewer requested privacy
- `rating`: Numeric rating (1-5)
- `review_text`: Full review content
- `review_date`: When review was posted on source platform
- `is_public`: **Determines visibility** (false = hidden, true = published)
- `reviewed_by`: Admin user_id who approved
- `reviewed_at`: When admin reviewed
- `review_notes`: Admin comments during review
- `created_at` / `updated_at`: Timestamps

**RLS Policies**:
- Therapists: Can view their own imported reviews (both public and private)
- Public: Can view only `is_public = true` reviews on public profiles
- Admins: Full access to manage and review

## Complete Workflow

### Phase 1: Signup & Submission (0 hours)
```
1. Therapist navigates to /signup/migration
2. Selects platform and enters profile URL
3. URL validation checks:
   - Format matches platform pattern
   - URL is reachable (HEAD request)
   - Returns validation errors if invalid
4. Therapist adds one or more URLs and submits
5. /api/migrate/initiate endpoint called:
   - Creates entries in profile_migrations table (status: "pending")
   - Stores with therapist's email (no profile_id yet)
   - Sends confirmation email
   - Returns success response
6. Therapist continues signup flow (review → verification)
```

**Database State After Submission**:
```sql
-- profile_migrations table
id: uuid,
email: "therapist@example.com",
profile_id: NULL,  -- Not yet created
platform: "rubmaps",
source_url: "https://rubmaps.com/provider/123",
status: "pending",  -- Waiting for processing
imported_review_count: 0,
is_verified: FALSE,  -- Not yet reviewed by admin
verified_at: NULL,
verified_by: NULL,
created_at: NOW()
```

### Phase 2: Account Completion & Profile Creation (0-24 hours)
```
1. Therapist completes signup:
   - Creates auth account
   - Fills in profile details
   - Completes identity verification
   - Creates therapist profile in database
2. After account creation:
   - Therapist's email is now linked to profile_id
   - Migration system matches pending migrations to new profile_id
   - status changes to "in_progress"
   - Background job is triggered
```

**Database State During Processing**:
```sql
-- profile_migrations table (updated)
id: uuid,
email: "therapist@example.com",
profile_id: "therapist-profile-uuid",  -- Now linked!
platform: "rubmaps",
source_url: "https://rubmaps.com/provider/123",
status: "in_progress",  -- Background job running
imported_review_count: 0,  -- Updates as reviews are scraped
is_verified: FALSE,  -- Still waiting for admin review
```

### Phase 3: Background Processing (24-48 hours)

**Processing pipeline** (`src/app/api/migrate/_lib/processor.ts`, exposed at
`/api/migrate/process`):

```typescript
// Runs immediately after submission (via next/server `after()` in the
// initiate route) and daily via Vercel Cron (see vercel.json) as a
// retry sweeper. Secured with the CRON_SECRET env var.
// 1. Query pending migrations (oldest first, batch of 10)
// 2. For each migration:
//    a. Fetch the source_url HTML (10s timeout, 3MB cap)
//    b. Extract schema.org JSON-LD Review objects (generic scraper);
//       per-platform DOM scrapers can be added in PLATFORM_SCRAPERS
//    c. Create imported_reviews entries (is_public: FALSE initially)
//    d. Update profile_migrations.imported_review_count
//    e. Set status: "completed"
// 3. No machine-readable reviews found → status: "manual_review"
//    (concierge team imports by hand; never silently completed empty)
// 4. Handle errors: Set status: "failed", log error message

// Note: supabase/functions/process-migrations/index.ts contains an
// equivalent Supabase Edge Function variant, kept as an alternative
// deployment path. The Next.js route above is the one that ships.
```

**Key Implementation Details**:

```typescript
// Creating imported review entries
const { data: importedData } = await supabase
  .from('imported_reviews')
  .insert({
    profile_id: migration.profile_id,
    migration_id: migration.id,
    source_platform: migration.platform,
    source_url: source_url_of_specific_review,
    reviewer_name: review.author,
    rating: review.rating,
    review_text: review.text,
    review_date: review.date,
    is_public: FALSE,  // CRITICAL: Start hidden
    reviewed_by: null,  // Awaiting admin
    reviewed_at: null,
  });

// Update migration status
await supabase
  .from('profile_migrations')
  .update({
    status: 'completed',
    imported_review_count: reviews.length,
    completed_at: new Date().toISOString(),
  })
  .eq('id', migration.id);

// Trigger admin notification
await sendAdminNotification({
  subject: `New Imported Reviews Awaiting Review: ${therapistName}`,
  data: {
    migration_id: migration.id,
    imported_count: reviews.length,
    admin_review_url: `/admin/migrations/${migration.id}`,
  }
});
```

**Database State After Processing**:
```sql
-- imported_reviews table (one entry per migrated review)
id: uuid,
profile_id: "therapist-profile-uuid",
migration_id: "migration-request-uuid",
source_platform: "rubmaps",
source_url: "https://rubmaps.com/provider/123#review-456",
reviewer_name: "John D.",
rating: 4.5,
review_text: "Great massage, very professional...",
review_date: "2024-06-15",
is_public: FALSE,  -- HIDDEN from public view
reviewed_by: NULL,
reviewed_at: NULL,
review_notes: NULL,
created_at: NOW()

-- profile_migrations table (updated)
status: "completed",
imported_review_count: 12,
completed_at: NOW(),
is_verified: FALSE,  -- Still needs admin approval
```

### Phase 4: Admin Review & Approval (24-48 hours)

**Admin Dashboard** (`/admin/migrations/<id>`):

Admin sees:
- Migration request details
- List of imported reviews
- For each review:
  - Reviewer name, rating, text, source link
  - Thumbnails/formatting
  - Checkbox to approve/reject each review
  - Notes field for any concerns

**Admin Actions**:
```sql
-- Approve a review
UPDATE imported_reviews
SET is_public = TRUE,  -- Makes visible
    reviewed_by = admin_user_id,
    reviewed_at = NOW(),
    review_notes = 'Approved - authentic source'
WHERE id = review_uuid;

-- Reject/hide a review
UPDATE imported_reviews
SET is_public = FALSE,  -- Keep hidden
    reviewed_by = admin_user_id,
    reviewed_at = NOW(),
    review_notes = 'Rejected - potential fake review'
WHERE id = review_uuid;

-- Approve entire migration
UPDATE profile_migrations
SET is_verified = TRUE,
    verified_by = admin_user_id,
    verified_at = NOW()
WHERE id = migration_uuid;
```

**Database State After Admin Approval**:
```sql
-- imported_reviews table (approved reviews)
is_public: TRUE,  -- NOW VISIBLE
reviewed_by: "admin-user-uuid",
reviewed_at: "2024-07-09 14:22:00",
review_notes: "Approved - authentic source",

-- profile_migrations table
is_verified: TRUE,
verified_by: "admin-user-uuid",
verified_at: "2024-07-09 14:22:00",
```

### Phase 5: Therapist Preview & Confirmation (Optional)

**Therapist Dashboard** (`/dashboard/profile/migrations`):

Therapist sees:
- Migration status for each import
- Preview of imported reviews (both pending and approved)
- Ability to:
  - Edit/redact any imported review text
  - Request removal of specific reviews
  - Reorder reviews
  - Hide/unhide reviews from their profile

**Therapist Actions**:
```sql
-- Therapist edits imported review
UPDATE imported_reviews
SET review_text = 'Edited text...',  -- Can customize
    updated_at = NOW()
WHERE id = review_uuid
  AND profile_id = therapist_profile_uuid;

-- Therapist temporarily hides review from their profile
-- (Note: is_public controls visibility, but therapist can't completely delete)
-- Add therapist_hidden flag if needed:
ALTER TABLE imported_reviews
ADD COLUMN therapist_hidden BOOLEAN DEFAULT FALSE;

UPDATE imported_reviews
SET therapist_hidden = TRUE
WHERE id = review_uuid
  AND profile_id = therapist_profile_uuid;
```

### Phase 6: Public Display

**Public Profile** (`/therapist/<id>`):

Displays all reviews where:
```sql
is_public = TRUE
AND therapist_hidden = FALSE
```

**Markup Example**:
```html
<div class="review">
  <div class="rating">★★★★☆ 4.0</div>
  <p class="review-text">Great massage, very professional...</p>
  <p class="reviewer">John D.</p>
  <p class="source">
    <Badge>Imported from RubMaps</Badge>
    <a href="source_url">View original</a>
  </p>
  <p class="date">June 15, 2024</p>
</div>
```

## Data Visibility Summary

| Entity | Who Can See | Conditions |
|--------|------------|-----------|
| **imported_reviews** (Pending) | Therapist, Admins | is_public=FALSE, reviewed_at=NULL |
| **imported_reviews** (Under Review) | Therapist, Admins | is_public=FALSE, reviewed_at=populated |
| **imported_reviews** (Approved) | Public, Therapist, Admins | is_public=TRUE |
| **profile_migrations** | Therapist (own), Admins (all) | RLS enforced |

## API Endpoints

### POST `/api/migrate/validate-url`
- **Input**: `{ url: string, platform: string }`
- **Output**: `{ valid: boolean, message?: string }`
- **Purpose**: Real-time validation during signup
- **No database changes**

### POST `/api/migrate/initiate`
- **Input**: `{ profileUrls: Array<{platform, url}>, email: string }`
- **Output**: `{ ok: boolean, message: string }`
- **Purpose**: Create migration requests
- **Database Changes**:
  - Inserts into `profile_migrations` (status: pending)
  - Sends confirmation email

### PUT `/api/migrate/<migrationId>/approve` (Admin)
- **Input**: `{ reviews: Array<{id, approved: boolean}>, notes?: string }`
- **Output**: `{ success: boolean }`
- **Purpose**: Admin approves individual reviews
- **Database Changes**:
  - Updates `imported_reviews` (is_public, reviewed_by, reviewed_at)
  - Updates `profile_migrations` (is_verified if all approved)

### GET `/api/therapist/<profileId>/imported-reviews` (Therapist)
- **Input**: None
- **Output**: `Array<ImportedReview>`
- **Purpose**: Therapist views their pending/approved reviews
- **Visibility**: Only own therapist's data

## Error Handling

### Migration Fails to Complete
```typescript
// If scraping fails or times out
UPDATE profile_migrations
SET status = 'failed',
    migration_notes = 'Failed to scrape RubMaps - 404 not found'
WHERE id = migration_id;

// Therapist sees in dashboard:
// "Migration failed for RubMaps profile. Contact support."
```

### Admin Rejects All Reviews
```typescript
// If admin decides reviews don't meet standards
UPDATE profile_migrations
SET is_verified = FALSE,
    verified_notes = 'Insufficient review quality - no approved reviews'
WHERE id = migration_id;

// Therapist can retry migration
```

## Compliance & GDPR

### Data Retention
- **Pending reviews** (is_public=FALSE): Deleted after 90 days if not approved
- **Approved reviews** (is_public=TRUE): Retained for life of therapist account
- **Failed migrations**: Deleted after 30 days

### Reviewer Privacy
- Reviewer names stored as-is from source platform
- If reviewer requested anonymization: Set `reviewer_anonymized = TRUE`
- Display as "Anonymous Client" when anonymized

### Account Deletion
```typescript
// When therapist deletes account
DELETE FROM imported_reviews WHERE profile_id = $1;
DELETE FROM profile_migrations WHERE profile_id = $1;
// Removes all imported data from MasseurMatch
// Does NOT affect source platforms
```

## Testing Checklist

- [ ] Migration request creates profile_migrations entry with correct status
- [ ] Database linking email to profile_id works after account creation
- [ ] Background job scrapes review data correctly
- [ ] Imported reviews start with is_public=FALSE
- [ ] Admin dashboard displays pending reviews
- [ ] Admin can approve/reject reviews individually
- [ ] Approved reviews appear on public profile
- [ ] Therapist can edit review text
- [ ] Therapist can hide individual reviews
- [ ] Public cannot see hidden or unapproved reviews
- [ ] RLS policies prevent unauthorized access
- [ ] Therapist dashboard shows migration status
- [ ] Deletion workflow removes all imported data
- [ ] Source attribution links work (point to original platforms)

## Future Enhancements

1. **Bulk admin interface** — Approve/reject 50+ reviews at once
2. **AI review filtering** — Flag suspicious reviews for manual review
3. **Photo migration** — Also scrape and import profile photos
4. **Rating aggregation** — Display average rating from all imported sources
5. **Competitor tracking** — Alert therapist if competitor profile detected
6. **Real-time progress** — WebSocket updates during scraping
7. **Verification badges** — Show "Verified Imported from RubMaps" badge
