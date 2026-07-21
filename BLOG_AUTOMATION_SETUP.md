# MasseurMatch Blog Automation Setup Guide

## 📋 Overview

Complete automation system for scheduling and publishing blog posts across multiple channels:
- Blog platform (database)
- Google Business Profile (GBP)
- Social media (Twitter, Facebook, Instagram, LinkedIn)
- Email subscribers
- Google Search Console

## 🚀 Quick Start

### 1. Environment Variables

Add these to `.env.local`:

```env
# Blog automation
ENABLE_AUTO_PUBLISHING=true
ENABLE_GBP_AUTO_POSTING=true
ENABLE_SOCIAL_MEDIA_POSTING=true
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SEARCH_CONSOLE_SUBMISSION=true

# Cron job security
CRON_SECRET=your-super-secret-cron-key-here

# Social media API keys
TWITTER_API_KEY=xxx
TWITTER_API_SECRET=xxx
FACEBOOK_ACCESS_TOKEN=xxx
INSTAGRAM_ACCESS_TOKEN=xxx
LINKEDIN_ACCESS_TOKEN=xxx

# Email service
SENDGRID_API_KEY=xxx
SENDER_EMAIL=content@masseurmatch.com

# Google APIs
GOOGLE_SEARCH_CONSOLE_API_KEY=xxx
GOOGLE_BUSINESS_PROFILE_API_KEY=xxx
```

### 2. Set Up Vercel Cron (or External Scheduler)

#### Option A: Vercel Cron Jobs (Built-in)

1. Add `vercel.json` to project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/publish-blog",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

2. Deploy to Vercel — cron job automatically starts running

#### Option B: External Cron Service (GitHub Actions, EasyCron, Zapier)

**GitHub Actions:**

Create `.github/workflows/blog-publishing.yml`:

```yaml
name: Blog Publishing Cron

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:  # Manual trigger

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger blog publishing
        run: |
          curl -X POST https://masseurmatch.com/api/cron/publish-blog \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### 3. Database Schema Setup

Create these tables in Supabase:

```sql
-- Blog posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  status TEXT DEFAULT 'draft', -- draft, scheduled, published, archived
  focus_keyword TEXT,
  meta_description TEXT,
  keywords TEXT[], -- array
  featured_image URL,
  published_at TIMESTAMP,
  scheduled_at TIMESTAMP,
  updated_at TIMESTAMP,
  author_id UUID REFERENCES users(id),
  linked_profiles TEXT[], -- therapist slugs
  linked_services TEXT[], -- service types
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Publishing queue/history
CREATE TABLE blog_publishing_queue (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES blog_posts(id),
  scheduled_time TIMESTAMP,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, failed
  actions JSONB,
  results JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Social media posts (generated)
CREATE TABLE blog_social_posts (
  id UUID PRIMARY KEY,
  blog_post_id UUID REFERENCES blog_posts(id),
  platform TEXT, -- twitter, facebook, instagram, linkedin
  content TEXT,
  image_url TEXT,
  scheduled_time TIMESTAMP,
  posted_time TIMESTAMP,
  posted_id TEXT, -- platform's post ID
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 📅 Content Calendar Generation

### Auto-Generate 12-Week Calendar

```typescript
import { generateContentCalendar } from '@/app/_lib/blog-automation';

const calendar = generateContentCalendar(new Date(), 12);
// Returns 12 weeks of 2-3 posts/week across all categories
```

### Upload to Database

```typescript
// Save calendar to database
const { error } = await supabase
  .from('blog_posts')
  .insert(calendar.flatMap(week => week.posts));
```

## 🎯 Post Creation Workflow

### Option 1: Use Admin Dashboard UI (Coming Soon)

1. Navigate to `/admin/blog`
2. Click "New Post"
3. Select template
4. Fill content
5. Configure SEO
6. Schedule
7. Publish

### Option 2: API Call

```bash
curl -X POST https://masseurmatch.com/api/admin/blog/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "title": "What is Deep Tissue Massage?",
    "excerpt": "Learn about deep tissue massage...",
    "content": "...",
    "keywords": ["deep tissue massage", "massage therapy"],
    "category": "client-guide",
    "scheduledAt": "2026-07-25T09:00:00Z",
    "linkedProfiles": ["therapist-slug-1"],
    "linkedServices": ["therapeutic-massage"]
  }'
```

### Option 3: Bulk Upload (CSV)

Create `blog-posts.csv`:

```csv
title,excerpt,keywords,category,scheduled_date,scheduled_time
"What is Swedish Massage?","Learn about Swedish massage...","swedish massage,massage therapy",client-guide,2026-07-22,09:00 AM
"Benefits of Deep Tissue","Deep tissue benefits...","deep tissue,massage benefits",wellness,2026-07-24,02:00 PM
```

Upload via admin or API:

```bash
curl -X POST https://masseurmatch.com/api/admin/blog/schedule/bulk \
  -F "file=@blog-posts.csv" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## ⚙️ Automation Configuration

### Update Settings

```bash
curl -X POST https://masseurmatch.com/api/admin/blog/automation/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "autoPublishing": {
      "enabled": true,
      "frequency": "3x_per_week",
      "daysToPublish": ["monday", "wednesday", "friday"],
      "timesToPublish": ["09:00", "14:00"],
      "timezone": "America/New_York"
    },
    "gbpPosting": {
      "enabled": true,
      "strategy": "publish_excerpt"
    },
    "socialMediaPosting": {
      "enabled": true,
      "channels": ["twitter", "facebook", "instagram", "linkedin"]
    },
    "emailNotifications": {
      "enabled": true,
      "recipientLists": ["subscribers"]
    }
  }'
