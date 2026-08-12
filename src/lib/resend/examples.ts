/**
 * Example usage of Resend Topics management system
 * These examples show common patterns for working with topics and sending emails
 */

import { createResendTopicsService } from './topics';
import { sendEmailWithTopic, sendBatchEmailsWithTopic } from './send-with-topic';

// ─────────────────────────────────────────────────────────────────────
// TOPIC MANAGEMENT EXAMPLES
// ─────────────────────────────────────────────────────────────────────

/**
 * Example 1: Create default topics during app initialization
 */
export async function setupDefaultTopics() {
  const topicsService = createResendTopicsService();

  const defaultTopics = [
    {
      name: 'Product Updates',
      description: 'New features and product launches',
      default_subscription: 'opt_out' as const,
    },
    {
      name: 'Weekly Newsletter',
      description: 'Weekly massage tips and wellness content',
      default_subscription: 'opt_in' as const,
    },
    {
      name: 'Promotional Offers',
      description: 'Special promotions and discounts',
      default_subscription: 'opt_in' as const,
    },
    {
      name: 'System Notifications',
      description: 'Important account and system notifications',
      default_subscription: 'opt_out' as const,
    },
  ];

  for (const topicData of defaultTopics) {
    try {
      const topic = await topicsService.createTopic(topicData);
      console.log(`Created topic: ${topic.id} - ${topic.name}`);
    } catch (error) {
      console.error(`Failed to create topic ${topicData.name}:`, error);
    }
  }
}

/**
 * Example 2: Retrieve and list topics
 */
export async function viewTopics() {
  const topicsService = createResendTopicsService();

  // Get a specific topic
  const topic = await topicsService.getTopic('topic-uuid-here');
  console.log('Topic:', topic);

  // List all topics (if implemented in SDK)
  const allTopics = await topicsService.listTopics();
  console.log('All topics:', allTopics);
}

/**
 * Example 3: Update topic settings
 */
export async function updateTopicSettings() {
  const topicsService = createResendTopicsService();

  const updatedTopic = await topicsService.updateTopic({
    id: 'topic-uuid-here',
    description: 'Updated description',
    default_subscription: 'opt_in',
  });

  console.log('Updated topic:', updatedTopic);
}

/**
 * Example 4: Delete a topic
 */
export async function deleteTopic() {
  const topicsService = createResendTopicsService();

  const success = await topicsService.deleteTopic('topic-uuid-here');
  console.log('Topic deleted:', success);
}

// ─────────────────────────────────────────────────────────────────────
// EMAIL SENDING EXAMPLES
// ─────────────────────────────────────────────────────────────────────

/**
 * Example 5: Send a transactional email with topic
 */
export async function sendTransactionalEmail() {
  const html = `
    <h1>New Inquiry Received</h1>
    <p>You have a new client inquiry on MasseurMatch!</p>
    <p><a href="https://masseurmatch.com/pro/inquiries">View Inquiry</a></p>
  `;

  const result = await sendEmailWithTopic({
    to: 'therapist@example.com',
    subject: 'New Client Inquiry',
    html,
    topicId: 'system-notifications-topic-id',
  });

  console.log('Email sent:', result);
}

/**
 * Example 6: Send marketing email with opt-in topic
 */
export async function sendMarketingEmail(recipientEmail: string) {
  const html = `
    <h1>Exclusive Offer for Elite Members</h1>
    <p>Get 20% off featured listings this month!</p>
    <p><a href="https://masseurmatch.com/pro/billing">Learn More</a></p>
  `;

  const result = await sendEmailWithTopic({
    to: recipientEmail,
    subject: 'Special Offer for You',
    html,
    topicId: 'promotional-offers-topic-id',
  });

  console.log('Marketing email sent:', result);
}

/**
 * Example 7: Send newsletter with batch API
 */
export async function sendWeeklyNewsletter(recipients: string[]) {
  const emailList = recipients.map((email) => ({
    to: email,
    subject: 'MasseurMatch Weekly Wellness Tips',
    html: `
      <h1>This Week's Tips</h1>
      <p>Discover the latest massage techniques and wellness insights...</p>
      <p><a href="https://masseurmatch.com/tips">Read More</a></p>
    `,
    topicId: 'weekly-newsletter-topic-id',
  }));

  const result = await sendBatchEmailsWithTopic(emailList);
  console.log('Batch emails sent:', result);
}

/**
 * Example 8: Send account notification
 */
