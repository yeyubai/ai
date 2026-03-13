# 需求设计进度

owner: engineering
status: active
last_updated: 2026-03-13
prd_ref: docs/product/prd/2026-03-13-prd-v2.md
product_design_refs:
- docs/product/design/2026-03-13-user-journey-and-ia.md
- docs/product/design/2026-03-13-theme-and-voice.md
api_refs:
- docs/api/contracts/2026-03-13-api-v2-contracts.md
- docs/api/errors/2026-03-13-api-v2-error-codes.md

## 当前有效 requirement 包（v3）

| Requirement | Domain | PRD Scope | Backend Design | Frontend Design | Code Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| rq-001-entry-onboarding | 登录、目标体重、运动基线、基础权益初始化 | approved | draft | draft | in_progress | 首批评审 |
| rq-002-home-daily-loop | 首页双核心闭环、今日下一步、follow-up | approved | draft | draft | in_progress | 首批评审 |
| rq-003-record-center | 体重/运动主记录、饮食/睡眠辅助化 | approved | draft | draft | in_progress | 第二批评审 |
| rq-004-review-adjustment | 晚间 AI 调整、次日预览、恢复模式 | approved | draft | draft | in_progress | 第二批评审 |
| rq-005-progress-insight | 体重趋势、运动执行率、周消耗、回顾 | approved | draft | draft | in_progress | 第二批评审 |
| rq-006-membership-reminders | 体重提醒、运动提醒、复盘提醒、升级触点 | approved | draft | draft | in_progress | 第二批评审 |
| rq-007-account-privacy | 我的、设置、导出、注销 | approved | draft | draft | in_progress | 第三批评审 |

## 固定顺序

- 设计评审顺序：backend design -> frontend design
- 开发顺序：`rq-001 -> rq-002 -> rq-003 -> rq-004 -> rq-005 -> rq-006 -> rq-007`
- 首批进入评审：`rq-001-entry-onboarding`、`rq-002-home-daily-loop`

## 说明

- 当前 active 方案以“体重 + 运动消耗”作为唯一主线。
- 饮食、睡眠 requirement 不单独立项，留在 `rq-003-record-center` 中作为辅助记录兼容能力。
- 首页、进度页、复盘页均不得再以饮食/睡眠作为主链路优先级。
