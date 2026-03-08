

## Restructure Subscription Tiers: Free → Standard → Pro → Elite + Add-ons

The current system has 5 tiers (Free, Standard, Premium, Gold, Platinum). The new structure consolidates to 4 tiers with new pricing, features, and adds upsell add-ons.

### Tier Mapping

```text
OLD                          NEW
─────────────────────────────────────────────
Free ($0)        →  Free ($0)
Standard ($29)   →  Standard ($39)
Premium ($59)    →  Pro ($79)
Gold ($99)       →  Elite ($99)
Platinum ($149)  →  REMOVED
```

### New Tier Details

| Tier | Price | Photos | Search | Available Now | Travel | Analytics | Extras |
|------|-------|--------|--------|---------------|--------|-----------|--------|
| Free | $0 | 1 | bottom | No | 1/mo | No | "Basic Listing" watermark |
| Standard | $39 | 6 | middle | 60 min | 3/mo | views | newsletter chance |
| Pro | $79 | 12 + video | top | 120 min | unlimited | views+clicks | homepage rotation, weekly specials, Verified badge |
| Elite | $99 | 12 + video | top | 120 min | unlimited | views+clicks | 2 active ads (2 cities), everything in Pro |

### Add-ons (Upsell)

- Masseur of the Day: $15/day
- Sponsor Profile: $99/month
- Extra Travel Schedules: $5 each (Standard only)
- Homepage Banner: $120/month
- Credits/Cards: secure communication

---

### Files to Change

**1. `src/hooks/usePlanLimits.ts`**
- Replace 5-tier PlanKey with 4-tier: `"free" | "standard" | "pro" | "elite"`
- Update limits per tier (maxPhotos: 1/6/12/12, maxCities: 1/1/1/2, etc.)
- Add new feature flags: `hasAvailableNow`, `availableNowMinutes`, `maxTravelSchedules`, `hasVideo`, `hasVerifiedBadge`, `hasWeeklySpecials`, `hasHomepageRotation`, `hasNewsletter`, `hasBasicWatermark`
- Remove old tiers (premium, gold, platinum)

**2. `src/pages/Pricing.tsx`**
- Replace 5 plans array with 4 new plans (Free $0, Standard $39, Pro $79, Elite $99)
- Update features lists to match new spec
- Mark Pro as "Most Popular"
- Add Add-ons section below plans grid (Masseur of the Day, Sponsor Profile, etc.)
- Update Founder Deal pricing (50% of new prices)

**3. `src/pages/dashboard/DashboardSubscription.tsx`**
- Replace plans array with new 4 tiers and updated pricing/features
- Mark Pro as popular
- Update plan keys

**4. `src/pages/dashboard/DashboardPromotion.tsx`**
- Update promotion checks to reference new plan keys (pro/elite instead of premium/gold)

**5. `supabase/functions/create-checkout/index.ts`**
- Replace PLANS object: remove premium/gold/platinum, add pro ($7900) and elite ($9900)
- Update standard amount to $3900

**6. `src/i18n/locales/en.json`** (and es.json, fr.json, pt.json)
- Replace pricing section keys: remove premium/gold/platinum, add pro/elite
- Update prices, descriptions, features
- Add add-ons section translations

**7. `src/contexts/AuthContext.tsx`**
- No structural changes needed (plan_key is dynamic from Stripe)

### Add-ons Section
For now, add-ons will be displayed as a static informational section on the Pricing page and DashboardPromotion page. The actual purchase flow for add-ons can be implemented as a follow-up with individual Stripe products.

### Migration Note
Existing Stripe products with old plan keys (premium, gold, platinum) will remain in Stripe but won't be offered to new users. The `check-subscription` edge function already reads `plan_key` from Stripe metadata dynamically, so existing subscribers keep their current plan until renewal.

