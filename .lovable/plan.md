

# Plan: Page Transitions, Animated Hero Background, and Rename to MasseurMatch

## Overview

Three enhancements: smooth page transitions using Framer Motion's `AnimatePresence`, an animated gradient mesh background for the homepage hero, and renaming every instance of "MassageConnect" to "MasseurMatch".

---

## 1. Smooth Page Transitions

**Approach:** Create a `PageTransition` wrapper component using Framer Motion's `AnimatePresence` and `motion.div`. Wrap all route elements in `App.tsx` with this component, keyed by `location.pathname`.

**New file:** `src/components/animations/PageTransition.tsx`
- Wraps children in a `motion.div` with fade + subtle slide-up entrance/exit
- Uses `AnimatePresence mode="wait"` so the exiting page animates out before the new one enters

**Modified file:** `src/App.tsx`
- Extract route content into an inner component that uses `useLocation()` for the animation key
- Wrap `<Routes>` with `<AnimatePresence mode="wait">`
- Each `<Route>` element gets wrapped in `<PageTransition>`

---

## 2. Animated Gradient Mesh Hero Background

**New file:** `src/components/animations/GradientMesh.tsx`
- A full-screen absolute-positioned component using multiple animated `motion.div` blobs
- 4-5 large gradient circles (white/gray at low opacity) that slowly move, scale, and rotate using `framer-motion` infinite animations
- Layered with a subtle noise texture and blur for a premium mesh effect
- Pure CSS/Framer Motion -- no external dependencies

**Modified file:** `src/pages/Index.tsx`
- Replace the existing floating particles in the hero section with the new `<GradientMesh />` component
- Keep the existing content structure intact

---

## 3. Rename "MassageConnect" to "MasseurMatch"

Global find-and-replace across all files:

| File | Changes |
|------|---------|
| `index.html` | og:url, og:site_name, author, JSON-LD, twitter meta |
| `src/components/layout/Header.tsx` | Brand name in nav |
| `src/components/layout/Footer.tsx` | Brand name + copyright |
| `src/pages/Index.tsx` | "Why Choose" section label |
| `src/pages/About.tsx` | "About" heading + body text (4 instances) |
| `src/pages/Auth.tsx` | Logo text + toast message |
| `src/pages/Explore.tsx` | SEO paragraph |
| `src/pages/Pricing.tsx` | FAQ answer |
| `src/pages/Contact.tsx` | Email address (`support@masseurmatch.com`) |

Also update `massageconnect.com` references to `masseurmatch.com`.

---

## Technical Details

**PageTransition animation values:**
```text
enter:  opacity 0 -> 1, y: 20px -> 0, duration 0.4s
exit:   opacity 1 -> 0, y: 0 -> -20px, duration 0.3s
```

**GradientMesh blob config:**
- 4 blobs with radial gradients (white -> transparent, 10-20% opacity)
- Each blob: 300-600px diameter, animate x/y/scale/rotate over 15-25s infinite loops
- Container has `filter: blur(60px)` for soft diffusion
- Overlaid with the existing `noise-bg` texture class

**No new dependencies required** -- everything uses existing framer-motion.

