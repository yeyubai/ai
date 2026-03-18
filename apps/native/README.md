# 原生壳

这个包承载混合 App 的原生容器，当前已落地 Android 工程，并为后续 iOS / TestFlight 接入预留统一配置和脚本入口。

## 范围

- 基于 Capacitor 的 WebView 容器
- `apps/web` 继续作为主要业务 UI
- Android 继续作为当前已跑通的平台
- iOS 按同一套架构扩展，不重写第二套业务前端

## 当前状态

- 已有 `apps/native/android`
- 当前仓库还没有 `apps/native/ios`
- iOS 工程需要在 macOS + Xcode 环境中执行 `cap add ios`

## 前置条件

- Node.js 20+
- Android 联调需要：
  - JDK
  - Android Studio
- iOS 落地需要：
  - macOS
  - Xcode

## 环境文件

推荐直接从以下样例复制：

- `apps/native/.env.debug.example`
- `apps/native/.env.test.example`
- `apps/native/.env.release.example`

关键变量说明：

- `NATIVE_APP_ID`
  - 默认使用跨平台 bundle id 根：`com.aiweightcoach.app`
  - 该默认值用于跨平台配置与后续新平台接入；当前已存在的 `apps/native/android` 仍保留历史包名 `com.aiweightcoach.android`，本阶段不做 Android 包名重命名迁移
- `NATIVE_APP_MODE`
  - `debug | test | release`
- `NATIVE_WEB_APP_URL`
  - 仅供 `debug` / `test`
- `NATIVE_RELEASE_WEB_APP_URL`
  - 仅供 `release`
- `NATIVE_MIN_WEB_APP_VERSION`
  - release 最低兼容 Web 版本
- `NATIVE_RELEASE_UPDATE_URL`
  - fallback 页更新入口
- `NATIVE_RELEASE_SUPPORT_URL`
  - fallback 页帮助入口

`debug` 模式下常见地址约定：

- iOS 模拟器：`http://localhost:3000`
- Android 模拟器：`http://10.0.2.2:3000`
- 真机：宿主机局域网地址

## 常用命令

- 安装原生端依赖：
  - `npm run install:native`
- 新增 Android 工程：
  - `npm run native:android:add`
- 同步 Android 工程：
  - `npm run native:android:sync`
- 打开 Android Studio：
  - `npm run native:open:android`
- 编译 Android Debug 包：
  - `npm run native:android:assemble:debug`
- 预留 iOS 工程创建入口：
  - `npm run native:ios:add`
- 预留 iOS 工程同步入口：
  - `npm run native:ios:sync`
- 预留 Xcode 打开入口：
  - `npm run native:open:ios`
- Capacitor 环境检查：
  - `npm run native:doctor`

说明：

- `native:ios:add` / `native:ios:sync` / `native:open:ios` 需要在 macOS + Xcode 环境执行。
- 当前 `native:sync` 仍保留为 Android 同步兼容入口，避免影响已跑通的 Android 联调流程。

## 运行边界

- `NATIVE_WEB_APP_URL` 只用于内部测试和类 live reload 联调。
- `release` 模式必须使用固定 HTTPS 入口，不允许继续依赖本地或明文调试地址。
- 当前会话访问已经统一经过 `SessionStorageAdapter`；当 Web 应用运行在原生 Capacitor 容器中时，登录态会持久化到安全存储，而不是直接落在 WebView `localStorage`。
- release 模式已包含本地 fallback / 维护页，并支持最低 Web 版本校验。
- iOS 首版默认只对齐 Android 首版的原生能力边界：
  - 启动页
  - 图标
  - 状态栏样式
  - 外链打开
  - 基础分享
  - 登录态安全存储

## 参考文档

- 架构方案：
  - `docs/tech/architecture/android-hybrid-app-plan.md`
- 联调 / 准备手册：
  - `docs/tech/runbooks/android-hybrid-app-local-debug.md`
