# 需求设计进度

owner: engineering
status: active
last_updated: 2026-03-17
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
| rq-008-weight-diary-home-quick-record | 首页体重日记、快捷记录弹层、原地回显 | draft | draft | draft | in_progress | 2026-03-15 补充需求 |
| rq-009-diary-rich-text-and-report-polish | 日记富文本、体重报告区间轴、记录卡展示修正 | draft | draft | draft | in_progress | 2026-03-15 补充需求 |

## Native 工程轨道

| Track | Scope | Status | Primary Doc | Execution Checklist | Notes |
| --- | --- | --- | --- | --- | --- |
| native-android-hybrid-app | Android 容器、会话抽象、平台桥、发布边界 | in_progress | `docs/tech/architecture/android-hybrid-app-plan.md` | `docs/tech/architecture/android-hybrid-app-delivery-checklist.md` | 非产品 `rq`，用于承接 Native 工程落地；P0 阻塞项只覆盖首页 / 记录 / 进度 / 我的 / 登录恢复 |

## 固定顺序

- 设计评审顺序：backend design -> frontend design
- 开发顺序：`rq-001 -> rq-002 -> rq-003 -> rq-004 -> rq-005 -> rq-006 -> rq-007`
- 首批进入评审：`rq-001-entry-onboarding`、`rq-002-home-daily-loop`
- Native 工程轨道顺序：`P0 主线联调 -> P1 会话抽象与交付边界 -> P2 平台桥与壳能力 -> P3 安全存储与发布准备`

## 说明

- 当前 active 方案以“体重 + 运动消耗”作为唯一主线。
- 饮食、睡眠 requirement 不单独立项，留在 `rq-003-record-center` 中作为辅助记录兼容能力。
- 首页、进度页、复盘页均不得再以饮食/睡眠作为主链路优先级。
- `rq-008-weight-diary-home-quick-record` 作为当前体重日记首页重构的补充 requirement，优先解决首页快捷记录闭环与错误可感知性。
- `rq-009-diary-rich-text-and-report-polish` 作为当前视觉与信息架构纠偏的补充 requirement，优先解决日记页回归设计图、区间轴连续化和列表卡可读性。
- Native 工程轨道是项目级交付轨道，不替代现有产品 `rq`；业务页面仍以 `apps/web` 复用为前提。
- Native P0 只以首页、记录、进度、我的与登录恢复为阻塞验收项；AI 私教 / 聊天不作为首轮阻塞项。
- Native 轨道继续推进前，应先完成 `SessionStorageAdapter`，避免会话逻辑继续扩散 `localStorage` 直连。
