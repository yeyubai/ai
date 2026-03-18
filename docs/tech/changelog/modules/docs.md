# Module Changelog: docs

## 2026-03-18 | 2026-03-18-emulator-local-debug-log
- Summary: 追加 2026-03-18 对话日志，记录 Android 模拟器本地联调所需的 Native 调试地址、本地 CORS 配置与前端 API 默认地址兼容策略。
- Files:
  - `docs/tech/changelog/conversations/2026-03-18.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 本条仅同步文档留痕；对应实现和本地配置分别记录在 frontend 与 native 模块日志中。

## 2026-03-18 | 2026-03-18-gradle-deprecation-cleanup-log
- Summary: 追加 2026-03-18 对话日志，记录 Android 原生工程中旧 Gradle DSL 的清理与 Gradle 9 兼容性 warning 收敛。
- Files:
  - `docs/tech/changelog/conversations/2026-03-18.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 本条仅同步文档留痕；对应工程配置改动记录在 native 模块日志。

## 2026-03-18 | 2026-03-18-gradle-wrapper-sync-log
- Summary: 新增 2026-03-18 对话日志，记录 Android Studio Gradle Sync 下载失败的排查与 wrapper 稳定性调整。
- Files:
  - `docs/tech/changelog/conversations/2026-03-18.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 本条仅同步文档留痕；对应工程配置改动记录在 native 模块日志。

## 2026-03-17 | 2026-03-17-root-readme-architecture-sync
- Summary: 同步根目录 README 的架构重写留痕，记录项目入口文档已按当前混合架构更新。
- Files:
  - `README.md`
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/global.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 本条主要同步项目说明文档变更，不引入新的架构决策。

## 2026-03-17 | 2026-03-17-hybrid-app-p1-delivery-sync
- Summary: 同步混合 App P1 工程落地文档，更新 Native 工程轨道状态、README 配置说明与当日会话留痕，记录会话抽象和 Native 模式边界的首批实现。
- Files:
  - `apps/native/README.md`
  - `docs/tech/design/requirements/index.md`
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/frontend.md`
  - `docs/tech/changelog/modules/native.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 本条主要同步工程进度与文档口径，不引入新的方案决策。

## 2026-03-17 | 2026-03-17-hybrid-app-p2-platform-bridge-sync
- Summary: 记录混合 App P2 平台桥首批落地，补充当日会话留痕并同步 bridge 已进入页面级消费阶段。
- Files:
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/frontend.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 本条为实现留痕同步，当前未新增新的架构文档。

## 2026-03-17 | 2026-03-17-hybrid-app-p3-secure-storage-sync
- Summary: 同步混合 App P3 Native 安全存储接入留痕，更新 README 与模块日志，记录 secure storage 插件和异步会话 hydration 的首批实现。
- Files:
  - `apps/native/README.md`
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/frontend.md`
  - `docs/tech/changelog/modules/native.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 本条主要同步已完成实现，不新增新的方案文档。

## 2026-03-17 | 2026-03-17-hybrid-app-p3-fallback-gate-sync
- Summary: 同步混合 App P3 release fallback 与版本闸门实现留痕，记录 Android 本地维护页和最低 Web 版本校验的首批落地。
- Files:
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/frontend.md`
  - `docs/tech/changelog/modules/native.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 当前已完成 typecheck、sync 和 doctor；Android 编译仍受本机 `JAVA_HOME` 缺失阻塞。

## 2026-03-17 | 2026-03-17-hybrid-app-p3-recovery-links-sync
- Summary: 同步混合 App P3 fallback 恢复入口补强留痕，记录更新/帮助链接和 App build 信息展示的后续实现。
- Files:
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/frontend.md`
  - `docs/tech/changelog/modules/native.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 当前主要补强恢复路径和信息可见性，不新增新的架构文档。

## 2026-03-17 | 2026-03-17-hybrid-app-p2-shell-chrome-sync
- Summary: 同步混合 App P2 壳层状态栏与启动页初始化留痕，记录 NativeShellController 与相关 Capacitor 插件的接入。
- Files:
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/frontend.md`
  - `docs/tech/changelog/modules/native.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 本条为实现同步留痕，不新增新的方案文档。

## 2026-03-17 | 2026-03-17-android-runbook-sync
- Summary: 同步 Android 联调入口、环境样例和本地联调手册留痕，记录仓库已具备更完整的安卓开发执行入口。
- Files:
  - `apps/native/README.md`
  - `docs/tech/runbooks/android-hybrid-app-local-debug.md`
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/native.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 本条主要同步执行入口与文档，不新增新的架构决策。

## 2026-03-17 | 2026-03-17-android-hybrid-app-plan-tighten
- Summary: 收紧 Android 混合 App 方案边界，明确调试入口不等同正式交付、前移 `SessionStorageAdapter`、缩小 P0 阻塞范围，并新增 Native 工程执行清单与需求索引入口。
- Files:
  - `docs/tech/architecture/android-hybrid-app-plan.md`
  - `docs/tech/architecture/android-hybrid-app-delivery-checklist.md`
  - `docs/tech/design/requirements/index.md`
  - `apps/native/README.md`
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 本次调整只收口方案与执行路径，不改变 Native 代码行为。

## 2026-03-17 | 2026-03-17-android-hybrid-app-plan
- Summary: 新增 Android 首版混合 App 架构方案文档，明确当前项目采用 `Capacitor + Android 壳 + 现有 Next.js Web + 现有 NestJS API` 的首版路径，并固化范围、分层、存储策略、环境发布方式和分阶段计划。
- Files:
  - `docs/tech/architecture/android-hybrid-app-plan.md`
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 本次为架构方案文档新增，不涉及代码实现或 `apps/native` 工程落地。

## 2026-03-17 | 2026-03-17-native-scaffold-changelog-sync
- Summary: 追加 2026-03-17 对话日志，记录 Android / Capacitor P0 原生端骨架落地与仓库脚本同步结果。
- Files:
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 本条仅同步文档留痕；对应代码改动已分别记录在 global 与 native 模块日志中。

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

## 2026-03-12 | 2026-03-12-fe-auth-login-integration
- Summary: 追加当日日志，记录前端登录联调实现（页面、模块、API 客户端与占位路由）及构建验证结果。
- Files:
  - `docs/tech/changelog/conversations/2026-03-12.md`
  - `docs/tech/changelog/modules/frontend.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 延续按日期 conversations + 按模块索引的双轨留痕方式。

