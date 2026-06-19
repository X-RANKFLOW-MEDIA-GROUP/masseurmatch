# MasseurMatch — Relatório de QA (Ciclo 2 — profundo)

**Data:** 19/06/2026 · **Ambiente:** produção live + clone `masseurmatch-repo` · **DB:** Supabase `ijsdpozjfjjufjsoexod`

## Status dos bugs

### ✅ Corrigido e CONFIRMADO no ar (produção)
1. **Perfis de terapeuta davam 404 (P0).** `getPublicTherapistBySlug` comparava slug contra a coluna `id` (UUID) → erro de cast `22P02` → todo perfil real por slug caía em 404 (8 perfis). Afetava TODO link de perfil do site. **Verificado: o perfil agora abre.** (`src/app/_lib/directory.ts`)

### ✅ Corrigido no clone — aguardando push (1 commit fecha tudo)
2. **`/explore` quebrava com loop infinito (#185).** Ping-pong de efeitos por causa do `useDeferredValue`. (`src/app/explore/ExplorePageClient.tsx`)
3. **`/explore` redirecionava pra `/explore/usa` → 404.** `exploreFiltersToUrl` emitia `city=` vazio e o middleware redirecionava pra slug vazio. Corrigido em `src/app/_lib/explore.ts` + `src/middleware.ts`. (segundo bug, antes escondido pelo crash #185)
4. **`/admin/approvals` quebrava ("Something went wrong").** Banco tem `profile_status='pending'`, mas o código só mapeava `pending_approval` → `config.icon` em `undefined`. Fallback resiliente. (`src/app/admin/approvals/page.tsx`)
5. **Link de blog quebrado no email `CityDigestEmail`** (`/blog/deep-tissue-signs` inexistente → post real). (`src/emails/CityDigestEmail.tsx`)
6. **Deploy só pela `main`** (`vercel.json` `git.deploymentEnabled`).

## ✅ Áreas varridas sem erro
- **Público (~30):** home, search, near-me, cities, how-it-works, for-therapists, trust, pricing, safety, about, contact, advertise, faq, blog, guides, compare, legais (privacy/terms/cookie/accessibility/community-guidelines/platform-disclaimer/legal).
- **Templates dinâmicos:** cidades (dallas, miami, new-york, los-angeles), perfis, compare/[slug] (todos), guides/[slug], explore/usa/[city].
- **Admin (todas as abas):** dashboard, users, therapists, photos, moderation, bookings, sms, billing, reports, logs, blog, cities, keywords, seo, support, verification, legal, analytics, complaints, onboarding, settings. (só /approvals quebrava — corrigido)
- **Pro (logado):** dashboard, profile, photos, inquiries, analytics, subscription, billing, settings, listing.
- **Segurança de acesso:** rotas /admin/* e /pro/* bloqueiam corretamente acesso não autenticado (redirect pro login). ✅

## ⚠️ Precisa da sua decisão/ação
- **Push das correções 2–6:** `git add -A && git commit -m "..." && git push origin main` no `masseurmatch-repo` (eu não consigo dar push: lock do git + sem credenciais).
- **Branches "só main":** produção está sendo servida a partir da branch do **PR #428** (`fix/final-production-go-live-closure`), e há branches `claude/*` abertas. Para valer "só main": mesclar/fechar os PRs e deletar as branches no GitHub (ação destrutiva — você faz, ou me dá acesso ao GitHub pra eu guiar).
- **Segurança do banco (Supabase):** bucket `therapist-photos` permite listagem; funções SECURITY DEFINER executáveis por anon; proteção de senha vazada e MFA desativadas. (no relatório do ciclo 1; alterações de acesso = sua aprovação)

## Itens menores
- Perfis de **amostra** (`bruno-santos`, `bruno-dallas-tx`): "gallery photo 2" como imagem quebrada (só nos showcases).
- Páginas `/guides/[slug]` usam título genérico "Guide | MasseurMatch" (SEO menor).
- Dashboard admin mostra "Total Therapists: 1" enquanto há 8 perfis públicos (métrica a revisar).

## Observação de honestidade
Uma garantia de "100% de tudo" exige o ciclo iterativo (push → re-teste → fix), que é exatamente o objetivo da tarefa horária. Recomendo: (1) dar o push das correções, (2) limpar as branches, (3) eu reconfirmo no live e ligo o QA horário.
