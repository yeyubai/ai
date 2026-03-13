# RQ-006 Frontend Design - Membership & Reminders

owner: engineering
requirement_id: rq-006-membership-reminders
prd_ref: docs/product/prd/2026-03-13-prd-v2.md
product_design_refs:
- docs/product/design/2026-03-13-user-journey-and-ia.md
- docs/product/design/2026-03-13-theme-and-voice.md
backend_design_ref: docs/tech/design/requirements/rq-006-membership-reminders/2026-03-13-rq-006-membership-reminders-backend-design.md
api_contract_ref: docs/api/contracts/2026-03-13-api-v2-contracts.md
status: draft
ac_refs: AC-13, AC-14

## 1. 需求范围

- `/settings/preferences` 中的会员与提醒区块
- 首页 / 进度页中的升级触点
- 提醒回执查看

Out of scope:
- 支付收银台
- 全屏弹窗式营销流程

## 2. 页面与路由设计

- `/settings/preferences`
- 首页和进度页只展示局部升级触点，不额外增加主路由

页面职责：
- 会员区域说明当前权益，不重讲主流程
- 提醒区域围绕体重、运动、复盘三个提醒点配置
- 会员文案只围绕“解释更清楚、提醒更稳、恢复更快”
- 回执区域只负责确认“是否已发出”

## 3. 数据流设计

- 读取 `GET /api/v1/membership/status`
- 读取并提交 `GET/PUT /api/v1/reminders/settings`
- 按需读取 `GET /api/v1/reminders/receipts`
- 共享类型：`EntitlementState`, `UpgradeTouchpoint`, `ReminderSettings`

## 4. 接口契约映射

- `GET /api/v1/membership/status`
- `GET /api/v1/reminders/settings`
- `PUT /api/v1/reminders/settings`
- `GET /api/v1/reminders/receipts`

DTO -> UI Model：
- `entitlements` -> 解释更清楚 / 提醒更稳 / 恢复更快 三类权益状态
- `upgradePrompts[]` -> 升级触点文案
- `dailyMissionReminderTimes` -> 体重 / 运动提醒时间输入
- `reviewReminderTime` -> 复盘提醒输入

错误态映射：
- `SUBSCRIPTION_REQUIRED` -> 展示会员价值说明，不清空已编辑表单
- `REMINDER_WINDOW_CONFLICT` -> 高亮冲突时间字段
- `TRIAL_LIMIT_REACHED` -> 展示权益耗尽提示与升级入口

## 5. 交互与状态

- loading：会员卡、提醒表单骨架
- success：保存成功消息 + 更新时间
- error：保留已编辑值，避免用户重填

交互规则：
- 会员触点必须跟价值点绑定，不单独拦截首页首屏
- 提醒文案应使用“体重提醒 / 运动提醒 / 复盘提醒”，不使用抽象任务名
- 禁止使用“更多功能”“解锁全部能力”作为主卖点，改为强调坚持更稳
- 我的页不解释核心主线，只承接低频设置

## 6. 埋点设计

- `membership_status_view`
- `membership_upgrade_click`
- `upgrade_touchpoint_view`
- `reminder_settings_save`
- `reminder_receipt_view`

公共属性：`touchpoint`, `membership_plan`, `from_path`, `strong_reminder_enabled`

## 7. 测试方案

- Component tests：权益卡、提醒冲突提示、升级触点卡、会员价值文案
- Page flow tests：修改提醒 -> 保存成功；开启强提醒 -> 权益提示；免费用户不出现阻断式触点
- Contract mock tests：`entitlements`, `upgradePrompts`, `dailyMissionReminderTimes`, `reviewReminderTime` 映射

## 8. 开发任务拆解

- FE-6.1 对齐我的页中的会员与提醒分区
- FE-6.2 明确体重 / 运动 / 复盘提醒文案，并收敛会员价值表达
- FE-6.3 接入升级触点与回执查看
- FE-6.4 补提醒和会员埋点测试
