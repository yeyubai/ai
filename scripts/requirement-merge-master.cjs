#!/usr/bin/env node

const { spawnSync } = require('node:child_process');

function fail(message) {
  console.error(`[requirement:merge-master] ${message}`);
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
    source: '',
    execute: false,
    target: 'master',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (current === '--source') {
      options.source = argv[index + 1] ?? '';
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
    if (current === '--help' || current === '-h') {
      console.log(`Usage:
  npm run requirement:merge-master -- --source codex/rq-009
  npm run requirement:merge-master -- --source codex/rq-009 --execute

Options:
  --source     Branch to merge from. Defaults to current branch.
  --target     Merge target branch. Defaults to master.
  --execute    Actually perform checkout + merge. Without this flag, only print the plan.
`);
      process.exit(0);
    }
  }

  return options;
}

const repoRoot = process.cwd();
const options = parseArgs(process.argv.slice(2));

const currentBranch = run('git', ['branch', '--show-current'], { cwd: repoRoot }).stdout.trim();
const sourceBranch = options.source || currentBranch;
if (!sourceBranch) {
  fail('Could not determine source branch');
}

const status = run('git', ['status', '--porcelain'], { cwd: repoRoot }).stdout.trim();
if (status) {
  fail('Working tree is not clean. Commit or stash changes before merging.');
}

const mergePlan = [
  `git checkout ${options.target}`,
  'git pull --ff-only',
  `git merge --no-ff ${sourceBranch}`,
];

if (!options.execute) {
  console.log('[requirement:merge-master] dry run');
  mergePlan.forEach((step) => console.log(`  ${step}`));
  console.log('');
  console.log('[requirement:merge-master] rerun with --execute to perform the merge');
  process.exit(0);
}

run('git', ['checkout', options.target], { cwd: repoRoot, stdio: 'inherit' });
run('git', ['pull', '--ff-only'], { cwd: repoRoot, stdio: 'inherit', allowFailure: true });
run('git', ['merge', '--no-ff', sourceBranch], { cwd: repoRoot, stdio: 'inherit' });

console.log('[requirement:merge-master] merge completed');
