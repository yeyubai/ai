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
