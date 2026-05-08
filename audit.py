#!/usr/bin/env python3
import os, re, json
from pathlib import Path
from collections import defaultdict

REPO_PATH = r"C:\Users\admin\masseurmatch"
OUTPUT_REPORT = "audit_masseurmatch_complete.json"

P0_FILES = ['masseurmatch-legal-polished.html', 'masseurmatch-complete-legal-package.html', 'GO_LIVE_FULL_REPO_AUDIT.md', 'GO_LIVE_CHECKLIST.md']
P1_FILES = ['DEPLOYMENT_READINESS_REPORT.md', 'DEPLOYMENT_CHECKLIST.md', 'ID_VERIFICATION_STRIPE_AUDIT.md', 'ADMIN_GUIDE.md', 'MISSING_FEATURES_ANALYSIS.md']

ERROR_PATTERNS = {
    'TODO': r'\[TODO\]|\[FIXME\]|\[XXX\]|TODO:|FIXME:',
    'PLACEHOLDER': r'{{.*?}}|{%.*?%}|__[A-Z_]+__|PLACEHOLDER',
    'BROKEN_LINK': r'href=["'"'"'](#|/|http[s]?://[^\s"'"'"']+)',
    'DOUBLE_SPACE': r'  +',
    'EMPTY_TAGS': r'<[^>]+>\s*</[^>]+>',
}

def find_all_files(extensions):
    files = []
    for root, dirs, filenames in os.walk(REPO_PATH):
        dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']
        for filename in filenames:
            if any(filename.endswith(ext) for ext in extensions):
                files.append(os.path.join(root, filename))
    return sorted(files)

def get_priority(filename):
    basename = os.path.basename(filename)
    for p0_file in P0_FILES:
        if p0_file.lower() in basename.lower():
            return 'P0'
    for p1_file in P1_FILES:
        if p1_file.lower() in basename.lower():
            return 'P1'
    if 'legal' in basename.lower() or 'compliance' in basename.lower():
        return 'P0'
    return 'P2'

def audit_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e:
        return {'file': os.path.basename(filepath), 'status': 'ERROR', 'error': str(e)}
    
    filename = os.path.basename(filepath)
    priority = get_priority(filename)
    issues = []
    
    for error_type, pattern in ERROR_PATTERNS.items():
        matches = list(re.finditer(pattern, content, re.IGNORECASE))
        if matches:
            issues.append({'type': error_type, 'count': len(matches), 'severity': 'P0' if error_type in ['TODO', 'PLACEHOLDER'] else 'P2'})
    
    status = 'CLEAN' if not issues else ('CRITICAL' if any(i['severity'] == 'P0' for i in issues) else 'NEEDS_FIX')
    
    return {'file': filename, 'path': filepath, 'priority': priority, 'status': status, 'total_issues': len(issues), 'issues': issues}

print("\n" + "="*80)
print("Auditando repositório MasseurMatch...")
print("="*80 + "\n")

md_files = find_all_files(['.md'])
html_files = find_all_files(['.html'])
all_files = md_files + html_files

print(f"Encontrados: {len(md_files)} .md + {len(html_files)} .html = {len(all_files)} total\n")

results = []
for idx, filepath in enumerate(all_files, 1):
    filename = os.path.basename(filepath)
    print(f"[{idx:3d}/{len(all_files)}] {filename:<60}", end='', flush=True)
    result = audit_file(filepath)
    results.append(result)
    print(f" {result['status']}")

print("\n" + "="*80)
print("RESUMO")
print("="*80)
clean = sum(1 for r in results if r['status'] == 'CLEAN')
critical = sum(1 for r in results if r['status'] == 'CRITICAL')
needs_fix = sum(1 for r in results if r['status'] == 'NEEDS_FIX')

print(f"✅ Clean: {clean}")
print(f"🔧 Needs Fix: {needs_fix}")
print(f"🚨 Critical: {critical}")

critical_files = [r for r in results if r['status'] == 'CRITICAL']
if critical_files:
    print(f"\n🎯 CRITICAL FILES:")
    for f in critical_files[:10]:
        print(f"   ❌ {f['file']} - {f['total_issues']} issues")

report = {"total": len(results), "clean": clean, "critical": critical, "needs_fix": needs_fix, "files": results}
with open("audit_report.json", 'w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print(f"\n✅ Relatório salvo em: audit_report.json")
print("="*80 + "\n")
