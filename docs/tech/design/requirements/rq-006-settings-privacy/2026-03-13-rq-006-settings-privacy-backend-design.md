# RQ-006 Backend Design - 设置与隐私

owner: backend
requirement_id: rq-006-settings-privacy
prd_ref: docs/product/prd/2026-03-12-prd.md
status: draft

## 1. 需求范围

- 提供用户设置（单位、时区等）读取与更新。
- 支持数据导出任务创建与查询。
- 支持账号注销申请、状态查询与冷静期内撤销。

Out of scope:
- 法务文本动态配置系统。
- 跨租户数据导出。

## 2. 接口设计

- `GET /api/v1/settings`
- `PUT /api/v1/settings`
- `POST /api/v1/account/export`
- `GET /api/v1/account/export/{taskId}`
- `POST /api/v1/account/delete-request`
- `GET /api/v1/account/delete-request`
- `DELETE /api/v1/account/delete-request`

Request DTO：
- settings update: `{ weightUnit, timezone, locale }`
- export create: `{ format }`（MVP 固定 `json`）
- delete request create: `{ reason?, confirmText }`

Response DTO（统一结构）：
- response: `{ code, message, data, traceId }`
- export data: `{ taskId, status, downloadUrl?, expiresAt? }`
- delete request data: `{ status, requestedAt, effectiveAt, canCancel }`

Error codes:
- `400 INVALID_PARAMS`
- `401 AUTH_EXPIRED`
- `409 DUPLICATE_DELETE_REQUEST`
- `429 EXPORT_RATE_LIMIT`
- `500 INTERNAL_ERROR`

## 3. 数据模型设计

涉及表：
- `user_settings`
- `export_tasks`
- `delete_requests`

索引与约束：
- `user_settings(user_id)` unique
- `export_tasks(user_id, created_at desc)`
- `delete_requests(user_id, status)`

迁移策略与回滚：
- 前向：新增设置、导出任务、注销申请表。
- 回滚：按依赖逆序删除新增表。

## 4. 业务规则

校验规则：
- 导出格式 MVP 仅支持 `json`。
- 注销申请后进入 7 天冷静期，冷静期内可撤销。
- 存在进行中的注销申请时不允许重复创建。

幂等与并发：
- 导出任务创建使用 `(user_id, date)` 去重，防止短时间重复创建。
- 注销申请创建使用数据库唯一约束 + 业务校验双重保障。

频控/限流：
- 数据导出创建：5 次/天。
- 注销申请操作：10 次/天。

## 5. 非功能要求

- 设置读写接口 p95 <= 300ms。
- 导出任务创建 p95 <= 500ms，导出文件 10 分钟内可下载。
- 注销状态查询可审计，包含 traceId 与操作者信息。

## 6. 测试方案

- Unit:
- 单位与时区校验
- 冷静期计算与撤销规则

- Integration:
- 设置更新链路
- 导出任务创建与状态查询
- 注销申请创建/查询/撤销

- Contract:
- settings/export/delete DTO 契约
- 错误码与统一响应结构

## 7. 开发任务拆解

- BE-6.1 settings API 与存储
- BE-6.2 export task API 与异步任务编排
- BE-6.3 delete request API 与冷静期逻辑
- BE-6.4 权限审计与错误码映射
- BE-6.5 设置隐私链路测试

## 8. 风险与回滚

- 风险：导出任务堆积导致 SLA 超时。
- 风险缓解：异步队列限流与任务超时告警。
- 回滚：临时关闭导出创建入口，仅保留查询已完成任务。
