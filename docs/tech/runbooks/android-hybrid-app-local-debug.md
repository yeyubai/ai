# Android 混合 App 本地联调手册

owner: engineering
last_updated: 2026-03-17
related_plan: docs/tech/architecture/android-hybrid-app-plan.md

## 1. 目标

这份手册用于指导本机完成 Android 混合 App 的本地联调、基础校验和 release 前检查。

## 2. 环境前置

- 已安装 JDK，并确认 `JAVA_HOME` 指向真实 JDK 根目录。
- 已安装 Android Studio。
- 已安装 Node.js 20+。
- 仓库依赖已安装完成。

## 3. JDK 检查

在新开的终端中执行：

- `echo $env:JAVA_HOME`
- `java -version`
- `javac -version`

通过标准：

- `JAVA_HOME` 不为空。
- `java`、`javac` 均可执行。

如果 `JAVA_HOME` 指向 `C:\Program Files\Java\latest` 这一层，而真正的 JDK 在下一层目录，需改为实际目录，例如：

- `C:\Program Files\Java\latest\jdk-26`

## 4. 原生端环境文件

推荐直接从以下样例复制：

- 调试联调：`apps/native/.env.debug.example`
- 测试环境：`apps/native/.env.test.example`
- release 模拟：`apps/native/.env.release.example`

常见含义：

- `NATIVE_APP_MODE=debug|test|release`
- `NATIVE_WEB_APP_URL`：仅供 `debug` / `test`
- `NATIVE_RELEASE_WEB_APP_URL`：仅供 `release`
- `NATIVE_MIN_WEB_APP_VERSION`：release 最低兼容 Web 版本
- `NATIVE_RELEASE_UPDATE_URL`：fallback 页的更新入口
- `NATIVE_RELEASE_SUPPORT_URL`：fallback 页的帮助入口

## 5. 本地调试流程

1. 启动前后端：
   - `npm.cmd run dev`
2. 安装原生端依赖：
   - `npm.cmd run install:native`
3. 准备 `.env`：
   - 从 `apps/native/.env.debug.example` 复制为 `apps/native/.env`
4. 初始化 Android 容器：
   - `npm.cmd run native:android:add`
5. 同步原生工程：
   - `npm.cmd run native:sync`
6. 健康检查：
   - `npm.cmd run native:doctor`
7. 编译 Debug 包：
   - `npm.cmd run native:android:assemble:debug`
8. 打开 Android Studio：
   - `npm.cmd run native:open:android`

## 6. Debug 验收清单

- App 可安装。
- 冷启动不白屏。
- 首页、记录、进度、我的可进入。
- 游客态可建立。
- 登录后可恢复会话。
- “我的”页可显示当前运行环境与版本信息。
- 导出任务可创建，分享按钮在支持的环境可用。
- 返回前台后状态栏样式正常。

## 7. Release 模拟检查

使用 `apps/native/.env.release.example` 时，重点检查：

- `NATIVE_RELEASE_WEB_APP_URL` 是否为 HTTPS。
- `NATIVE_MIN_WEB_APP_VERSION` 是否与当前 Web 版本匹配。
- `NATIVE_RELEASE_UPDATE_URL` / `NATIVE_RELEASE_SUPPORT_URL` 是否已填写。
- fallback 页是否能显示原因、目标地址、版本信息和恢复入口。

## 8. 常见问题

### 8.1 `java` 找不到

说明当前终端没有继承新的环境变量。关闭终端重新打开，或重新设置 `JAVA_HOME` 和 `PATH`。

### 8.2 `assembleDebug` 失败且提示 Gradle 下载超时

这通常不是代码问题，而是当前网络无法在限定时间内拉取 Gradle 发行包。可重试，或在 Android Studio 中先完成 Gradle 初始化。

### 8.3 `doctor` 通过但真机仍打不开

优先检查：

- `.env` 是否加载了正确的模式和地址
- Web 地址是否可在手机 / 模拟器访问
- 后端 CORS 是否允许当前来源
- release 模式是否错误使用了 `NATIVE_WEB_APP_URL`
