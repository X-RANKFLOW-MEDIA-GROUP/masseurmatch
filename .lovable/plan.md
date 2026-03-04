

## SEO no seu projeto atual vs Next.js

### A realidade sobre Next.js no Lovable

O Lovable **não suporta Next.js** — ele é construído sobre React + Vite. Migrar para Next.js significaria sair do Lovable e reescrever o projeto do zero em outra plataforma.

**Mas a boa notícia**: você já pode ter SEO excelente com o stack atual. O Google renderiza JavaScript (CSR) normalmente desde 2019. O que realmente importa são as práticas técnicas corretas.

---

### O que já está implementado no seu projeto

- `SEOHead.tsx` com meta tags dinâmicas (OG, Twitter Cards, hreflang)
- Sitemap dinâmico via Edge Function (`generate-sitemap`)
- `robots.txt` configurado
- JSON-LD structured data
- Canonical URLs

### O que falta para SEO de nível profissional (sem Next.js)

1. **Pre-rendering / SSG estático** — Adicionar um plugin de pre-rendering ao Vite (`vite-plugin-ssr` ou `vite-ssg`) que gera HTML estático no build para as rotas principais. Isso resolve o problema de crawlers que não executam JS e melhora o First Contentful Paint.

2. **Meta tags no `index.html`** — Atualmente as meta tags são injetadas via JS no client. Para crawlers de redes sociais (Facebook, WhatsApp, Twitter) que NÃO executam JS, precisamos de uma Edge Function que sirva HTML com meta tags server-side para bots (detectando User-Agent).

3. **Dynamic OG Image rendering** — Uma Edge Function que gera imagens OG dinâmicas (com nome e foto do terapeuta) para compartilhamento em redes sociais.

### Plano de implementação

**Tarefa 1: Edge Function de Server-Side Rendering para bots (meta tags)**
- Criar `supabase/functions/render-meta/index.ts`
- Detectar User-Agent de crawlers (Googlebot, facebookexternalhit, Twitterbot, WhatsApp)
- Para bots: buscar dados do perfil/cidade no Supabase e retornar HTML com meta tags preenchidas
- Para humanos: redirecionar para o SPA normalmente
- Isso resolve o problema principal de compartilhamento em redes sociais

**Tarefa 2: Atualizar `robots.txt` e configurar redirects**
- O `robots.txt` já aponta para o sitemap dinâmico (correto)
- Adicionar headers `X-Robots-Tag` nas respostas da Edge Function

**Tarefa 3: Otimizar Core Web Vitals**
- Lazy loading de imagens com `loading="lazy"` e `fetchpriority="high"` no hero
- Preconnect para domínios externos (Supabase storage, fontes)
- Adicionar `<link rel="preload">` para assets críticos no `index.html`

### Resumo

| Aspecto | Next.js | Seu stack atual (com melhorias) |
|---|---|---|
| SSR para bots | Nativo | Via Edge Function (bot detection) |
| Meta tags sociais | Nativo | Edge Function serve HTML para bots |
| Sitemap | Plugin | Já implementado via Edge Function |
| Structured Data | Manual | Já implementado no SEOHead |
| Performance | ISR/SSG | Pre-rendering + lazy loading |
| **Esforço** | Reescrever tudo | ~3 tarefas incrementais |

A abordagem recomendada é implementar a **Edge Function de bot detection** que serve HTML com meta tags corretas para crawlers — isso resolve 90% do gap entre CSR e SSR para SEO.

