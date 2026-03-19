# Module Changelog: frontend

## 2026-03-19 | 2026-03-19-ios-chat-form-viewport-followup
- Summary: 继续清理 iOS WebView 下残留的页面级高度与键盘问题：教练聊天页改为动态视口布局并补上消息自动滚底，体重录入页与通用记录表单增加键盘态底部缓冲，日记空态和编辑页则移除固定 `vh` 依赖，统一转向 `--app-viewport-height`。
- Files:
  - `apps/web/features/coach/ui/sections/coach-chat-section.tsx`
  - `apps/web/features/weight-diary/ui/sections/weight-entry-form-section.tsx`
  - `apps/web/features/checkins/ui/components/checkin-form-layout.tsx`
  - `apps/web/features/diary/ui/sections/diary-section.tsx`
  - `apps/web/features/diary/ui/sections/diary-editor-section.tsx`
  - `docs/tech/changelog/conversations/2026-03-19.md`
  - `docs/tech/changelog/modules/frontend.md`
- Notes: 这一轮重点是收口具体页面层的 iOS 输入体验，优先修掉固定高度和原生输入未继承通用策略的缺口；真实 iOS 模拟器与真机手感仍需后续在 Xcode 环境验证。

## 2026-03-19 | 2026-03-19-ios-keyboard-dialog-input-adaptation
- Summary: 继续推进 iOS 逻辑适配：正式接入 `@capacitor/keyboard`，让原生键盘事件参与底部 inset 计算；通用 `DialogContent` 改为可跟随键盘和 safe-area 调整的底部弹层；全局输入样式补充原生滚动边距与 iOS 16px 字号规则，减少聚焦放大与键盘遮挡。
- Files:
  - `apps/web/package.json`
  - `apps/web/types/capacitor-shims.d.ts`
  - `apps/web/shared/native-shell/native-shell-controller.tsx`
  - `apps/web/components/ui/dialog.tsx`
  - `apps/web/app/globals.css`
  - `docs/tech/changelog/conversations/2026-03-19.md`
  - `docs/tech/changelog/modules/frontend.md`
- Notes: 这一轮属于通用交互层补强，目标是让更多页面天然继承 iOS 友好的键盘与弹层行为，而不是逐页打补丁。

## 2026-03-18 | 2026-03-18-ios-viewport-keyboard-adaptation
- Summary: 为 iOS 首次接入补齐 Web 壳层的动态视口、safe-area 和键盘态适配：根布局输出 `viewport-fit=cover`，`NativeShellController` 同步原生平台/键盘状态到 CSS 变量，底部 Tab 与悬浮按钮在键盘弹起时自动隐藏，日记编辑器等页面改为基于统一视口变量计算高度与底部间距；同时为 Native 安全存储增加失败不炸页面的兜底。
- Files:
  - `apps/web/app/layout.tsx`
  - `apps/web/app/globals.css`
  - `apps/web/shared/native-shell/native-shell-controller.tsx`
  - `apps/web/features/navigation/ui/components/app-shell.tsx`
  - `apps/web/features/navigation/ui/components/bottom-tab-bar.tsx`
  - `apps/web/features/diary/ui/components/diary-floating-add-button.tsx`
  - `apps/web/features/weight-diary/ui/components/floating-add-button.tsx`
  - `apps/web/features/diary/ui/sections/diary-editor-section.tsx`
  - `apps/web/features/diary/ui/sections/diary-section.tsx`
  - `apps/web/features/settings/ui/sections/me-number-picker-section.tsx`
  - `apps/web/features/weight-diary/ui/sections/home-overview-section.tsx`
  - `apps/web/lib/session/session-storage.ts`
  - `docs/tech/changelog/conversations/2026-03-18.md`
  - `docs/tech/changelog/modules/frontend.md`
- Notes: 这一轮只处理仓库中可先迁移的跨端逻辑，不依赖 Xcode；真实 iOS 模拟器与真机表现仍需后续在 macOS 环境实测。

## 2026-03-18 | 2026-03-18-ios-shell-status-bar-guard
- Summary: 为原生壳控制器补齐平台分支，明确状态栏背景色仅在 Android 路径设置，避免后续 iOS 接入时继续沿用 Android 风格背景色策略。
- Files:
  - `apps/web/shared/native-shell/native-shell-controller.tsx`
  - `docs/tech/changelog/conversations/2026-03-18.md`
  - `docs/tech/changelog/modules/frontend.md`
- Notes: 该改动不改变现有 Android 样式，只是为 iOS 首版接入提前收口平台差异。

