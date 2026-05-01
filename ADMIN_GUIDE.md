# Admin Dashboard Quick Reference

## Navigation Structure

### Main Dashboard
**Route**: `/admin`
**Purpose**: Overview of key metrics and quick links
**Features**:
- Total therapists count
- Pending approvals count
- Weekly approval metrics
- Recent complaints
- Direct links to all sections

---

## Therapist Approvals Workflow

### Browse Pending Approvals
**Route**: `/admin/approvals`
**Features**:
- Filter: Pending, Approved, Rejected, Changes Requested, All
- Shows: Name, email, city, ID verification status, completion %, time waiting
- Sort: Newest submitted first
- Click any card to see details

**Keyboard/URL Shortcuts**:
- `/admin/approvals?status=pending` - Pending only
- `/admin/approvals?status=approved` - Approved profiles
- `/admin/approvals?status=rejected` - Rejected profiles

### Review Single Profile
**Route**: `/admin/approvals/[id]`
**Left Side (Profile Info)**:
- Bio and specialties
- In-call and out-call rates
- Photo gallery with moderation status

**Right Side (Admin Actions)**:
- Profile completion progress bar
- Verification status (identity, phone)
- Admin notes textarea (add/edit feedback)
- Action buttons:
  - **Approve Profile** (green) - Goes live immediately
  - **Request Changes** (yellow) - Therapist sees feedback, can resubmit
  - **Reject Profile** (red) - Therapist must resubmit entire profile
- Timeline showing submission/review dates

**Workflow Tips**:
1. Check ID verification status first
2. Review all photos for appropriateness
3. Verify profile completion is 100%
4. Add specific feedback if requesting changes
5. Click action button to finalize decision

---

## Client Complaints

### View Complaints Queue
**Route**: `/admin/complaints`
**Features**:
- Filter: Pending Review, Resolved, Dismissed, All
- Shows: Reported therapist, category, complaint snippet, days ago
- Categories: Inappropriate Photos, Fake Profile, Harassment, Scam, Other
- Click any card for detail page

**Workflow**:
1. Review pending complaints first
2. Investigate reported therapist's profile
3. Check complaint history for this therapist
4. Take action: Resolve (mark investigated) or Dismiss (no violation)

---

## Photo & Document Moderation

### Review Flagged Content
**Route**: `/admin/moderation`
**Features**:
- Comprehensive moderation queue
- Shows flagged photos and profile texts
- Displays AI moderation reason
- Approve (keep on profile) or Reject (remove/notify therapist)
- Filter by pending, approved, rejected

**Batch Operations**:
- Approve/reject multiple items
- Add reason notes for therapist
- Track moderation history

---

## Platform Analytics

### View Real-Time Metrics
**Route**: `/admin/analytics`
**Metrics Displayed**:

**Profile Stats**:
- Total therapists registered
- Approved profiles (live)
- Pending approval (in review)
- Rejected profiles

**Issue Tracking**:
- Pending complaints
- Flagged photos (in queue)
- Average approval time (hours)
- Weekly approval count

**Performance Indicators**:
- Approval rate (approved / total %)
- Complaint resolution rate
- Photo approval rate

**Tips**:
- Check "Avg Approval Time" to identify bottlenecks
- Monitor "Pending Complaints" weekly
- Track "Weekly Approvals" to measure team velocity

---

## Common Admin Tasks

### Task: Approve a New Therapist
1. Go to `/admin/approvals?status=pending`
2. Click on newest therapist
3. Review profile info, photos, specialties
4. Check identity verification ✓
5. Verify profile completion = 100%
6. (Optional) Add notes like "Great photos and verified ID"
7. Click "Approve Profile" button
8. Therapist gets approval email, profile goes live

### Task: Request Profile Improvements
1. Go to `/admin/approvals` and click profile
2. In "Admin Notes" add specific feedback:
   - "Please add bio describing your experience"
   - "Rates should be in $50-150 range"
   - "Add at least 3 professional photos"
3. Click "Request Changes" button
4. Therapist sees red banner with your feedback
5. Therapist can update profile and resubmit
6. You'll see new submission when ready for review again

### Task: Reject a Profile (Policy Violation)
1. Go to `/admin/approvals` and click profile
2. In "Admin Notes" explain the reason:
   - "Photos contain inappropriate content"
   - "Profile violates our terms of service"
   - "Unverified identity cannot continue"
3. Click "Reject Profile" button
4. Therapist gets rejection email with your feedback
5. Therapist must create new profile to reapply

### Task: Investigate a Complaint
1. Go to `/admin/complaints?status=pending`
2. Click complaint about therapist
3. Review: complaint date, category, description
4. Click link to view therapist's profile
5. Check: photos, reviews, verification status
6. Decide:
   - **Dismiss** - No violation found, close ticket
   - **Resolve & Suspend** - Multiple violations, remove profile
   - **Resolve & Warn** - First-time, send warning email

### Task: View Platform Health
1. Go to `/admin/analytics`
2. Check key metrics:
   - Are approvals keeping up? (days < 2 is good)
   - Are complaints trending up? (investigate if so)
   - Which cities have most therapists?
3. If metrics look bad:
   - Longer approval times? Need more reviewers
   - More complaints? Might need stricter screening
   - Uneven city distribution? Consider marketing in gaps

---

## Pro Tips

💡 **Batch Approvals**: Use filter to show only pending, then approve all qualified profiles at once

💡 **Speed Up Reviews**: Look for photos with red flags first, skip verification if already done

💡 **Document Feedback**: Always add admin notes so therapist knows exactly what to fix

💡 **Monitor Trends**: Check analytics weekly for patterns in complaints or approval times

💡 **Escalate Issues**: If therapist has 3+ complaints, consider suspension even if unverified

💡 **Quality Over Speed**: An approved profile with 1 complaint is worse than careful review now

---

## Keyboard Shortcuts

- `/admin` - Dashboard
- `/admin/approvals` - Pending approvals
- `/admin/approvals?status=approved` - Approved profiles
- `/admin/complaints` - Complaints queue
- `/admin/moderation` - Photo moderation
- `/admin/analytics` - Real-time metrics

---

## Support

**Can't find a profile?**
- Make sure you're using the right filter (pending/approved/rejected/all)
- Try searching by therapist ID or email in the complaint/moderation queue

**Profile won't approve?**
- Check all required fields are filled (completion % = 100)
- Verify identity check passed
- Check admin notes if there's an issue blocking approval

**Need to undo an action?**
- Go to profile page and re-take the action (e.g., reject again, then approve)
- Contact dev team if you need full rollback of specific actions

---

**Last Updated**: May 1, 2026
**Version**: 1.0
