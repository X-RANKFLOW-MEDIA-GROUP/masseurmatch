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

- **Brand palette** — sober red / black / white (this is what ships in
  production; it replaced the earlier orange + navy scheme):
  - Accent red: `#8B1E2D` (hover `#6E1521`, soft tint `#F8EDEE`) — Tailwind
    `accent` / `primary`. (Replaces the old orange `#FF8A1F`.)
  - Text: `#111111` primary, `#6F6F6F` secondary, `#8E8E8E` muted.
  - Surfaces: `#FFFFFF` base, `#F7F7F7` soft, `#FAFAFA` card.
  - Borders/hairlines: `#E8E8E8` subtle, `#D9D9D9` strong.
  - Focus ring: `3px rgba(139,30,45,.18)`.
  - Spacing scale: 4·8·12·16·24·32·40·48·64px.
    Type scale: 12·14·16·18·24·32·40·56px.
  - Micro-labels / eyebrows: `font-mono text-[10px] uppercase
    tracking-[0.18em]`.
  - All type (headings, display, body): the self-hosted **Satoshi** variable
    font (`var(--font-satoshi)`; woff2/woff in `public/fonts/`). It replaced
    Montserrat/Unbounded — do not reintroduce those.

- **Homepage rhythm**: predominantly light, high-end sections on white/soft-gray
  surfaces with the red accent used sparingly for emphasis and CTAs; dark
  bands (e.g. the cinematic "city diorama" and the footer) act as bookends.

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
- API: `src/app/api/knotty/route.ts` → `src/lib/knotty/service.ts`.
  LLM reply provider order: **DeepSeek `deepseek-chat` (`DEEPSEEK_API_KEY`)** →
  OpenAI `gpt-4o-mini` (`OPENAI_API_KEY`) → Gemini `gemini-1.5-flash`
  (`GEMINI_API_KEY`) → deterministic fallback.
  Plus guardrails, FAQ, intent, ranking, learning, attribution.
- Client: `useKnotty` hook + `KnottyChat` (floating, mounted site-wide in
  `layout.tsx` via `ChatWidget`) + per-profile `ProfileAIChat`.
- Open the floating chat from anywhere by dispatching
  `window.dispatchEvent(new CustomEvent("knotty:open", { detail: { prompt } }))`.

## Dependency Management

**pnpm is the single source of truth** for this project (`pnpm@10.32.1` locked in `package.json`).

- **Always use pnpm** — never `npm install` or `yarn add`. Use:
  - `pnpm add <package>` (production)
  - `pnpm add -D <package>` (dev)
  - `pnpm remove <package>`
- **Every commit touching package.json must update pnpm-lock.yaml.** If it's out
  of sync, CI will fail with `pnpm install --frozen-lockfile`.
- **Never commit package-lock.json, yarn.lock, or shrinkwrap.yaml.**
  Use only `pnpm-lock.yaml`.
- **Setup the pre-commit hook** (automatic lockfile sync when package.json changes):
  ```bash
  git config core.hooksPath .githooks
  ```
  This runs `pnpm install --lockfile-only` before each commit if `package.json` changed,
  ensuring `pnpm-lock.yaml` is always in sync.
- **CI enforces lockfile consistency** — each job runs `pnpm install --frozen-lockfile`,
  so lockfile mismatches are caught immediately in the PR.

## Workflow

- Dev branch for this work: `claude/repo-launch-readiness-KqLDX`.
- Before pushing, run: `npx tsc --noEmit`, `npx eslint <changed files>`,
  `pnpm run build`, and verify `pnpm-lock.yaml` is updated.
- Do not open PRs unless explicitly asked.
