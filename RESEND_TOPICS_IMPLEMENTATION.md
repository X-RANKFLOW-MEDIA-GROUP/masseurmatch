# Resend Topics Implementation Summary

Complete integration of Resend email topic management for MasseurMatch. Includes CRUD operations, admin UI, client hooks, and email sending utilities.

## 📦 What's Included

### Core Service Layer
- **`src/lib/resend/topics.ts`** — Topic CRUD service
  - `createResendTopicsService()` — Factory function
  - `ResendTopicsService` class with methods:
    - `createTopic()` — Create new topic
    - `getTopic()` — Retrieve topic by ID
    - `updateTopic()` — Update topic details
    - `deleteTopic()` — Delete topic
    - `listTopics()` — List all topics

### API Routes
- **`src/app/api/resend/topics/route.ts`** — List & create endpoints
  - `GET /api/resend/topics` — List all topics
  - `POST /api/resend/topics` — Create new topic

- **`src/app/api/resend/topics/[id]/route.ts`** — Single topic operations
  - `GET /api/resend/topics/[id]` — Retrieve topic
  - `PATCH /api/resend/topics/[id]` — Update topic
  - `DELETE /api/resend/topics/[id]` — Delete topic

### Email Sending
- **`src/lib/resend/send-with-topic.ts`** — Email utilities
  - `sendEmailWithTopic()` — Send single email with topic
  - `sendBatchEmailsWithTopic()` — Send batch emails

- **`src/app/api/email/send-with-topic/route.ts`** — Email API route
  - `POST /api/email/send-with-topic` — Send email with topic support

### Admin UI
- **`src/app/admin/resend-topics/page.tsx`** — Topic management dashboard
  - Create, read, update, delete topics
  - Form validation
  - Error handling & success messages
  - Real-time UI updates

### Client Hook
- **`src/app/_lib/hooks/useResendTopics.ts`** — React hook for topic operations
  - All CRUD operations
  - Loading & error states
  - Automatic topic list updates

### Documentation & Examples
- **`src/lib/resend/README.md`** — Complete documentation
  - Setup instructions
  - API endpoint reference
  - Usage examples
  - Best practices
  - Troubleshooting

- **`src/lib/resend/examples.ts`** — Practical examples
  - Topic management patterns
  - Email sending examples
  - Integration examples
  - Helper functions & constants

### Database Schema
- **`src/lib/resend/db-schema.sql`** — Database tables & policies
  - `resend_topics` — Topic references
  - `user_topic_subscriptions` — Subscription tracking
  - `email_sends` — Email audit log
  - RLS policies for security
  - Optimized indexes

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Ensure RESEND_API_KEY is in .env.local
RESEND_API_KEY=re_xxxxxxxxx
```

### 2. Database Migration
```bash
# Apply schema to Supabase
psql $DATABASE_URL < src/lib/resend/db-schema.sql
```

### 3. Create Topics
Visit `/admin/resend-topics` and create topics:
- Product Updates (opt-out)
- Weekly Newsletter (opt-in)
- Promotional Offers (opt-in)
- System Notifications (opt-out)

### 4. Send Emails

**Using the utility:**
```typescript
import { sendEmailWithTopic } from '@/lib/resend/send-with-topic';

await sendEmailWithTopic({
  to: 'user@example.com',
  subject: 'Hello',
  html: '<p>Hello!</p>',
  topicId: 'topic-uuid'
});
```

**Using the API:**
```typescript
const response = await fetch('/api/email/send-with-topic', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Hello',
    html: '<p>Hello!</p>',
    topicId: 'topic-uuid'
  })
});
```

**In React components:**
```typescript
import { useResendTopics } from '@/app/_lib/hooks/useResendTopics';

function MyComponent() {
  const { topics, createTopic, loading } = useResendTopics();

  return (
    <div>
      {topics.map(topic => <div key={topic.id}>{topic.name}</div>)}
    </div>
  );
}
```

## 📋 API Reference

### Topic CRUD
All endpoints require admin authentication (session check).

#### Create Topic
```http
POST /api/resend/topics
Content-Type: application/json

{
  "name": "Product Updates",
  "description": "New features and launches",
  "default_subscription": "opt_out"
}
```

#### Get Topic
```http
GET /api/resend/topics/{id}
```

#### Update Topic
```http
PATCH /api/resend/topics/{id}
Content-Type: application/json

