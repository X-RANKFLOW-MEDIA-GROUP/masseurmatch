# Competitor gap analysis (MasseurFinder + RentMasseur) — 2026-04-28

## Sources reviewed
- MasseurFinder homepage and search/discovery pages:
  - https://www.masseurfinder.com/
  - https://www.masseurfinder.com/male_massage/search.php
- Public discussion signals about RentMasseur workflows and trust/perception:
  - https://www.reddit.com/r/GayMen/comments/15ydj5s/what_are_your_thoughts_on_masseur_finder/
  - https://www.reddit.com/r/askgaybros/comments/hrtc2l/rentmasseurs/

## Key competitor capabilities observed
1. **Fast discovery UX from homepage** (location-first search).
2. **High city coverage + city browse navigation** as a primary discovery mechanism.
3. **"Available now" positioning** (MasseurFinder help content references this explicitly).
4. **Trust shorthand in search** (community often references licensed/certified and reviews in RentMasseur discussions).

## MasseurMatch diagnosis
### Working strengths
- Strong modern UI, SEO-forward city architecture, and richer profile data model.
- Existing advanced filters (availability, verified, price, identity/language signals) already exceed legacy directories in structure.

### Functional issue fixed in this cycle
- **Critical API reliability bug in no-env/dev-like contexts**:
  - `GET /api/pro/profile` could return `500` instead of expected `401` when Supabase env vars were absent.
  - Root cause: Supabase client was instantiated at import-time and threw hard before auth guard logic ran.

## Fix implemented
- Hardened Supabase browser client bootstrap to avoid crashing at module import when env vars are missing.
- Added `hasSupabaseClientEnv` flag and a guarded fallback proxy client that throws only on actual client method use.
- Result: auth-protected endpoints now return consistent auth errors (`401`) instead of infra errors (`500`) when appropriate.

## Competitive impact of this fix
Even though this is backend hardening, it directly improves:
- **Trust and stability** vs legacy competitors (fewer hard failures on protected routes).
- **Operational quality** for QA/staging and partial-env deployments.
- **Conversion safety** by preventing avoidable server errors from interrupting user journeys.

## Next implementation priorities (recommended)
1. Add explicit **Licensed / Credential verified** filter taxonomy and badge copy in Explore cards.
2. Expand **public review provenance** UI (how verification works) to strengthen trust against competitor skepticism.
3. Add **surface-level availability chips** on more grid/list contexts (not only inside deep profile views).
4. Add a lightweight **"save search" preset** flow for repeat users.
