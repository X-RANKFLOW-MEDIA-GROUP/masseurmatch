# Massage Therapist Onboarding & Profile Forms

## Estrutura dos Steps
- Definidos em `steps.ts` (ordem, labels, campos por etapa)

## Campos
- Definidos em `fields.ts` (label, tipo, placeholder, opções, visibilidade)
- Campos públicos: `publicFields.ts`
- Filtros, cards, first fold: `filters.ts`

## Utilitários
- Validação de preços: `../utils/priceValidation.ts`
- Exibição de contato: `../utils/contactDisplay.ts`
- Labels de confiança: `../utils/trustLabels.ts`

## Como usar
- Use os steps para renderizar o onboarding multi-step
- Use os campos para gerar inputs dinâmicos
- Use os utilitários para garantir regras de negócio e UX

## Observações
- Nunca exibir telefone cru, só via botão
- Não usar wording proibido em badges
- Padronizar rates/hours/travel em JSON
- Separar campos públicos/internos
