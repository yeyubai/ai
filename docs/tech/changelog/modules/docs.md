# Module Changelog: docs

## 2026-03-12 | 2026-03-12-root-deps-strategy-optimize
- Summary: 记录根目录依赖策略优化，明确“根脚本调度 + 子项目本地安装”的工程约定。
- Files:
  - `README.md`
  - `.gitignore`
  - `apps/web/package-lock.json`
  - `backend/package-lock.json`
  - `docs/tech/changelog/conversations/2026-03-12.md`
  - `docs/tech/changelog/modules/global.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 降低根目录作为源码层的误解，提高目录职责清晰度。

## 2026-03-12 | 2026-03-12-backend-local-deps-fix
- Summary: 追加当日日志，记录 backend 目录依赖安装位置修正与验证结果。
- Files:
  - `docs/tech/changelog/conversations/2026-03-12.md`
  - `docs/tech/changelog/modules/backend.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: conversations 按日期文件持续追加。

## 2026-03-12 | 2026-03-12-auth-login-first-api
- Summary: 追加当日日志，记录后端初始化校验与首个登录接口实现结果。
- Files:
  - `docs/tech/changelog/conversations/2026-03-12.md`
  - `docs/tech/changelog/modules/backend.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: conversations 维持“按日期文件追加”策略。

## 2026-03-12 | date-log-policy
- Summary: 将 conversations 记录方式统一为“按日期文件持续追加”，并将当天历史对话文件合并到单日日志。
- Files:
  - `docs/tech/changelog/README.md`
  - `.codex/rules/docs/structure.md`
  - `docs/tech/changelog/conversations/2026-03-12.md`
  - `docs/tech/changelog/modules/global.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: conversations 目录只保留单日文件，旧分散文件已合并清理。

## 2026-03-12 | 2026-03-12-db-connection-prisma6-stack-cleanup
- Summary: 补充本次数据库联调与技术栈纠偏会话日志，明确 DataGrip schema 过滤与 Prisma 版本提示处理方式。
- Files:
  - `docs/tech/changelog/conversations/2026-03-12.md`
  - `docs/tech/changelog/modules/backend.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 继续执行“每次对话改动必留痕”机制。

## 2026-03-12 | 2026-03-12-prd-design-first-workflow
- Summary: 新增“需求设计先行”文档体系，补充 `tech/design` 目录、模板、需求索引与 `rq-001` 前后端详细设计。
- Files:
  - `README.md`
  - `docs/README.md`
  - `docs/tech/architecture/project-structure.md`
  - `.codex/rules/docs/structure.md`
  - `docs/tech/design/README.md`
  - `docs/tech/design/templates/requirement-backend-design-template.md`
  - `docs/tech/design/templates/requirement-frontend-design-template.md`
  - `docs/tech/design/requirements/index.md`
  - `docs/tech/design/requirements/rq-001-auth-profile/2026-03-12-rq-001-auth-profile-backend-design.md`
  - `docs/tech/design/requirements/rq-001-auth-profile/2026-03-12-rq-001-auth-profile-frontend-design.md`
  - `docs/tech/changelog/conversations/2026-03-12.md`
- Notes: 建立“后端设计 -> 前端设计 -> 后端编码 -> 前端编码”的交付标准流程。

## 2026-03-12 | 2026-03-12-rerun-init-after-node-upgrade
- Summary: 记录 Node 升级后重跑初始化验证会话与修复结论。
- Files:
  - `docs/tech/changelog/conversations/2026-03-12.md`
  - `docs/tech/changelog/modules/global.md`
  - `docs/tech/changelog/modules/frontend.md`
  - `docs/tech/changelog/modules/backend.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 继续保持“每次对话改动必留痕”执行。

## 2026-03-12 | 2026-03-12-init-frontend-backend-structure
- Summary: 记录前后端初始化会话的对话日志与模块同步日志。
- Files:
  - `docs/tech/changelog/conversations/2026-03-12.md`
  - `docs/tech/changelog/modules/global.md`
  - `docs/tech/changelog/modules/frontend.md`
  - `docs/tech/changelog/modules/backend.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 继续执行“每次对话必须留痕”机制。

## 2026-03-12 | 2026-03-12-update-root-readme
- Summary: 更新根 README 的目录说明与结构示意，补充规则与日志入口。
- Files:
  - `README.md`
  - `docs/tech/changelog/conversations/2026-03-12.md`
- Notes: 文档可读性提升，无代码行为变更。

## 2026-03-12 | 2026-03-12-vibe-coding-rules
- Summary: 新增对话与模块双轨日志机制，并把文档目录纳入 changelog 管理。
- Files:
  - `docs/README.md`
  - `.codex/rules/docs/structure.md`
  - `docs/tech/changelog/README.md`
  - `docs/tech/changelog/conversations/2026-03-12.md`
- Notes: 后续所有对话改动都要求同步写入本模块日志。

## 2026-03-12 | 2026-03-12-backend-review-findings-fix
- Summary: 追加当日日志，记录后端规范性问题修复（分层、traceId、配置收口、Prisma 命名映射）及验证结果。
- Files:
  - `docs/tech/changelog/conversations/2026-03-12.md`
  - `docs/tech/changelog/modules/backend.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 保持 conversations 按日期文件持续追加，模块日志同步归档。
