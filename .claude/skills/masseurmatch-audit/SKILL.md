---
name: masseurmatch-audit
description: Auditoria completa e higienização do codebase MasseurMatch em treze fases — erros, segurança, performance, acessibilidade, fluxos de negócio, integrações (Supabase, Vercel, Cloudinary), testes e privacidade. Use quando o usuário pedir "auditoria completa", "audit", "higienização", "verificar o código de ponta a ponta", "encontrar e remover erros", ou antes de um launch/deploy importante do MasseurMatch. Também aceita execução parcial ("rode só a fase de segurança").
---

# MasseurMatch Full Audit

Auditoria de ponta a ponta do codebase MasseurMatch. Execute as fases em ordem. Escreva o progresso em AUDIT_PROGRESS.md ao final de cada fase antes de iniciar a próxima, para permitir retomada se a sessão for interrompida.

## Contexto do projeto

- Diretório de massoterapeutas, modelo puro de diretório: sem intermediação de pagamento ou agendamento.
- Stack: Next.js + Supabase + Vercel + Cloudinary.
- Tiers: Standard $39, Pro $79, Elite $149.
- Ranking: RPC no Supabase com seis sinais ponderados.
- Demand Radar: dashboard de tendências de keywords nas views admin e pro.
- Compliance: política FOSTA-SESTA vigente; moderação de conteúdo obrigatória.
- E-mails: legal@masseurmatch.com (jurídico), billing@masseurmatch.com (cobrança), support@masseurmatch.com (geral).
- Histórico: bug de auth em establishClientSession e chave restrita do Cloudinary já foram P0; PR #405 já quebrou a build.

## Regra de interrupção

Se em qualquer fase encontrar P0 de segurança (segredo exposto, RLS ausente em tabela com PII, rota admin aberta), pare, corrija ou reporte imediatamente, e só então continue.

## Fase 1 — Mapeamento

1. Liste a árvore completa do projeto e classifique cada arquivo: ativo, morto, duplicado, órfão.
2. Gere inventário de rotas (app/pages router), API routes, edge functions, componentes, hooks, utils, migrations e RPCs do Supabase.
3. Identifique todos os pontos de integração externa: Supabase, Vercel, Cloudinary, e-mail/SMS, analytics, SDKs e fetches para APIs externas.

## Fase 2 — Erros e bugs

Antes de começar, rode o plugin code-review se instalado (agentes paralelos de revisão) e incorpore os achados.

4. Rode tsc --noEmit, eslint e build completo. Liste todos os erros e warnings com arquivo e linha.
5. Verifique o fluxo de autenticação, incluindo establishClientSession e lógica de sessão/refresh token: race conditions, sessão nula, redirect loops, cookies inseguros.
6. Verifique o upload de fotos via Cloudinary: chaves, permissões, presets, tratamento de erro, limites de tamanho e tipo.
7. Audite todas as chamadas ao Supabase: queries sem tratamento de erro, .single() que pode falhar, tipos desatualizados vs schema real, N+1, chamadas client-side que deveriam ser server-side.
8. Valide o RPC de ranking: assinatura, pesos dos seis sinais, comportamento com dados nulos ou perfis incompletos, performance (EXPLAIN quando possível).
9. Verifique promises sem await, try/catch vazios, catch que engole erro, console.log em produção, estados de loading/error ausentes na UI.

## Fase 3 — Segurança

Antes de começar, rode /security-review e incorpore os achados. Em seguida:

10. Audite RLS no Supabase: toda tabela deve ter policies; liste tabelas sem RLS ou com policies permissivas demais (using true).
11. Procure segredos hardcoded no código e em arquivos versionados: service_role do Supabase, API secret do Cloudinary, tokens. Confirme que apenas variáveis NEXT_PUBLIC_ seguras vão ao client.
12. Verifique validação e sanitização de todo input de usuário: XSS, SQL injection via RPC, path traversal em URLs de imagem.
13. Confirme separação de privilégios admin vs pro: nenhuma rota ou API admin acessível sem verificação de role no servidor.
14. Verifique rate limiting em endpoints públicos (busca, signup, contato) e proteção contra scraping do diretório.

## Fase 4 — Higienização

15. Remova código morto, imports não usados, componentes órfãos, arquivos duplicados, dependências não utilizadas (npx depcheck).
16. Padronize nomenclatura de arquivos, estrutura de pastas, formatação (prettier), ordenação de imports.
17. Elimine any, @ts-ignore e @ts-expect-error sem justificativa; substitua por tipos gerados do schema (supabase gen types).
18. Consolide lógica duplicada em utils/hooks compartilhados.

## Fase 5 — Integrações e deploy

