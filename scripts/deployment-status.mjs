#!/usr/bin/env node
/**
 * Vercel Deployment Status Check
 * Verifies that the codebase is ready for Vercel deployment
 * Assumes environment variables are configured in Vercel dashboard
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('\n✨ === VERCEL DEPLOYMENT STATUS ===\n');

// 1. Check critical code issues are fixed
console.log('🔍 Code Quality Checks:\n');

const checks = [
  {
    name: 'No duplicate imports in ResetPasswordClient',
    file: 'src/app/reset-password/ResetPasswordPageClient.tsx',
    validate: (content) => (content.match(/import.*Link/g) || []).length === 1,
  },
  {
    name: 'Supabase client shim exists',
    file: 'src/lib/supabase/client.ts',
    validate: (content) => content.includes('@/integrations/supabase/client'),
  },
  {
    name: 'Alert component configured',
    file: 'src/components/ui/alert.tsx',
    validate: (content) => content.includes('AlertTitle') && content.includes('AlertDescription'),
  },
  {
    name: 'No network font dependencies',
    file: 'src/app/layout.tsx',
    validate: (content) => !content.includes('next/font/google'),
  },
  {
    name: 'Sitemap has no duplicate calls',
    file: 'src/app/sitemap.ts',
    validate: (content) => (content.match(/buildNeighborhoodsSitemapEntries/g) || []).length === 1,
  },
];

let allPassed = true;
checks.forEach((check) => {
  const filePath = path.join(rootDir, check.file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const passed = check.validate(content);
    console.log(`  ${passed ? '✅' : '❌'} ${check.name}`);
    if (!passed) allPassed = false;
  } else {
    console.log(`  ⚠️ ${check.name} (file not found)`);
    allPassed = false;
  }
});

// 2. Check build artifacts
console.log('\n📦 Build Artifacts:\n');
const nextDir = path.join(rootDir, '.next');
if (fs.existsSync(nextDir)) {
  try {
    const stats = execSync(`du -sh "${nextDir}"`, { encoding: 'utf8' }).trim();
    console.log(`  ✅ Build directory: ${stats}`);
  } catch (err) {
    console.log('  ⚠️ Could not determine build size');
  }
} else {
  console.log('  ⚠️ Build directory not found (run pnpm build)');
}

// 3. Check package.json for build script
console.log('\n🏗️ Build Configuration:\n');
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
if (packageJson.scripts && packageJson.scripts.build) {
  console.log(`  ✅ Build script: ${packageJson.scripts.build}`);
} else {
  console.log('  ❌ No build script found');
  allPassed = false;
}

// 4. Environment setup status
console.log('\n🔐 Environment Variables:\n');
console.log('  ℹ️  ENVIRONMENT REQUIREMENT:');
console.log('     Local development: Not required (development values can be used)');
console.log('     Vercel deployment: All 15 required vars must be configured');
console.log('     Current workspace: Variables not loaded (expected)');

const criticalVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'RESEND_API_KEY',
];

console.log('\n  Key checks in Vercel dashboard:');
criticalVars.forEach((varName) => {
  // Check if it would be set in Vercel (we can't check actual Vercel here without CLI)
  console.log(`     - ${varName}: Configure in Vercel → Settings → Environment Variables`);
});

// 5. Deployment readiness summary
console.log('\n' + '='.repeat(60));
console.log('\n📋 DEPLOYMENT READINESS REPORT\n');

const status = allPassed ? 'READY ✅' : 'REVIEW NEEDED 🟡';
console.log(`Status: ${status}`);

if (allPassed) {
  console.log('\n✨ The application is ready for Vercel deployment!');
  console.log('\nNext steps:');
  console.log('  1. Verify all 15 environment variables in Vercel dashboard');
  console.log('  2. Trigger deployment: git push origin main');
  console.log('  3. Monitor Vercel build logs at: https://vercel.com/dashboard');
  console.log('  4. Test endpoints after deployment completes');
} else {
  console.log('\n⚠️ Some checks failed. Review code before deploying.');
}

console.log('\n' + '='.repeat(60) + '\n');

// Return exit code based on readiness
process.exit(allPassed ? 0 : 1);
