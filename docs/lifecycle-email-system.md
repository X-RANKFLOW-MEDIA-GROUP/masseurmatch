# MasseurMatch — Lifecycle Email & Campaign System
# Complete Implementation Document
# Role: Lifecycle Marketing Lead
# Language: English (all copy final)
# Last updated: February 2026

---

## BLOCO A: EMAIL INFRASTRUCTURE AND COMPLIANCE

### A1. Recommended From Addresses

All marketing and transactional emails must use separate subdomains to protect sender reputation.

Transactional (subdomain: mail.masseurmatch.com)
1. noreply@mail.masseurmatch.com — Email verification, password reset
2. security@mail.masseurmatch.com — Password changed, new login alerts
3. receipts@mail.masseurmatch.com — Payment confirmations, invoices
4. billing@mail.masseurmatch.com — Payment failed, plan changes, cancellations
5. onboarding@mail.masseurmatch.com — Welcome series, profile completion nudges
6. notifications@mail.masseurmatch.com — Profile approved, profile rejected, status updates
7. safety@mail.masseurmatch.com — Report confirmations, moderation actions
8. privacy@mail.masseurmatch.com — Privacy policy updates, data requests
9. abuse@mail.masseurmatch.com — Abuse reports (inbound only, listed in headers)

Marketing (subdomain: updates.masseurmatch.com)
10. newsletter@updates.masseurmatch.com — Weekly newsletters, content digests
11. updates@updates.masseurmatch.com — Product announcements, feature launches
12. community@updates.masseurmatch.com — City digests, community highlights

### A2. DKIM, SPF, DMARC Configuration

DNS Records Required:

SPF Record (for each subdomain):
  Type: TXT
  Host: updates.masseurmatch.com
  Value: v=spf1 include:_spf.resend.com ~all

DKIM Record:
  Type: CNAME
  Host: resend._domainkey.updates.masseurmatch.com
  Value: (provided by Resend dashboard after domain verification)

DMARC Record:
  Type: TXT
  Host: _dmarc.masseurmatch.com
  Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@masseurmatch.com; pct=100; adkim=s; aspf=s

Critical Rules:
1. Transactional emails use mail.masseurmatch.com — never mixed with marketing.
2. Marketing emails use updates.masseurmatch.com — isolated reputation.
3. If marketing subdomain reputation degrades, transactional delivery is unaffected.
4. Monitor DMARC reports weekly for the first 90 days.

### A3. Suppression List and Unsubscribe Rules

Suppression Categories:
1. Hard bounces — permanently suppress after 1 bounce
2. Soft bounces — suppress after 3 consecutive soft bounces within 14 days
3. Spam complaints — permanently suppress immediately, log for audit
4. Manual unsubscribes — suppress within 1 second of click, no confirmation page required
5. Role-based addresses (info@, admin@, support@) — never add to marketing lists

Unsubscribe Implementation:
1. Every marketing email must contain a one-click unsubscribe link in the footer
2. Every marketing email must include a List-Unsubscribe header (RFC 8058)
3. Unsubscribe must take effect immediately, no "are you sure" screens
4. Unsubscribe page shows: "You have been unsubscribed. You will no longer receive marketing emails from MasseurMatch."
5. Users can re-subscribe only from their dashboard settings, never from email
6. Transactional emails are exempt from unsubscribe (verify, reset, receipts, security alerts)

### A4. Frequency Policy by Segment

Therapist Segments:
  Free plan: Maximum 1 email per week (newsletter) + triggered automations
  Starter plan: Maximum 2 emails per week (newsletter + 1 product update)
  Pro plan: Maximum 2 emails per week (newsletter + 1 feature highlight)
  Elite plan: Maximum 2 emails per week (newsletter + 1 exclusive insight)
  Trial users: Automation sequence takes priority, newsletter paused during trial flow

Client Segments:
  Active clients: Maximum 1 email per week (educational content)
  Inactive clients (30+ days): Maximum 1 email every 2 weeks (re-engagement)
  New clients (first 30 days): Welcome series + 1 newsletter per week

Global Rules:
1. Never send marketing emails on the same day as a transactional email
2. Respect a 24-hour cooldown between any two marketing emails
3. Cap at 8 marketing emails per month per recipient across all campaigns
4. Suppress marketing sends on major US holidays (Thanksgiving, Christmas Day, New Year)
5. If spam complaint rate exceeds 0.08%, pause all marketing sends and audit

---

## BLOCO B: SEGMENTATION AND TRIGGERS

### B1. Primary Segments

SEGMENT: Therapist — Free Plan
  Definition: Provider account, no active subscription, email verified
  Objective: Educate on platform value, drive trial or paid conversion
  Core Message: You have a free listing. Here is how to get more visibility.
  CTA: Start your free trial / Upgrade your plan

SEGMENT: Therapist — Starter Plan
  Definition: Provider account, active Starter subscription
  Objective: Maximize feature usage, retain, upsell to Pro
  Core Message: You are getting noticed. Here is how to stand out even more.
  CTA: Explore Pro features / Optimize your profile

SEGMENT: Therapist — Pro Plan
  Definition: Provider account, active Pro subscription
  Objective: Deepen engagement, showcase ROI, upsell to Elite
  Core Message: You are a top-tier professional. Here are tools to stay ahead.
  CTA: Go Elite / View your analytics

SEGMENT: Therapist — Elite Plan
  Definition: Provider account, active Elite subscription
  Objective: Retain, provide exclusive value, make them advocates
  Core Message: You are in our top tier. Here is your exclusive advantage.
  CTA: Access exclusive features / Share your success

SEGMENT: Therapist — Trial Active
  Definition: Provider with active trial, more than 3 days remaining
  Objective: Drive feature adoption before trial ends
  Core Message: Your trial is active. Make the most of these premium features.
  CTA: Complete your profile / Explore features

SEGMENT: Therapist — Trial Ending (3 days)
  Definition: Provider with trial ending in 3 days or less
  Objective: Convert to paid before trial expires
  Core Message: Your trial ends soon. Keep your premium visibility.
  CTA: Choose a plan / Add payment method

