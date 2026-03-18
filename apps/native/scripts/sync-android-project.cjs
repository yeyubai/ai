const { spawnSync } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const fixScriptPath = path.join(__dirname, 'fix-gradle-deprecations.cjs');

const syncResult = spawnSync(npxCommand, ['cap', 'sync', 'android'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});

if ((syncResult.status ?? 1) !== 0) {
  process.exit(syncResult.status ?? 1);
}

const patchResult = spawnSync(process.execPath, [fixScriptPath], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: process.env,
});

process.exit(patchResult.status ?? 1);
