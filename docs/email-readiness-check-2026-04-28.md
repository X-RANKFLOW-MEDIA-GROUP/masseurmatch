# Email readiness check

Date: 2026-04-28

## Confirmed in repository

- Contact inquiries trigger therapist notification send attempts via `/api/email/send`.
- Generic email send endpoint supports inquiry confirmation and therapist notification templates.
- Auth callback queues lifecycle emails after signup.
- Forgot-password flow uses Supabase reset email.
- Notification preferences API includes email channel toggles.

## Risks to validate in environment

- `RESEND_API_KEY` configured in production/staging.
- `NEXT_PUBLIC_APP_URL` configured to avoid localhost links in emails.
- Lifecycle queue worker cron is enabled (`process-lifecycle-email-queue`).

## Recommended immediate action

Run end-to-end tests in staging for:
1. Inquiry confirmation email to client.
2. Inquiry notification email to therapist.
3. Post-signup lifecycle email insertion and processing.
4. Forgot-password email delivery and redirect correctness.
