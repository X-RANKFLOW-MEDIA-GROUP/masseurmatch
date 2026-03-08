

## Add Newsletter Welcome Email

### Approach

Use the existing `send-notification-email` edge function infrastructure. Add a `newsletter_welcome` template and trigger it from the frontend after successful subscription.

### Changes

**1. Add `newsletter_welcome` template to `send-notification-email/index.ts`**

Add a new case in the `getTemplate` switch that sends a branded welcome email with:
- Subject: "Welcome to the MasseurMatch Newsletter!"
- Body: greeting, confirmation of subscription, what to expect (therapist spotlights, wellness tips), unsubscribe note
- From: `MasseurMatch <newsletter@masseurmatch.com>`

**2. Update `NewsletterSignup.tsx`**

After successful insert (not duplicate), call the edge function to send the welcome email. Since the subscriber is anonymous (no `user_id`), invoke the function directly with the email address instead of a user_id:

```ts
await supabase.functions.invoke("send-notification-email", {
  body: { email: trimmed, template: "newsletter_welcome", data: {} }
});
```

**3. Update `send-notification-email/index.ts` handler**

Modify the request handler to accept either `user_id` (existing flow — looks up email from profiles) or direct `email` field for anonymous sends like newsletter. Add a guard so only the `newsletter_welcome` template can be used with direct email (prevents abuse).

### No database changes needed

The existing `newsletter_subscribers` table and RLS policies are sufficient.

