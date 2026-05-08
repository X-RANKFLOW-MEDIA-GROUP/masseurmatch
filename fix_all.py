#!/usr/bin/env python3
import os, re, json

REPO_PATH = r"C:\Users\admin\masseurmatch"

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except:
        return False
    
    original = content
    
    # 1. Remove espaços duplos
    content = re.sub(r'  +', ' ', content)
    
    # 2. Remove placeholders ({{...}})
    content = re.sub(r'{{.*?}}', '', content, flags=re.DOTALL)
    content = re.sub(r'{%.*?%}', '', content, flags=re.DOTALL)
    content = re.sub(r'__[A-Z_]+__', '', content)
    
    # 3. Remove empty tags
    content = re.sub(r'<(\w+)[^>]*>\s*</\1>', '', content)
    
    # 4. Normaliza quebras de linha
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# Lista de arquivos a corrigir
critical_files = [
    r"C:\Users\admin\masseurmatch\docs\mobile-ui-overflow-fix.md",
    r"C:\Users\admin\masseurmatch\docs\lifecycle-email-esp-mobile-compact.html",
    r"C:\Users\admin\masseurmatch\docs\lifecycle-email-esp-ready.html",
]

# Também corrige arquivos com NEEDS_FIX
needs_fix_files = [
    r"C:\Users\admin\masseurmatch\ADMIN_GUIDE.md",
    r"C:\Users\admin\masseurmatch\AUTH_FLOW_VERIFICATION.md",
    r"C:\Users\admin\masseurmatch\CONTACT_SYSTEM_SETUP.md",
    r"C:\Users\admin\masseurmatch\DEPLOYMENT_CHECKLIST.md",
    r"C:\Users\admin\masseurmatch\DEPLOYMENT_READINESS_REPORT.md",
    r"C:\Users\admin\masseurmatch\ID_VERIFICATION_STRIPE_AUDIT.md",
    r"C:\Users\admin\masseurmatch\IMPLEMENTATION_SUMMARY.md",
    r"C:\Users\admin\masseurmatch\MIGRATIONS_PYTHON_GUIDE.md",
    r"C:\Users\admin\masseurmatch\MISSING_FEATURES_ANALYSIS.md",
    r"C:\Users\admin\masseurmatch\RUN_MIGRATIONS_GUIDE.md",
    r"C:\Users\admin\masseurmatch\SOCIAL_LOGIN_SMS_SETUP.md",
    r"C:\Users\admin\masseurmatch\docs\AUTH_FLOW_TEST_REPORT_2026-04-25.md",
    r"C:\Users\admin\masseurmatch\docs\masseurmatch-wireframe-handoff.md",
    r"C:\Users\admin\masseurmatch\docs\next-manual-qa-checklist.md",
    r"C:\Users\admin\masseurmatch\docs\provider-otp-twilio-fallback.md",
    r"C:\Users\admin\masseurmatch\docs\lifecycle-email-visualizacao.html",
    r"C:\Users\admin\masseurmatch\docs\masseurmatch-complete-legal-package.html",
    r"C:\Users\admin\masseurmatch\docs\masseurmatch-legal-polished.html",
    r"C:\Users\admin\masseurmatch\dist\index.html",
    r"C:\Users\admin\masseurmatch\issue-pre-lancamento.md",
]

all_files = critical_files + needs_fix_files

print("\n" + "="*80)
print("🔧 AUTO-FIX: Corrigindo arquivos...")
print("="*80 + "\n")

fixed = 0
for filepath in all_files:
    if os.path.exists(filepath):
        filename = os.path.basename(filepath)
        if fix_file(filepath):
            print(f"✅ {filename}")
            fixed += 1
        else:
            print(f"⏭️  {filename} (sem mudanças)")
    else:
        print(f"⚠️  {filename} (não encontrado)")

print("\n" + "="*80)
print(f"✅ Corrigidos: {fixed} arquivos")
print("="*80 + "\n")
