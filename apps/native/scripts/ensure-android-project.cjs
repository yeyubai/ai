const { existsSync } = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const androidDir = path.join(projectRoot, 'android');

if (existsSync(androidDir)) {
  console.log('Android project already exists at apps/native/android');
  process.exit(0);
}

const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(npxCommand, ['cap', 'add', 'android'], {
  cwd: projectRoot,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
