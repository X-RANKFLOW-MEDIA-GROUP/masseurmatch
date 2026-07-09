# MasseurMatch Frontend Design Audit Report
**Date:** 2026-07-09  
**Branch:** `claude/frontend-design-audit-plugin-hh0sas`  
**Scope:** Premium design standards compliance per CLAUDE.md

---

## Executive Summary

The MasseurMatch frontend demonstrates **strong overall compliance** with premium design standards (red/black/white brand palette, Satoshi typography, lucide-react icons). However, **3 actionable issues** were identified that deviate from CLAUDE.md guidelines:

1. **Icon Library Inconsistency** — Custom hand-drawn sketch icons used alongside lucide-react
2. **Accessibility Compliance Gap** — Aurora animations lack `prefers-reduced-motion` support
3. **Color Palette Inconsistency** — Amber star ratings conflict with brand palette guidelines

---

## Detailed Findings

### 🎨 Issue #1: Custom Icon Library vs. Lucide-React Inconsistency

**Severity:** MEDIUM  
**Standard Violated:** "Always use `lucide-react` components, never text-glyph or emoji icons."

#### Current State
- **Lucide-react usage:** 199 imports across the codebase ✅
- **Custom icon usage:** 39 imports (13 files)
- **Total custom icon code:** 913 lines in `src/components/icons/`

#### Custom Icon Usage (9 files):
1. `src/components/profile/ProfileHeader.tsx` — uses `IconMapPin`
2. `src/components/profile/ProfileLocationMap.tsx` — uses `IconMapPin`, `IconShield`
3. `src/components/booking/InquiryForm.tsx` — uses `IconArrowRight`, `IconCalendar`
4. `src/components/social/SocialProofBadges.tsx` — uses `IconStar`, `IconAward`
5. `src/app/_components/therapist-card.tsx` — uses `IconStar`, `IconMapPin`

#### Design Intent
The custom icons are **luxury masculine hand-drawn thin-line sketches** with subtle sketch filter effects—intentional for premium positioning, but violate the stated standard of "always use lucide-react."

#### Impact
- Inconsistent visual language across the app (mixing sketch icons with flat lucide-react)
- Increased maintenance burden (43 custom SVG icon components)
- Accessibility consideration: custom icons have manual aria-hidden/focusable attributes

#### Recommendation
**Choose one approach:**
- **Option A (Recommended):** Deprecate custom icons, replace with lucide-react equivalents with manual styling (stroke width, sizing) to match premium aesthetic
- **Option B:** Formalize custom icon library as an exception to the standard and document when/why to use over lucide-react

---

### ♿ Issue #2: Aurora Animations Missing `prefers-reduced-motion` Support

**Severity:** MEDIUM (Accessibility)  
**Standard Violated:** "Respect `prefers-reduced-motion` (via framer `useReducedMotion`) in every animated component."

#### Current State
**File:** `src/components/ui/aurora-background.tsx`

Animation classes defined but **no motion preferences respected:**
```tsx
className="... animate-aurora-1"  // Always animates
className="... animate-aurora-2"  // No @media (prefers-reduced-motion)
className="... animate-aurora-3"
className="... animate-aurora-4"
className="... animate-aurora-5"
```

The animations are:
- Aurora-1 to Aurora-5: 15–25 second infinite loops
- Using `ease-in-out` timing
- Defined in `tailwind.config.ts` (lines 153–181)

