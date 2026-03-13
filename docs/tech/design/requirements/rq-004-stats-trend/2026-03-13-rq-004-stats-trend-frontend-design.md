# RQ-004 Frontend Design - 趋势与进度

owner: frontend
requirement_id: rq-004-stats-trend
prd_ref: docs/product/prd/2026-03-12-prd.md
backend_design_ref: docs/tech/design/requirements/rq-004-stats-trend/2026-03-13-rq-004-stats-trend-backend-design.md
status: draft

## 1. 需求范围

- 趋势页展示 7 日/30 日体重趋势。
- 展示执行率（打卡完成率、计划采纳率）与目标进度。
- 支持目标修改后趋势页刷新。

Out of scope:
- 趋势图高级配置（自定义时间窗、叠加多指标）。
- 趋势数据导出。

## 2. 页面与路由设计

- `/trend`

组件划分：
- 页面级：趋势页容器
- 模块级：`features/stats-trend`
- 图表组件：折线图、进度卡、执行率卡

## 3. 数据流设计

- 页面顶层请求：
- 默认请求 `GET /api/v1/stats/weekly`
- 切换到 30 日时请求 `GET /api/v1/stats/monthly`

- store 归属：
- 当前时间窗（7d/30d）与统计结果使用页面级 store。
- 图表 hover 态使用本地 state。

## 4. 接口契约映射

- `GET /api/v1/stats/weekly`
- `GET /api/v1/stats/monthly`

DTO -> UI Model：
- `trendPoints[]` -> chart points
- `checkinCompletionRate` -> checkin rate card
- `planAdoptionRate` -> adoption rate card
- `targetProgress` -> target progress bar

错误态映射：
- `401 AUTH_EXPIRED` -> 跳转登录
- `429 STATS_RATE_LIMIT` -> 降频提示与按钮冷却
- `500 INTERNAL_ERROR` -> 展示错误态卡片

## 5. 交互与状态

- loading：图表 skeleton + 指标卡 skeleton
- empty：无体重点时显示“先完成体重打卡”
- success：图表与指标完整展示
- error：错误态卡片 + 重试按钮

交互规则：
- 切换 7d/30d 时保留上次时间窗选择。
- 空点在图表中显示断点，不连接线段。

## 6. 埋点设计

- `trend_page_view`
- `trend_window_switch`
- `trend_retry_click`

公共属性：`user_id`, `client_type`, `timezone`, `window_type`

## 7. 测试方案

- Component tests:
- 7d/30d 切换
- 空点断点渲染

- Page flow tests:
- 初始加载 -> 切换窗口 -> 错误重试

- Contract mock tests:
- 指标字段映射
- 限流错误映射

## 8. 开发任务拆解

- FE-4.1 趋势页容器与路由
- FE-4.2 图表组件与指标卡
- FE-4.3 7d/30d 切换逻辑
- FE-4.4 错误态与重试交互
- FE-4.5 趋势埋点与回归测试