```

## 🔍 Monitor Automation

### Check Queue Status

```bash
curl https://masseurmatch.com/api/admin/blog/automation/status \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Returns:

```json
{
  "queueLength": 5,
  "postsPublishedToday": 2,
  "upcomingPosts": [
    {
      "title": "What is Deep Tissue Massage?",
      "scheduledAt": "2026-07-22T09:00:00Z",
      "status": "pending"
    }
  ],
  "lastSuccessfulRun": "2026-07-21T14:05:30Z",
  "nextScheduledRun": "2026-07-21T14:10:00Z"
}
```

### View Publishing Logs

```bash
curl https://masseurmatch.com/api/admin/blog/logs \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Manually Trigger Job

```bash
curl -X POST https://masseurmatch.com/api/admin/blog/automation/trigger \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## 📊 Analytics & Performance

### Track Blog Metrics

```bash
curl https://masseurmatch.com/api/admin/blog/analytics \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "startDate=2026-07-01&endDate=2026-07-31"
```

### Key Metrics Tracked

- Page views per post
- Time on page
- Scroll depth
- Click-through rate (CTR) from search results
- Keyword ranking position
- Links clicked to therapist profiles
- Links clicked to services
- Booking conversions from blog traffic

## 🔐 Security

### Cron Job Authentication

All cron jobs require `CRON_SECRET` in Authorization header:

```
Authorization: Bearer $CRON_SECRET
```

### Rate Limiting

- Social media posting: 1 post per platform per hour (avoid rate limits)
- Search Console submissions: Max 50 URLs per day
- Email sending: Batched to respect SendGrid limits

### Validation

- Posts must have title, slug, content
- Keywords must be array of strings
- Dates must be valid ISO 8601 format
- External links validated before publishing

## 🚨 Troubleshooting

### Post not publishing?

1. Check cron job logs: `curl https://masseurmatch.com/api/admin/blog/logs`
2. Verify `CRON_SECRET` env var is set
3. Check database connection
4. Review error message in queue

### Social media posts not showing up?

1. Verify API tokens are valid
2. Check rate limits not exceeded
3. Confirm accounts have permissions
4. Check social post logs

### GBP posting failing?

1. Verify Google Business Profile API key
2. Confirm business account is authorized
3. Check GBP is not rate-limited

## 📈 Optimization Tips

### Best Posting Times

- **Twitter**: 9 AM, 2 PM, 6 PM EST
- **Facebook**: 12 PM, 3 PM EST
- **Instagram**: 10 AM, 7 PM EST
- **LinkedIn**: 8 AM, 5 PM EST

### Content Gaps

Auto-detection of missing content:
- "Benefits of [massage type]" (for each type)
- "Massage for [common condition]" (back pain, anxiety, etc.)
- LGBTQ+ affirmation content (monthly)
- Therapist guides (monthly)

## 🎓 Documentation

- **blog-automation.ts**: Core automation logic
- **blog-admin-dashboard.ts**: Admin panel configuration
- **route.ts**: API endpoints
- **BLOG_AUTOMATION_SETUP.md**: This guide

## 📞 Support

For issues or questions:
1. Check logs: `/api/admin/blog/logs`
2. Review environment variables
3. Verify database schema
4. Check API key permissions

---

**Status**: ✅ Ready to deploy
**Testing**: All automation endpoints tested
**Next Steps**: Deploy to production and start scheduling posts
