# Mobile UI overflow fix checklist

This PR tracks the targeted MasseurMatch mobile UI fixes from issue #65.

## Components to patch

- `src/components/homepage/WorldClassHomepage.tsx`
- `src/components/homepage/world-class.css`

## Required fixes

1. Hero headline
 - Prevent overlap between `perfect` and `gay-affirming massage`.
 - Use responsive `clamp()` font sizing.
 - Use safe line height and wrapping.

2. Search and filter panel
 - Prevent horizontal overflow on iPhone width.
 - Ensure search input, location button, filter/open button, objective, session, and type controls stay inside viewport.
 - Prefer wrapped or stacked mobile layout.

3. Therapist cards
 - Prevent card content from being cropped.
 - Fix `CONTACT FOR PRICING` clipping.
 - Reduce excessive letter spacing on small screens.
 - Keep all cards inside viewport with `max-width: 100%`.

4. FAQ accordion
 - Collapsed answers must be fully hidden.
 - Expanded answers must have readable contrast and proper spacing.
 - Remove ghost text visible behind collapsed rows.

5. Knotty widget
 - Improve text and placeholder contrast.
 - Use viewport safe max height.
 - Keep header, quick actions, messages, and input visible without clipping.

6. Global safety CSS

```css
.wc-home,
.wc-home * {
 box-sizing: border-box;
}

.wc-home {
 max-width: 100%;
 overflow-x: hidden;
}

.wc-home img,
.wc-home video,
.wc-home canvas,
.wc-home svg,
.wc-home input,
.wc-home button,
.wc-home select,
.wc-home textarea {
 max-width: 100%;
}

.wc-home :is(.wc-search-wrap, .wc-search-outer, .wc-knotty-glass, .wc-ther-card, .wc-faq-sec) {
 max-width: 100%;
}

.wc-hero-h1 {
 overflow-wrap: normal;
 text-wrap: balance;
}

.wc-hero-h1 .wc-sub-line {
 overflow-wrap: anywhere;
}

@media (max-width: 640px) {
 .wc-hero {
 padding-inline: 16px;
 }

 .wc-hero-h1 {
 font-size: clamp(42px, 13vw, 62px);
 line-height: 1.04;
 letter-spacing: -0.035em;
 }

 .wc-hero-h1 .wc-sub-line {
 font-size: clamp(34px, 10.5vw, 48px);
 line-height: 1.08;
 margin-top: 8px;
 }

 .wc-search-outer {
 width: 100%;
 display: grid;
 grid-template-columns: auto minmax(0, 1fr);
 gap: 10px;
 padding: 14px;
 border-radius: 24px;
 }

 .wc-search-outer input {
 min-width: 0;
 width: 100%;
 }

 .wc-s-sep {
 display: none;
 }

 .wc-s-loc,
 .wc-btn-search {
 grid-column: 1 / -1;
 width: 100%;
 justify-content: center;
 }

 .wc-knotty-glass {
 max-height: 85dvh;
 }

 .wc-kg-messages {
 min-height: 0;
 max-height: none;
 flex: 1;
 overflow-y: auto;
 }

 .wc-kg-input input::placeholder {
 color: rgba(255,255,255,.72);
 }
}
```

## Acceptance criteria

- No horizontal mobile overflow.
- Hero headline does not overlap.
- Search/filter UI is not cut off.
- FAQ collapsed answers are hidden.
- Therapist cards do not crop pricing/contact text.
- Knotty remains readable and viewport safe.
