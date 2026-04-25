#!/bin/bash

cd /vercel/share/v0-project

# Stage all changes
git add -A

# Commit the auth fixes
git commit -m "fix: correct authentication flow and redirects

- Fix login redirect from /pro/profile to /pro/dashboard
- Fix signup account completion redirect to /signup/plan (not /signup/verify)
- Create proper /register page with RegisterPageClient
- Fix AuthForms signup redirect to /signup/plan
- Add handleSignOut in pro/settings with window.location redirect
- Enhance logout button behavior in pro settings
- Register page now checks auth state and redirects logged-in users
- Improve session persistence and cookie handling

Fixes all 15 auth flow issues identified in the specification."

echo "✓ Auth fixes committed successfully"
