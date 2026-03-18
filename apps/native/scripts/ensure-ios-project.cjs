const { existsSync } = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const iosDir = path.join(projectRoot, 'ios');

if (existsSync(iosDir)) {
  console.log('iOS project already exists at apps/native/ios');
  process.exit(0);
}

if (process.platform !== 'darwin') {
  console.error('Creating the iOS project requires macOS with Xcode installed.');
  process.exit(1);
}

const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(npxCommand, ['cap', 'add', 'ios'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
