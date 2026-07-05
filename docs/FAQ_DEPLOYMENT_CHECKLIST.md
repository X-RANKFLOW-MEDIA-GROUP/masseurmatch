# FAQ Schema Deployment Checklist

Use this checklist before merging to `main` or deploying to production.

---

## Pre-Deployment (Dev Environment)

- [ ] **Files Created**
  - [ ] `src/lib/seo/faq-schema.ts` exists
  - [ ] `src/components/faq-schema-provider.tsx` exists
  - [ ] `src/components/faq-accordion.tsx` exists
  - [ ] `src/styles/faq-accordion.css` exists (or integrated into globals)
  - [ ] All imports resolve without errors

- [ ] **Dependencies**
  - [ ] `@radix-ui/react-accordion` is installed: `npm ls @radix-ui/react-accordion`
  - [ ] `lucide-react` is installed (for icons)
  - [ ] Tailwind CSS is configured
  - [ ] No console errors or warnings on page load

- [ ] **TypeScript**
  - [ ] `npx tsc --noEmit` passes (no type errors)
  - [ ] All imports typed correctly
  - [ ] No `// @ts-ignore` comments added

- [ ] **Code Quality**
  - [ ] `npx eslint src/lib/seo/faq-schema.ts` passes
  - [ ] `npx eslint src/components/faq-*.tsx` passes
  - [ ] No unused imports or variables
  - [ ] Code follows project style guide

---

## Integration Testing (Local)

- [ ] **Page Rendering**
  - [ ] City page loads without errors: `http://localhost:3000/dallas`
  - [ ] FAQ accordion renders visually
  - [ ] All questions are visible
  - [ ] Accordion opens/closes on click
  - [ ] "Learn more" links appear and work

