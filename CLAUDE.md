# MasseurMatch — Engineering & Design Standards

MasseurMatch is a premium US directory of LGBTQ+-affirming male massage
therapists (Next.js App Router + Supabase + Stripe, deployed on Vercel).
The bar is **premium, hand-crafted, and trustworthy** — never cheap or
"obviously AI-generated." Treat every visible surface as a showcase.

## Design standards (non-negotiable)

- **Premium icons everywhere — no text-glyph or emoji "icons."**
  Always use `lucide-react` components, never literal characters like
  `→ ↑ ↗ ✓ ★ ✦ ✕ •` standing in for an icon. Examples:
  - arrow link → `ArrowRight` / `ArrowUpRight`
  - checkmark → `Check` / `BadgeCheck` / `ShieldCheck`
  - send → `ArrowUp` / `Send`
  - rating star → `Star` (filled), not `★`
  Give icons intentional `strokeWidth` (≈2.25–2.5) and size them in `rem`
  units that match the adjacent text. (Literal `·` as a separator in copy
  is fine; it is punctuation, not an icon.)

- **Brand palette**
  - Deep navy (first fold + footer): `#060E1A`
  - Primary orange: `#FF8A1F` (Tailwind `primary`)
  - Trust accent: emerald (`emerald-400`)
  - Hairlines/borders on dark: `white/[0.06]`; glass surfaces:
    `bg-white/[0.04]`–`bg-white/5` with `border-white/10` + `backdrop-blur`.
  - Micro-labels / eyebrows on dark: `font-mono text-[10px] uppercase
    tracking-[0.18em]` (mirrors the footer).
  - Headlines: `font-display` (Unbounded), extrabold, tight tracking.

- **Homepage rhythm**: only the first fold (hero + city marquee) is the deep
  navy `#060E1A`; the body alternates light, high-end sections, with the
  cinematic dark "city diorama" band and the footer as dark bookends.

- **Effects = restrained, not garish**: fine radially-masked dot grids,
  slow-breathing single-color glows, thin gradient hairlines, vignettes.
  Respect `prefers-reduced-motion` (via framer `useReducedMotion`) in every
  animated component.

- **No fabricated claims** pre-launch: no invented ratings ("4.9★"),
  percentages, or "licensed/background-checked" guarantees we can't back.
  Prefer process statements ("reviewed before going live").

- **Copy is English-only** for launch.

## Knotty (the AI assistant)

The full stack already exists — do not rebuild it:
- API: `src/app/api/knotty/route.ts` → `src/lib/knotty/service.ts`
  (Gemini `gemini-1.5-flash` via `GEMINI_API_KEY`, with a deterministic
  fallback; guardrails, FAQ, intent, ranking, learning, attribution).
- Client: `useKnotty` hook + `KnottyChat` (floating, mounted site-wide in
  `layout.tsx` via `ChatWidget`) + per-profile `ProfileAIChat`.
- Open the floating chat from anywhere by dispatching
  `window.dispatchEvent(new CustomEvent("knotty:open", { detail: { prompt } }))`.

## Workflow

- Dev branch for this work: `claude/repo-launch-readiness-KqLDX`.
- Before pushing, run: `npx tsc --noEmit`, `npx eslint <changed files>`,
  and `npm run build`.
- Do not open PRs unless explicitly asked.
