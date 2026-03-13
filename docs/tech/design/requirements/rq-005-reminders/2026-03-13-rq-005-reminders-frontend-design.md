# RQ-005 Frontend Design - 提醒系统

owner: frontend
requirement_id: rq-005-reminders
prd_ref: docs/product/prd/2026-03-12-prd.md
backend_design_ref: docs/tech/design/requirements/rq-005-reminders/2026-03-13-rq-005-reminders-backend-design.md
status: draft

## 1. 需求范围

- 提醒设置页支持查看与修改提醒配置。
- 支持静默时段与提醒开关配置。
- 提供发送回执列表查看。

Out of scope:
- 多渠道推送偏好设置。
- 智能推荐提醒时间。

## 2. 页面与路由设计

- `/settings/reminders`

组件划分：
- 页面级：提醒设置页容器
- 模块级：`features/reminders`
- 组件级：时间选择器、开关组、回执列表

## 3. 数据流设计

- 页面顶层请求：
- 初始化：`GET /api/v1/reminders/settings`
- 保存：`PUT /api/v1/reminders/settings`
- 回执：`GET /api/v1/reminders/receipts`

- store 归属：
- 提醒配置使用模块 store。
- 编辑中临时状态使用本地表单状态。

## 4. 接口契约映射

- `GET /api/v1/reminders/settings`
- `PUT /api/v1/reminders/settings`
- `GET /api/v1/reminders/receipts`

DTO -> UI Model：
- `checkinReminderTimes[]` -> 未打卡提醒时间控件
- `hydrationEnabled`/`hydrationTimes[]` -> 喝水提醒开关与时间控件
- `quietHours` -> 静默时段控件

错误态映射：
- `400 INVALID_PARAMS` -> 字段级错误提示
- `409 DUPLICATE_REMINDER_RULE` -> 顶部冲突提示
- `429 REMINDER_RATE_LIMIT` -> 保存按钮冷却
- `401 AUTH_EXPIRED` -> 跳转登录

## 5. 交互与状态

- loading：配置 skeleton 与回执 skeleton
- empty：回执为空时显示“暂无发送记录”
- success：设置保存成功 toast
- error：保存失败 toast + 保留编辑内容

交互规则：
- 保存前先进行静默时段冲突校验。
- 提醒开关关闭时对应时间控件置灰。

## 6. 埋点设计

- `reminder_settings_view`
- `reminder_settings_save`
- `reminder_settings_save_fail`
- `reminder_receipts_view`

公共属性：`user_id`, `client_type`, `timezone`, `hydration_enabled`

## 7. 测试方案

- Component tests:
- 时间控件与开关联动
- 静默时段冲突校验

- Page flow tests:
- 设置加载 -> 修改 -> 保存成功
- 保存失败重试流程

- Contract mock tests:
- 配置 DTO 映射
- 限流与冲突错误映射

## 8. 开发任务拆解

- FE-5.1 reminders 页面与模块搭建
- FE-5.2 配置编辑与保存流程
- FE-5.3 回执列表与分页
- FE-5.4 表单校验与冲突提示
- FE-5.5 提醒埋点与回归测试
