# Module Changelog: backend

## 2026-03-18 | 2026-03-18-home-module-registration-fix
- Summary: 修复后端首页模块未注册到根应用的问题，恢复 `/api/v1/home/today` 与首页动作完成接口的路由挂载；同时为 `HomeModule` 补齐 `JourneyStateModule` 依赖，消除移动端联调时的 404 与 Nest DI 启动错误。
- Files:
  - `backend/src/app.module.ts`
  - `backend/src/modules/home/home.module.ts`
  - `docs/tech/changelog/conversations/2026-03-18.md`
  - `docs/tech/changelog/modules/backend.md`
- Notes: 本次仅补齐 NestJS 模块装配，不涉及 Home 领域逻辑改写。

## 2026-03-18 | 2026-03-18-hybrid-dev-cors-origin-broadening
- Summary: 为混合 App 本地联调放宽开发态 CORS 来源匹配，除显式配置外额外允许 `localhost`、`10.0.2.2`、常见私网 IPv4 以及 `capacitor://localhost` / `ionic://localhost` 等本地容器来源，修复 Android WebView 初始化 guest session 时被 CORS 拦截的问题。
- Files:
  - `backend/src/main.ts`
  - `docs/tech/changelog/conversations/2026-03-18.md`
  - `docs/tech/changelog/modules/backend.md`
- Notes: 该逻辑仅在非 production 下启用额外的本地来源放行；生产环境仍以显式配置 origin 为准。

## 2026-03-12 | 2026-03-12-backend-local-deps-fix
- Summary: 修正依赖安装位置，在 `backend` 目录本地安装依赖，避免仅根 workspace 可用。
- Files:
  - `backend/node_modules/**`
  - `docs/tech/changelog/conversations/2026-03-12.md`
  - `docs/tech/changelog/modules/backend.md`
- Notes: 在 `C:\Users\20156\Desktop\demo\ai\backend` 执行 `npm install --workspaces=false` 后，后端目录具备独立运行能力。

## 2026-03-12 | 2026-03-12-auth-login-first-api
- Summary: 完成 backend 初始化校验并实现首个登录接口 `POST /api/v1/auth/login`，补充请求 DTO、验证码校验、token 返回与单元测试。
- Files:
  - `backend/src/modules/auth/controllers/auth.controller.ts`
  - `backend/src/modules/auth/services/auth.service.ts`
  - `backend/src/modules/auth/dto/login-request.dto.ts`
  - `backend/src/modules/auth/dto/login-response.dto.ts`
  - `backend/src/shared/config/env.config.ts`
  - `backend/src/shared/dto/api-response.dto.ts`
  - `backend/src/shared/filters/http-exception.filter.ts`
  - `backend/.env.example`
  - `backend/jest.config.cjs`
  - `backend/tests/unit/auth.service.spec.ts`
  - `docs/tech/changelog/conversations/2026-03-12.md`
- Notes: 当前登录接口采用 mock 验证码（默认 `123456`），后续接入真实短信服务时保留同一契约。

## 2026-03-12 | 2026-03-12-db-connection-prisma6-stack-cleanup
- Summary: 完成 MySQL 连通性验证，移除后端 Java 风格占位目录，并将 Prisma 版本固定到 v6.19.2。
- Files:
  - `backend/package.json`
  - `backend/README.md`
  - `docs/tech/changelog/conversations/2026-03-12.md`
- Notes: 当前后端技术栈保持 NestJS + Prisma + MySQL，不再保留 Java 目录占位。

## 2026-03-12 | 2026-03-12-prd-design-first-workflow
- Summary: 后端规则新增“设计文档门禁”，需求编码前必须具备后端设计（接口、模型、错误码、测试）。
- Files:
  - `.codex/rules/backend/coding.md`
  - `docs/tech/changelog/conversations/2026-03-12.md`
- Notes: 将需求实现流程前移到设计评审阶段，避免接口与数据结构返工。

