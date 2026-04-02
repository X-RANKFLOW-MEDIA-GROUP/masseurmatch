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
- [ ] Validar fluxos de autenticação e páginas-chave
- [x] Auditar SEO e links quebrados
- [x] Revisar segurança e configuração de ambiente
- [ ] Revisar acessibilidade das páginas principais
- [ ] Fechar pendências P0/P1

## Resultado da auditoria (execução atual)

### Evidências técnicas
- `pnpm lint`: passou com 1 warning (`react-hooks/exhaustive-deps` em `src/components/homepage/Hero.tsx`).
- `pnpm typecheck`: passou após correções de imports quebrados.
- `pnpm build`: passou (Next.js 15.5.12; 610 páginas geradas).
- `npx playwright test tests/api/profiles-listing.spec.ts` (baseURL `http://localhost:5000`): 3/3 testes passando.

### Achados priorizados

#### P0 (bloqueadores de lançamento)
1. **Build e typecheck quebravam por imports inexistentes (corrigido)**
	- Arquivos afetados:
	  - `src/app/admin/onboarding/page.tsx`
	  - `src/app/admin/onboarding/DebugProfilesButton.tsx`
	  - `src/app/therapists/kevin-os/page.tsx`
	- Problema: referências para módulos legados em `src/mm/**` que não existem mais.
	- Ação aplicada: substituição por fluxo válido atual (`/pro/onboard`, `/pro/profile`) e uso de `getPublicTherapistBySlug` no perfil `kevin-os`.

2. **Teste crítico da API falhava por erro 500 no filtro por técnica (corrigido)**
	- Arquivo: `src/app/api/pro/profiles/route.ts`
	- Problema: filtro com `query.contains("massage_techniques", [technique])` causava falha no backend em runtime.
	- Ação aplicada: remoção do `contains` no banco para esse campo e filtro resiliente em memória com normalização case-insensitive.

#### P1 (alta prioridade pré-lançamento)
1. **Warning de lint em dependência de Hook**
	- Arquivo: `src/components/homepage/Hero.tsx`
	- Risco: comportamento inconsistente de animação/efeito em renderizações futuras.
	- Recomendação: mover `phrases` para `useMemo` ou para dentro do `useEffect`.

2. **CSP global mínima para produção**
	- Arquivo: `next.config.mjs`
	- Situação atual: CSP define apenas `frame-src` e `connect-src`.
	- Risco: baseline de segurança abaixo do ideal (faltam diretivas usuais como `default-src`, `script-src`, `style-src`, `img-src`, `object-src`, `base-uri`, `frame-ancestors`).
	- Recomendação: endurecer a policy e testar integrações (Stripe/Supabase) com allowlist explícita.

3. **Segredos em `.env` local (atenção operacional)**
	- Achado: chaves sensíveis detectadas no arquivo `.env` local (service role).
	- Nota: não é vazamento público por si só, mas exige governança de segredo, rotação e bloqueio de commit.
	- Recomendação: validar `.gitignore`, rotação periódica, e scanner de segredo no CI.

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