19. Vercel: valide vercel.json, variáveis por ambiente (preview vs production), regiões, limites de serverless functions, headers de segurança (CSP, HSTS, X-Frame-Options), redirects e rewrites.
20. Verifique sitemap.xml e robots.txt: cobertura de todos os perfis publicados, ausência de rotas privadas indexadas, canonical tags.
21. Valide SEO técnico: metadata por rota, Open Graph, dados estruturados schema.org (LocalBusiness/Person para perfis).
22. Confirme que migrations do Supabase estão versionadas e reproduzíveis e que o schema local bate com produção.

## Fase 6 — Execução e relatório

23. Corrija tudo que for seguro corrigir automaticamente. Commit atômico por correção: fix(escopo): descrição.
24. Problemas que exigem decisão de produto ou acesso externo (dashboards Supabase, Vercel, Cloudinary): registre em AUDIT_REPORT.md na raiz com severidade (P0/P1/P2), arquivo:linha, descrição, impacto, correção recomendada e passo a passo manual.
25. Rode novamente tsc, eslint e build para confirmar zero erros. Resuma: arquivos auditados, erros corrigidos, arquivos removidos, pendências por severidade.

## Fase 7 — Performance e Core Web Vitals

26. Audite bundle size com @next/bundle-analyzer: liste os 10 maiores chunks, bibliotecas pesadas com alternativas leves, imports que quebram tree-shaking.
27. Verifique otimização de imagens: next/image em todos os lugares, transformações Cloudinary (f_auto, q_auto, responsivo), lazy loading, dimensões explícitas contra CLS.
28. Identifique rotas que deveriam ser estáticas ou ISR mas renderizam dinamicamente; caching ausente em fetches (revalidate, cache tags).
29. Verifique índices no Postgres para toda coluna em WHERE, ORDER BY e JOIN das queries do diretório e do ranking; liste índices ausentes com o CREATE INDEX recomendado.

## Fase 8 — Acessibilidade

30. Audite WCAG 2.1 AA: alt em imagens de perfil, labels em inputs, contraste, navegação por teclado em filtros e galerias, focus states, aria em modais, tabs do Demand Radar e dropdowns.

## Fase 9 — Fluxos críticos de negócio

31. Trace ponta a ponta: signup de terapeuta, criação/edição de perfil, upload de fotos, publicação, busca por cidade/especialidade, perfil público, contato, upgrade de tier. Liste pontos de falha sem tratamento e estados intermediários quebrados (perfil incompleto, sem fotos, cidade sem resultados).
32. Verifique gates de tier aplicados no servidor, não só na UI; downgrade/expiração tratados; nenhum benefício Elite acessível manipulando o client.
33. Valide o pipeline de moderação: perfis e fotos passam por aprovação antes de publicar; campos livres têm filtro contra conteúdo que viole FOSTA-SESTA; fluxo de denúncia funcional.

## Fase 10 — E-mail, SMS e comunicações

34. Audite envios transacionais (confirmação de signup, reset de senha, notificações de contato): templates existem, remetentes corretos por assunto (support@, billing@, legal@), tratamento de falha de envio, links funcionais.
35. Se houver SMS de outreach: opt-out obrigatório, armazenamento de consentimento, conformidade TCPA.

## Fase 11 — Observabilidade e resiliência

36. Verifique captura de erros em produção (Sentry ou equivalente): se ausente, P1 com plano de instalação; se presente, confirme source maps e contexto sem PII.
37. Confirme error boundaries no React, páginas 404/500 customizadas, fallbacks quando Supabase ou Cloudinary caírem: o diretório degrada, não quebra em tela branca.
38. Verifique logging estruturado nas API routes: request id, sem dados sensíveis.

## Fase 12 — Testes e CI/CD

39. Inventarie cobertura existente. Crie no mínimo: unitários para o cálculo de ranking (incluindo nulos), integração para auth e gates de tier, smoke E2E (Playwright) do fluxo busca → perfil → contato.
40. Verifique pipeline de CI (GitHub Actions) rodando tsc, eslint, testes e build em todo PR; se ausente, crie o workflow e inclua a action anthropics/claude-code-security-review. Branch protection na main: pendência manual.

## Fase 13 — Dados e privacidade

41. Audite PII: quais tabelas guardam dados pessoais, fluxo de exclusão de conta que remove dados e fotos do Cloudinary, retenção de dados de contato visitante-terapeuta.
42. Verifique cookies e consentimento: banner se houver analytics/tracking, política de privacidade linkada, coerência entre coleta real e política declarada.
43. Confirme backups do Supabase habilitados e teste de restore documentado (pendência manual se sem acesso ao dashboard).

## Regras

1. Não altere lógica de negócio (pesos do ranking, pricing, regras FOSTA-SESTA) sem listar como pendência.
2. Não exponha nem mova segredos para o código.
3. Não delete migrations.
4. Trabalhe na branch audit/full-codebase-cleanup.
5. Ao terminar cada fase, atualize AUDIT_PROGRESS.md antes de iniciar a próxima.
6. Saídas finais obrigatórias: AUDIT_REPORT.md (pendências) e AUDIT_PROGRESS.md (rastreamento), ambos na raiz.