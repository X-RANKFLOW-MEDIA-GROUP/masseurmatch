#!/usr/bin/env node

/**
 * Run Database Migrations
 * Calls the migration API endpoint to execute all SQL migrations
 */

const DEV_PORT = process.env.DEV_PORT || process.env.NEXT_PUBLIC_DEV_PORT || '5000';
const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : (process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${DEV_PORT}`);

if (typeof fetch === 'undefined') {
  console.error('[run-migrations] global fetch is not available. Please run with Node 18+ (fetch builtin) or use a polyfill.');
  process.exit(1);
}

async function runMigrations() {
  console.log('🚀 Running Supabase Migrations');
  console.log(`📍 API URL: ${baseUrl}/api/admin/run-migrations\n`);

  try {
    const response = await fetch(`${baseUrl}/api/admin/run-migrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error:', data.error);
      process.exit(1);
    }

    // Print summary
    console.log('📊 Migration Results:');
    console.log(`   ✓ Executed: ${data.summary?.executed ?? '0'}`);
    console.log(`   ⏭️  Skipped: ${data.summary?.skipped ?? '0'}`);
    console.log(`   ❌ Errors: ${data.summary?.errors ?? '0'}`);
    console.log(`   📈 Total: ${data.summary?.total ?? (Array.isArray(data.results)?data.results.length:'?')}\n`);

    // Print individual results
    if (Array.isArray(data.results) && data.results.length > 0) {
      console.log('📝 Detailed Results:');
      data.results.forEach((result) => {
        const icon =
          result.status === 'success' ? '✓' :
          result.status === 'skipped' ? '⏭️' :
          '❌';

        const message = result.message ? ` (${result.message})` : '';
        console.log(`   ${icon} ${result.file}${message}`);
      });
    }

    if (data.success) {
      console.log('\n🎉 All migrations completed successfully!');
      console.log('✨ Your Supabase database is now ready!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some migrations failed. Check errors above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to run migrations:', error instanceof Error ? error.message : String(error));
    console.error('\n💡 Make sure:');
    console.error('   1. Your Next.js app is running (pnpm dev)');
    console.error('   2. The app is accessible at:', baseUrl);
    console.error('   3. Supabase credentials are configured');
    process.exit(1);
  }
}

runMigrations();
