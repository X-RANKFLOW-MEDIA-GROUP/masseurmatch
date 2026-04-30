#!/usr/bin/env node
import fs from 'node:fs';
if (!fs.existsSync('supabase/PRODUCTION_SCHEMA_LOCK.sql')) {
  console.error('[validate-db-contract] Missing supabase/PRODUCTION_SCHEMA_LOCK.sql');
  process.exit(1);
}
console.log('[validate-db-contract] OK (schema lock file present)');
