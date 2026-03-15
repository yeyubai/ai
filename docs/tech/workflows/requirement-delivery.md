# Requirement Delivery Workflow

owner: engineering
status: active
last_updated: 2026-03-15

## Goal

在每次完成一个需求后，用统一命令完成：
- 只收口本次需求相关文件
- 运行仓库级检查
- 生成 commit
- 提供合并到 `master` 的安全路径

## Commands

### 0. 一条命令完成

只想记一个命令时，直接用：

```bash
npm run requirement:ship -- --message "rq-009: diary api" --paths apps/web/features/diary,apps/web/app/diary,backend/src/modules/diary,backend/prisma/schema.prisma,backend/prisma/migrations/20260315_add_diary_entries,docs/tech/design/requirements/rq-009-diary-rich-text-and-report-polish
```

这会：
- 先执行 `requirement:finish`
- 再执行 `requirement:merge-master` 的 dry-run

真正一键提交并合并到 `master`：

```bash
npm run requirement:ship -- --message "rq-009: diary api" --paths apps/web/features/diary,apps/web/app/diary,backend/src/modules/diary,backend/prisma/schema.prisma,backend/prisma/migrations/20260315_add_diary_entries,docs/tech/design/requirements/rq-009-diary-rich-text-and-report-polish --execute
```

### 1. 收口需求并提交

```bash
npm run requirement:finish -- --message "rq-009: diary api" --paths apps/web/features/diary,apps/web/app/diary,backend/src/modules/diary,backend/prisma/schema.prisma,backend/prisma/migrations/20260315_add_diary_entries,docs/tech/design/requirements/rq-009-diary-rich-text-and-report-polish
```

默认行为：
- 检查当前不在 `master/main`
- 运行 `npm run typecheck`
- 运行 `npm run test`
- 只 `git add` 传入的 `--paths`
- 自动 `git commit -m`

可选参数：
- `--skip-checks`

### 2. 合并到 master

先 dry-run：

```bash
npm run requirement:merge-master -- --source codex/rq-009
```

确认后执行：

```bash
npm run requirement:merge-master -- --source codex/rq-009 --execute
```

默认策略：
- 工作区必须干净
- 切换到 `master`
- `git pull --ff-only`
- `git merge --no-ff <source>`

## Recommended Branching

- 每个需求一个分支
- 分支命名建议：`codex/rq-xxx-short-name`
- 一个需求只收口自己的路径，不混提 unrelated changes

## Safety Notes

- `requirement:finish` 不会自动 `git add -A`
- `requirement:merge-master` 默认不执行真实 merge，必须显式加 `--execute`
- 如果仓库里同时有多个需求并行开发，请先分支隔离再使用这套流程