## 2026-03-13 | 2026-03-13-prd-spec-refactor-full-rq
- Summary: 完成 PRD 的 Spec Entry 重构，新增 rq 映射与 AC 唯一映射，并补齐 `rq-002` 到 `rq-006` 前后端设计文档；同时对齐 `rq-001` 错误码基线与需求索引状态。
- Files:
  - `docs/product/prd/2026-03-12-prd.md`
  - `docs/tech/design/requirements/index.md`
  - `docs/tech/design/requirements/rq-001-auth-profile/2026-03-12-rq-001-auth-profile-backend-design.md`
  - `docs/tech/design/requirements/rq-001-auth-profile/2026-03-12-rq-001-auth-profile-frontend-design.md`
  - `docs/tech/design/requirements/rq-002-checkins/2026-03-13-rq-002-checkins-backend-design.md`
  - `docs/tech/design/requirements/rq-002-checkins/2026-03-13-rq-002-checkins-frontend-design.md`
  - `docs/tech/design/requirements/rq-003-ai-coach/2026-03-13-rq-003-ai-coach-backend-design.md`
  - `docs/tech/design/requirements/rq-003-ai-coach/2026-03-13-rq-003-ai-coach-frontend-design.md`
  - `docs/tech/design/requirements/rq-004-stats-trend/2026-03-13-rq-004-stats-trend-backend-design.md`
  - `docs/tech/design/requirements/rq-004-stats-trend/2026-03-13-rq-004-stats-trend-frontend-design.md`
  - `docs/tech/design/requirements/rq-005-reminders/2026-03-13-rq-005-reminders-backend-design.md`
  - `docs/tech/design/requirements/rq-005-reminders/2026-03-13-rq-005-reminders-frontend-design.md`
  - `docs/tech/design/requirements/rq-006-settings-privacy/2026-03-13-rq-006-settings-privacy-backend-design.md`
  - `docs/tech/design/requirements/rq-006-settings-privacy/2026-03-13-rq-006-settings-privacy-frontend-design.md`
  - `docs/tech/changelog/conversations/2026-03-13.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 该批次变更为文档层重构，可直接进入需求评审与任务排期。

## 2026-03-13 | 2026-03-13-api-contracts-errors-sync
- Summary: 新增 `docs/api/contracts` 与 `docs/api/errors` 文档，完成从 PRD/RQ 到 API 契约与错误码字典的同步，覆盖 21 个 `/api/v1` 接口并补齐示例请求/响应。
- Files:
  - `docs/api/contracts/2026-03-13-api-v1-contracts.md`
  - `docs/api/errors/2026-03-13-api-error-codes.md`
  - `docs/tech/changelog/conversations/2026-03-13.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 该批次为文档层契约固化，后续接口实现需与此文档保持一致并在变更时同步更新。

## 2026-03-13 | 2026-03-13-rq001-auth-profile-sync
- Summary: 追加当日日志，记录按 `docs/tech/design` 对齐 `rq-001` 的前后端实现落地，并更新需求索引代码状态。
- Files:
  - `docs/tech/design/requirements/index.md`
  - `docs/tech/changelog/conversations/2026-03-13.md`
  - `docs/tech/changelog/modules/backend.md`
  - `docs/tech/changelog/modules/frontend.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 本次是文档驱动实现同步，后续 `rq-002` 需在 draft 升级为 approved 后再进入编码。

## 2026-03-13 | 2026-03-13-prd-rq007-tabbar-spec
- Summary: PRD 增补 H5 底部 Tab 导航规范（信息架构、显隐规则、高亮归属、Safe Area），新增 `rq-007-app-shell-tabbar` 前后端设计并更新需求索引执行顺序。
- Files:
  - `docs/product/prd/2026-03-12-prd.md`
  - `docs/tech/design/requirements/index.md`
  - `docs/tech/design/requirements/rq-007-app-shell-tabbar/2026-03-13-rq-007-app-shell-tabbar-backend-design.md`
  - `docs/tech/design/requirements/rq-007-app-shell-tabbar/2026-03-13-rq-007-app-shell-tabbar-frontend-design.md`
  - `docs/tech/changelog/conversations/2026-03-13.md`
  - `docs/tech/changelog/modules/docs.md`
- Notes: 本次文档改动与前端实现保持一致，未新增后端业务 API。
