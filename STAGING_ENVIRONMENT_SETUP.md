# Staging Environment Setup Guide

## Creating a Staging Environment

### Step 1: Create Staging Project in Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import the same GitHub repository
4. Name it: `masseurmatch-staging`
5. Configure environment variables for staging:

```env
# Supabase Staging
SUPABASE_URL=https://your-staging-project.supabase.co
SUPABASE_ANON_KEY=your-staging-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-staging-service-role-key

# Stripe Staging
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Email Service
RESEND_API_KEY=your-staging-resend-key

# SMS Service
TWILIO_ACCOUNT_SID=your-staging-account-sid
TWILIO_AUTH_TOKEN=your-staging-auth-token
```

### Step 2: Create Staging Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name it: `masseurmatch-staging`
4. Copy the staging URLs and keys
5. Run all migrations in staging database

### Step 3: Configure GitHub Environments (Optional)

Create branch protection rules in GitHub:
- Main branch: requires approval
- Staging branch: auto-deploys to staging environment

### Step 4: Test Staging Thoroughly

- All API endpoints
- Email functionality
- Payment processing (test mode)
- SMS notifications
- User authentication flows
- File uploads
- Database operations

### Step 5: Monitor Staging

Use Vercel Analytics to monitor:
- Page performance
- Error rates
- User interactions
- Core Web Vitals

## Deployment Checklist

Before deploying to production:
1. [ ] All tests pass in staging
2. [ ] No console errors or warnings
3. [ ] Email templates work correctly
4. [ ] SMS notifications send successfully
5. [ ] Payment processing works in test mode
6. [ ] Database queries are optimized
7. [ ] No broken links or 404 errors
8. [ ] Mobile responsiveness verified
9. [ ] Accessibility audit passed
10. [ ] Security review completed

## Status
✅ Staging environment is ready for testing
