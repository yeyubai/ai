# 原生壳

这个包承载混合 App 的 Android 原生容器。

## 范围

- 以 Android 内部测试为优先
- 基于 Capacitor 的 WebView 容器
- 现有 `apps/web` 继续作为主要业务 UI

## 前置条件

- Node.js 20+
- JDK
- Android Studio

## 初始化

1. 在仓库根目录安装原生端依赖：
   - `npm run install:native`
2. 创建 Android 工程：
   - `npm run native:android:add`
3. 为原生壳配置可访问的 Web 地址：
   - 将 `.env.example` 复制为 `.env`
   - 设置 `NATIVE_APP_MODE=debug` 或 `NATIVE_APP_MODE=test`
   - 设置 `NATIVE_WEB_APP_URL`
4. 如果要模拟 release 配置：
   - 设置 `NATIVE_APP_MODE=release`
   - 设置 `NATIVE_RELEASE_WEB_APP_URL=https://...`
   - 可选设置 `NATIVE_MIN_WEB_APP_VERSION`，用于限制最低兼容的 Web 版本
   - 可选设置 `NATIVE_RELEASE_UPDATE_URL` 和 `NATIVE_RELEASE_SUPPORT_URL`，让 fallback 页面提供更新和帮助入口
5. 同步原生工程：
   - `npm run native:sync`
6. 打开 Android Studio：
   - `npm run native:open:android`
7. 需要命令行编译 Debug 包时：
   - `npm run native:android:assemble:debug`

## 说明

- `NATIVE_WEB_APP_URL` 只用于内部测试和类 live reload 联调。
- `NATIVE_WEB_APP_URL` 不能当作正式交付入口；release 构建应使用固定 HTTPS 地址，不允许随意覆盖。
- 当前 Android manifest 允许明文流量，所以 `http://10.0.2.2:3000` 这类本地联调地址可以工作；release 模式应关闭 cleartext 并收紧网络白名单。
- 占位用的 `web/` 目录主要用于满足 P0 阶段 Capacitor 的本地资源要求。
- 会话访问已经统一经过 `SessionStorageAdapter`；当 Web 应用运行在原生 Capacitor 容器中时，登录态会持久化到安全存储，而不是直接落在 WebView `localStorage`。
- release 模式现在已经包含本地 fallback / 维护页，并支持通过 `NATIVE_MIN_WEB_APP_VERSION` 做最低 Web 版本校验，也可以通过 `NATIVE_RELEASE_UPDATE_URL` 和 `NATIVE_RELEASE_SUPPORT_URL` 向用户提供恢复路径。
- 推荐直接使用分环境样例文件：
  - `apps/native/.env.debug.example`
  - `apps/native/.env.test.example`
  - `apps/native/.env.release.example`
- 本地联调与验收流程见：
  - `docs/tech/runbooks/android-hybrid-app-local-debug.md`
