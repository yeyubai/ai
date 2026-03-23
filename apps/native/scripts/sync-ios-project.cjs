const { existsSync } = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const iosDir = path.join(projectRoot, 'ios');
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';

if (!existsSync(iosDir)) {
  console.error('iOS project does not exist yet. Run `npm run native:ios:add` on macOS first.');
  process.exit(1);
}

if (process.platform !== 'darwin') {
  console.error('Syncing the iOS project requires macOS with Xcode installed.');
  process.exit(1);
}

const result = spawnSync(npxCommand, ['cap', 'sync', 'ios'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});

process.exit(result.status ?? 1);