#### Missing Implementation
The component does **not**:
- Check for reduced motion via CSS media query
- Conditionally disable animations for users with `prefers-reduced-motion: reduce`
- Use `useReducedMotion()` from framer-motion (component is client but doesn't import/use it)

#### Good Examples Elsewhere
✅ `HeroCinematic.tsx` correctly uses:
```tsx
const reducedMotion = useReducedMotion();
const dur = reducedMotion ? 0 : 0.8;  // Disables animations
```

#### Recommendation
Add CSS media query to tailwind config:
```ts
animation: {
  "aurora-1": "aurora-1 15s ease-in-out infinite",
  // ... Add @media (prefers-reduced-motion: reduce) equivalent
}
```

Or refactor component to use `useReducedMotion()` and conditionally render animations.

---

### 🎨 Issue #3: Amber Star Ratings vs. Brand Palette

**Severity:** LOW  
**Standard Violated:** Implicit — brand palette uses red/grayscale, no amber defined for secondary UI.

#### Current State
Star ratings throughout the app use Tailwind's amber palette:
- `fill-amber-400` / `text-amber-400` (ReviewsList.tsx, ReviewForm.tsx)
- `text-amber-600`, `bg-amber-50`, `bg-amber-100` (admin dashboards, alerts)

Example (`ReviewsList.tsx:115-116`):
```tsx
star <= Math.round(averageRating)
  ? "fill-amber-400 text-amber-400"  // ⚠️ Amber, not brand red
  : "text-slate-300"
```

#### CLAUDE.md Brand Palette
- **Accent red:** `#8B1E2D` (not amber)
- **Text colors:** `#111111`, `#6F6F6F`, `#8E8E8E` (blacks and grays)
- **Surfaces:** `#FFFFFF`, `#F7F7F7`, `#FAFAFA` (whites/near-whites)
- **No amber defined** — only red as accent

#### Context
- Used for: star ratings, warning alerts, secondary UI
- Rationale: unclear (no documentation)
- Prevalence: ~8 instances across ReviewsList, ReviewForm, dashboards

#### Recommendation
**Option A (Strict Compliance):** Replace amber with red (`#8B1E2D`) or grayscale:
```tsx
fill-[#8B1E2D] text-[#8B1E2D]  // Brand red for filled stars
```

**Option B (Documented Exception):** Document amber as intentional secondary accent for ratings/warnings and update CLAUDE.md:
```
- Secondary highlight (ratings): amber-400 (warm, friendly)
- Alerts/warnings: amber-600 (caution signal)
```

---

## Compliance Summary

| Category | Status | Notes |
|----------|--------|-------|
| **Icons** | ⚠️ PARTIAL | 199 lucide-react ✅, but 39 custom icon imports in 9 files ❌ |
| **Brand Colors** | ✅ PASS | Red #8B1E2D used correctly; old orange #FF8A1F not found |
| **Typography** | ✅ PASS | Satoshi font, no Montserrat/Unbounded found |
| **Effects** | ⚠️ PARTIAL | Restrained effects ✅, but aurora animations miss reduced-motion |
| **Fabricated Claims** | ✅ PASS | No invented ratings or unverified claims found |
| **Copy** | ✅ PASS | English-only, no marketing fluff |
| **Accessibility** | ⚠️ PARTIAL | Most components use `useReducedMotion()`, but AuroraBackground does not |

---

## Files Reviewed

**Component Audit:**
- ✅ `src/components/ui/button.tsx` — CSS custom properties, proper focus ring
- ✅ `src/components/ui/badge.tsx` — token-driven, micro-label correct
- ✅ `src/components/marketing/HeroCinematic.tsx` — lucide-react (Sparkles, ArrowUpRight), reduced motion respected
- ✅ `src/components/marketing/HowItWorksPremium.tsx` — lucide-react (Search, MessageSquare, CheckCircle), breathing glow correct
- ✅ `src/components/ui/available-now-badge.tsx` — lucide-react (Zap), pulsing animation
- ✅ `src/components/ui/status-badge.tsx` — 13 lucide-react icons (BadgeCheck, ShieldCheck, etc.), proper sizing
- ✅ `src/components/ui/special-offer-badge.tsx` — lucide-react (Tag)
- ⚠️ `src/components/ui/aurora-background.tsx` — no reduced-motion support
- ⚠️ `src/components/profile/ProfileHeader.tsx` — mixed icons (Crown from lucide, IconMapPin custom)
- ⚠️ `src/components/booking/InquiryForm.tsx` — mixed icons (Send/CheckCircle2/Loader2 from lucide, IconArrowRight/IconCalendar custom)
- ⚠️ `src/components/reviews/ReviewsList.tsx` — amber star ratings, lucide-react (Star, ThumbsUp, CheckCircle2, Loader2)

---

## Actionable Next Steps

### High Priority
1. **Fix Aurora Animation Accessibility** (15 min)
   - Add `@media (prefers-reduced-motion: reduce)` CSS rule to disable aurora-1–5 animations
   - Or refactor `AuroraBackground` to use `useReducedMotion()` hook

### Medium Priority
2. **Decide on Icon Library** (1 hour planning + X implementation)
   - Decision: standardize on lucide-react or document custom icon exceptions
   - If standardizing: replace 9 custom icon usages with lucide-react equivalents
   - If documenting: add design system docs on when to use custom vs. lucide

3. **Audit & Update Star Colors** (30 min)
   - Decide: brand red (`#8B1E2D`) or documented exception for amber ratings
   - Update ReviewsList, ReviewForm, and dashboard ratings
   - Document decision in CLAUDE.md

### Low Priority
4. **Documentation**
   - Formalize icon library standards in CLAUDE.md
   - Add accessibility section to design system (reduced motion, color contrast, etc.)

---

## Overall Assessment

✅ **The frontend is well-designed and mostly compliant.**  
The 3 issues identified are **non-blocking** but should be addressed to maintain premium, consistent design standards.

**Risk:** Amber ratings and custom icons create mild brand inconsistency, but neither breaks functionality or violates core accessibility requirements. Aurora animation accessibility is a genuine UX issue for motion-sensitive users (~5–10% of population).

---

## Notes for Implementation

- **Icon replacement:** Map custom icons → lucide-react equivalents:
  - `IconMapPin` → `MapPin`
  - `IconStar` → `Star`
  - `IconArrowRight` → `ArrowRight`
  - `IconCalendar` → `Calendar`
  - `IconShield` → `ShieldCheck`
  - `IconAward` → `Award`

- **Aurora fix:** Add to `tailwind.config.ts` keyframes:
  ```ts
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none'
  }
  ```

- **Star color:** If using brand red, test contrast on dark/light backgrounds to ensure WCAG AA compliance.

---

**Report generated by Frontend Design Audit Plugin**  
Ready for implementation or decision on icon/color strategy.
