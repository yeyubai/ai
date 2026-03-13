# RQ-002 Backend Design - 打卡与补录

owner: backend
requirement_id: rq-002-checkins
prd_ref: docs/product/prd/2026-03-12-prd.md
status: approved

## 1. 需求范围

- 支持体重、饮食、运动、睡眠四类打卡。
- 支持近 7 天补录，并显式记录 `is_backfill`。
- 为趋势计算提供标准化数据来源。

Out of scope:
- 历史记录删除与撤销。
- 智能硬件自动同步。

## 2. 接口设计

- `POST /api/v1/checkins/weight`
- `POST /api/v1/checkins/meal`
- `POST /api/v1/checkins/activity`
- `POST /api/v1/checkins/sleep`

Request DTO（核心字段）：
- weight: `{ checkinDate, measuredAt, weightKg, source, isBackfill }`
- meal: `{ checkinDate, mealType, description, estimatedKcal?, imageUrl?, isBackfill }`
- activity: `{ checkinDate, activityType, durationMin, steps?, estimatedKcal?, isBackfill }`
- sleep: `{ checkinDate, sleepAt, wakeAt, durationMin, isBackfill }`

Response DTO（统一结构）：
- response: `{ code, message, data, traceId }`
- data: `{ checkinId, checkinType, checkinDate, isBackfill, createdAt }`

Error codes:
- `400 INVALID_PARAMS`
- `401 AUTH_EXPIRED`
- `409 DUPLICATE_CHECKIN`
- `409 CHECKIN_LIMIT_REACHED`
- `429 CHECKIN_RATE_LIMIT`
- `500 INTERNAL_ERROR`

## 3. 数据模型设计

涉及表：
- `checkins_weight`
- `checkins_meal`
- `checkins_activity`
- `checkins_sleep`

关键字段：
- 公共：`id`, `user_id`, `checkin_date`, `is_backfill`, `created_at`
- 各类型扩展字段：体重值、餐次与热量、运动类型与时长、睡眠时间段

索引与约束：
- `idx_<table>_user_date (user_id, checkin_date desc)`
- `idx_weight_user_measured_at (user_id, measured_at desc)`
- `weightKg` 范围校验：`30-250`

迁移策略与回滚：
- 前向：新增 4 张打卡表 + 索引。
- 回滚：按依赖逆序删除索引与新增表。

## 4. 业务规则

校验规则：
- 补录窗口：`checkinDate >= today-7d`
- 同日体重最多 3 条。
- 睡眠 `wakeAt` 必须晚于 `sleepAt`。

幂等与并发：
- 客户端提交 `idempotencyKey`（header）用于重复请求去重。
- 同用户同类型同秒级时间戳重复提交返回 `409 DUPLICATE_CHECKIN`。

频控/限流：
- 单用户单类型提交频率：60 次/小时上限。
- 超限返回 `429 CHECKIN_RATE_LIMIT`。

## 5. 非功能要求

- 四类打卡接口 p95 <= 400ms（图片上传链路除外）。
- 打卡写入成功率 >= 99.5%。
- 打卡审计日志记录 `user_id`, `checkin_type`, `traceId`。

## 6. 测试方案

- Unit:
- 字段边界校验（体重、时长、时间顺序）
- 同日 3 条体重上限校验

- Integration:
- 四类打卡写入与补录流程
- 重复提交与幂等行为

- Contract:
- 统一响应结构 `{ code, message, data, traceId }`
- 错误码契约映射

## 7. 开发任务拆解

- BE-2.1 新增四类 Checkin DTO 与验证规则
- BE-2.2 Checkin Service + Repository 实现
- BE-2.3 幂等键与重复提交检测
- BE-2.4 错误码映射与统一异常处理
- BE-2.5 合同测试与集成测试

## 8. 风险与回滚

- 风险：图片上传失败导致饮食打卡失败率升高。
- 风险缓解：允许图片失败后仅文本提交。
- 回滚：关闭餐图必填策略并回退到纯文本打卡流程。
