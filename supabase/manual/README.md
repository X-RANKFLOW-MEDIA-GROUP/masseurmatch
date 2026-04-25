# Execução manual de migrações Supabase

Este diretório contém utilitários para executar migrações manualmente no **Supabase Dashboard → SQL Editor** quando o CLI não está disponível.

## Arquivos

- `apply_all_migrations.sql`: bundle único com todas as migrações em `supabase/migrations`, em ordem lexicográfica (timestamp).

## Como gerar novamente

```bash
node scripts/build-manual-migration-bundle.mjs
```

## Como executar no Dashboard

1. Acesse **Supabase Dashboard → SQL Editor**.
2. Abra `supabase/manual/apply_all_migrations.sql`.
3. Copie todo o conteúdo e execute.
4. Rode as queries de verificação abaixo (separadamente):

```sql
SELECT COUNT(*) AS total_tables
FROM information_schema.tables
WHERE table_schema = 'public';

SELECT *
FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 20;
```

## Observações

- O bundle é gerado com `BEGIN; ... COMMIT;` para manter execução transacional.
- Sempre prefira validar em staging antes de executar em produção.
