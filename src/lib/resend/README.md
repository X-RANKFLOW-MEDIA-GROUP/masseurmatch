# Resend Topics Management

Complete integration for managing Resend email topics with subscription management for MasseurMatch.

## Overview

This module provides:
- Topic CRUD operations (Create, Read, Update, Delete)
- Admin UI for managing topics
- Client-side hook for topic operations
- Email sending with topic support
- Database schema for tracking subscriptions

## Setup

1. Ensure `RESEND_API_KEY` is set in your environment variables
2. Run the database schema migration:
   ```sql
   psql $DATABASE_URL < src/lib/resend/db-schema.sql
   ```

## API Endpoints

### Create Topic
```bash
POST /api/resend/topics
Content-Type: application/json

{
  "name": "Product Updates",
  "description": "Updates about our product launches",
  "default_subscription": "opt_out"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d",
    "name": "Product Updates",
    "description": "Updates about our product launches",
    "default_subscription": "opt_out"
  }
}
```

### Retrieve Topic
```bash
GET /api/resend/topics/[id]
```

### Update Topic
```bash
PATCH /api/resend/topics/[id]
Content-Type: application/json

{
  "description": "Updates from our product team"
}
```

### Delete Topic
```bash
DELETE /api/resend/topics/[id]
```

### List Topics
```bash
GET /api/resend/topics
```

## Client-Side Usage

```typescript
import { useResendTopics } from '@/app/_lib/hooks/useResendTopics';

function MyComponent() {
  const { topics, createTopic, updateTopic, deleteTopic } = useResendTopics();

  const handleCreate = async () => {
    const topic = await createTopic({
      name: 'Newsletter',
      description: 'Weekly newsletter',
      default_subscription: 'opt_in'
    });
  };

  return (
    <div>
      {topics.map(topic => (
        <div key={topic.id}>{topic.name}</div>
      ))}
    </div>
  );
}
```

## Sending Emails with Topics

### Single Email with Topic

```typescript
import { sendEmailWithTopic } from '@/lib/resend/send-with-topic';

await sendEmailWithTopic({
  to: 'user@example.com',
  subject: 'Weekly Update',
  html: '<p>Hello!</p>',
  topicId: '5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d'
});
```

### Via API Route

```typescript
const response = await fetch('/api/email/send-with-topic', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Weekly Update',
    html: '<p>Hello!</p>',
    topicId: '5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d'
  })
});
```

### Batch Send

```typescript
import { sendBatchEmailsWithTopic } from '@/lib/resend/send-with-topic';

await sendBatchEmailsWithTopic([
  {
    to: 'user1@example.com',
    subject: 'Hello',
    html: '<p>Hello user1</p>',
    topicId: 'topic-1'
  },
  {
    to: 'user2@example.com',
    subject: 'Hello',
    html: '<p>Hello user2</p>',
    topicId: 'topic-1'
  }
]);
```

## Admin UI

Access the topic management dashboard at `/admin/resend-topics`

Features:
- Create new topics
- Edit existing topics
- Delete topics
- View topic IDs and metadata
- Manage default subscription behavior

## Database Schema

### resend_topics
Stores reference to Resend topics
- `id` - UUID primary key
- `resend_id` - Resend's topic ID (unique)
- `name` - Topic name
- `description` - Topic description
- `default_subscription` - 'opt_in' or 'opt_out'
- `category` - Optional categorization
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### user_topic_subscriptions
Tracks user subscriptions
- `id` - UUID primary key
- `user_id` - Reference to auth.users
- `topic_id` - Reference to resend_topics
- `subscribed` - Boolean subscription status
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### email_sends
Logs sent emails for auditing
- `id` - UUID primary key
- `resend_id` - Resend's email ID
- `to_email` - Recipient email
- `subject` - Email subject
- `topic_id` - Associated topic
- `status` - Send status
- `sent_at` - Send timestamp

## Subscription Types

### Opt-out (default_subscription: 'opt_out')
Users are subscribed by default and can unsubscribe.
Use for:
- Product updates
- Important announcements
- Service notifications

### Opt-in (default_subscription: 'opt_in')
Users are unsubscribed by default and must opt-in.
Use for:
- Marketing emails
- Promotions
- Newsletters

## Environment Variables

```env
RESEND_API_KEY=re_xxxxxxxxx
```

## Best Practices

1. **Organize by category**: Group related topics
   - Transactional (opt-out): Order confirmations, receipts
   - Marketing (opt-in): Promotions, newsletters
   - Updates (opt-out): Feature announcements, maintenance

2. **Clear naming**: Use descriptive topic names
   - ✅ "Weekly Newsletter"
   - ❌ "Email 1"

3. **Test before sending**: Always test topic configuration before sending to users

4. **Monitor unsubscribes**: Track which topics have high unsubscribe rates

5. **Compliance**: Honor user preferences and provide unsubscribe options

## TypeScript Types

```typescript
interface Topic {
  id: string;
  name: string;
  description?: string | null;
  default_subscription?: 'opt_in' | 'opt_out';
  created_at?: string;
}

interface CreateTopicInput {
  name: string;
  description?: string;
  default_subscription?: 'opt_in' | 'opt_out';
}

interface UpdateTopicInput {
  id: string;
  name?: string;
  description?: string;
  default_subscription?: 'opt_in' | 'opt_out';
}

interface SendEmailWithTopicOptions {
  to: string;
  subject: string;
  html: string;
  topicId?: string;
  topicNames?: string[];
  replyTo?: string;
}
```

## Troubleshooting

### "RESEND_API_KEY is not configured"
- Ensure `RESEND_API_KEY` is set in your `.env` or `.env.local`
- Verify the API key is valid in your Resend dashboard

### Topic not appearing in Resend dashboard
- Topics are synced one-way (from app to Resend)
- Wait a few minutes for Resend to process
- Check the Resend API response for errors

### Permission denied errors
- Ensure user is authenticated and has admin role
- Check RLS policies in the database

## Support

For issues with Resend's API, visit: https://resend.com/docs
