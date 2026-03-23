# Android 混合 App 执行清单

owner: engineering
last_updated: 2026-03-17
source_plan: docs/tech/architecture/android-hybrid-app-plan.md

## 1. 用途

这份清单不是新的产品 requirement，而是 Android 混合 App 工程轨道的执行检查表。

它用于把架构方案中的原则拆成可落地动作，避免团队只记住“已经能跑”，却遗漏会话抽象、交付边界和 release 收口。

## 2. 轨道边界

- 业务页面仍由 `apps/web` 承载，不新增第二套原生业务 UI。
- 本轨道只覆盖 Android 容器、平台桥、会话抽象、发布边界和相关验收。
- 产品主线仍以 `rq-001` 到 `rq-009` 为准，本清单不替代 PRD / AC。

## 3. P0 清单：Android 主线联调跑通

### 3.1 前置条件

- `apps/native` Android 容器工程已生成。
- 本机具备 JDK 和 Android Studio。
- 已配置可访问的测试 Web 入口。
- 后端已补齐对应来源的 CORS 配置。

### 3.2 必做项

- App 可安装、可启动、可回到前台。
- 首页、记录、进度、我的四条主线页面可进入。
- 游客会话可创建，登录后可进入主线页面，退出后可回到游客态。
- WebView 下 `Authorization`、`x-trace-id` 等现有请求头逻辑保持正常。
- 冷启动、热启动、前后台切换不白屏。
- 底部 Tab、安全区、手势导航下布局无明显遮挡。

### 3.3 非阻塞项

- AI 私教 / 聊天能力兼容验证。
- 分享、外链、版本信息等桥接能力。

### 3.4 P0 退出标准

- Android 壳已具备稳定联调主线业务的能力。
- 团队已确认当前仍处于内测 / 调试入口模式，而不是正式交付模式。

## 4. P1 清单：会话抽象与交付边界收口

### 4.1 会话抽象

- 新增 `SessionStorageAdapter` 接口：
  - `getSession()`
  - `saveSession(session)`
  - `clearSession()`
- Web 端保留 `localStorage` 实现，但业务代码不再直接读写 `localStorage`。
- API 客户端、鉴权 store、登录恢复流程统一改走存储接口。

### 4.2 交付边界

- 明确区分 `debug` / `test` / `release` 三种模式。
- `NATIVE_WEB_APP_URL` 只允许用于 `debug` / `test`。
- release 模式使用固定 HTTPS 入口，不允许任意覆盖。
- Android 网络 allowlist、后端 CORS 白名单、Web 入口域名形成统一环境矩阵。

### 4.3 P1 退出标准

- 业务代码里不再新增 `localStorage` 直连点。
- 团队对 release 模式入口策略有明确口径，不再是“以后再说”。

## 5. P2 清单：平台桥与基础壳能力

### 5.1 平台桥

- 新增 `PlatformBridge` 抽象：
  - `isNative()`
  - `share(data)`
  - `openExternalUrl(url)`
  - `getAppInfo()`
- Web 环境提供浏览器降级实现。
- 业务页面只通过平台桥调用 Native 能力。

### 5.2 壳能力

- 启动页已接入。
- 状态栏样式已统一。
- 外链可交给系统浏览器。
- 基础分享可唤起系统分享面板。

### 5.3 P2 退出标准

- 原生能力调用路径统一，不再在业务代码中散落容器细节。
- 主链路页面已完成平台桥兼容验证。

## 6. P3 清单：安全存储与发布准备

### 6.1 安全存储

- Native 端 `SessionStorageAdapter` 已切换到原生安全存储。
- App 重启后登录恢复行为稳定。
- 退出登录可正确清空 Native 端会话。

### 6.2 发布收口

- release 模式关闭 cleartext。
- release 模式只允许固定 HTTPS 入口。
- 启动阶段具备版本兼容检查。
- 远端入口不可用或版本不兼容时，可进入本地 fallback / 维护页。

### 6.3 验收补充

- 常见 Android 真机安装 / 升级 / 重启可通过。
- 主链路请求、401 失效处理、登录恢复行为与 Web 口径一致。
- 没有把 debug / 内测配置误带入 release。

## 7. 建议落地顺序

1. 先完成 P0 主链路联调。
2. 再做 P1，会话抽象和交付边界必须先收住。
3. 然后做 P2，把平台桥和基础壳能力统一起来。
4. 最后做 P3，完成安全存储和更正式分发前的收口。