## 2026-03-18 | 2026-03-18-weight-detail-range-fallback-tone
- Summary: 修正记录详情页体重区间轴的降级态展示，避免缺少判定条件时整条轴变成纯灰，并让其直接复用体脂区间轴的同组颜色值；同时收紧提示文案说明当前为通用分段样式。
- Files:
  - `apps/web/features/weight-diary/ui/sections/weight-entry-detail-section.tsx`
  - `docs/tech/changelog/conversations/2026-03-18.md`
  - `docs/tech/changelog/modules/frontend.md`
- Notes: 仅调整详情页前端表现层，不影响 BMI / 体脂计算和后端返回结构。

## 2026-03-18 | 2026-03-18-root-loading-error-fallback
- Summary: 为首页根路由补充混合 App 初始化中的可见加载态与失败重试兜底，避免 guest session 初始化失败时页面只呈现白屏。
- Files:
  - `apps/web/app/page.tsx`
  - `docs/tech/changelog/conversations/2026-03-18.md`
  - `docs/tech/changelog/modules/frontend.md`
- Notes: 根路由仍保留原有“会话就绪后跳转 `/home`”逻辑，只是在等待或失败时提供可见反馈。

## 2026-03-18 | 2026-03-18-emulator-api-base-url-fallback
- Summary: 为 Android 模拟器本地联调调整 API client 默认地址解析逻辑，在未显式配置 `NEXT_PUBLIC_API_BASE_URL` 时自动跟随当前页面 hostname 并默认指向 `:3001`。
- Files:
  - `apps/web/lib/api/client.ts`
  - `apps/web/shared/native-shell/native-shell-controller.tsx`
  - `apps/web/types/capacitor-shims.d.ts`
  - `docs/tech/changelog/conversations/2026-03-18.md`
  - `docs/tech/changelog/modules/frontend.md`
- Notes: 该改动兼容宿主机浏览器的 `localhost` 和 Android 模拟器的 `10.0.2.2`，不影响已有显式环境变量配置；同时补充 Capacitor shim 类型以打通当前前端类型检查。

## 2026-03-17 | 2026-03-17-session-storage-adapter-p1
- Summary: 为混合 App P1 落地 Web 侧 `SessionStorageAdapter`，收口 `auth-store` 读写、兼容旧持久化格式，并让 API client 不再直接访问 `localStorage`。
- Files:
  - `apps/web/lib/session/session-storage.ts`
  - `apps/web/features/auth/model/auth.store.ts`
  - `apps/web/lib/api/client.ts`
  - `docs/tech/design/requirements/index.md`
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/frontend.md`
- Notes: 本次优先完成会话访问抽象，暂未接入 Native 安全存储实现。

## 2026-03-17 | 2026-03-17-platform-bridge-p2
- Summary: 新增 Web 侧 `PlatformBridge` 抽象，统一封装分享、外链与 App 信息读取，并在“我的”页接入导出任务分享与环境展示作为首批混合能力落点。
- Files:
  - `apps/web/lib/platform/platform-bridge.ts`
  - `apps/web/lib/platform/index.ts`
  - `apps/web/features/settings/ui/sections/me-section.tsx`
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/frontend.md`
- Notes: 当前 bridge 已切到官方 Capacitor JS API，并保留浏览器降级路径。

## 2026-03-17 | 2026-03-17-native-secure-session-p3
- Summary: 为混合 App P3 接入 Native 会话安全存储，在 Capacitor 容器中通过 `@aparajita/capacitor-secure-storage` 持久化登录态，并调整根路由 hydration 时序与 API client 的异步 token 读取。
- Files:
  - `apps/web/lib/session/session-storage.ts`
  - `apps/web/features/auth/model/auth.store.ts`
  - `apps/web/lib/api/client.ts`
  - `apps/web/app/page.tsx`
  - `apps/web/package.json`
  - `apps/web/package-lock.json`
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/frontend.md`
- Notes: 该实现仅在 Native 容器中启用 secure storage；浏览器环境仍保留现有 `localStorage` 路径。

## 2026-03-17 | 2026-03-17-web-version-meta-p3
- Summary: 为 Web 端 metadata 增加 `ai-web-app-version`，供 Native release 闸门读取当前 Web 版本并执行最低兼容检查。
- Files:
  - `apps/web/app/layout.tsx`
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/frontend.md`
- Notes: 该版本标记目前用于 Native release 兼容检查，不影响现有 Web 页面行为。

