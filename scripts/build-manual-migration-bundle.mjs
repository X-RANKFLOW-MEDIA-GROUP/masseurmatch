import { promises as fs } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const migrationsDir = path.join(repoRoot, 'supabase', 'migrations');
const defaultOutputFile = path.join(repoRoot, 'supabase', 'manual', 'apply_all_migrations.sql');

const outputArg = process.argv.find((arg) => arg.startsWith('--output='));
const outputFile = outputArg
  ? path.resolve(repoRoot, outputArg.replace('--output=', ''))
  : defaultOutputFile;
const outputDir = path.dirname(outputFile);

const migrationFiles = (await fs.readdir(migrationsDir))
  .filter((file) => file.endsWith('.sql'))
  .sort((a, b) => a.localeCompare(b));

if (migrationFiles.length === 0) {
  throw new Error('No migration files found in supabase/migrations.');
}

await fs.mkdir(outputDir, { recursive: true });

const generatedAt = new Date().toISOString();
const header = [
  '-- AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.',
  `-- Generated at: ${generatedAt}`,
  '-- Source directory: supabase/migrations',
  `-- Total migrations included: ${migrationFiles.length}`,
  '--',
  '-- Usage in Supabase Dashboard SQL Editor:',
  '-- 1) Open SQL Editor',
  '-- 2) Paste this file contents',
  '-- 3) Run once in a safe environment (prefer staging first)',
  '--',
  'BEGIN;',
  ''
].join('\n');

const sections = [];

for (const file of migrationFiles) {
  const fullPath = path.join(migrationsDir, file);
  const sql = await fs.readFile(fullPath, 'utf8');
  sections.push([
    `-- ============================================================`,
    `-- MIGRATION: ${file}`,
    `-- ============================================================`,
    sql.trim(),
    ''
  ].join('\n'));
}

const footer = [
  'COMMIT;',
  '',
  '-- Quick verification helpers (run separately, optional):',
  "-- SELECT COUNT(*) AS total_tables FROM information_schema.tables WHERE table_schema = 'public';",
  "-- SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 20;",
  ''
].join('\n');

await fs.writeFile(outputFile, `${header}${sections.join('\n')}${footer}`);

console.log(`Created ${path.relative(repoRoot, outputFile)} with ${migrationFiles.length} migrations.`);
