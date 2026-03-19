# Module Changelog: native

## 2026-03-19 | 2026-03-19-keyboard-plugin-config-for-ios-prep
- Summary: 为后续 iOS 接入补齐 `@capacitor/keyboard` 的显式依赖声明，并在 Capacitor 配置中加入 Keyboard 插件策略，约定 iOS 使用 `native` resize、Android 保留 `resizeOnFullScreen` 兼容项，为后续 `cap sync ios` / `cap sync android` 提前收口键盘行为。
- Files:
  - `apps/native/package.json`
  - `apps/native/capacitor.config.ts`
  - `docs/tech/changelog/conversations/2026-03-19.md`
  - `docs/tech/changelog/modules/native.md`
- Notes: 当前阶段仍未生成 `apps/native/ios`；本条主要是为后续原生工程同步准备配置基线。

## 2026-03-18 | 2026-03-18-ios-prep-cross-platform-native-shell
- Summary: 将 `apps/native` 收口为 Android / iOS 共用的原生壳配置：默认 bundle id 改为平台中性值，补齐分环境样例文件，并新增 iOS 工程创建 / 同步 / 打开脚本入口，为后续 TestFlight 接入做仓库级准备。
- Files:
  - `apps/native/capacitor.config.ts`
  - `apps/native/.env.example`
  - `apps/native/.env.debug.example`
  - `apps/native/.env.test.example`
  - `apps/native/.env.release.example`
  - `apps/native/package.json`
  - `apps/native/scripts/ensure-ios-project.cjs`
  - `apps/native/scripts/sync-ios-project.cjs`
  - `package.json`
  - `docs/tech/changelog/conversations/2026-03-18.md`
  - `docs/tech/changelog/modules/native.md`
- Notes: 当前未生成 `apps/native/ios`；iOS 脚本会在非 macOS 环境下给出明确报错，而不是隐式失败。

## 2026-03-18 | 2026-03-18-capacitor-gradle-deprecation-auto-fix
- Summary: 新增 Gradle 兼容性自动修复脚本，自动处理 Capacitor Android 插件和生成工程里的旧 DSL，减少 `Deprecated Gradle features were used in this build` 警告反复出现。
- Files:
  - `apps/native/package.json`
  - `apps/native/scripts/ensure-android-project.cjs`
  - `apps/native/scripts/run-android-gradle.cjs`
  - `apps/native/scripts/sync-android-project.cjs`
  - `apps/native/scripts/fix-gradle-deprecations.cjs`
  - `docs/tech/changelog/conversations/2026-03-18.md`
  - `docs/tech/changelog/modules/native.md`
- Notes: 该方案属于当前仓库的兼容层，优先解决 Android Studio 联调阶段的噪音 warning；后续如 Capacitor 上游升级修复，可再移除这层补丁逻辑。

## 2026-03-18 | 2026-03-18-android-proguard-template-fix
- Summary: 修正 Android App 壳层仍使用 `proguard-android.txt` 默认模板的问题，改为当前 AGP 支持的 `proguard-android-optimize.txt`，并将该替换纳入自动补丁脚本。
- Files:
  - `apps/native/android/app/build.gradle`
  - `apps/native/scripts/fix-gradle-deprecations.cjs`
  - `docs/tech/changelog/conversations/2026-03-18.md`
  - `docs/tech/changelog/modules/native.md`
- Notes: 该错误会在 Gradle 配置阶段直接中断构建；改动后若 IDE 仍报旧错，需要重新 Sync 让 Android Studio 丢弃旧缓存模型。

## 2026-03-18 | 2026-03-18-native-wrapper-version-rollback
- Summary: 将 Android Gradle wrapper 从 `9.3.1` 回收到工程当前锁定的 `8.14.3-bin`，减少因 IDE 或本地 Gradle 升级过快导致的原生构建兼容问题。
- Files:
  - `apps/native/android/gradle/wrapper/gradle-wrapper.properties`
  - `docs/tech/changelog/conversations/2026-03-18.md`
  - `docs/tech/changelog/modules/native.md`
- Notes: Android Studio 后续 Sync 会按 wrapper 文件重新下载对应版本；若仍看到旧 Gradle 版本信息，通常需要重开项目或重新 Sync。

## 2026-03-18 | 2026-03-18-native-agp-version-realign
- Summary: 将顶层 Android Gradle Plugin 从意外升到的 `9.1.0` 恢复为当前 Capacitor 8 工程基线 `8.13.0`，并把这条修正规则纳入自动补丁脚本，重新对齐 `AGP 8.13.x + Gradle 8.14.3` 的稳定组合。
- Files:
  - `apps/native/android/build.gradle`
  - `apps/native/scripts/fix-gradle-deprecations.cjs`
  - `docs/tech/changelog/conversations/2026-03-18.md`
  - `docs/tech/changelog/modules/native.md`
- Notes: 这次修正主要是为了消除顶层 AGP 9.x 与 Capacitor 子模块仍停留在 8.13.x 之间的不一致；重开 Android Studio 并重新 Sync 后应回到 8.x 链路。

## 2026-03-18 | 2026-03-18-local-debug-env-for-emulator
- Summary: 新增本地 `apps/native/.env` 调试配置，默认让 Android 模拟器通过 `http://10.0.2.2:3000` 访问宿主机上的 Web 前端。
- Files:
  - `apps/native/.env`
  - `docs/tech/changelog/conversations/2026-03-18.md`
  - `docs/tech/changelog/modules/native.md`
- Notes: 该文件只用于本机联调，不会进入 Git；若切换真机或测试环境，需要改成对应可访问地址。

## 2026-03-18 | 2026-03-18-gradle-deprecation-dsl-cleanup
- Summary: 收敛原生工程中几处已过时的 Android Gradle DSL，用较新的 `minSdk` / `targetSdk` / `lint` / `androidResources` 写法替代旧配置，并将顶层 clean 任务改为 `tasks.register(...)`。
- Files:
  - `apps/native/android/build.gradle`
  - `apps/native/android/app/build.gradle`
  - `apps/native/android/capacitor-cordova-android-plugins/build.gradle`
  - `docs/tech/changelog/conversations/2026-03-18.md`
  - `docs/tech/changelog/modules/native.md`
- Notes: 该改动旨在减少仓库自身触发的 Gradle 9 兼容性 warning，但不保证完全消除第三方插件带来的提示。

## 2026-03-18 | 2026-03-18-gradle-wrapper-download-stability
- Summary: 针对 Android Studio 首次 Gradle Sync 下载中断问题，将 wrapper 分发包改为更小的 `gradle-8.14.3-bin.zip`，并提升网络超时设置。
- Files:
  - `apps/native/android/gradle/wrapper/gradle-wrapper.properties`
  - `docs/tech/changelog/conversations/2026-03-18.md`
  - `docs/tech/changelog/modules/native.md`
- Notes: 该改动只能降低下载失败概率；若官方分发地址仍不可达，仍需处理本机网络或代理问题。

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
