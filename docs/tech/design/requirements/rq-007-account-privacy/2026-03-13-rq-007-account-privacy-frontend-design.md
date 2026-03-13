# RQ-007 Frontend Design - Account & Privacy

owner: engineering
requirement_id: rq-007-account-privacy
prd_ref: docs/product/prd/2026-03-13-prd-v2.md
product_design_refs:
- docs/product/design/2026-03-13-user-journey-and-ia.md
- docs/product/design/2026-03-13-theme-and-voice.md
backend_design_ref: docs/tech/design/requirements/rq-007-account-privacy/2026-03-13-rq-007-account-privacy-backend-design.md
api_contract_ref: docs/api/contracts/2026-03-13-api-v2-contracts.md
status: draft
ac_refs: AC-15, AC-16

## 1. 需求范围

- 我的页基础设置
- 数据导出状态查看
- 注销申请与取消

Out of scope:
- 多账号切换
- 客服会话中心

## 2. 页面与路由设计

- `/settings/preferences`
- `/settings/profile`

组件划分：
- 页面级：preferences / profile 容器
- 模块级：`features/account-privacy`
- 组件级：偏好设置表单、导出任务卡、注销确认弹层、注销状态卡

## 3. 数据流设计

- 页面加载设置 `GET /settings`
- 更新偏好 `PUT /settings`
- 导出与注销使用 mutation，成功后刷新当前状态查询
- 导出任务与注销状态使用局部 query，不进入全局 store

## 4. 接口契约映射

- `GET /api/v1/settings`
- `PUT /api/v1/settings`
- `POST /api/v1/account/export`
- `GET /api/v1/account/export/{taskId}`
- `POST /api/v1/account/delete-request`
- `GET /api/v1/account/delete-request`
- `DELETE /api/v1/account/delete-request`

DTO -> UI Model：
- `weightUnit`, `timezone`, `locale` -> `preferencesForm`
- `status`, `effectiveAt` -> `deleteStatusCard`
- `downloadUrl`, `expiresAt` -> `exportTaskCard`

错误态映射：
- `EXPORT_RATE_LIMIT` -> 导出按钮冷却
- `DUPLICATE_DELETE_REQUEST` -> 直接展示现有注销状态卡
- `INVALID_PARAMS` -> 表单字段错误或确认文案错误

## 5. 交互与状态

- loading：设置表单骨架、导出卡骨架
- empty：无导出任务时展示“需要时再创建导出”
- success：导出任务创建成功、注销申请状态更新成功
- error：保留用户当前输入并提示恢复方式

交互规则：
- 注销必须二次确认，并清楚展示冷静期和可取消时间
- 导出成功后优先展示状态卡，不打断用户留在当前页面

## 6. 埋点设计

- `settings_view`
- `settings_save`
- `export_request_click`
- `delete_request_submit`
- `delete_request_cancel`

公共属性：`from_path`, `timezone`, `export_format`, `delete_request_status`

## 7. 测试方案

- Component tests：注销状态卡、导出任务卡、设置表单
- Page flow tests：保存设置；发起导出；发起注销 -> 取消注销
- Contract mock tests：`downloadUrl`, `effectiveAt`, `canCancel` 映射

## 8. 开发任务拆解

- FE-7.1 重写我的页设置分区
- FE-7.2 接入导出与状态查询
- FE-7.3 接入注销申请/取消流程
- FE-7.4 补账户操作埋点和回归测试
