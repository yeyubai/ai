# Android / iOS 首版混合 App 架构方案

owner: engineering
last_updated: 2026-03-18

## 1. 背景与目标

当前项目的前端主体已经是一个面向移动端交互的 `Next.js` 应用，后端则是独立的 `NestJS API` 服务。项目现阶段的目标不是重写一套新的原生前端，而是在尽量复用现有 Web 资产的前提下，交付一个可安装、可联调、可内部测试的原生壳。

当前仓库的现实状态是：

- Android 工程已经生成并进入联调阶段
- iOS 还没有生成本地工程
- Web 侧已经具备平台桥接、会话存储抽象和基础壳层控制能力

因此当前阶段的核心目标不是“马上做完双端”，而是先把仓库和配置收口为跨平台方案，让 iOS 接入不再建立在 Android 特例之上。

## 2. 为什么当前项目适合继续走混合 App

### 2.1 前端已经是移动端优先界面

现有 `apps/web` 的页面结构、底部 Tab、动效节奏和 `safe-area` 处理都明显以手机使用场景为主，天然适合放进 WebView 容器继续使用。

### 2.2 现有 Next.js 页面资产可以直接复用

当前前端基于 `Next.js 14 + React 18 + Tailwind + shadcn + Zustand + Axios` 构建，业务页面、状态和 API 接线已经成型。若改为 React Native，需要重写绝大部分 UI、导航和状态衔接，成本和风险都明显更高。

### 2.3 后端已经是独立 API 服务

后端采用 `NestJS + Prisma + MySQL`，以前后端分离方式提供 API，当前前端通过 Bearer token 调用后端接口。这类架构天然适合混合 App：App 容器承载前端页面，页面继续访问既有 API，不需要因为 App 化而重做业务协议。

### 2.4 仓库已经具备跨平台扩展基础

当前仓库虽然先落了 Android，但 Web 侧 `PlatformBridge`、`SessionStorageAdapter`、`NativeShellController` 这些抽象已经存在，且平台信息模型中已经包含 `ios`。这意味着 iOS 更适合沿用同一套容器思路接入，而不是另起一条技术路线。

## 3. 推荐方案与不选方案

### 3.1 推荐方案

首版推荐方案为：

`Capacitor + 原生壳（Android / iOS） + 现有 apps/web + 现有 backend`

该方案的核心思想是：

- `apps/web` 继续作为唯一业务 UI 主体
- `apps/native` 统一承载 Android / iOS 原生容器
- `backend` 继续提供 API，不新增 App 专属协议
- Android 继续作为当前已跑通的平台
- iOS 按同一套架构扩展，目标优先对齐 `TestFlight` 内测

### 3.2 不优先选择 React Native 重写

- 需要重做大部分页面、导航、状态衔接和组件体系
- 当前项目的主要需求仍集中在表单、记录、趋势、聊天等常规业务界面，尚不足以支撑重写成本
- 团队当前最强资产是已有 Web 前端，而不是原生端资产

### 3.3 不优先选择 PWA-only

- 当前目标是“可安装的 App 形态 + 原生壳能力”，而不是只做浏览器安装体验
- PWA 对未来双端一致性、容器控制、原生桥接和 TestFlight / 商店路径的支持不如混合 App 明确

### 3.4 不优先选择静态导出打包进壳

- 当前项目仍以 `Next.js App Router` 持续演进，过早转向静态导出会抬高构建、路由与资源更新复杂度
- 首版重点是快速内部联调与内测，而不是离线静态化
- 内部测试阶段直接加载测试 Web 地址，页面更新无需重新发包；更正式分发阶段再切换到受控正式入口

## 4. 分层职责

### 4.1 `apps/web` 负责业务页面与前端交互

- 登录、游客会话、首页、记录、进度、我的等主线业务页面
- API 调用与错误处理
- 页面状态管理、路由跳转和视觉层实现
- 绝大多数业务文案、页面布局和交互逻辑

### 4.2 `apps/native` 负责 Android / iOS 壳与原生能力

- Capacitor 容器配置
- Android / iOS 工程管理
- App 图标、启动页、状态栏等壳层能力
- 外链打开、基础分享等少量系统能力
- 安全存储、版本信息、fallback 页面和兼容闸门

`apps/native` 的职责是“容器与桥”，不是业务页面主实现层。

### 4.3 `backend` 继续提供 API

- 业务接口与鉴权
- 用户会话、记录、趋势、AI 教练等数据能力
- CORS、环境配置和 API 可用性保障

首版不为 iOS 单独设计一套新的接口协议，也不改变当前 Bearer token 模式。

## 5. 首版范围与非目标

### 5.1 首版范围

首版原生层只实现以下能力：

- 启动页
- 应用图标
- 状态栏样式
- 外链打开
- 基础分享
- 登录态安全存储

其中“原生层只实现这些能力”的意思是：

- 业务页面仍由 `apps/web` 渲染
- 原生层只负责让 App 更像 App，并接住少量系统能力
- iOS 不新增第二套专属业务 UI

### 5.2 首版非目标

- 推送通知
- 深链 / Universal Links / App Links
- 后台任务
- 离线缓存体系
- 复杂相机、相册和文件处理
- 大量本地数据库同步
- 大规模平台差异化 UI

## 6. 登录态与存储策略

### 6.1 当前现状

