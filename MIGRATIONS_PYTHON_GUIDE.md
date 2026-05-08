# 🚀 EXECUTAR MIGRAÇÕES COM PYTHON

Criei um script Python automático que executa todas as 21 migrações Supabase.

## PASSO 1: Preparar Ambiente

```bash
# Ir para o diretório do projeto
cd /vercel/share/v0-project

# Executar setup (instala dependências)
bash scripts/setup.sh

# Ativar virtual environment
source venv/bin/activate
```

## PASSO 2: Obter Credentials do Supabase

1. Abra https://app.supabase.com
2. Selecione seu projeto MasseurMatch
3. Clique em **Settings** (engrenagem)
4. Clique em **API**
5. Copie:
 - Project URL (em "Project API keys")
 - Service Role Key (em "Project API keys")

## PASSO 3: Executar Migrações

```bash
# Set as variáveis de ambiente
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Executar todas as migrações
python3 scripts/run_migrations.py
```

## O que o script faz:

✅ Lê todos os arquivos .sql em ordem 
✅ Conecta ao Supabase 
✅ Executa cada migração automaticamente 
✅ Trata erros comuns (like "already exists") 
✅ Mostra progresso em tempo real 
✅ Mostra resumo final 

## Esperado ao terminar:

```
🚀 MasseurMatch Migration Runner
📁 Found 21 migration files
🔗 Connecting to Supabase...
============================================================

[1/21] ✅ Success
[2/21] ✅ Success
...
[21/21] ✅ Success

============================================================

📊 Migration Summary:
 ✅ Executed: 21
 ⏭️ Skipped: 0
 ❌ Errors: 0

✨ All migrations completed successfully!
```

## Se der erro:

1. Verifique se as credenciais estão corretas
2. Verifique se sua conta tem permissões suficientes
3. Tente novamente

Pronto! Depois que rodar, suas tabelas estarão criadas e os dados persistirão.
