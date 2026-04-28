#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const envExamplePath = path.join(rootDir, '.env.example');

// Read .env.example to get all required and optional keys
const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
const envLines = envExampleContent.split('\n');

const requiredVars = new Set();
const optionalVars = new Set();
const varDescriptions = {};

envLines.forEach((line) => {
  const match = line.match(/^([A-Z_]+)=.*#\s*\[(REQUIRED|OPTIONAL)\]/);
  if (match) {
    const [, varName, type] = match;
    if (type === 'REQUIRED') {
      requiredVars.add(varName);
    } else {
      optionalVars.add(varName);
    }
    varDescriptions[varName] = line.split('#')[1]?.trim() || '';
  }
});

// Check current environment
console.log('\n📋 === ENVIRONMENT VARIABLES VERIFICATION ===\n');

let missingRequired = [];
let missingOptional = [];
let configuredRequired = [];
let configuredOptional = [];

// Check required variables
console.log('🔴 REQUIRED VARIABLES:\n');
requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}`);
    configuredRequired.push(varName);
  } else {
    console.log(`  ❌ ${varName} - MISSING`);
    missingRequired.push(varName);
  }
});

// Check optional variables
console.log('\n🟡 OPTIONAL VARIABLES:\n');
optionalVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}`);
    configuredOptional.push(varName);
  } else {
    console.log(`  ⚪ ${varName} - not configured`);
    missingOptional.push(varName);
  }
});

// Summary
console.log('\n📊 === SUMMARY ===\n');
console.log(`Required Variables: ${configuredRequired.length}/${requiredVars.size} configured`);
console.log(`Optional Variables: ${configuredOptional.length}/${optionalVars.size} configured`);

if (missingRequired.length > 0) {
  console.log(`\n⚠️ Missing ${missingRequired.length} REQUIRED variables:`);
  missingRequired.forEach(v => console.log(`  - ${v}`));
  process.exit(1);
} else {
  console.log('\n✅ All required variables are configured!');
}

if (missingOptional.length > 0) {
  console.log(`\n⚠️ ${missingOptional.length} optional variables not configured (features may be limited):`);
  missingOptional.slice(0, 5).forEach(v => console.log(`  - ${v}`));
  if (missingOptional.length > 5) {
    console.log(`  ... and ${missingOptional.length - 5} more`);
  }
}

// Test connectivity for major services
console.log('\n🔗 === CONNECTIVITY TESTS ===\n');

// Test Supabase
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
      },
    });
    console.log(`  ✅ Supabase: ${response.ok ? 'Connected' : `Status ${response.status}`}`);
  } catch (err) {
    console.log(`  ❌ Supabase: ${err.message}`);
  }
}

// Test Stripe
if (process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  const hasSecret = !!process.env.STRIPE_SECRET_KEY?.startsWith('sk_');
  const hasPublic = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_');
  if (hasSecret && hasPublic) {
    console.log(`  ✅ Stripe: Keys configured`);
  } else {
    console.log(`  ⚠️ Stripe: Incomplete (secret: ${hasSecret}, public: ${hasPublic})`);
  }
}

// Test Resend
if (process.env.RESEND_API_KEY) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
    });
    console.log(`  ✅ Resend: ${response.ok ? 'Connected' : `Status ${response.status}`}`);
  } catch (err) {
    console.log(`  ⚠️ Resend: ${err.message}`);
  }
}

// Test Twilio (if configured)
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  console.log(`  ✅ Twilio: Credentials configured`);
}

// Test Google Maps API
if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY) {
  console.log(`  ✅ Google Maps: Key configured`);
}

console.log('\n✨ Environment verification complete!\n');