当前会话访问已经统一经过 `SessionStorageAdapter`。Web 环境仍可使用 `localStorage`，而原生 Capacitor 容器环境会切到安全存储路径。

### 6.2 iOS 的执行约束

- iOS 端默认沿用现有 `@aparajita/capacitor-secure-storage`
- iOS 首版默认落到 Keychain 路径
- 不允许把正式会话长期回退成直接依赖 WebView `localStorage`

### 6.3 本项目的执行建议

- `debug` 联调允许先以“能跑起来”为目标验证容器可用性
- `test` / `release` 阶段必须继续沿用统一存储抽象，不新增平台分叉业务逻辑
- 后续若替换安全存储插件，也只能在 `SessionStorageAdapter` 之下替换

## 7. 网络、环境与发布方式

### 7.1 环境分层

首版至少区分以下环境：

- `debug`
- `test`
- `release`

### 7.2 调试地址策略

`debug` 模式下的地址口径如下：

- iOS 模拟器：优先 `http://localhost:3000`
- Android 模拟器：使用 `http://10.0.2.2:3000`
- 真机：使用宿主机局域网地址

### 7.3 TestFlight / release 约束

- `test` / `release` 包不允许继续依赖本地调试地址
- 必须切到固定 HTTPS Web 入口
- 保留本地 fallback 页面与最低 Web 版本闸门
- Android 继续按 cleartext / release 收口
- iOS 需要按 ATS 规则管理开发例外与 release allowlist

### 7.4 后端边界

- 后端不新增 iOS 专属 API
- 仅在需要时补环境来源配置
- 保持当前 API、鉴权和请求头协议不变

## 8. 分阶段实施计划

### P0：仓库收口

目标：让 `apps/native` 成为跨平台原生壳，而不是 Android 特例。

主要动作：

- 将默认 `appId` 改为跨平台 bundle id 根
- 当前已存在的 Android 工程包名保持历史值，避免在 iOS 准备阶段引入额外的 Android rename 风险；若后续需要统一商店标识，再单独做 Android package rename 迁移
- 补齐 `debug / test / release` 样例环境文件
- README、runbook、架构文档改成 Android / iOS 共用口径
- 增加 iOS 工程生成 / 同步 / 打开脚本入口
- 保持 Android 现有联调不回退

### P1：iOS 工程生成

目标：在有 Mac / Xcode 后生成 `apps/native/ios` 并接上现有 Capacitor 插件。

主要动作：

- 在 macOS 执行 `cap add ios`
- 完成 Xcode signing、bundle id、team、scheme、图标和启动图配置
- 接通 StatusBar / Splash / Share / Browser / SecureStorage 插件

### P2：iOS 联调与 TestFlight 准备

目标：在不扩范围的前提下完成 iOS 首版内测能力。

主要动作：

- 跑通冷启动、游客会话、登录恢复、首页、日记、我的、分享和外链
- 校验安全区、状态栏、Web 入口切换、fallback 页面、最低版本闸门
- 准备首个 TestFlight 内测包

## 9. 风险与控制策略

### 9.1 风险：把 Android 调试口径直接带进 iOS 内测

控制策略：

- `debug` / `test` / `release` 显式分层
- TestFlight / release 只能使用固定 HTTPS Web 入口

### 9.2 风险：iOS 接入时重新发明一套平台抽象

控制策略：

- 继续沿用现有 `PlatformBridge`
- 继续沿用现有 `SessionStorageAdapter`
- 继续沿用现有 `NativeShellController`

### 9.3 风险：没有 Mac 时先做了太多“伪 iOS 实现”

控制策略：

- 当前阶段只做仓库级收口
- 不承诺在无 Mac 状态下完成 iOS 编译
- 真正的 iOS 工程生成和 TestFlight 打包放到有 Xcode 后执行

### 9.4 风险：状态栏 / 安全区在 iOS 上表现与 Android 不一致

控制策略：

- 保留统一 Web 入口，但在壳层控制中显式区分平台
- iOS 不依赖 Android 风格背景色作为主策略
- 重点保证顶部留白、安全区和状态栏文字深浅正确

## 10. 验收标准

### 仓库层

- `apps/web` 类型检查通过
- `backend` 类型检查通过
- iOS 相关配置不影响 Android 现有联调

### iOS 模拟器

- App 可启动，冷启动无白屏
- 根路由可完成 guest session 初始化并进入首页
- 首页、日记、体重录入、我的页可正常打开
- 状态栏不压住内容，顶部安全区正确
- 分享调起系统面板，外链交给系统浏览器
- 杀进程后重新打开，登录态可恢复

### TestFlight

- 包体使用固定 HTTPS 入口
- 网络异常或版本不兼容时进入 fallback 页面而非白屏
- API 鉴权、游客态、登录态迁移正常
- 真实 iPhone 上滚动、输入、键盘弹起和 safe-area 无明显问题

## 11. 下一步建议

1. 先保持 Android 现有联调链路稳定，不回退现有壳工程能力。
2. 继续用当前仓库级配置和文档作为 iOS 接入基线。
3. 拿到 Mac 后先生成 `apps/native/ios`，不要先改业务页面。
4. 优先完成 iOS 模拟器联调，再进入 TestFlight。
5. 在 TestFlight 前再集中核对 HTTPS 入口、ATS、fallback 页面和最低版本闸门。
