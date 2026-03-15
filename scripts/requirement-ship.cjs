#!/usr/bin/env node

const { spawnSync } = require('node:child_process');

function fail(message) {
  console.error(`[requirement:ship] ${message}`);
  process.exit(1);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: false,
    ...options,
  });

  if (result.status !== 0) {
    fail(`${command} ${args.join(' ')} failed`);
  }
}

function runCapture(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'pipe',
    encoding: 'utf8',
    shell: false,
    ...options,
  });

  if (result.status !== 0) {
    const stderr = result.stderr?.trim();
    const stdout = result.stdout?.trim();
    fail(stderr || stdout || `${command} ${args.join(' ')} failed`);
  }

  return result.stdout.trim();
}

function parseArgs(argv) {
  const options = {
    message: '',
    paths: '',
    target: 'master',
    execute: false,
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
      options.paths = argv[index + 1] ?? '';
      index += 1;
      continue;
    }
    if (current === '--target') {
      options.target = argv[index + 1] ?? 'master';
      index += 1;
      continue;
    }
    if (current === '--execute') {
      options.execute = true;
      continue;
    }
    if (current === '--skip-checks') {
      options.skipChecks = true;
      continue;
    }
    if (current === '--help' || current === '-h') {
      console.log(`Usage:
  npm run requirement:ship -- --message "rq-009: diary api" --paths apps/web/features/diary,backend/src/modules/diary
  npm run requirement:ship -- --message "rq-009: diary api" --paths apps/web/features/diary,backend/src/modules/diary --execute

Options:
  --message, -m     Commit message
  --paths           Comma-separated requirement paths
  --target          Merge target branch. Defaults to master
  --execute         Actually merge into target after commit
  --skip-checks     Skip typecheck/test

Behavior:
  1. Runs requirement:finish
  2. Runs requirement:merge-master
  3. Without --execute, merge step stays in dry-run mode
`);
      process.exit(0);
    }
  }

  return options;
}

const repoRoot = process.cwd();
const options = parseArgs(process.argv.slice(2));

if (!options.message.trim()) {
  fail('Missing --message');
}

if (!options.paths.trim()) {
  fail('Missing --paths');
}

const nodeCommand = process.execPath;
const finishScript = 'D:/project/my/ai/ai/scripts/requirement-finish.cjs';
const mergeScript = 'D:/project/my/ai/ai/scripts/requirement-merge-master.cjs';

const currentBranch = runCapture('git', ['branch', '--show-current'], { cwd: repoRoot });
if (!currentBranch) {
  fail('Could not determine current branch');
}

const finishArgs = [finishScript, '--message', options.message, '--paths', options.paths];
if (options.skipChecks) {
  finishArgs.push('--skip-checks');
}

run(nodeCommand, finishArgs, { cwd: repoRoot });

const mergeArgs = [mergeScript, '--source', currentBranch, '--target', options.target];
if (options.execute) {
  mergeArgs.push('--execute');
}

run(nodeCommand, mergeArgs, { cwd: repoRoot });
