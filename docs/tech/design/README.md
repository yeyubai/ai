# 需求实现设计文档规范

owner: engineering
last_updated: 2026-03-12

## 目标
- 在 PRD 需求拆解后，先完成实现设计再编码。
- 保证后端与前端按统一契约协作，减少返工。

## 强制流程
1. 从 PRD 选择需求，分配 `rq-id`（如 `rq-001-auth-profile`）。
2. 先产出并评审后端设计文档。
3. 基于后端契约产出并评审前端设计文档。
4. 评审通过后开始编码，顺序为：后端 -> 前端。
5. 若实现偏离设计，必须回写设计文档并记录原因。

## 目录结构
- `templates/`：后端与前端设计模板
- `requirements/`：按需求编号存放设计文档
- `requirements/index.md`：需求设计进度看板

## 命名规则
- 后端设计：`YYYY-MM-DD-<rq-id>-backend-design.md`
- 前端设计：`YYYY-MM-DD-<rq-id>-frontend-design.md`
