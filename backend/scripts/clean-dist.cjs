const { existsSync, rmSync } = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true, force: true });
}