SEGMENT: Therapist — Paid Active
  Definition: Provider with active paid subscription, payment current
  Objective: Retain, increase engagement, reduce churn
  Core Message: Your plan is active. Here is what is new for you this week.
  CTA: Check your stats / Explore new features

SEGMENT: Therapist — Past Due
  Definition: Provider with failed payment, grace period active
  Objective: Recover payment, prevent involuntary churn
  Core Message: Your payment could not be processed. Update to keep your features.
  CTA: Update payment method

SEGMENT: Therapist — Profile Incomplete
  Definition: Provider with profile missing bio, photos, or identity verification
  Objective: Drive profile completion to go live
  Core Message: Your profile is almost ready. Complete these steps to go live.
  CTA: Finish your profile

SEGMENT: Therapist — Profile Live
  Definition: Provider with active, approved profile visible in directory
  Objective: Drive ongoing optimization and engagement
  Core Message: Your profile is live. Here is how it is performing.
  CTA: View your profile stats

SEGMENT: Therapist — High Views Low Leads
  Definition: Provider with 50+ profile views in 30 days but fewer than 3 contact taps
  Objective: Help improve conversion from views to inquiries
  Core Message: People are viewing your profile but not reaching out. Here is why and how to fix it.
  CTA: Optimize your profile / Update your photos

SEGMENT: Therapist — New City Added
  Definition: Provider who added a new service area or travel destination in the last 7 days
  Objective: Help them maximize visibility in the new city
  Core Message: You are now listed in a new city. Here is how to attract clients there.
  CTA: Update availability for the new city

SEGMENT: Therapist — Travel Mode Active
  Definition: Provider with active travel dates in provider_travel table
  Objective: Maximize bookings during travel, remind about availability updates
  Core Message: You are traveling to a new city. Make sure your profile is optimized for visitors.
  CTA: Check your travel listing

SEGMENT: Client — Active
  Definition: Client account with at least 1 session in the last 30 days
  Objective: Educate, build trust, encourage exploration
  Core Message: Discover more about professional massage therapy and how to choose the right therapist.
  CTA: Explore therapists near you

SEGMENT: Client — Inactive
  Definition: Client account with no session in 30+ days
  Objective: Re-engage gently with educational content
  Core Message: We have new therapists and resources for you.
  CTA: See what is new

### B2. City-Based Segments

Primary City: The city set in the provider or client profile
Target Cities: Cities added as service areas or travel destinations

Use city data to:
1. Include city-specific therapist counts in newsletters
2. Trigger "City Demand Digest" automations for providers
3. Personalize subject lines with city name for higher open rates

---

## BLOCO C: 12-WEEK THERAPIST NEWSLETTER CALENDAR

### WEEK 1
Theme: Profile Optimization Fundamentals
Subject A: Your profile checklist — are you missing anything?
Subject B: 5 things clients look for before reaching out
Preheader: Complete profiles get 3x more views. Here is your checklist.
Body:
Hi [Name],

Welcome to your weekly MasseurMatch update. This week, we are focusing on the foundation of your success on the platform: your profile.

A complete, professional profile is the single most important factor in getting inquiries. Here is what matters most:

1. A clear, recent headshot as your primary photo.
2. A bio that describes your training, specialties, and approach in your own words.
3. Accurate pricing for both incall and outcall services.
4. Your availability set and up to date.
5. Identity verification completed.

Therapists with all five elements completed see an average of 3x more profile views than those with incomplete listings.

Take two minutes today to review your profile and fill in anything that is missing.

Primary CTA: Review My Profile
Secondary CTA: View Profile Tips
Add-on: Identity Verification — verified badges increase trust and visibility
Plan Variation: Free users see "Upgrade to get priority placement in search results." Starter users see "Your Starter plan includes enhanced profile features. Make sure you are using them." Pro and Elite users see "Your plan includes premium profile tools. Here is how to maximize them."

### WEEK 2
Theme: Photo Best Practices
Subject A: Your photos are your first impression — make them count
Subject B: What kind of photos get the most profile views?
Preheader: Professional photos increase inquiries by up to 40 percent.
Body:
Hi [Name],

This week, let us talk about photos. Your images are the first thing potential clients see, and they make a decision in seconds.

Here is what works best on MasseurMatch:

1. Use natural lighting. Avoid dark or overly edited images.
2. Show your professional environment — your workspace, your equipment, your setup.
3. Include at least 3 photos: a clear headshot, a workspace shot, and one showing you in a professional setting.
4. All photos must follow our Photo Policy: recent, fully clothed, and professional.
5. Avoid stock photos, heavy filters, or images with text overlays.

Our photo moderation team reviews every upload to ensure quality and professionalism across the platform.

Upload or update your photos today and see the difference.

Primary CTA: Upload Photos
Secondary CTA: Read Photo Policy
Add-on: Photo Moderation — all photos reviewed for quality and professionalism, included on all plans
Plan Variation: Free users see "Upload up to 3 photos on your Free plan." Starter and above see "Your plan supports additional photo uploads. Fill all available slots."

### WEEK 3
Theme: Writing a Bio That Converts
Subject A: How to write a bio that actually gets you clients
Subject B: Your bio is your elevator pitch — here is how to nail it
Preheader: A strong bio turns profile visitors into inquiries.
Body:
Hi [Name],

Your bio is where clients decide if you are the right fit. It is not a resume — it is a conversation starter.

Here is a simple framework:

1. Start with what you specialize in and who you help. Example: "I specialize in deep tissue and sports recovery for active professionals."
2. Mention your training and experience briefly. Clients want to know you are qualified, not read your full CV.
3. Describe your approach. Are you clinical and precise? Warm and holistic? Let your personality come through.
4. End with a clear invitation. "Feel free to reach out with any questions" works well.

Keep it between 80 and 150 words. Avoid jargon. Write like you are talking to a friend who asked what you do.

Review your bio today and see if it passes this test: Would a stranger know exactly what to expect from a session with you?

