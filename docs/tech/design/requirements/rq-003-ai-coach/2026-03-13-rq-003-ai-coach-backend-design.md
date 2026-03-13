# RQ-003 Backend Design - AI 计划与复盘

owner: backend
requirement_id: rq-003-ai-coach
prd_ref: docs/product/prd/2026-03-12-prd.md
status: approved

## 1. 需求范围

- 生成每日计划（热量、三餐、运动、关键动作）。
- 生成晚间复盘（完成度、亮点、不足、明日重点）。
- 提供模型失败时兜底策略与风险文案防护。

Out of scope:
- 开放式长对话助手。
- 医疗建议或诊断输出。

## 2. 接口设计

- `POST /api/v1/ai/plan`
- `POST /api/v1/ai/review`

Request DTO：
- plan request: `{ date, forceRefresh?, timezone }`
- review request: `{ date, timezone }`

Response DTO（统一结构）：
- response: `{ code, message, data, traceId }`
- plan data: `{ planId, date, calorieTargetKcal, meals[], activity, topActions[], riskFlags[], summaryText, source }`
- review data: `{ reviewId, date, score, highlights[], gaps[], tomorrowFocus[], riskFlags[], summaryText, source }`

Error codes:
- `400 INVALID_PARAMS`
- `401 AUTH_EXPIRED`
- `429 AI_RATE_LIMIT`
- `500 INTERNAL_ERROR`

## 3. 数据模型设计

涉及表：
- `ai_plans`
- `ai_reviews`

关键字段：
- `user_id`, `plan_date/review_date`, `payload_json`, `source(model|fallback)`, `created_at`

索引与约束：
- `idx_ai_plans_user_date (user_id, plan_date desc)`
- `idx_ai_reviews_user_date (user_id, review_date desc)`
- 单用户单日计划仅保留最新有效版本（逻辑唯一）

迁移策略与回滚：
- 前向：新增 `ai_plans`, `ai_reviews`。
- 回滚：删除索引和新增表。

## 4. 业务规则

校验规则：
- 当日自动计划最多 1 次，手动刷新最多 2 次。
- 数据不足（连续记录 < 3 天）时必须返回兜底模板。
- 输出必须通过 schema 校验后才能落库。

幂等与并发：
- `POST /ai/plan` 使用 `(user_id, date, refresh_seq)` 控制并发写入。
- 并发请求仅首个执行模型调用，其余复用最新结果。

频控/限流：
- 单用户计划接口 3 次/天。
- 单用户复盘接口 2 次/天。

## 5. 非功能要求

- `POST /ai/plan` p95 <= 4s。
- `POST /ai/review` p95 <= 4s。
- 结构化 schema 通过率 >= 99%。
- 全链路记录模型耗时、token 消耗、traceId。

## 6. 测试方案

- Unit:
- schema 校验器
- 兜底策略分支
- 风险文案拦截规则

- Integration:
- 计划/复盘全链路（含模型超时与重试）
- 限流与刷新次数控制

- Contract:
- plan/review 输出字段契约
- 错误码与统一响应结构

## 7. 开发任务拆解

- BE-3.1 AI orchestration service（输入聚合 + 调用 + 校验）
- BE-3.2 兜底模板与越界文案替换
- BE-3.3 计划/复盘落库与版本管理
- BE-3.4 限流与刷新次数控制
- BE-3.5 合同测试与回归

## 8. 风险与回滚

- 风险：外部模型超时导致生成失败率上升。
- 风险缓解：模型超时走最近可用计划 + 兜底模板。
- 回滚：关闭实时生成，切换到规则模板模式。
