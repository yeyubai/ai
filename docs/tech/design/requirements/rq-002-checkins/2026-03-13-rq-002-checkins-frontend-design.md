# RQ-002 Frontend Design - 打卡与补录

owner: frontend
requirement_id: rq-002-checkins
prd_ref: docs/product/prd/2026-03-12-prd.md
backend_design_ref: docs/tech/design/requirements/rq-002-checkins/2026-03-13-rq-002-checkins-backend-design.md
status: approved

## 1. 需求范围

- 打卡页面覆盖体重、饮食、运动、睡眠。
- 支持补录最近 7 天数据，并在 UI 显示补录标识。
- 支持打卡失败后的本地保留与重试。

Out of scope:
- 历史记录删除。
- 复杂饮食识图编辑器。

## 2. 页面与路由设计

- `/checkins/weight`
- `/checkins/meal`
- `/checkins/activity`
- `/checkins/sleep`

组件划分：
- 页面级：四个路由页容器
- 模块级：`features/checkins`
- 基础 UI：`components/ui` 表单、按钮、toast

## 3. 数据流设计

- 页面顶层请求：提交时调用对应 `POST /api/v1/checkins/*`。
- store 归属：
- 用户全局信息使用共享 store。
- 表单草稿使用页面本地 state。

- 事件回流：
- 提交成功后回写 dashboard 今日完成状态。
- 提交失败保留输入内容并提示重试。

## 4. 接口契约映射

- `POST /api/v1/checkins/weight`
- `POST /api/v1/checkins/meal`
- `POST /api/v1/checkins/activity`
- `POST /api/v1/checkins/sleep`

DTO -> UI Model：
- `data.checkinId` -> `submissionId`
- `data.isBackfill` -> `isBackfillTag`

错误态映射：
- `400 INVALID_PARAMS` -> 字段错误提示
- `409 DUPLICATE_CHECKIN` -> 顶部提醒“请勿重复提交”
- `409 CHECKIN_LIMIT_REACHED` -> 顶部提醒“当日体重记录已达上限”
- `429 CHECKIN_RATE_LIMIT` -> 提交按钮冷却
- `401 AUTH_EXPIRED` -> 清理 token 并跳转登录

## 5. 交互与状态

- loading/empty/error/success 状态完整定义。
- 打卡成功后显示“已记录”反馈并返回上一页。
- 补录模式开启时固定显示黄色补录标签。
- 离开页面时若有未提交草稿，弹出确认提示。

## 6. 埋点设计

- `checkin_weight_submit`
- `checkin_meal_submit`
- `checkin_activity_submit`
- `checkin_sleep_submit`
- `checkin_submit_success`
- `checkin_submit_fail`

公共属性：`user_id`, `client_type`, `timezone`, `is_backfill`

## 7. 测试方案

- Component tests:
- 四类表单边界校验
- 补录标签与提示展示

- Page flow tests:
- 打卡成功流程
- 重复提交失败与重试流程

- Contract mock tests:
- 错误码到 UI 状态映射
- 统一响应结构解析

## 8. 开发任务拆解

- FE-2.1 `features/checkins` 模块搭建
- FE-2.2 四类打卡页面与表单校验
- FE-2.3 提交结果反馈与失败重试
- FE-2.4 补录模式 UI 与行为
- FE-2.5 打卡埋点与回归测试
