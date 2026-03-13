# API Error Codes（MVP v1）

owner: backend
status: superseded
superseded_by: docs/api/errors/2026-03-13-api-v2-error-codes.md
last_updated: 2026-03-13
prd_ref: docs/product/prd/2026-03-12-prd.md
contracts_ref: docs/api/contracts/2026-03-13-api-v1-contracts.md

## 1. 错误响应基线

错误响应统一结构：

```json
{
  "code": "INVALID_PARAMS",
  "message": "weightKg must be between 30 and 250",
  "data": null,
  "traceId": "d9f1af9f-3317-44bf-9e00-8a0fb2d8cdb9"
}
```

说明：
- `code`：稳定错误码，前端按此做逻辑处理
- `message`：可读文案，便于调试和直接展示
- `traceId`：用于后端日志追踪

## 2. HTTP 状态映射规则

- `400` -> 参数或状态不合法（`INVALID_PARAMS`）
- `401` -> 鉴权失败或会话过期（`AUTH_EXPIRED`）
- `409` -> 业务冲突/重复提交（`DUPLICATE_*`, `*_LIMIT_REACHED`）
- `429` -> 限流（`*_RATE_LIMIT`）
- `500` -> 未分类服务异常（`INTERNAL_ERROR`）

## 3. 错误码字典

| Code | HTTP | 模块 | 触发场景 | 客户端处理建议 |
| --- | --- | --- | --- | --- |
| `INVALID_PARAMS` | 400 | global | 参数缺失、格式错误、超出范围 | 展示字段级错误，阻止提交 |
| `AUTH_EXPIRED` | 401 | global | token 过期/无效 | 清理会话并跳转登录 |
| `INTERNAL_ERROR` | 500 | global | 未分类服务异常 | 展示通用错误，支持重试 |
| `DUPLICATE_PROFILE` | 409 | auth/profile | 档案更新冲突 | 刷新数据后重试 |
| `AUTH_RATE_LIMIT` | 429 | auth | 登录请求过频 | 按钮冷却并提示稍后再试 |
| `DUPLICATE_CHECKIN` | 409 | checkins | 重复提交同类打卡 | 提示“请勿重复提交” |
| `CHECKIN_LIMIT_REACHED` | 409 | checkins | 当日体重记录超过上限 | 提示当日上限并阻止提交 |
| `CHECKIN_RATE_LIMIT` | 429 | checkins | 打卡请求过频 | 按钮冷却并延迟重试 |
| `AI_RATE_LIMIT` | 429 | ai | 计划/复盘调用过频 | 禁用刷新并提示冷却 |
| `STATS_RATE_LIMIT` | 429 | stats | 趋势查询过频 | 降频拉取并提示稍后刷新 |
| `DUPLICATE_REMINDER_RULE` | 409 | reminders | 提醒规则冲突 | 提示冲突并要求修改配置 |
| `REMINDER_RATE_LIMIT` | 429 | reminders | 提醒设置或回执查询过频 | 冷却后重试 |
| `DUPLICATE_DELETE_REQUEST` | 409 | account | 已存在有效注销申请 | 展示当前申请状态 |
| `EXPORT_RATE_LIMIT` | 429 | account | 数据导出创建过频 | 提示频率限制并稍后重试 |

## 4. 错误码与接口映射

| Method | Path | Errors |
| --- | --- | --- |
| POST | `/api/v1/auth/login` | `INVALID_PARAMS`, `AUTH_RATE_LIMIT`, `INTERNAL_ERROR` |
| GET | `/api/v1/profile` | `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| PUT | `/api/v1/profile` | `INVALID_PARAMS`, `DUPLICATE_PROFILE`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| POST | `/api/v1/checkins/weight` | `INVALID_PARAMS`, `DUPLICATE_CHECKIN`, `CHECKIN_LIMIT_REACHED`, `CHECKIN_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| POST | `/api/v1/checkins/meal` | `INVALID_PARAMS`, `DUPLICATE_CHECKIN`, `CHECKIN_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| POST | `/api/v1/checkins/activity` | `INVALID_PARAMS`, `DUPLICATE_CHECKIN`, `CHECKIN_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| POST | `/api/v1/checkins/sleep` | `INVALID_PARAMS`, `DUPLICATE_CHECKIN`, `CHECKIN_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| POST | `/api/v1/ai/plan` | `INVALID_PARAMS`, `AI_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| POST | `/api/v1/ai/review` | `INVALID_PARAMS`, `AI_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| GET | `/api/v1/stats/weekly` | `INVALID_PARAMS`, `STATS_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| GET | `/api/v1/stats/monthly` | `INVALID_PARAMS`, `STATS_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| GET | `/api/v1/reminders/settings` | `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| PUT | `/api/v1/reminders/settings` | `INVALID_PARAMS`, `DUPLICATE_REMINDER_RULE`, `REMINDER_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| GET | `/api/v1/reminders/receipts` | `INVALID_PARAMS`, `REMINDER_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| GET | `/api/v1/settings` | `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| PUT | `/api/v1/settings` | `INVALID_PARAMS`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| POST | `/api/v1/account/export` | `INVALID_PARAMS`, `EXPORT_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| GET | `/api/v1/account/export/{taskId}` | `INVALID_PARAMS`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| POST | `/api/v1/account/delete-request` | `INVALID_PARAMS`, `DUPLICATE_DELETE_REQUEST`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| GET | `/api/v1/account/delete-request` | `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| DELETE | `/api/v1/account/delete-request` | `INVALID_PARAMS`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |

## 5. 前后端协作约束

- 前端错误分支必须以 `code` 为主，`message` 为辅。
- 新增错误码时，必须同步更新：
- `docs/api/errors/*`
- `docs/api/contracts/*`（接口映射）
- 对应 RQ backend/frontend design 文档
- 任何错误码删除或含义变更视为契约变更，需在同一 PR 完成联动更新。

