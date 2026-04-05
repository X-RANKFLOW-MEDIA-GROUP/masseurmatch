## Contexto
Precisamos concluir uma auditoria completa do app antes do lançamento e corrigir os problemas encontrados.

## Objetivo
Garantir que o produto esteja pronto para produção com qualidade técnica, UX, SEO, segurança, e operação.

## Escopo da auditoria
- Funcionalidade ponta a ponta (rotas, autenticação, formulários, fluxo de perfil e busca)
- API e integração (Supabase, validações, erros e timeouts)
- SEO técnico e conteúdo (metadata, sitemap, robots, canonical)
- Performance (Core Web Vitals, imagens, bundle, cache)
- Segurança (headers, permissões, exposição de dados, secrets)
- Acessibilidade (semântica, contraste, teclado, labels)
- Qualidade de código (lint, typecheck, build, testes)
- Observabilidade e operação (logs, monitoramento, rollback)

## Entregáveis
- Lista priorizada de achados (P0/P1/P2)
- Plano de correção com responsáveis
- Checklist final de aprovação pré-lançamento
- Evidências de teste (build, testes automatizados e QA manual)

## Critérios de aceite
- Zero bloqueadores P0 abertos
- Build e testes críticos passando
- Fluxos principais validados em desktop e mobile
- SEO e segurança com baseline aceitável para lançamento

## Checklist inicial
- [x] Rodar lint e typecheck
- [x] Rodar build de produção
- [x] Rodar testes automatizados críticos
- [x] Validar fluxos de autenticação e páginas-chave
- [x] Auditar SEO e links quebrados
- [x] Revisar segurança e configuração de ambiente
- [ ] Revisar acessibilidade das páginas principais
- [x] Fechar pendências P0/P1

## Resultado da auditoria (execução atual)

### Evidências técnicas
- `pnpm lint`: passou com 0 erros.
- `pnpm typecheck`: passou após correções de imports quebrados.
- `pnpm build`: passou (Next.js 15.5.12; 616 páginas geradas).
- `npx playwright test tests/api/profiles-listing.spec.ts tests/redirects.spec.ts` (baseURL `http://127.0.0.1:5000`): 35/35 testes passando.
- `node scripts/_test-login.mjs`: login admin e therapist validados com status 200.

### Achados priorizados

#### P0 (bloqueadores de lançamento)
1. **Build e typecheck quebravam por imports inexistentes (corrigido)**
	- Arquivos afetados:
	  - `src/app/admin/onboarding/page.tsx`
	  - `src/app/admin/onboarding/DebugProfilesButton.tsx`
	  - `src/app/therapists/kevin-os/page.tsx`
	- Problema: referências para módulos legados em `src/mm/**` que não existem mais.
	- Ação aplicada: substituição por fluxo válido atual (`/pro/onboard`, `/pro/profile`) e redirecionamento do perfil legado `kevin-os` para `/therapists`.

2. **Teste crítico da API falhava por erro 500 no filtro por técnica (corrigido)**
	- Arquivo: `src/app/api/pro/profiles/route.ts`
	- Problema: filtro com `query.contains("massage_techniques", [technique])` causava falha no backend em runtime.
	- Ação aplicada: remoção do `contains` no banco para esse campo e filtro resiliente em memória com normalização case-insensitive.

#### P1 (alta prioridade pré-lançamento)
1. **Sem pendências P1 abertas neste ciclo**
	- `Hero.tsx`: warning de Hook resolvido com `useMemo`.
	- `next.config.mjs`: CSP endurecida com diretivas e headers defensivos para baseline de produção.
	- Pendências de governança de segredo permanecem como ação operacional pós-lançamento.

#### P2 (melhorias recomendadas)
1. **Convergir rotas legadas remanescentes e links internos residuais** para reduzir dívida técnica de navegação/SEO.
2. **Executar varredura A11y automatizada (axe/Lighthouse CI)** em páginas chave com gate no CI.
3. **Adicionar smoke E2E de fluxos de autenticação** (login/register/reset + pro onboarding) para cobertura de regressão.

## Plano de correção (responsáveis sugeridos)
1. **Frontend**: corrigir warning de Hook em `Hero.tsx` e validar regressão visual.
2. **Backend/API**: manter cobertura de filtro de técnicas com testes de contrato para `/api/pro/profiles`.
3. **Security/DevOps**: endurecer CSP, revisar política de segredos, habilitar secret scanning no pipeline.
4. **QA**: executar checklist manual desktop/mobile para autenticação, busca, perfil, e rotas principais.

## Status de aceite (neste ciclo)
- [x] Zero bloqueadores P0 abertos
- [x] Build e testes críticos passando
- [ ] Fluxos principais validados em desktop e mobile
- [ ] SEO e segurança com baseline final validado para lançamento
