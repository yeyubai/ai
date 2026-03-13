# RQ-003 Frontend Design - AI 计划与复盘

owner: frontend
requirement_id: rq-003-ai-coach
prd_ref: docs/product/prd/2026-03-12-prd.md
backend_design_ref: docs/tech/design/requirements/rq-003-ai-coach/2026-03-13-rq-003-ai-coach-backend-design.md
status: approved

## 1. 需求范围

- 在 dashboard 展示今日计划卡片。
- 支持手动刷新计划（受次数限制）。
- 支持晚间复盘页面查看与明日重点确认。

Out of scope:
- 长会话 AI 聊天机器人。
- 用户自定义提示词编辑器。

## 2. 页面与路由设计

- `/dashboard`（今日计划卡片）
- `/coach/plan`（计划详情）
- `/coach/review`（晚间复盘）

组件划分：
- 页面级：dashboard/plan/review 容器
- 模块级：`features/ai-coach`
- 组件级：计划卡片、风险提示条、复盘分数卡

## 3. 数据流设计

- 页面顶层请求：
- 打开 dashboard 拉取计划。
- 晚间进入 review 页面触发复盘请求。

- store 归属：
- 当日计划和复盘状态使用 `coach store`。
- UI 临时交互（抽屉开关、展开状态）放本地 state。

## 4. 接口契约映射

- `POST /api/v1/ai/plan`
- `POST /api/v1/ai/review`

DTO -> UI Model：
- `calorieTargetKcal` -> `dailyCalorieTarget`
- `topActions[]` -> `todayActions[]`
- `riskFlags[]` -> `riskBadges[]`
- `source` -> `isFallback`（展示“通用建议”提示）

错误态映射：
- `429 AI_RATE_LIMIT` -> 禁用刷新按钮并显示冷却提示
- `500 INTERNAL_ERROR` -> 展示兜底卡片
- `401 AUTH_EXPIRED` -> 清理会话并跳转登录

## 5. 交互与状态

- loading：计划骨架屏/复盘骨架屏
- empty：无数据时显示“先完成打卡再生成建议”
- success：展示计划与复盘内容
- error：展示失败提示并支持重试

交互规则：
- 手动刷新次数耗尽后按钮置灰并展示次数说明。
- `isFallback=true` 时顶部展示“当前为通用建议”。

## 6. 埋点设计

- `ai_plan_view`
- `ai_plan_refresh_click`
- `ai_plan_refresh_blocked`
- `ai_review_view`
- `ai_action_mark_done`

公共属性：`user_id`, `client_type`, `timezone`, `is_fallback`, `risk_flags`

## 7. 测试方案

- Component tests:
- 计划卡片字段映射
- fallback 提示展示

- Page flow tests:
- dashboard 计划拉取 -> 手动刷新 -> 次数耗尽
- 复盘页生成 -> 展示明日重点

- Contract mock tests:
- AI 错误码与 UI 状态映射
- `source` 字段映射为 `isFallback`

## 8. 开发任务拆解

- FE-3.1 `features/ai-coach` 模块搭建
- FE-3.2 dashboard 计划卡片与刷新交互
- FE-3.3 晚间复盘页面实现
- FE-3.4 fallback 与风险提示渲染
- FE-3.5 AI 埋点与回归测试
