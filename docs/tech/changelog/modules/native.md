# Module Changelog: native

## 2026-03-17 | 2026-03-17-native-mode-boundary-p1
- Summary: 收口 Native P1 配置边界，为 Capacitor 增加 `debug / test / release` 模式区分，新增 release 专用 Web 入口变量并在 release 模式下强制 HTTPS。
- Files:
  - `apps/native/capacitor.config.ts`
  - `apps/native/.env.example`
  - `apps/native/README.md`
  - `docs/tech/design/requirements/index.md`
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/native.md`
- Notes: 本次仍未落地 Native 安全存储、本地 fallback 页面与平台桥实现。

## 2026-03-17 | 2026-03-17-native-secure-storage-plugin-p3
- Summary: 为 Android 容器接入 `@aparajita/capacitor-secure-storage` 插件，并完成一次 `cap sync android`，使 Native 会话存储具备切换到安全存储的运行时基础。
- Files:
  - `apps/native/package.json`
  - `apps/native/package-lock.json`
  - `apps/native/README.md`
  - `apps/native/android/**`
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/native.md`
- Notes: 当前已完成插件接入与 sync 验证，但尚未加入 release fallback 页面与版本兼容闸门。

## 2026-03-17 | 2026-03-17-release-fallback-version-gate-p3
- Summary: 为 Android 壳增加 release fallback 页面和最低 Web 版本闸门，在远端入口失败或版本不兼容时回退到本地维护页。
- Files:
  - `apps/native/android/app/build.gradle`
  - `apps/native/android/app/src/main/java/com/aiweightcoach/android/MainActivity.java`
  - `apps/native/web/fallback.html`
  - `apps/native/.env.example`
  - `apps/native/README.md`
  - `apps/native/android/**`
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/native.md`
- Notes: `cap sync android` 与 `doctor` 已通过；本机缺少 `JAVA_HOME`，暂未完成 `assembleDebug` 编译验证。

## 2026-03-17 | 2026-03-17-fallback-recovery-links-p3
- Summary: 为 release fallback 页面补充更新与帮助入口，通过环境变量注入恢复链接，避免版本不兼容或入口异常时只有“重试”路径。
- Files:
  - `apps/native/android/app/build.gradle`
  - `apps/native/android/app/src/main/java/com/aiweightcoach/android/MainActivity.java`
  - `apps/native/web/fallback.html`
  - `apps/native/.env.example`
  - `apps/native/README.md`
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/native.md`
- Notes: 当前恢复入口仍基于静态 fallback 页，后续如需更强引导可再接商店或官网分发页。

## 2026-03-17 | 2026-03-17-status-bar-splash-p2
- Summary: 接入 `@capacitor/status-bar` 与 `@capacitor/splash-screen` 插件，为 Android Native 容器补齐状态栏样式与启动页收口能力。
- Files:
  - `apps/native/package.json`
  - `apps/native/package-lock.json`
  - `apps/native/android/**`
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/native.md`
- Notes: 当前已完成插件接入与 sync 验证，具体调用由 Web 侧 `NativeShellController` 统一触发。

## 2026-03-17 | 2026-03-17-native-env-runbook-entrypoints
- Summary: 为 Android 联调补齐分环境 `.env` 样例、Gradle 调用脚本和本地联调手册，并新增根目录构建入口。
- Files:
  - `apps/native/.env.debug.example`
  - `apps/native/.env.test.example`
  - `apps/native/.env.release.example`
  - `apps/native/scripts/run-android-gradle.cjs`
  - `apps/native/package.json`
  - `package.json`
  - `apps/native/README.md`
  - `docs/tech/runbooks/android-hybrid-app-local-debug.md`
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/native.md`
- Notes: 这批改动主要提升联调可执行性，不改变 Native 容器运行时行为。

## 2026-03-17 | 2026-03-17-capacitor-android-p0-scaffold
- Summary: 新增 `apps/native` 原生端包，建立 Capacitor 配置、环境样例、占位 webDir 和目录骨架，为 Android 容器开发提供 P0 起点。
- Files:
  - `apps/native/package.json`
  - `apps/native/package-lock.json`
  - `apps/native/capacitor.config.ts`
  - `apps/native/.env.example`
  - `apps/native/README.md`
  - `apps/native/scripts/ensure-android-project.cjs`
  - `apps/native/web/index.html`
  - `apps/native/android/**`
  - `apps/native/assets/.gitkeep`
  - `apps/native/bridge/.gitkeep`
  - `apps/native/shared/.gitkeep`
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/native.md`
- Notes: 本次已完成 Android 容器生成与一次 sync 验证，但未进行真机构建或原生安全存储接入。

## 2026-03-12 | 2026-03-12-vibe-coding-rules
- Summary: 当前对话未新增 native 规则改动。
- Files:
  - `.codex/rules/native/bridge.md` (no change in this dialogue)
  - `.codex/rules/native/structure.md` (no change in this dialogue)
- Notes: 预留模块日志文件，后续有改动直接追加。
