# Changelog 维护规范

owner: engineering
last_updated: 2026-03-12

## 目标
- 记录每次对话的实际改动
- 按模块沉淀变更历史，便于追溯和回滚

## 目录结构
- `conversations/`：按日期维度记录变更（每天一个文件，持续追加）
- `modules/`：按模块累计变更日志（持续追加）

## 对话日志命名
- `conversations/YYYY-MM-DD.md`
- 当天所有对话改动统一追加到当天文件

## 模块日志文件
- `modules/global.md`
- `modules/frontend.md`
- `modules/backend.md`
- `modules/ai.md`
- `modules/native.md`
- `modules/infra.md`
- `modules/docs.md`
- `modules/testing.md`
- `modules/review.md`

## 每次对话的记录步骤
1. 在 `conversations/` 找到或创建当天日期文件（`YYYY-MM-DD.md`）。
2. 在当天日期文件中追加一条记录，写明本次目标、改动文件、影响说明。
3. 按改动涉及模块，追加写入 `modules/<module>.md`。

## 路径到模块映射
- `.codex/rules/global.md` -> `modules/global.md`
- `.codex/rules/frontend/*` -> `modules/frontend.md`
- `.codex/rules/backend/*` -> `modules/backend.md`
- `.codex/rules/ai/*` -> `modules/ai.md`
- `.codex/rules/native/*` -> `modules/native.md`
- `.codex/rules/infra/*` -> `modules/infra.md`
- `.codex/rules/docs/*` 与 `docs/**` -> `modules/docs.md`
- `.codex/rules/testing/*` -> `modules/testing.md`
- `.codex/rules/review/*` -> `modules/review.md`

## 日志模板
```md
## YYYY-MM-DD HH:mm | <topic>
- Summary: 本次改动摘要
- Files:
  - path/to/file-a
  - path/to/file-b
- Notes: 风险、回滚点、后续动作
```
