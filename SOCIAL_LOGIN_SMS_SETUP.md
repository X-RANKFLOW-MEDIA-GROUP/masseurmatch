# Social Login & SMS Integration Setup

## Social Login Implementation

### Google OAuth Setup

1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `https://yourapp.com/api/auth/callback/google`
   - `https://staging.yourapp.com/api/auth/callback/google`
6. Copy Client ID and Secret
7. Add to environment variables:
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

### GitHub OAuth Setup

1. Go to https://github.com/settings/developers
2. Create new OAuth App
3. Set Authorization callback URL to:
   - `https://yourapp.com/api/auth/callback/github`
4. Copy Client ID and Secret
5. Add to environment variables:
   ```env
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```

## SMS Integration with Twilio

### Setup Twilio Account

1. Sign up at https://www.twilio.com
2. Verify your phone number
3. Get a Twilio phone number
4. Copy Account SID and Auth Token
5. Add to environment variables:
   ```env
   TWILIO_ACCOUNT_SID=your-account-sid
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### SMS Message Types

Implemented SMS notifications for:
- Booking confirmations
- Appointment reminders (24h before)
- Cancellation notices
- Review requests
- Account alerts

### Usage Example

```typescript
// Send SMS notification
await sendSMSNotification(
  phoneNumber: '+1234567890',
  message: 'Your appointment is confirmed for tomorrow at 2 PM'
);
```

## Frontend Implementation

### Social Login Component

Located at: `src/components/auth/SocialLoginButtons.tsx`

Features:
- Google login button
- GitHub login button
- Apple login button (coming soon)
- Loading states
- Error handling
- Smooth redirects

### SMS Notification Component

Located at: `src/components/notifications/SMSNotifications.tsx`

Features:
- SMS preference management
- Opt-in/opt-out UI
- Delivery status tracking
- SMS history view

## Testing Social Login & SMS

### Local Testing

```bash
# Use ngrok to test webhooks locally
ngrok http 3000

# Test social login redirect
curl http://localhost:3000/api/auth/callback/google?code=test_code
```

### Production Testing

1. Create test accounts in each platform
2. Verify OAuth flow works end-to-end
3. Test SMS delivery with real phone numbers
4. Monitor delivery rates and errors

## Status
- Social Login: Ready for implementation
- SMS Integration: Ready for implementation
- Components: Created and tested
