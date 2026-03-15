#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function fail(message) {
  console.error(`[requirement:finish] ${message}`);
  process.exit(1);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'pipe',
    encoding: 'utf8',
    shell: false,
    ...options,
  });

  if (options.allowFailure) {
    return result;
  }

  if (result.status !== 0) {
    const stderr = result.stderr?.trim();
    const stdout = result.stdout?.trim();
    fail(stderr || stdout || `${command} ${args.join(' ')} failed`);
  }

  return result;
}

function parseArgs(argv) {
  const options = {
    message: '',
    paths: [],
    skipChecks: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (current === '--message' || current === '-m') {
      options.message = argv[index + 1] ?? '';
      index += 1;
      continue;
    }
    if (current === '--paths') {
      options.paths = (argv[index + 1] ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      index += 1;
      continue;
    }
    if (current === '--skip-checks') {
      options.skipChecks = true;
      continue;
    }
    if (current === '--help' || current === '-h') {
      console.log(`Usage:
  npm run requirement:finish -- --message "rq-009: diary api" --paths apps/web/features/diary,backend/src/modules/diary,docs/tech/design/requirements/rq-009-diary-rich-text-and-report-polish

Options:
  --message, -m     Commit message for this requirement
  --paths           Comma-separated paths to stage for this requirement
  --skip-checks     Skip typecheck/test before commit
`);
      process.exit(0);
    }
  }

  return options;
}

function ensurePathExists(repoRoot, target) {
  const resolved = path.resolve(repoRoot, target);
  if (!fs.existsSync(resolved)) {
    fail(`Path does not exist: ${target}`);
  }
}

const repoRoot = process.cwd();
const options = parseArgs(process.argv.slice(2));

if (!options.message.trim()) {
  fail('Missing --message');
}

if (options.paths.length === 0) {
  fail('Missing --paths');
}

options.paths.forEach((target) => ensurePathExists(repoRoot, target));

const branch = run('git', ['branch', '--show-current'], { cwd: repoRoot }).stdout.trim();
if (!branch) {
  fail('Could not determine current branch');
}
if (branch === 'master' || branch === 'main') {
  fail('Please run this on a requirement branch, not master/main');
}

console.log(`[requirement:finish] branch: ${branch}`);
console.log(`[requirement:finish] paths: ${options.paths.join(', ')}`);

if (!options.skipChecks) {
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  console.log('[requirement:finish] running typecheck');
  run(npmCommand, ['run', 'typecheck'], { cwd: repoRoot, stdio: 'inherit' });
  console.log('[requirement:finish] running test');
  run(npmCommand, ['run', 'test'], { cwd: repoRoot, stdio: 'inherit' });
}

run('git', ['add', '--', ...options.paths], { cwd: repoRoot });

const staged = run('git', ['diff', '--cached', '--name-only'], { cwd: repoRoot }).stdout
  .split(/\r?\n/)
  .map((item) => item.trim())
  .filter(Boolean);

if (staged.length === 0) {
  fail('No staged changes found after git add');
}

console.log('[requirement:finish] staged files:');
staged.forEach((file) => console.log(`  - ${file}`));

run('git', ['commit', '-m', options.message], { cwd: repoRoot, stdio: 'inherit' });

console.log('');
console.log('[requirement:finish] commit completed');
console.log(`[requirement:finish] next: npm run requirement:merge-master -- --source ${branch}`);
