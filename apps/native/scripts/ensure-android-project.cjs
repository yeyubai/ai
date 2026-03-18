const { existsSync } = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const androidDir = path.join(projectRoot, 'android');
const fixScriptPath = path.join(__dirname, 'fix-gradle-deprecations.cjs');

const runGradlePatch = () =>
  spawnSync(process.execPath, [fixScriptPath], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: process.env,
  });

if (existsSync(androidDir)) {
  console.log('Android project already exists at apps/native/android');
  const patchResult = runGradlePatch();
  process.exit(patchResult.status ?? 1);
}

const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(npxCommand, ['cap', 'add', 'android'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if ((result.status ?? 1) !== 0) {
  process.exit(result.status ?? 1);
}

const patchResult = runGradlePatch();
process.exit(patchResult.status ?? 1);
