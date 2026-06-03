# MasseurMatch — Launch Checklist (the finish line)

**One page. Finite. If everything in §1 and §2 is checked, the site is _done_ for launch.**
Anything not on this list is **§3 (later)** — not a launch blocker. New ideas go to §3, they do **not** expand the definition of done.

_Last verified: 2026-06-03 — all gates green, production deploy READY, `pnpm audit` clean._

For the full step-by-step procedure (env vars, Vercel config, rollback), see
[`GO_LIVE_CHECKLIST.md`](./GO_LIVE_CHECKLIST.md). This file is the short, authoritative bar.

---

## 1. Technical "done" — the hard gate

Run one command from the repo root; it must exit 0:

```bash
pnpm install --frozen-lockfile && pnpm release:check
```

`release:check` = lint → typecheck → test → validate:sitemap → validate:db-contract → release:audit → build.

- [x] `pnpm release:check` passes (exit 0)
- [x] `pnpm audit` reports no known vulnerabilities in shipped or tooling deps
- [x] Production deploy is `READY` on `target: production` (commit on `main`)
- [x] Only `main` is the deployable branch; production builds from `main`

> If any box above is unchecked, the site is **not** ready — no exceptions, no "it's basically fine."

---

## 2. Launch must-haves — product bar (finite)

**Core directory**
- [x] Home, `/search`, city/state pages render with the production card grid
- [x] Therapist profile page: photos, location map (area-only, no exact address), Q&A, inline Knotty
- [x] Profiles carry `schema.org/Person` + `PostalAddress` microdata; FAQ JSON-LD matches visible Q&A
- [x] `/sitemap.xml` and `/robots.txt` valid (covered by `validate:sitemap`)

**Accounts & payments**
- [x] Pro signup → review → approval flow works end to end
- [x] Stripe checkout + webhook keeps tier/billing period in sync
- [x] `MM_SESSION_SECRET` set in production (session signing decoupled from DB key)

**Trust, legal, brand**
- [x] Terms, privacy, trust/safety, therapist-agreement pages live
- [x] No fabricated claims (ratings/percentages/guarantees) per `CLAUDE.md`
- [x] Premium design standards: lucide icons only, brand palette, English-only copy

**Pre-send ritual (every change, before pushing to `main`)**
- [ ] `pnpm release:check` green
- [ ] `pnpm audit` clean
- [ ] Eyeball the affected page on the production URL after deploy

---

## 3. Later (post-launch backlog) — explicitly NOT launch blockers

Park ideas here so "done" stays still. Pull from this list _after_ launch, one at a time.

- Card art-direction iterations (alternate photo ratios, density tuning)
- Dedicated accessibility audit (axe/pa11y) — script is currently a placeholder
- Playwright redirect/e2e suite in CI (`test:redirects`)
- Resolve the `@stripe/react-stripe-js` ↔ `@stripe/stripe-js` peer-range warning
- Reviews/ratings once real data exists
- Additional cities / editorial content expansion

---

### How to know you're done
Run `pnpm release:check`, confirm `pnpm audit` is clean, confirm the prod deploy is `READY`, and confirm every box in §1 + §2 is checked. That's it — ship. Everything else is §3.
