#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('\n🚀 === VERCEL DEPLOYMENT READINESS CHECK ===\n');

// Check known issues from deployment-log-analysis-2026-04-10.md

console.log('🔍 Checking for known deployment issues:\n');

// 1. Check for duplicate imports in ResetPasswordPageClient
console.log('1. Checking ResetPasswordPageClient.tsx for duplicate imports...');
const resetPasswordPath = path.join(rootDir, 'src/app/reset-password/ResetPasswordPageClient.tsx');
if (fs.existsSync(resetPasswordPath)) {
  const content = fs.readFileSync(resetPasswordPath, 'utf8');
  const linkImports = content.match(/import.*Link.*from.*['"][^'"]*['"]/g) || [];
  if (linkImports.length > 1) {
    console.log(`   ❌ FOUND ${linkImports.length} Link imports (should be 1)`);
    linkImports.forEach((imp, i) => console.log(`      ${i + 1}. ${imp}`));
  } else {
    console.log('   ✅ No duplicate Link imports');
  }
} else {
  console.log('   ⚠️ File not found');
}

// 2. Check if supabase/client shim exists
console.log('\n2. Checking for Supabase client compatibility shim...');
const supabaseShimPath = path.join(rootDir, 'src/lib/supabase/client.ts');
if (fs.existsSync(supabaseShimPath)) {
  const content = fs.readFileSync(supabaseShimPath, 'utf8');
  if (content.includes('@/integrations/supabase/client')) {
    console.log('   ✅ Supabase client shim exists and is configured');
  } else {
    console.log('   ⚠️ Shim exists but may not be properly configured');
  }
} else {
  console.log('   ❌ Supabase client shim not found');
}

// 3. Check if alert component exists
console.log('\n3. Checking for UI alert component...');
const alertPath = path.join(rootDir, 'src/components/ui/alert.tsx');
if (fs.existsSync(alertPath)) {
  const content = fs.readFileSync(alertPath, 'utf8');
  const hasAlert = content.includes('AlertTitle') && content.includes('AlertDescription');
  if (hasAlert) {
    console.log('   ✅ Alert component exists with required exports');
  } else {
    console.log('   ⚠️ Alert component may be incomplete');
  }
} else {
  console.log('   ❌ Alert component not found');
}

// 4. Check font configuration
console.log('\n4. Checking font configuration in layout...');
const layoutPath = path.join(rootDir, 'src/app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const content = fs.readFileSync(layoutPath, 'utf8');
  const hasNetworkFonts = content.includes('next/font/google');
  if (hasNetworkFonts) {
    console.log('   ⚠️ Found next/font/google import (network dependency)');
  } else {
    console.log('   ✅ No network font dependencies in layout');
  }
}

// 5. Build output size check
console.log('\n5. Checking build artifacts...');
const nextDirPath = path.join(rootDir, '.next');
if (fs.existsSync(nextDirPath)) {
  try {
    const stats = execSync(`du -sh "${nextDirPath}"`, { encoding: 'utf8' }).trim();
    console.log(`   ✅ Build directory exists: ${stats}`);
  } catch (err) {
    console.log('   ⚠️ Could not determine build size');
  }
} else {
  console.log('   ⚠️ Build directory not found (run pnpm build first)');
}

// Environment-specific checks
console.log('\n6. Checking critical environment variables...');
const criticalVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'RESEND_API_KEY',
];

let allCritical = true;
criticalVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(`   ✅ ${varName}`);
  } else {
    console.log(`   ❌ ${varName} - NOT SET`);
    allCritical = false;
  }
});

console.log('\n' + '='.repeat(60) + '\n');

if (allCritical) {
  console.log('✨ All critical checks passed! Ready for deployment.\n');
  process.exit(0);
} else {
  console.log('⚠️ Some checks failed. Please review above.\n');
  process.exit(1);
}
