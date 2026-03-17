const { spawnSync } = require('child_process');
const path = require('path');

const androidDir = path.resolve(__dirname, '..', 'android');
const gradleExecutable = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const gradlePath = path.join(androidDir, gradleExecutable);
const gradleArgs = process.argv.slice(2);

if (gradleArgs.length === 0) {
  console.error('Missing Gradle task. Example: node ./scripts/run-android-gradle.cjs assembleDebug');
  process.exit(1);
}

const result = spawnSync(gradlePath, gradleArgs, {
  cwd: androidDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});

process.exit(result.status ?? 1);
