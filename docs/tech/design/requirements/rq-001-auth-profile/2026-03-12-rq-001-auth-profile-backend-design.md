# RQ-001 Backend Design - 登录与档案

owner: backend
requirement_id: rq-001-auth-profile
prd_ref: docs/product/prd/2026-03-12-prd.md
status: approved

## 1. 需求范围

- 支持手机号验证码登录（MVP 占位实现可先抽象验证码服务接口）。
- 提供档案读取与更新 API。
- 对档案字段执行后端校验，非法输入统一返回错误码。

Out of scope:
- 第三方登录。
- 复杂账号风控策略。

## 2. 接口设计

- `POST /api/v1/auth/login`
- `GET /api/v1/profile`
- `PUT /api/v1/profile`

Request / Response（统一返回结构）：
- response: `{ code, message, data, traceId }`
- login request: `{ phone, code }`
- login response data: `{ token, refreshToken, expiresIn }`
- profile response data: `UserProfileDto`

错误码：
- `400 INVALID_PARAMS`
- `401 AUTH_EXPIRED`
- `409 DUPLICATE_PROFILE`
- `429 AUTH_RATE_LIMIT`
- `500 INTERNAL_ERROR`

## 3. 数据模型设计

新增表建议：
- `users`
- `user_profiles`
- `auth_sessions`

字段约束：
- 身高 `120-220`
- 当前体重 `30-250`
- 目标体重 `<= 当前体重`（减脂场景）

索引建议：
- `users(phone)` unique
- `user_profiles(user_id)` unique
- `auth_sessions(user_id, expires_at)`

## 4. 业务规则

- 新用户首次登录后，若档案未完成，`profileCompleted=false`。
- `PUT /profile` 为幂等更新：同 payload 多次提交结果一致。
- token 过期时统一返回 `401 AUTH_EXPIRED`。

## 5. 非功能要求

- 登录接口 p95 <= 400ms（验证码网关除外）。
- 档案读写接口 p95 <= 300ms。
- 记录登录与档案更新审计日志，日志包含 traceId。

## 6. 测试方案

- unit:
- 档案字段边界校验
- 目标体重规则校验

- integration:
- 登录 -> 获取档案 -> 更新档案链路

- contract:
- 错误码与响应结构契约测试

## 7. 开发任务拆解

- BE-1.1 DTO 与 ValidationPipe 约束
- BE-1.2 auth 模块 login 接口与 token 策略
- BE-1.3 profile 模块读写接口
- BE-1.4 错误码映射与统一异常处理
- BE-1.5 契约测试

## 8. 风险与回滚

- 风险：验证码服务不可用导致登录失败率上升。
- 回滚：登录入口切回 mock code 模式（预发布），生产回滚至上一个稳定版本。
