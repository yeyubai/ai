# RQ-001 Frontend Design - Entry & Onboarding

owner: engineering
requirement_id: rq-001-entry-onboarding
prd_ref: docs/product/prd/2026-03-13-prd-v2.md
product_design_refs:
- docs/product/design/2026-03-13-user-journey-and-ia.md
- docs/product/design/2026-03-13-theme-and-voice.md
backend_design_ref: docs/tech/design/requirements/rq-001-entry-onboarding/2026-03-13-rq-001-entry-onboarding-backend-design.md
api_contract_ref: docs/api/contracts/2026-03-13-api-v2-contracts.md
status: draft
ac_refs: AC-01, AC-02

## 1. 需求范围

- 登录页与轻评估页
- 基础档案编辑
- 完成 onboarding 后进入首页

Out of scope:
- 长问卷画像
- 支付页

## 2. 页面与路由设计

- `/auth/login`
- `/onboarding/profile`

组件划分：
- 页面级：登录页、轻评估页
- 模块级：`features/auth`, `features/onboarding-flow`
- 组件级：登录表单、目标设定表单、首日动作预览

## 3. 数据流设计

- 登录后根据 `userStatus` 决定进入 onboarding 还是首页
- 轻评估提交顺序：`PUT /profile` -> `POST /onboarding/assessment` -> `POST /onboarding/complete`
- 首日预览只承接三件事：`先称重 / 去运动 / 晚间调整`
- 全局只保存登录态；表单状态留在页面本地

## 4. 接口契约映射

- `POST /api/v1/auth/login`
- `GET /api/v1/profile`
- `PUT /api/v1/profile`
- `POST /api/v1/onboarding/assessment`
- `POST /api/v1/onboarding/complete`

DTO -> UI Model：
- `userStatus` -> 登录后分流
- `recommendedDailyActions[]` -> 首日动作预览
- `membershipState.plan` -> 权益标记

错误态映射：
- `AUTH_RATE_LIMIT` -> 登录按钮冷却
- `INVALID_PARAMS` -> 字段级校验提示
- `ONBOARDING_LIMIT_REACHED` -> 直接跳首页并提示已开始今天安排

## 5. 交互与状态

- 轻评估尽量控制在一屏完成
- 当前体重、目标体重、目标周期、活动基线为主字段
- 作息和饮食偏好保留，但不作为首页主任务优先级输入
- 完成 onboarding 后直接进首页，不停留在复杂结果页

## 6. 埋点设计

- `login_submit`
- `login_success`
- `onboarding_view`
- `onboarding_assessment_submit`
- `onboarding_complete`

公共属性：`goal_weeks`, `activity_baseline`, `user_status`, `motivation_pattern`

## 7. 测试方案

- Component tests：登录校验、目标字段校验、首日动作预览
- Page flow tests：登录 -> 轻评估 -> 完成 -> 首页
- Contract mock tests：`userStatus`, `recommendedDailyActions`, `homeRedirect` 映射

## 8. 开发任务拆解

- FE-1.1 调整登录分流
- FE-1.2 收敛轻评估到体重 + 运动起点主字段
- FE-1.3 接首页跳转和首日动作预览
- FE-1.4 补 entry 埋点和回归测试
