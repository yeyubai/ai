# 混合 App 本地联调与 iOS 准备手册

owner: engineering
last_updated: 2026-03-18
related_plan: docs/tech/architecture/android-hybrid-app-plan.md

## 1. 目标

这份手册用于指导当前仓库完成两类工作：

- Android 本地联调与基础验收
- iOS 接入前的仓库准备，以及有 Mac 后的 iOS / TestFlight 落地步骤

## 2. 环境前置

- 共享前置：
  - Node.js 20+
  - 仓库依赖已安装完成
- Android 联调：
  - JDK
  - Android Studio
- iOS 落地：
  - macOS
  - Xcode

## 3. 环境文件与地址约定

推荐直接从以下样例复制：

- 调试联调：`apps/native/.env.debug.example`
- 内部测试：`apps/native/.env.test.example`
- release 模拟：`apps/native/.env.release.example`

常见含义：

- `NATIVE_APP_MODE=debug|test|release`
- `NATIVE_WEB_APP_URL`：仅供 `debug` / `test`
- `NATIVE_RELEASE_WEB_APP_URL`：仅供 `release`
- `NATIVE_MIN_WEB_APP_VERSION`：release 最低兼容 Web 版本
- `NATIVE_RELEASE_UPDATE_URL`：fallback 页更新入口
- `NATIVE_RELEASE_SUPPORT_URL`：fallback 页帮助入口

`debug` 模式的地址口径：

- iOS 模拟器：优先 `http://localhost:3000`
- Android 模拟器：使用 `http://10.0.2.2:3000`
- 真机：使用宿主机可访问的局域网地址

## 4. Android 本地调试流程

1. 启动前后端：
   - `npm.cmd run dev`
2. 安装原生端依赖：
   - `npm.cmd run install:native`
3. 准备 `.env`：
   - 从 `apps/native/.env.debug.example` 复制为 `apps/native/.env`
   - 如果跑 Android 模拟器，将 `NATIVE_WEB_APP_URL` 改为 `http://10.0.2.2:3000`
4. 初始化 Android 容器：
   - `npm.cmd run native:android:add`
5. 同步 Android 工程：
   - `npm.cmd run native:android:sync`
6. 健康检查：
   - `npm.cmd run native:doctor`
7. 编译 Debug 包：
   - `npm.cmd run native:android:assemble:debug`
8. 打开 Android Studio：
   - `npm.cmd run native:open:android`

## 5. 当前无 Mac 时的 iOS 准备范围

在暂时没有 Mac 的阶段，只做仓库层准备，不承诺立即完成 iOS 编译：

- 使用跨平台 bundle id 根：
  - `com.aiweightcoach.app`
- 保持 `apps/web` 继续作为唯一业务 UI
- 保持 `PlatformBridge`、`SessionStorageAdapter`、`NativeShellController` 作为共享抽象
- 补齐 iOS 专用脚本入口与文档
- 明确 iOS 的 `debug / test / release` 网络边界

这阶段的完成标准不是“能跑 iOS 包”，而是“拿到 Mac 后不需要重新设计仓库结构”。

## 6. 有 Mac 后的 iOS 落地步骤

1. 在 `apps/native/.env` 中使用适合 iOS 的地址：
   - 模拟器优先 `http://localhost:3000`
2. 创建 iOS 工程：
   - `npm run native:ios:add`
3. 同步 iOS 工程：
   - `npm run native:ios:sync`
4. 打开 Xcode：
   - `npm run native:open:ios`
5. 在 Xcode 中完成：
   - Signing / Team
   - Bundle Identifier
   - Scheme / Build Configuration
   - App Icon / Launch Screen
   - 测试环境入口与 ATS 配置核对

说明：

- `native:ios:add` 和 `native:ios:sync` 在非 macOS 环境会直接报错，这是预期行为。
- TestFlight / release 不允许继续使用本地 `debug` 地址。

## 7. iOS 模拟器 / TestFlight 验收清单

- 冷启动不白屏
- 根路由可完成 guest session 初始化
- 首页、日记、体重录入、我的页可正常打开
- 状态栏不遮挡内容，顶部安全区正确
- 分享调起系统分享面板
- 外链交给系统浏览器
- 杀进程后登录态可恢复
- TestFlight 包只使用固定 HTTPS Web 入口
- 远端入口失败或版本不兼容时进入 fallback 页面而不是白屏

## 8. 常见问题

### 8.1 Android 本地地址能在浏览器打开，但 App 里不通

优先检查：

- `.env` 是否指向了正确的平台地址
- Web 地址是否可从模拟器 / 真机访问
- 后端 CORS 是否允许当前来源

### 8.2 `native:ios:add` 在 Windows 上失败

这是预期行为。iOS 工程生成和 Xcode 打开都需要 macOS。

### 8.3 TestFlight 包仍然指向本地地址

说明环境文件或 Xcode Scheme 仍在使用 `debug` / `test` 口径。内测 / release 必须切换到固定 HTTPS Web 入口。
