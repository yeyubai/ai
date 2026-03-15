const { rmSync } = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '..');
const command = process.argv[2] ?? 'dev';
const args = process.argv.slice(3);

const distDirByCommand = {
  dev: '.next-dev',
  build: '.next-prod',
  start: '.next-prod',
};

const distDir = distDirByCommand[command] ?? '.next';
const defaultPortByCommand = {
  dev: '3000',
  start: '3000',
};
const nextArgs = [...args];

if (
  defaultPortByCommand[command] &&
  !nextArgs.includes('-p') &&
  !nextArgs.includes('--port')
) {
  nextArgs.push('--port', defaultPortByCommand[command]);
}

if (command === 'dev' || command === 'build') {
  rmSync(path.join(root, distDir), {
    recursive: true,
    force: true,
  });
}

const nextBin = require.resolve('next/dist/bin/next');
const child = spawn(process.execPath, [nextBin, command, ...nextArgs], {
  cwd: root,
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_DIST_DIR: distDir,
  },
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