export async function sendAccountNotification(userEmail: string) {
  const html = `
    <h1>Account Action Required</h1>
    <p>Your profile needs attention. Please review your details.</p>
    <p><a href="https://masseurmatch.com/dashboard">View Profile</a></p>
  `;

  const result = await sendEmailWithTopic({
    to: userEmail,
    subject: 'Action Required: Profile Update',
    html,
    topicId: 'system-notifications-topic-id',
    replyTo: 'support@masseurmatch.com',
  });

  console.log('Account notification sent:', result);
}

// ─────────────────────────────────────────────────────────────────────
// CONDITIONAL SENDING EXAMPLES
// ─────────────────────────────────────────────────────────────────────

/**
 * Example 9: Send different email types based on user preferences
 */
export async function sendContextualEmail(userEmail: string, context: 'new_inquiry' | 'feature_launch') {
  const topicMap = {
    new_inquiry: {
      topicId: 'system-notifications-topic-id',
      subject: 'New Inquiry Received',
      template: 'new_inquiry_email',
    },
    feature_launch: {
      topicId: 'product-updates-topic-id',
      subject: 'Check Out Our New Feature',
      template: 'feature_launch_email',
    },
  };

  const config = topicMap[context];

  const html = renderEmailTemplate(config.template);

  const result = await sendEmailWithTopic({
    to: userEmail,
    subject: config.subject,
    html,
    topicId: config.topicId,
  });

  return result;
}

/**
 * Example 10: Send with fallback topic names
 */
export async function sendWithFallback(userEmail: string) {
  const result = await sendEmailWithTopic({
    to: userEmail,
    subject: 'Hello',
    html: '<p>Hello!</p>',
    topicNames: ['newsletter', 'updates'], // Fallback if topicId not available
  });

  return result;
}

// ─────────────────────────────────────────────────────────────────────
// INTEGRATION EXAMPLES
// ─────────────────────────────────────────────────────────────────────

/**
 * Example 11: Send inquiry notification to therapist with topic
 */
export async function notifyTherapistOfInquiry(
  therapistEmail: string,
  inquiryData: {
    clientName: string;
    clientEmail: string;
    message: string;
  }
) {
  const html = `
    <h1>New Inquiry from ${inquiryData.clientName}</h1>
    <p><strong>Message:</strong></p>
    <p>${inquiryData.message}</p>
    <p>
      <a href="https://masseurmatch.com/pro/inquiries">Respond in Dashboard</a>
    </p>
  `;

  return await sendEmailWithTopic({
    to: therapistEmail,
    subject: `New inquiry from ${inquiryData.clientName}`,
    html,
    topicId: 'system-notifications-topic-id',
    replyTo: inquiryData.clientEmail,
  });
}

/**
 * Example 12: Send bulk notification to all therapists with opt-out topic
 */
export async function notifyAllTherapists(
  therapistEmails: string[],
  announcement: {
    title: string;
    body: string;
  }
) {
  const emailList = therapistEmails.map((email) => ({
    to: email,
    subject: `Announcement: ${announcement.title}`,
    html: `
      <h1>${announcement.title}</h1>
      <p>${announcement.body}</p>
    `,
    topicId: 'product-updates-topic-id',
  }));

  return await sendBatchEmailsWithTopic(emailList);
}

// ─────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────

/**
 * Render email templates (placeholder)
 */
function renderEmailTemplate(templateName: string): string {
  const templates: Record<string, string> = {
    new_inquiry_email: '<h1>New Inquiry</h1>',
    feature_launch_email: '<h1>New Feature Available</h1>',
  };

  return templates[templateName] || '<p>Email</p>';
}

/**
 * Get topic ID by name (helper for common topics)
 */
export async function getTopicIdByName(name: string): Promise<string | null> {
  const topicNameMap: Record<string, string> = {
    'Product Updates': 'product-updates-topic-id',
    'Weekly Newsletter': 'weekly-newsletter-topic-id',
    'Promotional Offers': 'promotional-offers-topic-id',
    'System Notifications': 'system-notifications-topic-id',
  };

  return topicNameMap[name] || null;
}

/**
 * Define standard topics as constants
 */
export const RESEND_TOPICS = {
  PRODUCT_UPDATES: 'product-updates-topic-id',
  WEEKLY_NEWSLETTER: 'weekly-newsletter-topic-id',
  PROMOTIONAL_OFFERS: 'promotional-offers-topic-id',
  SYSTEM_NOTIFICATIONS: 'system-notifications-topic-id',
} as const;

// Usage:
// await sendEmailWithTopic({
//   to: 'user@example.com',
//   subject: 'New Feature',
//   html: '<p>Check out our new feature!</p>',
//   topicId: RESEND_TOPICS.PRODUCT_UPDATES,
// });