## 2026-03-12 | 2026-03-12-rerun-init-after-node-upgrade
- Summary: 初始化阶段调整 backend 测试脚本为 `--passWithNoTests`，让骨架阶段质量门禁可执行。
- Files:
  - `backend/package.json`
  - `docs/tech/changelog/conversations/2026-03-12.md`
- Notes: 后续补齐首批单测后可恢复严格测试门禁。

## 2026-03-12 | 2026-03-12-init-frontend-backend-structure
- Summary: 初始化 NestJS 后端骨架，完成模块分层、统一响应、全局校验、错误处理与 Prisma schema。
- Files:
  - `backend/package.json`
  - `backend/src/main.ts`
  - `backend/src/app.module.ts`
  - `backend/src/modules/**`
  - `backend/src/shared/**`
  - `backend/prisma/schema.prisma`
  - `backend/.env.example`
- Notes: 保留旧 Java 风格空目录到 `backend/legacy`，避免污染当前 Nest 运行结构。

## 2026-03-12 | 2026-03-12-vibe-coding-rules
- Summary: 增加后端分层红线、复杂度阈值、DTO/领域/响应分离约束，防止 Controller/Repository 职责污染。
- Files:
  - `.codex/rules/backend/coding.md`
  - `.codex/rules/backend/database.md`
- Notes: 强化事务、幂等、并发与迁移可回滚约束。

## 2026-03-12 | 2026-03-12-backend-review-findings-fix
- Summary: 修复后端规范检查问题：补齐 Repository 分层、落地 traceId 注入、启动配置收口到 envConfig、Prisma 字段 snake_case 显式映射。
- Files:
  - `backend/src/modules/auth/repositories/auth.repository.ts`
  - `backend/src/modules/auth/services/auth.service.ts`
  - `backend/src/modules/auth/auth.module.ts`
  - `backend/src/shared/middleware/trace-id.middleware.ts`
  - `backend/src/app.module.ts`
  - `backend/src/main.ts`
  - `backend/prisma/schema.prisma`
  - `backend/tests/unit/auth.service.spec.ts`
  - `docs/tech/changelog/conversations/2026-03-12.md`
  - `docs/tech/changelog/modules/backend.md`
- Notes: 运行时冒烟验证通过，`POST /api/v1/auth/login` 成功/失败响应均携带非空 `traceId`。

## 2026-03-13 | 2026-03-13-rq001-auth-profile-sync
- Summary: 按 `rq-001` 设计文档补齐后端实现：新增 profile 读写接口、会话鉴权 Guard、auth_sessions/user_profiles 数据模型与档案完成态规则。
- Files:
  - `backend/prisma/schema.prisma`
  - `backend/src/app.module.ts`
  - `backend/src/modules/auth/auth.module.ts`
  - `backend/src/modules/auth/controllers/auth.controller.ts`
  - `backend/src/modules/auth/repositories/auth.repository.ts`
  - `backend/src/modules/auth/services/auth.service.ts`
  - `backend/src/modules/auth/guards/session-auth.guard.ts`
  - `backend/src/modules/auth/decorators/current-user-id.decorator.ts`
  - `backend/src/modules/profile/profile.module.ts`
  - `backend/src/modules/profile/controllers/profile.controller.ts`
  - `backend/src/modules/profile/services/profile.service.ts`
  - `backend/src/modules/profile/repositories/profile.repository.ts`
  - `backend/src/modules/profile/dto/update-profile-request.dto.ts`
  - `backend/src/modules/profile/dto/user-profile.dto.ts`
  - `backend/tests/unit/auth.service.spec.ts`
  - `backend/tests/unit/profile.service.spec.ts`
  - `docs/tech/changelog/conversations/2026-03-13.md`
  - `docs/tech/changelog/modules/backend.md`
- Notes: `GET/PUT /api/v1/profile` 与登录鉴权链路已联通，`targetWeightKg <= currentWeightKg` 规则由 Service 强制校验。
