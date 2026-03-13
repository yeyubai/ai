# RQ-006 Frontend Design - 设置与隐私

owner: frontend
requirement_id: rq-006-settings-privacy
prd_ref: docs/product/prd/2026-03-12-prd.md
backend_design_ref: docs/tech/design/requirements/rq-006-settings-privacy/2026-03-13-rq-006-settings-privacy-backend-design.md
status: draft

## 1. 需求范围

- 提供设置页（单位、时区、语言）读写。
- 提供数据导出申请与状态查看。
- 提供账号注销申请、状态展示与撤销。

Out of scope:
- 法务文案管理后台。
- 导出文件内容在线预览。

## 2. 页面与路由设计

- `/settings/preferences`
- `/settings/privacy`

组件划分：
- 页面级：偏好设置页、隐私页
- 模块级：`features/settings`, `features/privacy`
- 组件级：设置表单、导出任务卡、注销确认弹窗

## 3. 数据流设计

- 页面顶层请求：
- 偏好页：`GET /api/v1/settings`，保存时 `PUT /api/v1/settings`
- 隐私页：`POST /api/v1/account/export` + `GET /api/v1/account/export/{taskId}`
- 注销：`POST/GET/DELETE /api/v1/account/delete-request`

- store 归属：
- 设置持久状态放 `settings store`。
- 注销弹窗状态与确认输入放本地 state。

## 4. 接口契约映射

- `GET /api/v1/settings`
- `PUT /api/v1/settings`
- `POST /api/v1/account/export`
- `GET /api/v1/account/export/{taskId}`
- `POST /api/v1/account/delete-request`
- `GET /api/v1/account/delete-request`
- `DELETE /api/v1/account/delete-request`

DTO -> UI Model：
- `weightUnit` -> 单位选择（kg/lb）
- `export.status` -> 导出任务状态徽标
- `deleteRequest.effectiveAt` -> 注销倒计时

错误态映射：
- `400 INVALID_PARAMS` -> 表单错误提示
- `409 DUPLICATE_DELETE_REQUEST` -> 展示“已存在注销申请”
- `429 EXPORT_RATE_LIMIT` -> 展示导出频率限制提示
- `401 AUTH_EXPIRED` -> 跳转登录

## 5. 交互与状态

- loading：设置页和隐私页均使用 skeleton。
- success：设置保存、导出申请、注销操作均有 toast。
- error：失败时保留当前输入并提供重试。

交互规则：
- 注销申请前必须输入确认文案（`confirmText`）。
- 存在有效注销申请时显示倒计时和“撤销申请”按钮。
- 导出任务成功后显示下载入口（若返回 `downloadUrl`）。

## 6. 埋点设计

- `settings_preferences_view`
- `settings_preferences_save`
- `privacy_export_create`
- `privacy_delete_request_create`
- `privacy_delete_request_cancel`

公共属性：`user_id`, `client_type`, `timezone`, `weight_unit`

## 7. 测试方案

- Component tests:
- 偏好设置表单校验
- 注销确认弹窗校验

- Page flow tests:
- 设置读取 -> 修改 -> 保存
- 导出创建 -> 状态查询 -> 下载入口展示
- 注销申请 -> 状态展示 -> 撤销

- Contract mock tests:
- 导出/注销状态字段映射
- 频控与冲突错误映射

## 8. 开发任务拆解

- FE-6.1 设置与隐私页面搭建
- FE-6.2 设置读写与状态管理
- FE-6.3 导出任务交互与状态轮询
- FE-6.4 注销申请与撤销交互
- FE-6.5 隐私埋点与回归测试