## 2026-03-17 | 2026-03-17-app-build-display-p3
- Summary: 在“我的”页补充 App build 信息展示，便于混合 App 联调时快速确认当前运行环境和版本。
- Files:
  - `apps/web/features/settings/ui/sections/me-section.tsx`
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/frontend.md`
- Notes: 版本信息仍来自 `PlatformBridge.getAppInfo()`，Web 环境下会按降级路径展示。

## 2026-03-17 | 2026-03-17-native-shell-controller-p2
- Summary: 新增 `NativeShellController`，在 Native 容器中统一设置状态栏样式并在页面准备好后隐藏启动页。
- Files:
  - `apps/web/shared/native-shell/native-shell-controller.tsx`
  - `apps/web/app/layout.tsx`
  - `apps/web/package.json`
  - `apps/web/package-lock.json`
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/frontend.md`
- Notes: 该能力只在 Capacitor Native 容器中生效，浏览器环境会直接跳过。

## 2026-03-12 | 2026-03-12-prd-design-first-workflow
- Summary: 前端规则新增“设计先行 + 后端先行”约束，前端编码必须依赖后端契约定稿与前端设计文档。
- Files:
  - `.codex/rules/frontend/coding.md`
  - `docs/tech/changelog/conversations/2026-03-12.md`
- Notes: 明确禁止在后端契约未冻结时提前进入前端编码。

## 2026-03-12 | 2026-03-12-rerun-init-after-node-upgrade
- Summary: 修复前端 `package.json` BOM，恢复 Next.js 生产构建可用性。
- Files:
  - `apps/web/package.json`
  - `docs/tech/changelog/conversations/2026-03-12.md`
- Notes: `npm run build` 已验证通过。

## 2026-03-12 | 2026-03-12-init-frontend-backend-structure
- Summary: 初始化 Next.js 前端工程骨架，按 feature-first 分层并接入 Tailwind/shadcn/axios/zustand 基线。
- Files:
  - `apps/web/package.json`
  - `apps/web/tsconfig.json`
  - `apps/web/next.config.mjs`
  - `apps/web/tailwind.config.ts`
  - `apps/web/components.json`
  - `apps/web/app/layout.tsx`
  - `apps/web/app/page.tsx`
  - `apps/web/lib/api/client.ts`
  - `apps/web/features/health/**`
- Notes: 目录与示例代码已对齐前端 rules 的数据流与分层约束。

## 2026-03-12 | 2026-03-12-vibe-coding-rules
- Summary: 补充分层红线、复杂度阈值和可读性约束，强化防“组件职责混乱”和数据流失控。
- Files:
  - `.codex/rules/frontend/coding.md`
- Notes: 新增禁止项（组件直连 API、跨 feature 内部依赖）和强制重构触发阈值。

## 2026-03-12 | 2026-03-12-fe-auth-login-integration
- Summary: 基于已完成后端契约实现前端首版登录联调，新增 `/auth/login` 页面、`features/auth` 模块、统一 API 错误模型与登录态 store。
- Files:
  - `apps/web/app/page.tsx`
  - `apps/web/app/auth/login/page.tsx`
  - `apps/web/app/onboarding/profile/page.tsx`
  - `apps/web/app/settings/profile/page.tsx`
  - `apps/web/features/auth/index.ts`
  - `apps/web/features/auth/api/auth.api.ts`
  - `apps/web/features/auth/model/auth.store.ts`
  - `apps/web/features/auth/types/auth.types.ts`
  - `apps/web/features/auth/ui/components/login-form-card.tsx`
  - `apps/web/features/auth/ui/sections/login-page-section.tsx`
  - `apps/web/lib/api/client.ts`
  - `apps/web/lib/api/types.ts`
  - `apps/web/features/health/api/health.api.ts`
  - `apps/web/.env.example`
  - `docs/tech/changelog/conversations/2026-03-12.md`
  - `docs/tech/changelog/modules/frontend.md`
- Notes: `npm run typecheck`、`npm run lint`、`npm run build`（cwd: `apps/web`）均通过。

## 2026-03-13 | 2026-03-13-rq001-auth-profile-sync
- Summary: 对齐 `rq-001` 前端设计，补齐登录后分流与档案页联调：新增 `features/profile`，打通 `/onboarding/profile` 与 `/settings/profile` 对后端 profile 接口调用。
- Files:
  - `apps/web/features/auth/ui/sections/login-page-section.tsx`
  - `apps/web/features/auth/model/auth.store.ts`
  - `apps/web/lib/api/client.ts`
  - `apps/web/features/profile/index.ts`
  - `apps/web/features/profile/api/profile.api.ts`
  - `apps/web/features/profile/types/profile.types.ts`
  - `apps/web/features/profile/ui/components/profile-form-card.tsx`
  - `apps/web/features/profile/ui/sections/profile-editor-section.tsx`
  - `apps/web/app/onboarding/profile/page.tsx`
  - `apps/web/app/settings/profile/page.tsx`
  - `docs/tech/changelog/conversations/2026-03-13.md`
  - `docs/tech/changelog/modules/frontend.md`
