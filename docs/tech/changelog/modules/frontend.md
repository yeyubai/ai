# Module Changelog: frontend

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
