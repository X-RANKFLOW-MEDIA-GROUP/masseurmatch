#!/usr/bin/env node

/**
 * Run Database Migrations
 * Calls the migration API endpoint to execute all SQL migrations
 */

const baseUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

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
    console.log(`   ✓ Executed: ${data.summary.executed}`);
    console.log(`   ⏭️  Skipped: ${data.summary.skipped}`);
    console.log(`   ❌ Errors: ${data.summary.errors}`);
    console.log(`   📈 Total: ${data.summary.total}\n`);

    // Print individual results
    if (data.results.length > 0) {
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
    console.error('   1. Your Next.js app is running (npm run dev)');
    console.error('   2. The app is accessible at:', baseUrl);
    console.error('   3. Supabase credentials are configured');
    process.exit(1);
  }
}

runMigrations();
