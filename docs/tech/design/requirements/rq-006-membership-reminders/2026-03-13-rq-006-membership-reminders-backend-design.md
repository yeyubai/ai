# RQ-006 Backend Design - Membership & Reminders

owner: engineering
requirement_id: rq-006-membership-reminders
prd_ref: docs/product/prd/2026-03-13-prd-v2.md
product_design_refs:
- docs/product/design/2026-03-13-user-journey-and-ia.md
- docs/product/design/2026-03-13-theme-and-voice.md
api_contract_ref: docs/api/contracts/2026-03-13-api-v2-contracts.md
api_errors_ref: docs/api/errors/2026-03-13-api-v2-error-codes.md
status: draft
ac_refs: AC-13, AC-14

## 1. 需求范围

- 会员状态与权益查询
- 体重提醒、运动提醒、复盘提醒设置
- 提醒回执查询

Out of scope:
- 支付、扣费、续费
- 渠道级营销自动化

## 2. 接口设计

- `GET /api/v1/membership/status`
- `GET /api/v1/reminders/settings`
- `PUT /api/v1/reminders/settings`
- `GET /api/v1/reminders/receipts`

接口约束：
- `dailyMissionReminderTimes` 在 MVP 中承接体重提醒和运动提醒两个时间点
- `reviewReminderTime` 单独承接晚间复盘提醒
- `strongReminderEnabled=true` 需要会员权益，否则返回 `SUBSCRIPTION_REQUIRED`

## 3. 数据来源与模型

- MVP 使用 `JourneyStateService.memberships`、`JourneyStateService.reminders`
- `membership.status` 作为前后端唯一事实来源
- `reminder.receipts` 由服务端按当前设置生成回执视图，不引入复杂调度中心

## 4. 业务规则

- 免费版默认拥有基础记录、基础趋势、基础复盘摘要
- 会员增强只解锁深度复盘、深度周报和强提醒，不阻断核心动作
- 提醒时间不得落入静默时段，冲突时返回 `REMINDER_WINDOW_CONFLICT`
- 会员价值触点只能出现在完成核心动作后、查看周报后、配置高级提醒时
- 首页首个体重 / 运动动作前不得强插会员拦截

## 5. 非功能要求

- 会员状态接口 p95 <= 300ms
- 提醒设置写接口 p95 <= 400ms
- 提醒配置与冲突校验必须可追踪

## 6. 测试方案

- Unit：静默时段冲突、权益判断、触点白名单
- Integration：保存提醒 -> 回执读取；开启强提醒 -> 权益校验
- Contract：`entitlements`, `upgradePrompts`, `dailyMissionReminderTimes`, `reviewReminderTime` 稳定

## 7. 开发任务拆解

- BE-6.1 固化 membership / reminder DTO
- BE-6.2 接入强提醒权益判断
- BE-6.3 实现提醒冲突校验与回执查询
- BE-6.4 补充会员触点与提醒日志

## 8. 风险与回滚

- 风险：会员口径不一致会造成前端提示和后端权限冲突
- 处理：所有权益都从 `membership.status` 派生
- 回滚：高级提醒和升级提示可单独关闭，不影响核心流程
