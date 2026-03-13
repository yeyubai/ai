# RQ-005 Backend Design - 提醒系统

owner: backend
requirement_id: rq-005-reminders
prd_ref: docs/product/prd/2026-03-12-prd.md
status: draft

## 1. 需求范围

- 支持提醒配置读写（未打卡、喝水、复盘）。
- 支持静默时段、频控和降频策略。
- 提供提醒发送回执查询接口。

Out of scope:
- 多渠道提醒（短信/邮件）。
- 智能推荐提醒时间。

## 2. 接口设计

- `GET /api/v1/reminders/settings`
- `PUT /api/v1/reminders/settings`
- `GET /api/v1/reminders/receipts`

Request DTO：
- settings update: `{ checkinReminderTimes[], hydrationEnabled, hydrationTimes[], reviewReminderTime, quietHours, timezone }`
- receipts query: `{ dateFrom, dateTo, page, pageSize }`

Response DTO（统一结构）：
- response: `{ code, message, data, traceId }`
- settings data: `{ checkinReminderTimes[], hydrationEnabled, hydrationTimes[], reviewReminderTime, quietHours, timezone, updatedAt }`
- receipts data: `{ list: [{ reminderType, scheduledAt, sentAt, status, openAt? }], total }`

Error codes:
- `400 INVALID_PARAMS`
- `401 AUTH_EXPIRED`
- `409 DUPLICATE_REMINDER_RULE`
- `429 REMINDER_RATE_LIMIT`
- `500 INTERNAL_ERROR`

## 3. 数据模型设计

涉及表：
- `reminder_settings`
- `reminder_jobs`
- `reminder_receipts`

索引与约束：
- `reminder_settings(user_id)` unique
- `reminder_jobs(user_id, scheduled_at)`
- `reminder_receipts(user_id, sent_at desc)`

迁移策略与回滚：
- 前向：新增提醒配置与发送回执表。
- 回滚：删除提醒相关新表与索引。

## 4. 业务规则

校验规则：
- 默认静默时段：22:30-08:00。
- 同类提醒 24 小时内最多发送 2 次。
- 连续 3 天未打开提醒，降频到 1 次/天。

幂等与并发：
- `PUT /reminders/settings` 使用版本号乐观锁防覆盖。
- 同一提醒任务生成过程使用唯一 job key 去重。

频控/限流：
- 设置修改接口 30 次/小时。
- 回执查询接口 120 次/小时。

## 5. 非功能要求

- 提醒发送成功率 >= 98%。
- 提醒配置修改后 1 分钟内生效。
- 任务调度日志可追踪 `traceId` 与发送状态。

## 6. 测试方案

- Unit:
- 静默时段判断
- 频控与降频规则

- Integration:
- 设置保存 -> 调度任务生成 -> 回执查询
- 配置更新即时生效验证

- Contract:
- 设置 DTO 契约
- 回执分页契约与错误码

## 7. 开发任务拆解

- BE-5.1 reminder settings API
- BE-5.2 scheduler 任务生成与去重
- BE-5.3 发送回执落库与查询
- BE-5.4 频控/降频规则实现
- BE-5.5 提醒链路测试与监控接入

## 8. 风险与回滚

- 风险：推送通道波动导致到达率下降。
- 风险缓解：失败重试 + 告警阈值。
- 回滚：临时关闭非关键提醒（喝水），保留未打卡和复盘提醒。
