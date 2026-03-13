# RQ-004 Backend Design - 趋势与进度

owner: backend
requirement_id: rq-004-stats-trend
prd_ref: docs/product/prd/2026-03-12-prd.md
status: draft

## 1. 需求范围

- 提供 7 日/30 日趋势数据。
- 提供打卡完成率、计划采纳率、目标进度。
- 支持目标修改后进度重算。

Out of scope:
- 多维自定义图表分析。
- 导出趋势报表文件。

## 2. 接口设计

- `GET /api/v1/stats/weekly`
- `GET /api/v1/stats/monthly`

Request DTO（query）：
- weekly: `{ date?, timezone }`
- monthly: `{ date?, timezone }`

Response DTO（统一结构）：
- response: `{ code, message, data, traceId }`
- weekly data: `{ trendPoints[], checkinCompletionRate, planAdoptionRate, targetProgress }`
- monthly data: `{ trendPoints[], checkinCompletionRate, planAdoptionRate, targetProgress }`

Error codes:
- `400 INVALID_PARAMS`
- `401 AUTH_EXPIRED`
- `429 STATS_RATE_LIMIT`
- `500 INTERNAL_ERROR`

## 3. 数据模型设计

依赖表：
- `checkins_weight`
- `checkins_meal`
- `checkins_activity`
- `checkins_sleep`
- `ai_plans`
- `user_profiles`

索引建议：
- `checkins_weight(user_id, checkin_date)`
- `ai_plans(user_id, plan_date)`

计算规则：
- 体重趋势采用 3 日滑动平均。
- 缺失日期按空点返回，不做前向填充。

迁移策略与回滚：
- 本需求不新增业务表，优先使用查询聚合。
- 若新增缓存表，需单独提交迁移与回滚文档。

## 4. 业务规则

校验规则：
- `date` 默认取用户时区当天。
- 仅返回当前用户数据。

幂等与并发：
- 查询接口天然幂等。
- 同用户高频请求可命中短时缓存（30s）。

频控/限流：
- 单用户统计接口 120 次/小时。

## 5. 非功能要求

- 趋势接口 p95 <= 800ms。
- 目标修改后 1 分钟内统计结果更新。
- 关键计算链路记录 traceId 与耗时日志。

## 6. 测试方案

- Unit:
- 3 日滑动平均计算
- 缺失点处理
- 目标进度计算

- Integration:
- 周/月统计接口聚合正确性
- 目标更新后重算时效验证

- Contract:
- 响应字段完整性
- 错误码和限流行为

## 7. 开发任务拆解

- BE-4.1 统计聚合服务实现
- BE-4.2 趋势/进度计算纯函数
- BE-4.3 短时缓存与限流策略
- BE-4.4 周月接口与错误码映射
- BE-4.5 统计测试与回归

## 8. 风险与回滚

- 风险：历史数据缺失导致趋势图异常断裂。
- 风险缓解：空点显式返回并在前端展示“无数据”。
- 回滚：关闭滑动平均逻辑，切回原始点输出。
