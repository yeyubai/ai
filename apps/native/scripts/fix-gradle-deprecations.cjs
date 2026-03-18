const { existsSync, readFileSync, writeFileSync } = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

const sharedGradleDslReplacements = [
  {
    pattern: /^(\s*)compileSdkVersion\b/gm,
    replacement: '$1compileSdk',
  },
  {
    pattern: /^(\s*)minSdkVersion\b/gm,
    replacement: '$1minSdk',
  },
  {
    pattern: /^(\s*)targetSdkVersion\b/gm,
    replacement: '$1targetSdk',
  },
  {
    pattern: /^(\s*)lintOptions\b/gm,
    replacement: '$1lint',
  },
  {
    pattern: /^(\s*)aaptOptions\b/gm,
    replacement: '$1androidResources',
  },
  {
    pattern: /getDefaultProguardFile\('proguard-android\.txt'\)/g,
    replacement: "getDefaultProguardFile('proguard-android-optimize.txt')",
  },
];

const targets = [
  {
    relativePath: 'android/build.gradle',
    replacements: [
      {
        pattern: /classpath 'com\.android\.tools\.build:gradle:9\.1\.0'/g,
        replacement: "classpath 'com.android.tools.build:gradle:8.13.0'",
      },
      {
        pattern: /tasks\.register\("clean", Delete\)\s*\{\s*delete rootProject\.layout\.buildDirectory\s*\}/m,
        replacement:
          'tasks.register("clean", Delete) {\n    delete rootProject.layout.buildDirectory\n}',
      },
      {
        pattern: /task clean\(type: Delete\)\s*\{\s*delete rootProject\.buildDir\s*\}/m,
        replacement:
          'tasks.register("clean", Delete) {\n    delete rootProject.layout.buildDirectory\n}',
      },
    ],
  },
  {
    relativePath: 'android/app/build.gradle',
    replacements: sharedGradleDslReplacements,
  },
  {
    relativePath: 'android/capacitor-cordova-android-plugins/build.gradle',
    replacements: sharedGradleDslReplacements,
  },
  {
    relativePath: 'node_modules/@capacitor/android/capacitor/build.gradle',
    replacements: sharedGradleDslReplacements,
  },
  {
    relativePath: 'node_modules/@capacitor/app/android/build.gradle',
    replacements: sharedGradleDslReplacements,
  },
  {
    relativePath: 'node_modules/@capacitor/browser/android/build.gradle',
    replacements: sharedGradleDslReplacements,
  },
  {
    relativePath: 'node_modules/@capacitor/share/android/build.gradle',
    replacements: sharedGradleDslReplacements,
  },
  {
    relativePath: 'node_modules/@capacitor/splash-screen/android/build.gradle',
    replacements: sharedGradleDslReplacements,
  },
  {
    relativePath: 'node_modules/@capacitor/status-bar/android/build.gradle',
    replacements: sharedGradleDslReplacements,
  },
  {
    relativePath: 'node_modules/@capacitor/keyboard/android/build.gradle',
    replacements: sharedGradleDslReplacements,
  },
  {
    relativePath: 'node_modules/@aparajita/capacitor-secure-storage/android/build.gradle',
    replacements: sharedGradleDslReplacements,
  },
];

let updatedCount = 0;

for (const target of targets) {
  const filePath = path.join(projectRoot, target.relativePath);

  if (!existsSync(filePath)) {
    continue;
  }

  const original = readFileSync(filePath, 'utf8');
  let next = original;

  for (const { pattern, replacement } of target.replacements) {
    next = next.replace(pattern, replacement);
  }

  if (next === original) {
    continue;
  }

  writeFileSync(filePath, next, 'utf8');
  updatedCount += 1;
  console.log(`Updated Gradle DSL in ${target.relativePath}`);
}

if (updatedCount === 0) {
  console.log('No Gradle deprecation patches were needed.');
}