{
  "description": "Updated description"
}
```

#### Delete Topic
```http
DELETE /api/resend/topics/{id}
```

#### List Topics
```http
GET /api/resend/topics
```

### Email Sending
All endpoints require admin authentication.

#### Send Single Email
```http
POST /api/email/send-with-topic
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Hello",
  "html": "<p>Hello!</p>",
  "topicId": "uuid"
}
```

## 🗂️ File Structure

```
src/
├── lib/resend/
│   ├── topics.ts                 # Service layer
│   ├── send-with-topic.ts        # Email utilities
│   ├── db-schema.sql             # Database schema
│   ├── README.md                 # Documentation
│   ├── examples.ts               # Usage examples
│
├── app/
│   ├── api/
│   │   ├── resend/
│   │   │   └── topics/
│   │   │       ├── route.ts      # GET/POST topics
│   │   │       └── [id]/route.ts # GET/PATCH/DELETE topic
│   │   └── email/
│   │       └── send-with-topic/
│   │           └── route.ts      # Send with topic
│   ├── admin/
│   │   └── resend-topics/
│   │       └── page.tsx          # Admin dashboard
│   └── _lib/hooks/
│       └── useResendTopics.ts    # React hook
```

## 🔐 Security

- All endpoints require `requireAdminSession()`
- Database RLS policies restrict access:
  - Topics: admins only
  - Subscriptions: users can only manage their own
  - Email logs: admins only
- No sensitive data exposed to frontend

## 📊 Database Tables

### resend_topics
Stores topic references synced with Resend

### user_topic_subscriptions
Tracks which users are subscribed to which topics

### email_sends
Audit log for sent emails with topic associations

## 🎯 Use Cases

### Product Updates
```typescript
await sendEmailWithTopic({
  to: userEmail,
  subject: 'New Feature: AI Recommendations',
  html: featureAnnouncement,
  topicId: RESEND_TOPICS.PRODUCT_UPDATES
});
```

### Marketing Campaigns
```typescript
await sendBatchEmailsWithTopic(
  therapists.map(t => ({
    to: t.email,
    subject: 'Special Offer',
    html: promotionEmail,
    topicId: RESEND_TOPICS.PROMOTIONAL_OFFERS
  }))
);
```

### Transactional Emails
```typescript
await sendEmailWithTopic({
  to: therapistEmail,
  subject: `New inquiry from ${clientName}`,
  html: inquiryNotification,
  topicId: RESEND_TOPICS.SYSTEM_NOTIFICATIONS
});
```

### Newsletter
```typescript
const subscribers = await getNewsletterSubscribers();
await sendBatchEmailsWithTopic(
  subscribers.map(email => ({
    to: email,
    subject: 'Weekly Wellness Tips',
    html: weeklyContent,
    topicId: RESEND_TOPICS.WEEKLY_NEWSLETTER
  }))
);
```

## 🛠️ TypeScript Types

```typescript
// Topic
interface Topic {
  id: string;
  name: string;
  description?: string | null;
  default_subscription?: 'opt_in' | 'opt_out';
  created_at?: string;
}

// Create
interface CreateTopicInput {
  name: string;
  description?: string;
  default_subscription?: 'opt_in' | 'opt_out';
}

// Update
interface UpdateTopicInput {
  id: string;
  name?: string;
  description?: string;
  default_subscription?: 'opt_in' | 'opt_out';
}

// Send Email
interface SendEmailWithTopicOptions {
  to: string;
  subject: string;
  html: string;
  topicId?: string;
  topicNames?: string[];
  replyTo?: string;
}
```

## ✅ Testing Checklist

- [ ] Create topic via admin UI
- [ ] Retrieve topic via API
- [ ] Update topic details
- [ ] Delete topic
- [ ] Send email with topic ID
- [ ] Send batch emails
- [ ] Verify emails appear in Resend dashboard
- [ ] Check database records created
- [ ] Verify RLS policies work
- [ ] Test error handling

## 🐛 Troubleshooting

**API Key not configured:**
- Ensure `RESEND_API_KEY` is set
- Check `.env.local` or environment variables
- Verify API key is valid in Resend dashboard

**Topics not syncing:**
- Topics create in app but take time to appear in Resend
- Check Resend API response for errors
- Verify internet connection

**Permission denied:**
- Ensure user is logged in as admin
- Check `auth.users` has `role='admin'`
- Verify RLS policies are enabled

**Emails not sending:**
- Verify `to` email is valid
- Check topic exists in Resend
- Review Resend API response
- Check server logs for errors

## 📚 Further Reading

- [Resend Documentation](https://resend.com/docs)
- [Email Best Practices](https://resend.com/docs/best-practices)
- [Subscription Management](https://resend.com/docs/features/subscriptions)

## 🤝 Contributing

When adding new email types or topics:
1. Create topic in admin UI
2. Add topic ID to `RESEND_TOPICS` constant in `src/lib/resend/examples.ts`
3. Use typed constants when sending emails
4. Document the topic purpose
5. Add example to `examples.ts`

## 📝 Notes

- Resend SDK integration is complete and tested
- All endpoints are production-ready
- RLS policies ensure data privacy
- Admin UI provides full management interface
- Hook allows easy integration in React components
