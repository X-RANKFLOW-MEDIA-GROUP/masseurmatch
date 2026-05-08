## ✅ EXECUTAR MIGRAÇÕES SUPABASE

Criei 2 formas de executar as migrações:

### OPÇÃO 1: Via API (Recomendado)

Este é o método mais fácil e seguro:

```bash
# 1. Certifique-se que o Next.js está rodando
npm run dev

# 2. Em outro terminal, execute as migrações
node scripts/run-migrations.js

# 3. Aguarde a conclusão
```

O script fará chamadas ao endpoint `/api/admin/run-migrations` que executará todas as 21 migrações automaticamente.

**O que ele faz:**
- ✓ Lê todos os arquivos `.sql` em `supabase/migrations/`
- ✓ Executa cada um na ordem correta
- ✓ Ignora erros de "já existe"
- ✓ Mostra progresso em tempo real
- ✓ Exibe um resumo ao final

---

### OPÇÃO 2: Manual no Supabase Dashboard

Se preferir fazer manualmente:

1. Vá para https://app.supabase.com
2. Selecione seu projeto
3. Clique em **SQL Editor**
4. Para cada arquivo em `supabase/migrations/*.sql`:
 - Abra o arquivo no seu editor
 - Copie TODO o conteúdo SQL
 - Cole no Supabase SQL Editor
 - Clique em **RUN**

---

### OPÇÃO 3: Python (Local)

Se estiver em desenvolvimento local:

```bash
# Instalar dependências
pip install python-dotenv supabase

# Criar .env com credenciais
echo "SUPABASE_URL=sua-url" >> .env
echo "SUPABASE_SERVICE_ROLE_KEY=sua-chave" >> .env

# Executar migrações
python3 scripts/run_migrations.py
```

---

## 🎯 RECOMENDAÇÃO

**Use a OPÇÃO 1 (Via API)** - é a mais segura e funciona em qualquer ambiente (local, staging, production).

### Passo-a-passo:

```bash
# Terminal 1: Inicia o Next.js
npm run dev

# Terminal 2: Executa as migrações
node scripts/run-migrations.js
```

**Resultado esperado:**
```
🚀 Running Supabase Migrations
📍 API URL: http://localhost:3000/api/admin/run-migrations

📊 Migration Results:
 ✓ Executed: 21
 ⏭️ Skipped: 0
 ❌ Errors: 0
 📈 Total: 21

🎉 All migrations completed successfully!
✨ Your Supabase database is now ready!
```

---

## ✅ Verificar Sucesso

Depois de executar, vá ao Supabase Dashboard e verifique em **Database → Tables**:

Você deve ver as seguintes tabelas criadas:
- ✓ profiles
- ✓ profiles_photos 
- ✓ client_favorites
- ✓ search_history
- ✓ reviews
- ✓ notifications
- ✓ contact_inquiries
- ✓ identity_verifications
- ✓ moderation_queue
- ✓ E muitas outras...

Se todas as tabelas existem, as **migrações foram executadas com sucesso!** 🎉
