

# Sitemap Dinâmico para MasseurMatch

## Objetivo
Criar uma Edge Function que gera o sitemap.xml dinamicamente, consultando o banco de dados para incluir apenas URLs que merecem indexação. O robots.txt sera atualizado para apontar para o sitemap.

## O que sera criado

### 1. Edge Function `generate-sitemap`
Uma funcao backend que gera o XML do sitemap consultando o banco de dados em tempo real:

**URLs estaticas (sempre presentes):**
- `/` (prioridade 1.0)
- `/explore` (0.8)
- `/pricing` (0.7)
- `/about` (0.6)
- `/contact` (0.5)
- `/faq` (0.6)
- `/safety` (0.5)
- `/terms` (0.3)
- `/privacy` (0.3)

**URLs dinamicas de cidade** (`/city/{slug}`) - prioridade 0.9:
- Consulta a tabela `profiles` para encontrar cidades com pelo menos 1 perfil ativo
- Tambem inclui as 6 cidades hardcoded atuais (LA, SF, NY, Miami, Chicago, Seattle) que possuem conteudo editorial unico

**URLs dinamicas de perfil** (`/therapist/{id}`) - prioridade 0.7:
- Somente perfis com `is_active = true`
- Somente perfis com campos essenciais preenchidos (display_name ou full_name, bio, city)
- Perfis incompletos ou inativos sao excluidos automaticamente

**URLs excluidas (nunca entram):**
- `/auth`, `/register`
- `/dashboard/*` (todas as rotas do painel)
- Qualquer rota tecnica

### 2. Atualizacao do `robots.txt`
Adicionar a diretiva `Sitemap:` apontando para a Edge Function, e bloquear explicitamente rotas privadas:

```text
Disallow: /dashboard
Disallow: /auth
Disallow: /register

Sitemap: https://masseurmatch.com/sitemap.xml
```

### 3. Rota proxy no frontend (opcional mas recomendado)
Como o sitemap precisa estar acessivel em `/sitemap.xml`, e o app e uma SPA, a Edge Function servira diretamente via URL publica do backend. O `robots.txt` apontara para a URL correta.

---

## Detalhes Tecnicos

### Edge Function `generate-sitemap/index.ts`

```text
Fluxo:
1. Recebe GET request
2. Consulta profiles WHERE is_active = true AND display_name IS NOT NULL AND bio IS NOT NULL
3. Extrai cidades unicas dos perfis ativos
4. Monta XML com:
   - URLs estaticas com prioridade fixa
   - URLs de cidades (hardcoded + dinamicas do DB)
   - URLs de perfis ativos e completos
5. Retorna Content-Type: application/xml
```

**Criterios de inclusao de perfil:**
- `is_active = true`
- `display_name` ou `full_name` preenchido
- `bio` com pelo menos 50 caracteres
- `city` preenchido

**Formato XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://masseurmatch.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- ... -->
</urlset>
```

### Arquivos modificados/criados
1. **Criar** `supabase/functions/generate-sitemap/index.ts` - Edge Function
2. **Atualizar** `public/robots.txt` - Adicionar Sitemap + Disallow

### Nota sobre rotas futuras
O sitemap esta preparado para a estrutura atual de rotas. Quando forem implementadas as paginas de servicos (`/services/*`), blog (`/blog/*`) e a nova estrutura `/city/{slug}/therapist/{profile-slug}`, basta atualizar a Edge Function para incluir essas novas consultas.

