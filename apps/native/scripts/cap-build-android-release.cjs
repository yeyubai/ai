const { existsSync, readFileSync } = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const androidRoot = path.join(projectRoot, 'android');
const keystorePropertiesPath = path.join(androidRoot, 'keystore.properties');
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const requestedReleaseType = (process.argv[2] || 'APK').toUpperCase();
const releaseType = requestedReleaseType === 'AAB' ? 'AAB' : 'APK';

if (!existsSync(keystorePropertiesPath)) {
  console.error('Missing android/keystore.properties. Create it before running release build.');
  process.exit(1);
}

function parsePropertiesFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const separatorIndex = line.indexOf('=');
        if (separatorIndex === -1) {
          return [line, ''];
        }

        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim();
        return [key, value];
      }),
  );
}

const properties = parsePropertiesFile(keystorePropertiesPath);
const requiredKeys = ['storeFile', 'storePassword', 'keyAlias', 'keyPassword'];
const missingKeys = requiredKeys.filter((key) => !properties[key]);

if (missingKeys.length > 0) {
  console.error(`android/keystore.properties is missing: ${missingKeys.join(', ')}`);
  process.exit(1);
}

const keystorePath = path.resolve(androidRoot, properties.storeFile);

if (!existsSync(keystorePath)) {
  console.error(`Keystore file not found: ${keystorePath}`);
  process.exit(1);
}

const result = spawnSync(
  npxCommand,
  [
    'cap',
    'build',
    'android',
    '--keystorepath',
    keystorePath,
    '--keystorepass',
    properties.storePassword,
    '--keystorealias',
    properties.keyAlias,
    '--keystorealiaspass',
    properties.keyPassword,
    '--androidreleasetype',
    releaseType,
  ],
  {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  },
);

process.exit(result.status ?? 1);