Primary CTA: Edit My Bio
Secondary CTA: See Bio Examples
Add-on: AI FAQ Generator — auto-generate common questions and answers for your profile (Pro and Elite)
Plan Variation: Free and Starter see "Write a compelling bio to stand out." Pro and Elite see "Use our AI FAQ tool to add common questions to your profile automatically."

### WEEK 4
Theme: Pricing Strategy
Subject A: Are you pricing yourself right? Here is how to check
Subject B: Pricing transparency builds trust — and inquiries
Preheader: Set clear pricing to attract the right clients.
Body:
Hi [Name],

Pricing is one of the most viewed elements on any profile. Clients want clarity before they reach out.

Here is what we recommend:

1. List both incall and outcall rates clearly. If you only offer one, make that obvious.
2. Price competitively for your market. Check what other therapists in your city charge.
3. If you offer different session lengths, mention them in your bio or FAQ.
4. Avoid vague pricing like "contact for rates" — it reduces inquiries significantly.

Therapists with transparent pricing receive up to 2x more contact taps than those without.

Being upfront about your rates attracts serious, qualified clients and filters out poor fits before they even message you.

Primary CTA: Update Pricing
Secondary CTA: View Market Rates
Add-on: N/A
Plan Variation: All plans receive the same content. Free users see "Set your rates to start appearing in filtered searches."

### WEEK 5
Theme: Verification and Trust Signals
Subject A: Why verified therapists get more inquiries
Subject B: Build instant trust with identity verification
Preheader: Verified profiles are preferred by 80 percent of clients.
Body:
Hi [Name],

Trust is everything in a professional services directory. Clients are choosing someone to work with in person, and they need confidence that you are who you say you are.

That is why MasseurMatch offers identity verification powered by secure government ID checks.

What verification does for you:

1. You get a verified badge on your profile — visible in search results and on your page.
2. Verified therapists appear higher in search rankings.
3. Clients can filter to show only verified providers.
4. It signals professionalism and commitment to safety.

The process takes about 2 minutes. You will need a valid government-issued photo ID. Everything is processed securely and your ID images are never stored after verification.

If you have not verified yet, do it today. If you already have, thank you — you are part of what makes this platform trustworthy.

Primary CTA: Get Verified
Secondary CTA: Learn About Our Verification Process
Add-on: Identity Verification — free on all plans, powered by Stripe Identity
Plan Variation: Same content across all plans. Already-verified users see "Thank you for being verified. Share your profile with confidence."

### WEEK 6
Theme: Availability and Scheduling
Subject A: Clients are searching right now — is your availability set?
Subject B: Available Now gets you seen first
Preheader: Keep your availability current to appear in real-time searches.
Body:
Hi [Name],

When a client searches for a therapist, availability is one of the top filters they use. If your schedule is not set, you are invisible to those clients.

Here is how to make the most of availability:

1. Set your regular business hours in your dashboard.
2. Update your availability whenever it changes — even small updates help.
3. Therapists with current availability appear higher in search results.
4. If you are fully booked for the day, mark yourself as unavailable so clients have accurate expectations.

The more accurate your availability, the more qualified the inquiries you receive. Clients prefer therapists who clearly show when they are available.

Spend 30 seconds updating your hours today.

Primary CTA: Set Availability
Secondary CTA: View Dashboard
Add-on: N/A
Plan Variation: All plans. Pro and Elite see "Your plan includes priority placement when you mark yourself as available."

### WEEK 7
Theme: Travel Feature Deep Dive
Subject A: Traveling to a new city? Get listed there automatically
Subject B: Expand your reach — how travel mode works
Preheader: Add travel dates and appear in new city listings instantly.
Body:
Hi [Name],

If you travel for work, MasseurMatch makes it easy to get visibility in your destination city.

How it works:

1. Go to your Dashboard and open Travel Schedule.
2. Add your destination city and travel dates.
3. During those dates, your profile automatically appears in the destination city listings.
4. Your home city listing is paused while you are traveling.
5. A "Visiting" badge appears on your profile so clients know you are temporarily available.

This is a powerful way to build your client base across multiple cities without maintaining separate listings.

Pro tip: Add travel dates at least a week in advance so clients in the destination city can plan ahead.

Primary CTA: Add a Trip
Secondary CTA: Learn About Travel Mode
Add-on: Travel Mode — available on all plans, auto-featured placement for Pro and Elite
Plan Variation: Free and Starter see "Add travel dates to appear in new cities." Pro and Elite see "Your plan includes automatic featured placement in destination cities with the Visiting badge."

### WEEK 8
Theme: Understanding Your Profile Performance
Subject A: How many people viewed your profile this month?
Subject B: Your profile stats — what they mean and how to improve
Preheader: See how your profile is performing and what to improve.
Body:
Hi [Name],

Knowing how your profile performs helps you make smarter decisions about your listing.

Key metrics to watch:

1. Profile views — how many people visited your profile page.
2. Contact taps — how many people tapped your contact information.
3. View-to-contact ratio — the percentage of viewers who reached out.
4. Search appearances — how often your profile appeared in search results.

If you have high views but low contact taps, your profile may need better photos, a stronger bio, or clearer pricing.

If you have low views overall, consider completing your profile, getting verified, or upgrading your plan for better search placement.

Check your stats this week and identify one thing to improve.

Primary CTA: View My Stats
Secondary CTA: Optimize My Profile
Add-on: Analytics Dashboard — detailed stats available on Starter and above
Plan Variation: Free users see "Upgrade to Starter to access detailed profile analytics." Starter and above see "Your analytics dashboard is updated daily. Check it now."

### WEEK 9
Theme: Safety and Professionalism
Subject A: Safety is our priority — and yours
Subject B: How MasseurMatch protects you and your clients
Preheader: Our safety policies protect everyone on the platform.
Body:
Hi [Name],

MasseurMatch is built on trust and professionalism. Here is how we maintain a safe environment for everyone.

For therapists:

1. All providers must verify their identity before going live.
2. Every photo is reviewed by our moderation team.
3. Profile content is reviewed for accuracy and professionalism.
4. Users can report inappropriate behavior, and our safety team investigates every report.

