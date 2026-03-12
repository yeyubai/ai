# RQ-001 Frontend Design - 登录与档案

owner: frontend
requirement_id: rq-001-auth-profile
prd_ref: docs/product/prd/2026-03-12-prd.md
backend_design_ref: docs/tech/design/requirements/rq-001-auth-profile/2026-03-12-rq-001-auth-profile-backend-design.md
status: approved

## 1. 需求范围
- 登录页（手机号 + 验证码）。
- 档案引导页（首次必填）。
- 档案编辑页（已有用户可修改）。

Out of scope:
- 第三方账号绑定。
- 多步骤高级档案编辑器。

## 2. 页面与路由设计
- `/auth/login`
- `/onboarding/profile`
- `/settings/profile`

组件划分：
- 页面级：路由容器 + 顶层数据请求
- 模块级：`features/auth`、`features/profile`
- 基础 UI：`components/ui`

## 3. 数据流设计
- 页面顶层请求：
- 登录提交在 `page.tsx` 顶层触发 action
- 档案获取在页面容器统一拉取后通过 props 下发
- store 归属：
- `auth token` 放共享 store
- `profile form draft` 放页面本地 state

## 4. 接口契约映射
- `POST /api/v1/auth/login`
- `GET /api/v1/profile`
- `PUT /api/v1/profile`

错误态映射：
- `400 INVALID_PARAMS` -> 表单字段错误提示
- `401 AUTH_EXPIRED` -> 跳转登录并清理 token
- `429 AUTH_RATE_LIMIT` -> 按钮冷却与提示文案

## 5. 交互与状态
- 登录按钮状态：idle/loading/success/error
- 验证码输入错误高亮 + 文案
- 档案提交失败支持重试，不丢失已填字段
- 首次档案未完成时禁止进入 dashboard

## 6. 埋点设计
- `login_submit`
- `login_success`
- `profile_form_submit`
- `profile_completed`
- 公共属性：`user_id`、`client_type`、`timezone`

## 7. 测试方案
- component:
- 登录表单校验
- 档案表单边界校验
- page flow:
- 登录成功 -> 档案引导 -> 完成跳转
- contract mock:
- 接口错误码映射到 UI 状态

## 8. 开发任务拆解
- FE-1.1 登录页与验证码交互
- FE-1.2 token 管理与路由守卫
- FE-1.3 档案引导页与字段校验
- FE-1.4 档案编辑页与提交反馈
- FE-1.5 埋点接入与回归测试
