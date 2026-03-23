const { spawnSync } = require('child_process');
const path = require('path');

const androidDir = path.resolve(__dirname, '..', 'android');
const gradleExecutable = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const gradlePath = path.join(androidDir, gradleExecutable);
const gradleArgs = process.argv.slice(2);
const fixScriptPath = path.join(__dirname, 'fix-gradle-deprecations.cjs');

if (gradleArgs.length === 0) {
  console.error('Missing Gradle task. Example: node ./scripts/run-android-gradle.cjs assembleDebug');
  process.exit(1);
}

const patchResult = spawnSync(process.execPath, [fixScriptPath], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
  env: process.env,
});

if ((patchResult.status ?? 1) !== 0) {
  process.exit(patchResult.status ?? 1);
}

const result = spawnSync(gradlePath, gradleArgs, {
  cwd: androidDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});

process.exit(result.status ?? 1);
