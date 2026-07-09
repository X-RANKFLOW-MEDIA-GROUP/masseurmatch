# Profile Migration Feature — Implementation Guide

## Overview

The profile migration feature allows therapists to import their profiles, reviews, and ratings from other massage directories during signup. This is an "exciting" premium feature that:

- **Saves time**: Therapists don't need to re-enter all their information
- **Preserves reputation**: Reviews and ratings migrate automatically
- **Builds trust**: Shows existing clients that the therapist is established
- **Differentiates MasseurMatch**: A service-oriented onboarding experience

## Architecture

### Database Schema

**Table: `profile_migrations`**
- Stores migration requests from therapists
- Links email to profile once signup is complete
- Tracks migration status and imported data counts
- Supports async processing for batch imports

```sql
-- Run this migration: supabase/migrations/20250709_add_profile_migrations.sql
-- Creates profile_migrations table with RLS policies
```

### API Endpoints

**POST `/api/migrate/validate-url`**
- Validates that a URL belongs to a supported platform
- Returns validation errors immediately
- Checks URL format, reachability, and platform match

**POST `/api/migrate/initiate`**
- Receives profile URLs and email
- Creates migration request in database
- Sends confirmation email to therapist
- Triggered after therapist completes profile but before final submission

### Components

**Signup Page: `/signup/migration`**
- New optional step in signup flow
- Premium UI with platform selector
- URL validation with visual feedback
- Displays benefits and trust signals
- Can be skipped with a single click

### State Management

**SignupContext Updates**
- Added `ProfileMigrationUrl` interface
- Added `migrationUrls: ProfileMigrationUrl[]` to `SignupProfile`
- Persists migration data through signup session

### Email Notifications

**Two Email Templates:**

1. **Confirmation Email** (`/api/migrate/initiate`)
   - Sent immediately when migration request submitted
   - Sets expectations for 24-48 hour turnaround
   - Provides support contact

2. **Completion Email** (`ProfileMigrationCompletedEmail.tsx`)
   - Sent when migration finishes (triggered by admin/cron)
   - Shows number of imported reviews
   - Includes next steps and profile link
   - Social proof: "3x more bookings with complete profiles"

## Integration Steps

### 1. Apply Database Migration

```bash
# Run Supabase migration
supabase db push

# Or manually execute:
# supabase/migrations/20250709_add_profile_migrations.sql
```

### 2. Update Signup Flow Navigation

The migration page should be accessible in the signup flow. Options:

**Option A: After Profile Step** (Recommended)
```typescript
// In your signup navigation/step logic
"/signup/profile" → "/signup/migration" → "/signup/review"
```

**Option B: Optional Card on Review Page**
Add an optional "Add Profiles?" card on the review page before final submission.

### 3. Connect to Signup Context

The migration page is already set up to integrate with signup context:

```typescript
const { state, updateProfile } = useSignup();
// URLs are stored in: state.profile.migrationUrls
```

### 4. Test the Flow

1. Complete signup through profile step
2. Navigate to `/signup/migration`
3. Add URLs (test with real platforms)
4. Check that validation works
5. Verify confirmation email sends
6. Check database for `profile_migrations` entry

### 5. Set Up Background Processing

Create a Supabase Edge Function or cron job to:
1. Poll `profile_migrations` table for "pending" status
2. Scrape/fetch reviews from source URLs
3. Link reviews to therapist profile
4. Update migration status to "completed"
5. Send completion email via `ProfileMigrationCompletedEmail.tsx`

Example Supabase Function skeleton:

```typescript
// supabase/functions/process-migrations/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    // 1. Get pending migrations
    const { data: migrations } = await supabase
      .from("profile_migrations")
      .select("*")
      .eq("status", "pending");

    for (const migration of migrations || []) {
      // 2. Scrape profile data from source URL
      const profileData = await scrapeProfile(migration.source_url, migration.platform);

      // 3. Create or link reviews
      for (const review of profileData.reviews) {
        await supabase.from("imported_reviews").insert({
          profile_id: migration.profile_id,
          source_platform: migration.platform,
          reviewer_name: review.name,
          rating: review.rating,
          review_text: review.text,
          review_date: review.date,
        });
      }

      // 4. Update migration status
      await supabase
        .from("profile_migrations")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          imported_reviews: profileData.reviews.length,
        })
        .eq("id", migration.id);

      // 5. Send completion email
      // await sendEmail(...) using ProfileMigrationCompletedEmail
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Migration error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
```

## Supported Platforms

Currently configured:
- **RubMaps** (`rubmaps.com/provider/...`)
- **4Corners** (`4corners.xxx/...`)
- **NuruMap** (`nurumap.com/provider/...`)
- **Custom** (any URL with http/https)

Add more by updating `PLATFORM_VALIDATORS` in `/api/migrate/validate-url/route.ts`:

```typescript
const PLATFORM_VALIDATORS: Record<string, (url: string) => boolean> = {
  yourplatform: (url) => {
    try {
      const u = new URL(url);
      return u.hostname.includes("yourplatform.com") && /* validation */;
    } catch {
      return false;
    }
  },
};
```

## Design Highlights

**Premium UX Principles Applied:**
- **Value-first copy**: "Bring Your Reviews & Reputation"
- **Clear benefits**: Visual cards showing what happens
- **One-at-a-time input**: Platform selector then URL input (not overwhelming)
- **Instant validation**: Real-time feedback with error messages
- **Skip option**: Not mandatory, respects therapist autonomy
- **Trust signals**: Privacy statement and support contact
- **Micro-interactions**: Smooth animations, clear state changes

**Brand Alignment:**
- Color: Sober red (#8B1E2D) for CTAs only
- Typography: Satoshi font, clear hierarchy
- Icons: lucide-react (CheckCircle2, AlertCircle, etc.)
- Layout: Premium card-based, max-width 3xl
- Accessibility: Uses `useReducedMotion` via framer-motion

## Testing Checklist

- [ ] Database migration applies cleanly
- [ ] Migration page renders without errors
- [ ] URL validation works for each platform
- [ ] URLs can be added/removed smoothly
- [ ] Confirmation email sends on submit
- [ ] URLs are stored in database
- [ ] Background processing picks up pending migrations
- [ ] Completion email template renders correctly
- [ ] Links in emails work and are branded
- [ ] Migration can be skipped without issues
- [ ] Signup flow continues to review after migration

## Future Enhancements

1. **Advanced Scraping**: Implement headless browser scraping for JavaScript-heavy sites
2. **Review Aggregation**: Combine reviews from multiple platforms on single profile
3. **Verification Badges**: Show "Verified: Imported from [Platform]" badges
4. **Competitor Monitoring**: Track competitor profiles to alert existing clients
5. **Batch Import**: Allow uploading CSV of multiple profiles
6. **Real-time Progress**: WebSocket updates during migration process
7. **Review Filtering**: Admin interface to curate imported reviews
8. **Photo Import**: Also migrate profile photos from source platforms

## Support

Questions? Refer to:
- CLAUDE.md (design standards)
- Signup flow documentation
- Supabase Edge Functions docs
- Email template system in `/src/emails/`