- Notes: 登录成功后依据 `profileCompleted` 自动路由；未登录访问档案页会被守卫重定向到登录页。

## 2026-03-13 | 2026-03-13-rq007-tabbar-shell
- Summary: 新增登录后全局底部 Tab App Shell（首页/打卡/趋势/我的），补齐 `/trend` 与 `/settings/preferences` 路由，并引入 `lucide-react` 图标依赖。
- Files:
  - `apps/web/package.json`
  - `apps/web/package-lock.json`
  - `apps/web/app/layout.tsx`
  - `apps/web/app/trend/page.tsx`
  - `apps/web/app/settings/preferences/page.tsx`
  - `apps/web/features/navigation/index.ts`
  - `apps/web/features/navigation/types/tab.types.ts`
  - `apps/web/features/navigation/config/tab.config.ts`
  - `apps/web/features/navigation/utils/tab-tracking.ts`
  - `apps/web/features/navigation/ui/components/app-shell.tsx`
  - `apps/web/features/navigation/ui/components/bottom-tab-bar.tsx`
  - `docs/tech/changelog/conversations/2026-03-13.md`
  - `docs/tech/changelog/modules/frontend.md`
- Notes: `npm run typecheck/lint/build --prefix apps/web` 均通过。

## 2026-03-13 | 2026-03-13-shadcn-theme-polish
- Summary: 基于 shadcn 完成前端视觉升级，统一主题令牌并重构核心页面（登录/打卡/AI/趋势）和底部 Tab 导航样式。
- Files:
  - `apps/web/tailwind.config.ts`
  - `apps/web/app/globals.css`
  - `apps/web/components/ui/*`
  - `apps/web/app/auth/login/page.tsx`
  - `apps/web/app/dashboard/page.tsx`
  - `apps/web/app/checkins/*/page.tsx`
  - `apps/web/app/coach/*/page.tsx`
  - `apps/web/app/trend/page.tsx`
  - `apps/web/features/navigation/ui/components/app-shell.tsx`
  - `apps/web/features/navigation/ui/components/bottom-tab-bar.tsx`
  - `apps/web/features/auth/ui/components/login-form-card.tsx`
  - `apps/web/features/profile/ui/components/profile-form-card.tsx`
  - `apps/web/features/checkins/ui/components/checkin-form-layout.tsx`
  - `apps/web/features/checkins/ui/sections/*.tsx`
  - `apps/web/features/ai-coach/ui/sections/*.tsx`
  - `docs/tech/changelog/conversations/2026-03-13.md`
  - `docs/tech/changelog/modules/frontend.md`
- Notes: `npm --prefix apps/web run typecheck/lint/build` 全部通过。

## 2026-03-13 | 2026-03-13-vibe-polish-pass-2
- Summary: 基于 shadcn 完成第二轮视觉增强，新增入场动效、登录双栏视觉、Dashboard/Trend 与底部 Tab 质感优化。
- Files:
  - `apps/web/app/globals.css`
  - `apps/web/app/auth/login/page.tsx`
  - `apps/web/app/dashboard/page.tsx`
  - `apps/web/app/coach/plan/page.tsx`
  - `apps/web/app/coach/review/page.tsx`
  - `apps/web/app/checkins/*/page.tsx`
  - `apps/web/app/trend/page.tsx`
  - `apps/web/features/navigation/ui/components/app-shell.tsx`
  - `apps/web/features/navigation/ui/components/bottom-tab-bar.tsx`
  - `apps/web/features/auth/ui/components/login-form-card.tsx`
  - `apps/web/features/ai-coach/ui/sections/dashboard-coach-section.tsx`
  - `docs/tech/changelog/conversations/2026-03-13.md`
  - `docs/tech/changelog/modules/frontend.md`
- Notes: `npm --prefix apps/web run typecheck/lint/build` 全通过。

## 2026-03-13 | 2026-03-13-dev-cache-font-fix
- Summary: 修复前端 dev 500（`next/font` 误报 + `.next` chunk 缓存损坏），确认布局无 `Geist` 并清理缓存恢复重启路径。
- Files:
  - `apps/web/app/layout.tsx`
  - `docs/tech/changelog/conversations/2026-03-13.md`
  - `docs/tech/changelog/modules/frontend.md`
- Notes: 生产构建 `npm --prefix apps/web run build` 可通过；`/.well-known/appspecific/...` 请求失败可忽略。