For your safety:

1. You control your contact information and how clients reach you.
2. You choose whether to offer incall, outcall, or both.
3. You set your own boundaries, schedule, and pricing.
4. Block and report tools are available on every interaction.

We take every report seriously and act within 24 to 48 hours. Thank you for being part of a professional community.

Primary CTA: Review Safety Guidelines
Secondary CTA: Report an Issue
Add-on: N/A
Plan Variation: Same content across all plans.

### WEEK 10
Theme: Client Communication Best Practices
Subject A: How to respond to inquiries professionally
Subject B: First impressions matter — even in messages
Preheader: Better communication leads to more repeat clients.
Body:
Hi [Name],

When a potential client reaches out, your response sets the tone for the entire professional relationship.

Here are tips for effective communication:

1. Respond promptly. Aim for within a few hours during business hours.
2. Be professional and warm. Use their name, confirm what they are looking for, and provide clear next steps.
3. Set expectations upfront. Confirm location, timing, duration, and rate before the appointment.
4. If you cannot accommodate their request, let them know politely and suggest alternatives if possible.
5. After a session, a brief thank-you message builds loyalty and encourages repeat visits.

Professional communication is what separates a good therapist from a great one on any directory platform.

Primary CTA: Check Messages
Secondary CTA: Update Contact Preferences
Add-on: N/A
Plan Variation: Same content across all plans.

### WEEK 11
Theme: Reviews and Reputation (Future Feature Preview)
Subject A: Reputation matters — building yours starts now
Subject B: Why professional credibility is your best marketing
Preheader: Your reputation is your most valuable asset.
Body:
Hi [Name],

While MasseurMatch does not currently have a public review system, your professional reputation is still the most important factor in building a sustainable practice.

Here is how to build credibility on the platform right now:

1. Complete your profile 100 percent. Every field filled adds to your professional image.
2. Get verified. The verified badge is the strongest trust signal available.
3. Keep your information accurate and current. Outdated profiles erode trust.
4. Respond to inquiries professionally and promptly.
5. Add your certifications and training to your profile.

We are building tools to help you showcase your credibility even more. Stay tuned for updates.

In the meantime, invest in your profile. It is the best marketing you can do.

Primary CTA: Complete My Profile
Secondary CTA: Add Certifications
Add-on: Certifications display — available on all plans
Plan Variation: Same content across all plans.

### WEEK 12
Theme: Monthly Recap and What is Next
Subject A: Your month in review — and what is coming next
Subject B: Here is what happened on MasseurMatch this month
Preheader: Your monthly recap plus exciting updates ahead.
Body:
Hi [Name],

Here is your monthly MasseurMatch recap:

This month across the platform:
- New therapists joined in [City] and [City].
- We processed [X] identity verifications.
- Our photo moderation team reviewed [X] uploads.
- [Feature/update] was launched.

Your profile this month:
- [X] profile views
- [X] contact taps
- Your profile completion: [X] percent

Coming next month:
- [Upcoming feature or improvement]
- [Content theme preview]
- [Community highlight]

Thank you for being part of MasseurMatch. We are building this platform for professionals like you, and your feedback matters.

Reply to this email anytime with questions or suggestions.

Primary CTA: View My Dashboard
Secondary CTA: Share Feedback
Add-on: N/A
Plan Variation: Free users see a gentle upsell: "Upgrade to see detailed monthly analytics." Paid users see their actual stats.

---

## BLOCO D: 12-WEEK CLIENT NEWSLETTER CALENDAR

### WEEK 1
Theme: How to Choose a Massage Therapist
Subject A: How to find the right massage therapist for you
Subject B: What to look for when choosing a therapist
Preheader: A simple guide to finding a great therapist with confidence.
Body:
Hi [Name],

Finding the right massage therapist starts with knowing what to look for. Here are a few things to consider:

1. Check their profile for certifications and training.
2. Look for the verified badge — it means their identity has been confirmed.
3. Read their bio to understand their specialties and approach.
4. Review their photos to see their professional environment.
5. Check their availability and pricing for transparency.

MasseurMatch verifies every therapist on the platform. You can browse with confidence knowing that all listings meet our professional standards.

Primary CTA: Browse Therapists
Secondary CTA: Learn About Our Verification Process

### WEEK 2
Theme: Understanding Different Massage Types
Subject A: Deep tissue vs Swedish — which is right for you?
Subject B: A beginner guide to massage therapy types
Preheader: Not sure what type of massage to book? Here is a quick guide.
Body:
Hi [Name],

Not all massages are the same. Here is a quick overview of common types:

Swedish: Gentle, flowing strokes. Great for relaxation and stress relief.
Deep Tissue: Firm pressure targeting deep muscle layers. Ideal for chronic tension.
Sports Recovery: Focused on athletic performance and injury prevention.
Hot Stone: Heated stones placed on the body for deep relaxation.
Thai: Stretching and pressure techniques. No oils, fully clothed.

When browsing therapists on MasseurMatch, you can filter by specialty to find someone who matches your needs.

Primary CTA: Find a Specialist
Secondary CTA: Explore All Types

### WEEK 3
Theme: What to Expect at Your First Session
Subject A: First massage appointment? Here is what to expect
Subject B: Your first session — a step by step guide
Preheader: Everything you need to know before your first appointment.
Body:
Hi [Name],

If it is your first time seeing a massage therapist, here is what to expect:

Before: Communicate any health concerns, injuries, or preferences. Ask about the therapist's approach.
During: The therapist will check in about pressure and comfort. You are always in control.
After: Drink water, rest if needed, and note how you feel over the next day.

Remember, a professional therapist will always prioritize your comfort and consent. If anything feels wrong, speak up immediately.

On MasseurMatch, every listed therapist has been verified and their profile reviewed. Your safety is our priority.

Primary CTA: Find a Therapist
Secondary CTA: Read Safety Guidelines

### WEEK 4
Theme: Safety on MasseurMatch
Subject A: How we keep you safe on MasseurMatch
Subject B: Your safety is our top priority
Preheader: Every therapist is verified. Every profile is reviewed.
Body:
Hi [Name],

