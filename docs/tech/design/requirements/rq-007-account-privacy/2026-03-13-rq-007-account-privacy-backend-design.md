# RQ-007 Backend Design - Account & Privacy

owner: engineering
requirement_id: rq-007-account-privacy
prd_ref: docs/product/prd/2026-03-13-prd-v2.md
product_design_refs:
- docs/product/design/2026-03-13-user-journey-and-ia.md
- docs/product/design/2026-03-13-theme-and-voice.md
api_contract_ref: docs/api/contracts/2026-03-13-api-v2-contracts.md
api_errors_ref: docs/api/errors/2026-03-13-api-v2-error-codes.md
status: draft
ac_refs: AC-15, AC-16

## 1. 需求范围

- 偏好设置查询与更新
- 数据导出任务创建与状态查询
- 注销申请、查询、取消

Out of scope:
- 法务文书自动生成
- 多租户管理员后台

## 2. 接口设计

- `GET /api/v1/settings`
- `PUT /api/v1/settings`
- `POST /api/v1/account/export`
- `GET /api/v1/account/export/{taskId}`
- `POST /api/v1/account/delete-request`
- `GET /api/v1/account/delete-request`
- `DELETE /api/v1/account/delete-request`

## 3. 数据模型设计

- `user_settings`
  - 字段：`weight_unit`, `timezone`, `locale`
- `account_export_task`
  - 字段：`task_id`, `format`, `status`, `download_url`, `expires_at`
- `delete_request`
  - 字段：`status`, `requested_at`, `effective_at`, `cancelled_at`, `reason`
- 索引：
  - `idx_export_task_user_created_at`
  - `uniq_delete_request_active (user_id, active_flag)`

## 4. 业务规则

- 导出任务 10 分钟内可下载，过期后需重新申请
- 同一用户只允许存在一条有效注销申请
- 注销申请默认进入冷静期，并允许在生效前取消
- 注销状态变更必须写审计日志

## 5. 非功能要求

- 设置读写接口 p95 <= 300ms
- 导出任务创建接口 p95 <= 500ms
- 导出任务执行可异步，但状态查询必须稳定

## 6. 测试方案

- Unit：注销申请唯一约束、导出过期时间、时区更新
- Integration：发起导出 -> 查询下载链接；发起注销 -> 取消 -> 状态回写
- Contract：`status`, `effectiveAt`, `downloadUrl` 字段稳定

## 7. 开发任务拆解

- BE-7.1 补 user settings 模型与接口
- BE-7.2 实现 export task 生命周期
- BE-7.3 实现 delete request 状态机与审计
- BE-7.4 接入账户操作监控与告警

## 8. 风险与回滚

- 风险：导出与注销属于高风险动作，需要审计完整
- 处理：所有状态变更必须带 traceId 与 actor
- 回滚：注销申请流程可临时关闭，保留只读查询