- [ ] **Schema Validation**
  - [ ] Inspect page source (`Ctrl+U` or View > View Page Source)
  - [ ] Search for `"@type": "FAQPage"` — should find 1 match
  - [ ] Copy entire `<script type="application/ld+json">` block
  - [ ] Validate at [jsonlint.com](https://jsonlint.com) — should pass
  - [ ] Check for "mainEntity" array with 12+ items

- [ ] **Browser DevTools**
  - [ ] Right-click → Inspect → Network tab
  - [ ] Look for any `Content Security Policy` warnings (JSON-LD should be inline, safe)
  - [ ] Console tab: no errors or warnings
  - [ ] Application > Local Storage: no FAQ-related data leaking

- [ ] **Keyboard Navigation**
  - [ ] Tab through page — focus reaches FAQ questions
  - [ ] Space/Enter opens/closes accordion
  - [ ] ChevronDown icon rotates smoothly
  - [ ] Links are keyboard-accessible

- [ ] **Mobile Rendering**
  - [ ] Resize to mobile (375px width) — layout remains readable
  - [ ] FAQ questions are tapable (> 44px touch target)
  - [ ] Accordion opens/closes on mobile
  - [ ] Links work on mobile
  - [ ] No horizontal scrolling

- [ ] **Responsive Breakpoints**
  - [ ] sm (640px): Text sizes, spacing correct
  - [ ] md (768px): Grid layout shifts if applicable
  - [ ] lg (1024px): Maximum width respected
  - [ ] xl+ (1280px+): No weird layout stretching

---

## Google Rich Results Testing

- [ ] **Single Page Test**
  - [ ] Go to [Google Rich Results Test](https://search.google.com/test/rich-results)
  - [ ] Enter: `https://localhost:3000/dallas` (or staging URL once deployed)
  - [ ] Click "TEST URL"
  - [ ] In results, expand "FAQPage"
  - [ ] Verify all questions appear
  - [ ] No errors or warnings reported
  - [ ] "Answer" text previews are visible

- [ ] **All City Pages**
  - [ ] Test `/dallas` → FAQ detected ✓
  - [ ] Test `/houston` → FAQ detected ✓
  - [ ] Test `/austin` → FAQ detected ✓
  - [ ] (Add more cities as needed)

- [ ] **Root/Home Page**
  - [ ] Test `/` → FAQ detected (universal questions only) ✓
  - [ ] Verify schema is present even if visual accordion not shown

- [ ] **Schema Completeness**
  - [ ] Each question has a `name` field
  - [ ] Each answer has `text` field (not HTML, just plain text)
  - [ ] No HTML tags in answers (only plain text)
  - [ ] Answer length is 60–120 words (optimal for snippets)

---

## Copy & Content Review

- [ ] **Brand Voice**
  - [ ] Read all universal questions aloud — sound conversational, not robotic
  - [ ] No "AI-generated" tone
  - [ ] Tone matches existing MasseurMatch content (premium, trustworthy)
  - [ ] No salesy or overpromising language

- [ ] **Accuracy**
  - [ ] All URLs in "Learn more" links are real and reachable
  - [ ] Pricing range ($60–200+) still reflects current therapists
  - [ ] Neighborhood names (Oak Lawn, Uptown, Montrose, etc.) are correct
  - [ ] No broken assumptions (e.g., "all therapists speak Spanish" if not true)

- [ ] **Keywords**
  - [ ] Each answer contains 1–2 relevant keywords
  - [ ] Keywords are naturally integrated, not forced
  - [ ] Keywords match common search terms (use GSC or Google Trends to verify)

- [ ] **Consistency**
  - [ ] Terminology is consistent across all FAQs (e.g., "in-call" vs "in call")
  - [ ] Links point to consistent URL patterns
  - [ ] No contradictions between universal and city FAQs

---

## Styling & UX

- [ ] **Colors**
  - [ ] Accordion uses brand red (#8B1E2D) for active state
  - [ ] Text is readable: #111111 (primary), #6F6F6F (secondary)
  - [ ] Borders are subtle: #E8E8E8 or #D9D9D9
  - [ ] No color contrast issues (test with [WebAIM contrast checker](https://webaim.org/resources/contrastchecker/))

- [ ] **Spacing**
  - [ ] Padding/margins align with 4px grid (4, 8, 12, 16, 24, 32, 40, 48px)
  - [ ] FAQ section has adequate whitespace (not cramped)
  - [ ] Question text is readable (line-height ≥ 1.5)

- [ ] **Icons**
  - [ ] ChevronDown icon rotates smoothly on expand
  - [ ] Icon is lucide-react (premium, not emoji or text glyph)
  - [ ] Icon size matches text (e.g., 20px for 16px text)
  - [ ] Stroke width is intentional (~2.25)

- [ ] **Animations**
  - [ ] Accordion content slides down smoothly (200ms)
  - [ ] Icon rotation is synchronized with content reveal
  - [ ] No janky or stuttering animations
  - [ ] Respects `prefers-reduced-motion` setting

- [ ] **Accessibility**
  - [ ] Font size is ≥ 14px (readable)
  - [ ] Line length is ≤ 75–100 chars (not stretched too wide)
  - [ ] Focus indicators are visible (outline or ring)
  - [ ] No motion-triggered content (animation shouldn't be required to see content)

---

## Performance

- [ ] **Build Size**
  - [ ] FAQ components don't significantly increase bundle size
  - [ ] No large dependencies added (Radix is small ~5KB gzip)
  - [ ] `npm run build` completes without warnings

- [ ] **Load Performance**
  - [ ] Page loads in < 3 seconds (Lighthouse target)
  - [ ] FAQ section doesn't cause layout shift (CLS < 0.1)
  - [ ] Images (if any) are optimized and lazy-loaded

- [ ] **Runtime Performance**
  - [ ] Accordion opens/closes instantly (no lag)
  - [ ] Scrolling is smooth (60 FPS)
  - [ ] No memory leaks (DevTools: open/close accordion 10x, memory should not grow)

---

## SEO

- [ ] **Metadata**
  - [ ] Page title includes city name and relevant keyword
  - [ ] Meta description is unique and under 160 chars
  - [ ] Canonical URL is set correctly

- [ ] **Structured Data**
  - [ ] JSON-LD `@context` is "https://schema.org"
  - [ ] `@type` is "FAQPage"
  - [ ] `mainEntity` is array of Question objects
  - [ ] No duplicate schemas on page

- [ ] **Visibility**
  - [ ] Questions are visible on page (not hidden by CSS, JavaScript, or behind paywall)
  - [ ] Answers are visible when expanded
  - [ ] Text is actual text, not images

- [ ] **International**
  - [ ] If supporting multiple languages, schemas are language-tagged
  - [ ] URL structure supports i18n (e.g., `/en/dallas`, `/es/dallas`)

---

## Edge Cases & Error Handling

- [ ] **Invalid City**
  - [ ] Visiting `/invalid-city` returns 404 or redirects
  - [ ] 404 page doesn't break layout
  - [ ] No console errors on invalid city

- [ ] **Empty FAQ**
  - [ ] If no FAQs exist for a city, component gracefully shows nothing or fallback
  - [ ] Page still renders without errors

- [ ] **Very Long Answers**
  - [ ] If answer is > 120 words, text wraps correctly
  - [ ] Accordion doesn't overflow or break layout

- [ ] **Dynamic Content**
  - [ ] If FAQs are fetched from an API (future), error handling works
  - [ ] Loading state is shown (if applicable)
  - [ ] Retry logic on API failure (if applicable)

---

## Documentation

- [ ] **Code Comments**
  - [ ] Main functions in `faq-schema.ts` have JSDoc comments
  - [ ] Components have prop descriptions
  - [ ] Complex logic is explained

- [ ] **Guides**
  - [ ] `docs/FAQ_SCHEMA_INTEGRATION.md` is accurate and complete
  - [ ] `docs/FAQ_QUICK_REFERENCE.md` is up-to-date
  - [ ] `docs/CITY_PAGE_IMPLEMENTATION_EXAMPLE.tsx` compiles and imports resolve
  - [ ] `docs/FAQ_SCHEMA_EXAMPLES.json` examples are valid

- [ ] **Spreadsheet**
  - [ ] `docs/FAQ_SPREADSHEET_TEMPLATE.csv` is in sync with code
  - [ ] Columns are clear (Type, City, Question, Answer, Keywords, etc.)
  - [ ] Can be imported into Google Sheets without corruption

---

## Staging Deployment

- [ ] **Branch & PR**
  - [ ] Changes are on feature branch (e.g., `claude/faq-schema-KqLDX`)
  - [ ] PR description references ticket/issue (if applicable)
  - [ ] PR passes all CI checks (TypeScript, ESLint, tests)

- [ ] **Staging Environment**
  - [ ] Deploy to staging (e.g., `staging.masseurmatch.com`)
  - [ ] All city pages load without errors
  - [ ] FAQ accordion works on staging
  - [ ] Google Rich Results Test on staging URL (may fail if noindex tag present, OK)

- [ ] **Manual Smoke Test on Staging**
  - [ ] Visit staging `/dallas`, `/houston`, `/austin`
  - [ ] Click through FAQs
  - [ ] Verify links work
  - [ ] Check console for errors

---

## Production Deployment

- [ ] **Merge to Main**
  - [ ] Code review approved
  - [ ] All checks pass
  - [ ] No merge conflicts
  - [ ] Commit message is clear and references ticket (if applicable)

- [ ] **Production Deploy**
  - [ ] Deploy to production (Vercel, AWS, etc.)
  - [ ] Deployment logs show no errors
  - [ ] Health check passes

- [ ] **Post-Deployment**
  - [ ] Visit production `/dallas`, `/houston`, `/austin`
  - [ ] Verify FAQs render correctly
  - [ ] Test Rich Results on production URL (wait a few minutes for cache clear)
  - [ ] Check Google Search Console for any crawl errors

---

## Monitoring (Post-Launch)

- [ ] **Analytics**
  - [ ] Monitor FAQ accordion clicks (if GA event tracking added)
  - [ ] Track which questions are most-clicked
  - [ ] Monitor bounce rate on FAQ pages (should not increase)

- [ ] **Search Console**
  - [ ] Monitor "Rich Results" report for FAQ impressions
  - [ ] Wait 1–2 weeks for indexing and Rich Results appearance
  - [ ] Check for any indexing issues or manual actions

- [ ] **Feedback**
  - [ ] Monitor customer support tickets mentioning FAQs
  - [ ] Check if FAQ content answers real user questions
  - [ ] Update FAQs quarterly based on user questions

---

## Rollback Plan (if needed)

If FAQ schema causes issues post-launch:

- [ ] **Revert Commit**: `git revert <commit-hash>`
- [ ] **Remove from Metadata**: Comment out schema injection in `generateMetadata()`
- [ ] **Keep Components**: FAQAccordion component can stay (no harm)
- [ ] **Monitor**: Watch for indexing issues in GSC
- [ ] **Post-Mortem**: Document what went wrong

---

## Sign-Off

- [ ] **Dev**: All checks above completed
- [ ] **QA** (if applicable): Tested on staging, approved
- [ ] **Product** (if applicable): Copy reviewed and approved
- [ ] **Engineering Lead** (if applicable): Code review passed

---

**Deployment Date**: ________________  
**Deployed By**: ________________  
**Issues Encountered**: None ☐  |  Yes ☐ (describe): _________________  
**Notes**: ________________________________________________________________________  

---

**Checklist completed**: ________________  