MasseurMatch is designed with your safety in mind. Here is how:

1. Every therapist must verify their identity with a government-issued ID.
2. All profile photos are reviewed by our moderation team.
3. Profile content is checked for accuracy and professionalism.
4. You can report any concern and our safety team investigates within 24 to 48 hours.
5. You control all communication — no personal data is shared without your consent.

If you ever feel uncomfortable with any interaction, use the report button or contact our safety team directly. We take every report seriously.

Primary CTA: Browse Verified Therapists
Secondary CTA: Contact Safety Team

### WEEK 5
Theme: How Pricing Works
Subject A: Understanding massage therapy pricing
Subject B: What should a massage session cost?
Preheader: Transparent pricing helps you make the right choice.
Body:
Hi [Name],

Pricing varies based on location, specialization, and session type. Here is a general guide:

Incall sessions (at the therapist's location) tend to be more affordable.
Outcall sessions (therapist comes to you) typically include a travel fee.
Session length matters — most therapists offer 60, 90, or 120-minute options.
Specialized techniques like sports recovery may be priced higher.

On MasseurMatch, most therapists list their rates directly on their profile. Look for clear pricing as a sign of professionalism and transparency.

Primary CTA: Compare Therapists
Secondary CTA: Use Smart Match

### WEEK 6
Theme: Using Smart Match
Subject A: Find your perfect therapist in 4 taps
Subject B: Let Smart Match do the work for you
Preheader: Tell us what you need and we will find the best match.
Body:
Hi [Name],

Not sure where to start? Our Smart Match tool helps you find the right therapist in seconds.

How it works:
1. Choose incall, outcall, or either.
2. Set your budget range.
3. Pick your timeframe.
4. Select your preferred massage type.

Smart Match ranks therapists based on your preferences and shows you the top 3 matches. From there, you can view profiles and reach out directly.

It is fast, private, and designed to save you time.

Primary CTA: Try Smart Match
Secondary CTA: Browse All Therapists

### WEEK 7
Theme: Benefits of Regular Massage
Subject A: Why regular massage therapy matters
Subject B: The health benefits of consistent sessions
Preheader: Science-backed reasons to make massage a routine.
Body:
Hi [Name],

Regular massage therapy is more than a luxury. Research shows consistent sessions can:

1. Reduce chronic pain and muscle tension.
2. Lower stress hormones and improve sleep quality.
3. Improve circulation and flexibility.
4. Support recovery from injury or surgery.
5. Boost immune function over time.

Finding a therapist you trust makes it easier to build a routine. Many clients on MasseurMatch see the same therapist regularly for the best results.

Primary CTA: Find a Therapist
Secondary CTA: Explore Specialties

### WEEK 8
Theme: Incall vs Outcall — Which Is Right for You
Subject A: Incall or outcall — how to decide
Subject B: Should the therapist come to you?
Preheader: Understand the differences to choose what works best.
Body:
Hi [Name],

When browsing therapists, you will see two options: incall and outcall.

Incall means you visit the therapist at their professional location. Benefits: dedicated space, professional equipment, often lower cost.

Outcall means the therapist comes to your location. Benefits: convenience, comfort of your own space, no travel needed.

Some therapists offer both. When choosing, consider your comfort level, convenience, and budget.

On MasseurMatch, you can filter by incall, outcall, or either to find exactly what you need.

Primary CTA: Filter by Location Type
Secondary CTA: Browse Therapists

### WEEK 9
Theme: How to Communicate with Your Therapist
Subject A: Better communication leads to better sessions
Subject B: What to tell your therapist before your appointment
Preheader: Simple tips for a great experience.
Body:
Hi [Name],

Good communication with your therapist makes every session better. Here is what to share:

1. Any injuries, medical conditions, or areas of concern.
2. Your preferred pressure level — light, medium, or firm.
3. Areas you want focused on or avoided.
4. Your experience level with massage therapy.

A professional therapist will always ask about your needs and check in during the session. Do not hesitate to speak up at any time.

MasseurMatch therapists are trained professionals who prioritize your comfort and safety.

Primary CTA: Find a Therapist
Secondary CTA: Read Safety Guidelines

### WEEK 10
Theme: Exploring New Cities
Subject A: Traveling? Find verified therapists in your destination
Subject B: Professional massage therapy wherever you go
Preheader: MasseurMatch has therapists in cities across the country.
Body:
Hi [Name],

Whether you are traveling for work or vacation, MasseurMatch helps you find verified therapists in your destination city.

Simply search by city on the Explore page. You will see local therapists plus visiting therapists who are traveling to that area — marked with a "Visiting" badge.

Every therapist on the platform meets the same verification and professionalism standards regardless of location.

Primary CTA: Search by City
Secondary CTA: Try Smart Match

### WEEK 11
Theme: Reporting and Safety Tools
Subject A: How to report a concern on MasseurMatch
Subject B: Your safety tools — know how to use them
Preheader: We take every report seriously. Here is how to reach us.
Body:
Hi [Name],

If you ever have a concern about a therapist or interaction on MasseurMatch, here is what to do:

1. Use the Report button on any profile to flag an issue.
2. Our safety team reviews every report within 24 to 48 hours.
3. You will receive a confirmation email when your report is received.
4. You will be notified when action is taken.

Your reports help keep the platform safe and professional for everyone. All reports are confidential.

Primary CTA: Learn About Safety
Secondary CTA: Contact Support

### WEEK 12
Theme: Monthly Digest and Community Update
Subject A: What happened on MasseurMatch this month
Subject B: Your monthly update — new therapists and features
Preheader: See what is new in your area.
Body:
Hi [Name],

Here is your monthly MasseurMatch digest:

- [X] new verified therapists joined in your area.
- Most popular specialties this month: [Type 1], [Type 2].
- New feature: [Feature name and one-sentence description].

We are constantly improving the platform to make finding a professional massage therapist easier and safer.

Have feedback? Reply to this email — we read every response.

Primary CTA: Browse New Therapists
Secondary CTA: Share Feedback

---

## BLOCO E: AUTOMATION FLOWS — COMPLETE COPY

### E1. THERAPIST WELCOME SERIES (3 EMAILS)

FLOW: therapist_welcome_series
Trigger: New therapist profile created (insert on profiles table)
Exit Conditions: Profile status becomes "active" (goes live) at any point
Suppression: Unsubscribed from marketing, account suspended or banned
Success Metrics: Profile completion rate, time to first photo upload, verification start rate

EMAIL 1 — DAY 0
Subject: Welcome to MasseurMatch — let us get you set up
Preheader: Your activation checklist is ready.
From: onboarding@updates.masseurmatch.com
Body:
Hi [Name],

Welcome to MasseurMatch. We are excited to have you here.

You have taken the first step. Now let us get your profile ready so clients can find you.

Here is your activation checklist:
- Create account — done
- Verify email — done
- Complete your profile — add your bio, specialties, and pricing
- Upload professional photos — at least 3 high-quality images
- Verify your identity — quick and secure, takes about 2 minutes

Therapists who complete all five steps within their first week see significantly more profile views.

Your next step: complete your profile.

Primary CTA: Complete My Profile
Footer: You are receiving this because you created a MasseurMatch account. Unsubscribe.

EMAIL 2 — DAY 2
Delay: 48 hours after Email 1
Subject: Your profile is waiting — here is what to do next
Preheader: A few more steps and you will be live.
From: onboarding@updates.masseurmatch.com
Body:
Hi [Name],

It has been a couple of days since you joined MasseurMatch. How is your profile coming along?

If you have not finished setting up, here is a quick reminder of what matters most:

1. Bio — tell clients who you are and what you specialize in. Keep it under 150 words.
2. Photos — upload at least 3 professional images. Natural lighting, professional setting, fully clothed.
3. Pricing — list your incall and outcall rates clearly.

Once your profile is complete and reviewed, you will be live in the directory and visible to clients in your city.

Need help? Reply to this email and our team will guide you.

Primary CTA: Finish My Profile
Footer: You are receiving this because you created a MasseurMatch account. Unsubscribe.

EMAIL 3 — DAY 6
Delay: 4 days after Email 2
Subject: Last step — go live this week
Preheader: Complete your profile and start getting visibility.
From: onboarding@updates.masseurmatch.com
Body:
Hi [Name],

You are almost there. Just a few more items and your profile will be live on MasseurMatch.

Here is what you still need:
[Dynamic: list of incomplete items — bio, photos, verification, pricing]

Completing your profile means:
- Appearing in search results for clients in your city.
- Being eligible for featured placement.
- Building trust with the verified badge.

Do not miss out. Complete your profile today and go live this week.

Primary CTA: Go Live Now
Footer: You are receiving this because you created a MasseurMatch account. Unsubscribe.

---

### E2. PROFILE COMPLETION NUDGE (2 EMAILS)

FLOW: profile_completion_nudge
Trigger: Profile created but missing bio OR photos OR identity verification after 24 hours
Exit Conditions: Profile becomes complete (all required fields filled)
Suppression: Already in welcome series (suppress if Day 2 email not yet sent), unsubscribed
Success Metrics: Fields completed within 48 hours, full completion rate

EMAIL 1 — 24 HOURS AFTER PROFILE CREATION
Subject: Your profile is 70 percent done — finish it now
Preheader: Just a few more fields and you are live.
From: onboarding@updates.masseurmatch.com
Body:
Hi [Name],

Your MasseurMatch profile is almost complete. Here is what is still missing:

[Dynamic checklist of missing items]

Completing your profile is the fastest way to start appearing in client searches. It only takes a few minutes.

Primary CTA: Complete Profile
Footer: Unsubscribe.

EMAIL 2 — 72 HOURS AFTER PROFILE CREATION
Delay: 48 hours after Email 1
Subject: Clients are searching in [City] — is your profile ready?
Preheader: [X] clients searched for therapists in [City] this week.
From: onboarding@updates.masseurmatch.com
Body:
Hi [Name],

Clients in [City] are actively searching for massage therapists. Right now, your profile is not visible because it is incomplete.

Here is what you need to finish:
[Dynamic checklist]

Therapists who go live within their first week receive the most initial visibility. Do not miss your window.

Complete your profile now and start getting seen.

Primary CTA: Finish and Go Live
Footer: Unsubscribe.

---

### E3. TRIAL STARTED (1 EMAIL)

FLOW: trial_started
Trigger: User starts a paid plan trial (Stripe trial_start event or manual flag)
Exit Conditions: N/A (single email)
Suppression: Unsubscribed from marketing
Success Metrics: Feature adoption rate during trial, conversion to paid

EMAIL — IMMEDIATE
Subject: Your 14-day free trial is active — here is what you get
Preheader: Full access to [Plan Name] features for 14 days.
From: billing@updates.masseurmatch.com
Body:
Hi [Name],

Your [Plan Name] free trial is now active. For the next 14 days, you have full access to:

- Priority search placement
- Featured profile in your city
- Enhanced analytics dashboard
- [Plan-specific features]

Your trial ends on [Date]. No charge until then.

To keep these features after your trial, add a payment method before [Date]. If you decide it is not for you, your account will simply revert to the Free plan.

Make the most of your trial — start by checking your enhanced dashboard.

Primary CTA: Explore My Features
Secondary CTA: Manage Subscription
Footer: Unsubscribe.

---

### E4. TRIAL ENDING (2 EMAILS)

FLOW: trial_ending
Trigger: Trial end date minus 3 days (first email), trial end date minus 1 day (second email)
Exit Conditions: User converts to paid plan
Suppression: Unsubscribed, already converted to paid
Success Metrics: Trial-to-paid conversion rate

EMAIL 1 — 3 DAYS BEFORE TRIAL ENDS
Subject: Your trial ends in 3 days — keep your premium features
Preheader: Add a payment method to continue without interruption.
From: billing@updates.masseurmatch.com
Body:
Hi [Name],

Your [Plan Name] trial ends on [Date]. That is just 3 days away.

During your trial, your profile has received:
- [X] additional views from priority placement
- [X] search appearances from featured listing

To keep these benefits, add your payment method before [Date]. Your first charge will be [Amount] on [Date].

If you choose not to continue, your account will revert to the Free plan and you will lose premium placement and features.

Primary CTA: Add Payment Method
Secondary CTA: Compare Plans
Footer: Unsubscribe.

EMAIL 2 — 1 DAY BEFORE TRIAL ENDS
Subject: Tomorrow your trial ends — last chance to keep your features
Preheader: Your premium features expire tomorrow.
From: billing@updates.masseurmatch.com
Body:
Hi [Name],

This is your final reminder. Your [Plan Name] trial ends tomorrow, [Date].

After that:
- Your profile will lose priority search placement.
- Featured listing will be removed.
- Premium analytics will no longer be available.

It takes 30 seconds to add a payment method and keep everything you have been using.

Primary CTA: Keep My Features
Footer: Unsubscribe.

---

### E5. PAYMENT FAILED (2 EMAILS)

FLOW: payment_failed
Trigger: Stripe payment_intent.payment_failed or invoice.payment_failed event
Exit Conditions: Payment succeeds (subscription becomes active)
Suppression: Account suspended or banned (Note: payment failed emails are semi-transactional, do not suppress for marketing unsub)
Success Metrics: Payment recovery rate, time to resolution

EMAIL 1 — IMMEDIATE
Subject: Your payment could not be processed
Preheader: Update your card to keep your plan active.
From: billing@mail.masseurmatch.com (transactional subdomain — payment emails are operational)
Body:
Hi [Name],

We tried to process your payment of [Amount] for the [Plan Name] plan, but it was declined.

This can happen if your card expired, has insufficient funds, or if your bank flagged the charge.

Please update your payment method within 3 days to avoid losing your premium features. Your plan remains active during this grace period.

Primary CTA: Update Payment Method
Footer: This is a transactional email related to your account billing. You cannot unsubscribe from billing notifications.

EMAIL 2 — 48 HOURS AFTER FIRST EMAIL
Delay: 48 hours after Email 1
Subject: Urgent — your plan will be downgraded tomorrow
Preheader: Last chance to update your payment and keep your features.
From: billing@mail.masseurmatch.com
Body:
Hi [Name],

We still have not been able to process your payment of [Amount]. Your [Plan Name] plan will be downgraded to Free tomorrow if we cannot charge your card.

This means you will lose:
- Priority search placement
- Featured profile listing
- Premium analytics
- [Other plan-specific features]

Update your payment method now to keep your plan active.

Primary CTA: Update Payment Now
Footer: This is a transactional email related to your account billing.

---

### E6. RE-ENGAGEMENT (2 EMAILS)

FLOW: re_engagement
Trigger: No login and no profile update for 30 days (first email), 45 days (second email)
Exit Conditions: User logs in or updates profile
Suppression: Unsubscribed, account suspended, account banned
Success Metrics: Reactivation rate (login within 7 days of email)

EMAIL 1 — 30 DAYS INACTIVE
Subject: We miss you — here is what is new on MasseurMatch
Preheader: New features and therapists in your area.
From: updates@updates.masseurmatch.com
Body:
Hi [Name],

It has been a while since you logged in to MasseurMatch. Here is what you have been missing:

- [X] new therapists joined in [City].
- [New feature] was launched.
- Your profile has had [X] views while you were away.

Your profile is still live, but an outdated profile can hurt your visibility. Take a minute to log in and make sure everything is current.

Primary CTA: Log In to Dashboard
Footer: Unsubscribe.

EMAIL 2 — 45 DAYS INACTIVE
Delay: 15 days after Email 1
Subject: Your profile may be losing visibility
Preheader: Log in to keep your listing active and accurate.
From: updates@updates.masseurmatch.com
Body:
Hi [Name],

It has been 45 days since you last visited MasseurMatch. Profiles that are not updated regularly tend to rank lower in search results.

If you are still offering massage therapy services, log in and update your availability. It takes less than a minute and ensures clients can find you.

If you are no longer practicing, you can deactivate your profile from your dashboard settings.

Either way, we are here to help.

Primary CTA: Update My Profile
Secondary CTA: Deactivate Profile
Footer: Unsubscribe.

---

### E7. CITY DEMAND DIGEST (MONTHLY)

FLOW: city_demand_digest
Trigger: First Monday of each month (cron job)
Exit Conditions: N/A (recurring)
Suppression: Unsubscribed, account inactive for 60+ days
Success Metrics: Open rate, click to dashboard, profile update rate within 48 hours

EMAIL — MONTHLY
Subject: [City] Monthly Demand Report — [Month Year]
Preheader: See how your city performed and where the demand is.
From: updates@updates.masseurmatch.com
Body:
Hi [Name],

Here is your [City] demand digest for [Month]:

Search Activity:
- [X] total searches for therapists in [City]
- Top searched specialties: [Type 1], [Type 2], [Type 3]
- [X] percent of searches filtered by "Available Now"
- [X] percent of searches used Smart Match

Your Profile Performance:
- [X] profile views
- [X] contact taps
- View-to-contact ratio: [X] percent

City Trends:
- [X] new therapists joined [City] this month
- [X] therapists are currently visiting [City] via Travel Mode

Tip: Therapists who update their availability weekly see up to 40 percent more contact taps.

Primary CTA: Update Availability
Secondary CTA: View Full Stats
Footer: Unsubscribe.

---

## BLOCO F: METRICS AND MARKETING DASHBOARD

### F1. Key Performance Indicators

EMAIL HEALTH METRICS:
1. Open Rate — Target: 25 to 35 percent (therapist), 20 to 30 percent (client)
2. Click Rate — Target: 3 to 6 percent
3. Reply Rate — Target: 0.5 to 1 percent (indicates engagement)
4. Unsubscribe Rate — Target: below 0.3 percent per send
5. Spam Complaint Rate — Target: below 0.05 percent (critical threshold: 0.08 percent)
6. Bounce Rate — Target: below 2 percent

BUSINESS METRICS:
7. Conversion to Paid — Target: 8 to 15 percent of trial users
8. Add-on Attach Rate — Target: 5 to 10 percent of paid users per quarter
9. Trial-to-Paid Rate — Target: 20 to 30 percent
10. Payment Recovery Rate — Target: 60 to 70 percent within 72 hours
11. Re-engagement Rate — Target: 15 to 25 percent reactivation within 14 days
12. Profile Completion Rate (from email nudge) — Target: 40 to 60 percent within 72 hours

### F2. Iteration Framework

A/B Testing Protocol:
1. Test one variable at a time: subject line, CTA text, send time, or body copy.
2. Minimum sample size: 200 recipients per variant before declaring a winner.
3. Statistical significance threshold: 95 percent confidence.
4. Run each test for at least 48 hours before evaluating.
5. Document every test result in a shared log with date, hypothesis, result, and next action.

Iteration Cadence:
- Week 1-4: Test subject lines (biggest impact on open rate).
- Week 5-8: Test CTA copy and placement (impact on click rate).
- Week 9-12: Test send timing and frequency.
- Monthly: Review unsubscribe and spam trends, adjust frequency if needed.

### F3. Product Events for Segmentation

Events to track and feed into segmentation:

1. profile_viewed — when a therapist profile is viewed by a client
2. contact_tapped — when a client taps contact info on a profile
3. smart_match_used — when a client completes the Smart Match wizard
4. available_now_toggled — when a therapist marks themselves as available
5. photo_uploaded — when a therapist uploads a new photo
6. profile_updated — when a therapist updates bio, pricing, or specialties
7. travel_added — when a therapist adds a travel destination
8. verification_completed — when identity verification passes
9. subscription_started — when a paid plan begins
10. subscription_cancelled — when a plan is cancelled
11. search_performed — when a client searches with filters
12. city_searched — specific city searched (for demand data)

These events power:
- The "High Views Low Leads" segment (profile_viewed vs contact_tapped ratio)
- City Demand Digest (search_performed, city_searched)
- Re-engagement triggers (absence of any event for 30+ days)
- Smart Match adoption metrics

---

## FINAL DELIVERABLES

### FREQUENCY TABLE BY AUDIENCE AND SEGMENT

THERAPIST SEGMENTS:
  Free Plan — 1 newsletter per week, automations as triggered
  Starter Plan — 1 newsletter + 1 product update per week
  Pro Plan — 1 newsletter + 1 feature highlight per week
  Elite Plan — 1 newsletter + 1 exclusive insight per week
  Trial Active — Automation only (welcome + trial sequence), newsletter paused
  Trial Ending — Trial ending sequence (2 emails in 3 days)
  Past Due — Payment recovery sequence (2 emails in 48 hours, transactional)
  Profile Incomplete — Completion nudge (2 emails in 72 hours)
  Inactive 30 days — Re-engagement email 1
  Inactive 45 days — Re-engagement email 2
  Travel Mode — No additional sends (avoid noise during travel)

CLIENT SEGMENTS:
  Active — 1 educational newsletter per week
  New (first 30 days) — 1 newsletter per week (safety and education focused)
  Inactive 30+ days — 1 re-engagement email every 2 weeks

GLOBAL CAP: 8 marketing emails per month per recipient maximum.

### MONTHLY GROWTH DIGEST (FIXED TEMPLATE)

Sent: First Wednesday of each month
Audience: All active therapists (paid plans)
From: updates@updates.masseurmatch.com

Template Structure:
1. Header: "Your [Month] Growth Report"
2. Section 1: Platform Overview — new therapists joined, total searches, top cities
3. Section 2: Your Profile Stats — views, contact taps, ratio, rank in city
4. Section 3: Feature Spotlight — one feature highlighted with usage tip
5. Section 4: Tips — one actionable tip based on their segment
6. CTA: "View Full Dashboard"
7. Footer: Unsubscribe link

### SAFETY DIGEST (FIXED TEMPLATE)

Sent: Third Wednesday of each month
Audience: All active users (therapists and clients)
From: safety@updates.masseurmatch.com

Template Structure:
1. Header: "MasseurMatch Safety Update — [Month]"
2. Section 1: Safety Stats — reports processed, average response time, actions taken (anonymized)
3. Section 2: Safety Tip — one rotating safety topic (how to report, red flags, communication tips)
4. Section 3: Policy Reminder — brief reminder of one platform policy (photo policy, content policy, etc.)
5. Section 4: Community — "Thank you for keeping MasseurMatch safe"
6. CTA: "Review Safety Guidelines"
7. Footer: Unsubscribe link

### LAUNCH CHECKLIST — 20 ITEMS

1. Verify domain masseurmatch.com with Resend (DKIM, SPF, DMARC)
2. Set up marketing subdomain updates.masseurmatch.com with separate DNS records
3. Confirm transactional subdomain mail.masseurmatch.com is isolated
4. Configure suppression list handling in Resend (auto-suppress hard bounces, complaints)
5. Implement one-click unsubscribe with List-Unsubscribe header on all marketing emails
6. Create marketing_preferences table with opt-in status per user
7. Add newsletter opt-in checkbox to signup flow (unchecked by default)
8. Build unsubscribe endpoint that processes requests within 1 second
9. Test all 20 email templates with Resend sandbox before production
10. Verify all email templates render correctly on Gmail, Outlook, Apple Mail, and mobile
11. Set up email event tracking (opens, clicks, bounces, complaints) via Resend webhooks
12. Configure cron jobs for city demand digest and incomplete profile reminders
13. Test all DB triggers (profile status change, new signup, content flag) end to end
14. Implement 24-hour cooldown logic between marketing sends
15. Set up monthly cap enforcement (8 emails per recipient per month)
16. Create A/B testing framework for subject lines
17. Build internal dashboard to monitor open rate, click rate, unsubscribe rate, spam complaints
18. Document all email templates and triggers in internal wiki
19. Run deliverability test with seed list across major email providers
20. Schedule Week 1 newsletter send for both therapist and client segments

---

END OF DOCUMENT
