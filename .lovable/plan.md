# The Plan: Full Site Restructuring -- Directory Model Compliance

## Summary

Restructure MasseurMatch from a "marketplace" feel into a compliant **advertising directory**. This involves creating 6 new pages, modifying 7 existing pages, updating navigation/footer, adding legal disclaimers, removing booking/marketplace language, and adding SEO infrastructure.

---

## 1. New Pages to Create

### 1a. City Page (`src/pages/City.tsx`)

- Dynamic route `/city/:slug` (e.g., `/city/los-angeles`)
- SEO-optimized editorial intro paragraph about massage in that city
- Reuses filter/list components from Explore
- Therapist cards filtered by city
- Internal links to other cities and related profiles
- Safety disclaimer at bottom

### 1b. FAQ Page (`src/pages/FAQ.tsx`)

- Standalone FAQ page with accordion UI
- Questions covering: how the directory works, verification, pricing for therapists, safety, LGBTQ+ inclusivity
- FAQPage JSON-LD schema markup
- Internal links to Safety, Terms, Privacy

### 1c. Safety Page (`src/pages/Safety.tsx`)

- Clear messaging: directory only, no license verification, no service guarantee
- Safety tips for clients
- How to report concerns
- 18+ notice
- "Adult content prohibited" policy

### 1d. Terms of Service (`src/pages/Terms.tsx`)

- Standard ToS with directory-specific clauses
- No booking/payment processing disclaimers
- Advertising transparency: listings are paid advertisements
- Non-endorsement language

### 1e. Privacy Policy (`src/pages/Privacy.tsx`)

- Standard privacy policy
- Cookie usage, data collection, third-party services

### 1f. Dashboard (`src/pages/Dashboard.tsx`)

- Provider-only area (UI mockup)
- Profile management, analytics overview, plan/billing info
- Upgrade CTAs (only visible to providers)

---

## 2. Existing Page Modifications

### 2a. Home (`Index.tsx`)

- **Add hero search bar** (city + type inputs) that links to `/explore?city=X&type=Y`
- **Add "How It Works"** section (3 steps: Search, Compare, Contact)
- **Add safety disclaimer** strip before footer
- **Add "Featured Cities"** section with links to city pages
- **Remove** "Massage Sessions Booked" stat (implies marketplace) -- replace with "Cities Covered" or "Verified Profiles"
- **Change** "book your next session" to "find your next therapist"

### 2b. Explore (`Explore.tsx`)

- Remove "Book" language from cards
- Add safety disclaimer
- Add internal links to city pages at bottom

### 2c. Therapist Profile (`TherapistProfile.tsx`)

- **Remove** "Book Online" buttons -- replace with "Contact" or "Send Message"
- **Add safety disclaimer** section
- **Add advertising transparency notice**: "This is a paid advertisement. MasseurMatch does not verify credentials or guarantee services."
- **Add "Featured" / "Boosted" labels** where applicable (instead of plan tier names)
- Remove `license` field display (spec says no license verification)

### 2d. Pricing (`Pricing.tsx`)

- Reframe as "Advertising Plans" not growth plans
- Add non-endorsement disclaimer
- Clarify this is for therapist/providers only

### 2e. Auth (`Auth.tsx`)

- Add 18+ age confirmation checkbox on signup
- Add Terms/Privacy agreement checkbox

### 2f. Header (`Header.tsx`)

- Add "Safety" nav link
- Update nav order: Explore, Safety, Pricing, About, Contact
- No client login required per spec -- keep Sign In but make it provider-focused ("Provider Login")

### 2g. Footer (`Footer.tsx`)

- Add links: FAQ, Safety, Terms, Privacy
- Restructure groups: Directory, For Providers, Legal & Safety, Company

---

## 3. Language & Risk Compliance (Global)

All files will be audited for:


| Remove                         | Replace With                                |
| ------------------------------ | ------------------------------------------- |
| "Book Online" / "Book"         | "Contact" / "Send Message" / "Get in Touch" |
| "Massage Sessions Booked"      | "Therapist Profiles" or remove              |
| "marketplace"                  | "directory"                                 |
| Plan tier badges (Elite, Gold) | "Featured" / "Boosted" labels               |
| "instant booking"              | "instant contact"                           |
| License display                | Remove (no license verification claim)      |
| "endorsement" language         | Add non-endorsement disclaimers             |


---

## 4. SEO Infrastructure

### Clean URLs

- `/city/los-angeles` (not query params)
- `/therapist/marcus-rivera` (slug-based)
- `/faq`, `/safety`, `/terms`, `/privacy`

### Routes to add in `App.tsx`

```text
/city/:slug
/faq
/safety
/terms
/privacy
/dashboard
```

### Schema Markup

- Update existing WebSite and FAQPage JSON-LD
- Add `LocalBusiness` schema on city pages
- Add `ProfessionalService` schema on therapist profiles

### Internal Linking

- City pages link to therapist profiles and back
- Footer links to all legal pages
- "Related cities" sections on city pages

---

## 5. Disclaimers & Notices

### Safety Disclaimer Component (`src/components/legal/SafetyDisclaimer.tsx`)

Reusable component displayed on Home, Explore, Profile, and City pages:

- "MasseurMatch is an advertising directory only"
- "We do not verify licenses or credentials"
- "We do not guarantee any services"
- "No booking or payments are processed through this site"
- "Users must be 18+"
- "Adult content is strictly prohibited"

### Advertising Transparency Notice (`src/components/legal/AdTransparency.tsx`)

Shown on therapist profiles:

- "This listing is a paid advertisement"
- "MasseurMatch does not endorse this provider"

---

## 6. Monetization UI Updates

- "Featured" badge (yellow/gold accent) on boosted listings in Explore and Home
- "Sponsored" label on promoted cards
- Clear separation: upgrade CTAs only in Dashboard and Pricing (never on client-facing browse)
- Non-endorsement copy on all monetized labels

---

## File Summary


| Action | File                                                                             |
| ------ | -------------------------------------------------------------------------------- |
| Create | `src/pages/City.tsx`                                                             |
| Create | `src/pages/FAQ.tsx`                                                              |
| Create | `src/pages/Safety.tsx`                                                           |
| Create | `src/pages/Terms.tsx`                                                            |
| Create | `src/pages/Privacy.tsx`                                                          |
| Create | `src/pages/Dashboard.tsx`                                                        |
| Create | `src/components/legal/SafetyDisclaimer.tsx`                                      |
| Create | `src/components/legal/AdTransparency.tsx`                                        |
| Modify | `src/App.tsx` (add 6 routes)                                                     |
| Modify | `src/pages/Index.tsx` (search hero, how it works, cities, disclaimers, language) |
| Modify | `src/pages/Explore.tsx` (remove booking language, add disclaimers)               |
| Modify | `src/pages/TherapistProfile.tsx` (remove booking, add disclaimers, transparency) |
| Modify | `src/pages/Pricing.tsx` (reframe as advertising plans)                           |
| Modify | `src/pages/Auth.tsx` (18+ checkbox, terms agreement)                             |
| Modify | `src/components/layout/Header.tsx` (nav updates)                                 |
| Modify | `src/components/layout/Footer.tsx` (legal links)                                 |
| Modify | `index.html` (additional schema markup)                                          |


---

## Implementation Order

1. Legal components (SafetyDisclaimer, AdTransparency)
2. New pages (FAQ, Safety, Terms, Privacy, City, Dashboard)
3. Route registration in App.tsx
4. Header + Footer updates
5. Home page restructuring
6. Explore + Profile compliance updates
7. Pricing + Auth updates
8. Global language audit
9. SEO schema markup