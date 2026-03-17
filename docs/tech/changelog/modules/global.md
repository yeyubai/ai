# Module Changelog: global

## 2026-03-17 | 2026-03-17-native-shell-root-scripts
- Summary: 为原生端新增根目录安装与 Android 容器脚本，补充 Android 相关忽略项，并在根 README 中加入混合 App 初始化说明。
- Files:
  - `package.json`
  - `.gitignore`
  - `README.md`
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/global.md`
- Notes: 这批改动让仓库级脚本能够调度 `apps/native`，但不改变现有 Web/Backend 启动流程。

## 2026-03-12 | 2026-03-12-root-deps-strategy-optimize
- Summary: 优化根目录依赖策略，移除 workspace 安装模式，改为根脚本调度 + 子项目本地安装。
- Files:
  - `package.json`
  - `.gitignore`
  - `README.md`
  - `docs/tech/changelog/conversations/2026-03-12.md`
- Notes: 根目录不再作为前后端依赖安装目录，减少目录职责混乱。

## 2026-03-12 | date-log-policy
- Summary: 将全局变更留痕口径统一为“按日期文件记录”，当天所有改动追加到同一日期日志。
- Files:
  - `.codex/rules/global.md`
  - `docs/tech/changelog/conversations/2026-03-12.md`
- Notes: conversations 命名统一为 `YYYY-MM-DD.md`，不再按线程拆分。

## 2026-03-12 | 2026-03-12-prd-design-first-workflow
- Summary: 增加需求交付强制流程，要求每个 PRD 需求先完成后端/前端设计评审，再按“后端 -> 前端”顺序编码。
- Files:
  - `.codex/rules/global.md`
  - `docs/tech/changelog/conversations/2026-03-12.md`
- Notes: 前端编码必须在后端契约定稿后开始，作为全局硬约束执行。

## 2026-03-12 | 2026-03-12-rerun-init-after-node-upgrade
- Summary: Node 升级后重新执行初始化验证，修复根级 `package.json` BOM 解析问题。
- Files:
  - `package.json`
  - `docs/tech/changelog/conversations/2026-03-12.md`
- Notes: 依赖安装与构建流程在 Node 22 环境可通过。

## 2026-03-12 | 2026-03-12-init-frontend-backend-structure
- Summary: 初始化仓库级 workspace 管理文件与统一开发脚本。
- Files:
  - `package.json`
  - `.gitignore`
  - `.nvmrc`
- Notes: 根目录开始统一管理前后端依赖、构建、lint、typecheck、test 入口。

## 2026-03-12 | 2026-03-12-vibe-coding-rules
- Summary: 增加代码评审清单强制项，补充“每次对话必须记录 changelog”全局要求。
- Files:
  - `.codex/rules/global.md`
  - `.codex/project-rules.md`
  - `.codex/rules/README.md`
- Notes: 将对话级变更记录纳入全局流程约束。
