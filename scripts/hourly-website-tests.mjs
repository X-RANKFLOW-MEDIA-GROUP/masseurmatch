#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const LOGS_DIR = path.join(PROJECT_ROOT, '.test-logs');
const LOG_FILE = path.join(LOGS_DIR, `test-run-${new Date().toISOString().slice(0, 10)}.log`);

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

function execCommand(command, description) {
  log(`\n▶ ${description}`);
  try {
    const output = execSync(command, {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    log(`✓ ${description} passed`);
    return { success: true, output };
  } catch (error) {
    log(`✗ ${description} failed`);
    log(`Error: ${error.stderr || error.message}`);
    return { success: false, output: error.stderr || error.message };
  }
}

async function runHourlyTests() {
  log('═══════════════════════════════════════════════════════════════');
  log('Starting hourly website tests');
  log('═══════════════════════════════════════════════════════════════');

  const results = {
    lint: null,
    typecheck: null,
    unitTests: null,
    apiTests: null,
    sitemap: null,
    redirects: null,
    build: null,
  };

  // Run linting
  results.lint = execCommand('pnpm run lint', 'Linting');

  // Run type checking
  results.typecheck = execCommand('pnpm run typecheck', 'Type checking');

  // Run unit tests
  results.unitTests = execCommand('pnpm run test:unit', 'Unit tests');

  // Run API tests
  results.apiTests = execCommand('pnpm run test:api', 'API tests');

  // Validate sitemap
  results.sitemap = execCommand('pnpm run validate:sitemap', 'Sitemap validation');

  // Run redirect tests with Playwright
  results.redirects = execCommand('pnpm run test:redirects', 'Redirect tests');

  // Attempt build
  results.build = execCommand('pnpm run build', 'Build');

  // Summary
  log('\n═══════════════════════════════════════════════════════════════');
  log('TEST SUMMARY');
  log('═══════════════════════════════════════════════════════════════');

  const passed = Object.values(results).filter((r) => r && r.success).length;
  const failed = Object.values(results).filter((r) => r && !r.success).length;

  Object.entries(results).forEach(([test, result]) => {
    if (result) {
      const status = result.success ? '✓' : '✗';
      log(`${status} ${test}: ${result.success ? 'PASSED' : 'FAILED'}`);
    }
  });

  log(`\nTotal: ${passed} passed, ${failed} failed`);
  log(`Log file: ${LOG_FILE}`);

  // Auto-fix common issues if tests failed
  if (failed > 0) {
    log('\n═══════════════════════════════════════════════════════════════');
    log('ATTEMPTING AUTO-FIXES');
    log('═══════════════════════════════════════════════════════════════');

    // Auto-fix linting issues
    if (results.lint && !results.lint.success) {
      log('\n▶ Attempting to auto-fix linting issues with ESLint');
      try {
        execSync('pnpm run lint -- --fix', {
          cwd: PROJECT_ROOT,
          stdio: 'inherit',
        });
        log('✓ ESLint auto-fix completed');
        // Re-run lint to verify
        const relintResult = execCommand('pnpm run lint', 'Linting (after auto-fix)');
        results.lint = relintResult;
      } catch (error) {
        log('✗ ESLint auto-fix failed or issues remain');
      }
    }

    // Try formatting with Prettier if available
    log('\n▶ Attempting format with Prettier');
    try {
      execSync('pnpm prettier --write "src/**/*.{ts,tsx,js,jsx}"', {
        cwd: PROJECT_ROOT,
        stdio: 'pipe',
      });
      log('✓ Prettier formatting completed');
    } catch (error) {
      log('ℹ Prettier not available or no changes made');
    }

    // Clean and rebuild if build failed
    if (results.build && !results.build.success) {
      log('\n▶ Attempting clean rebuild');
      try {
        execSync('pnpm run clean:next', { cwd: PROJECT_ROOT, stdio: 'pipe' });
        const buildResult = execCommand('pnpm run build', 'Build (after clean)');
        results.build = buildResult;
      } catch (error) {
        log('✗ Clean rebuild failed');
      }
    }
  }

  // Commit and push if auto-fixes were applied
  if (failed > 0) {
    log('\n═══════════════════════════════════════════════════════════════');
    log('CHECKING FOR CHANGES TO COMMIT');
    log('═══════════════════════════════════════════════════════════════');

    try {
      const status = execSync('git status --porcelain', {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8',
      });

      if (status.trim()) {
        log('\n✓ Changes detected, preparing commit');
        execSync('git add -A', { cwd: PROJECT_ROOT, stdio: 'pipe' });

        const commitMessage = `[hourly-tests] Auto-fix: linting and formatting (${new Date().toISOString().slice(0, 19)})`;
        execSync(`git commit -m "${commitMessage}"`, {
          cwd: PROJECT_ROOT,
          stdio: 'pipe',
        });
        log(`✓ Committed: ${commitMessage}`);

        // Push to current branch
        const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
          cwd: PROJECT_ROOT,
          encoding: 'utf-8',
        }).trim();

        execSync(`git push origin ${currentBranch}`, {
          cwd: PROJECT_ROOT,
          stdio: 'pipe',
        });
        log(`✓ Pushed to branch: ${currentBranch}`);
      } else {
        log('ℹ No changes to commit');
      }
    } catch (error) {
      log(`ℹ Commit/push skipped: ${error.message}`);
    }
  }

  log('\n═══════════════════════════════════════════════════════════════');
  log('Hourly tests completed');
  log('═══════════════════════════════════════════════════════════════\n');

  return failed === 0;
}

// Run the tests
runHourlyTests().catch((error) => {
  log(`FATAL ERROR: ${error.message}`);
  process.exit(1);
});
