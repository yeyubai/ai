# API Error Codes（MVP v3）

owner: backend
status: active
last_updated: 2026-03-13
prd_ref: docs/product/prd/2026-03-13-prd-v2.md
contracts_ref: docs/api/contracts/2026-03-13-api-v2-contracts.md
supersedes: docs/api/errors/2026-03-13-api-error-codes.md

## 1. 错误响应基线

```json
{
  "code": "INVALID_PARAMS",
  "message": "durationMin must be between 0 and 600",
  "data": null,
  "traceId": "d9f1af9f-3317-44bf-9e00-8a0fb2d8cdb9"
}
```

说明：
- `PLAN_FALLBACK_USED` 不是失败，而是带兜底语义的成功码
- 客户端分支判断优先使用 `code`

## 2. HTTP 状态映射规则

- `200` -> 成功或降级成功（`OK`, `PLAN_FALLBACK_USED`）
- `400` -> 参数不合法（`INVALID_PARAMS`）
- `401` -> 鉴权失败或会话过期（`AUTH_EXPIRED`）
- `403` -> 权益不足（`SUBSCRIPTION_REQUIRED`, `TRIAL_LIMIT_REACHED`）
- `409` -> 业务冲突（`DUPLICATE_*`, `*_LIMIT_REACHED`, `REVIEW_NOT_READY`, `REMINDER_WINDOW_CONFLICT`）
- `429` -> 频控（`*_RATE_LIMIT`）
- `500` -> 未分类异常（`INTERNAL_ERROR`）

## 3. 错误码字典

| Code | HTTP | 模块 | 触发场景 | 客户端处理建议 |
| --- | --- | --- | --- | --- |
| `INVALID_PARAMS` | 400 | global | 参数缺失、格式错误、超出范围 | 展示字段级错误 |
| `AUTH_EXPIRED` | 401 | global | token 过期或无效 | 清理会话并跳转登录 |
| `INTERNAL_ERROR` | 500 | global | 未分类异常 | 展示通用错误并支持重试 |
| `PLAN_FALLBACK_USED` | 200 | home/review | 首页或复盘命中兜底输出 | 按成功态渲染并展示恢复说明 |
| `AUTH_RATE_LIMIT` | 429 | auth | 登录请求过频 | 按钮冷却并提示稍后重试 |
| `DUPLICATE_PROFILE` | 409 | entry | 档案更新冲突 | 刷新数据后重试 |
| `ONBOARDING_LIMIT_REACHED` | 409 | entry | 当日重复完成 onboarding | 直接跳转首页 |
| `DUPLICATE_CHECKIN` | 409 | record | 同类记录重复提交 | 提示“请勿重复提交” |
| `CHECKIN_LIMIT_REACHED` | 409 | record | 当日体重记录超过上限 | 阻止提交并提示上限 |
| `CHECKIN_RATE_LIMIT` | 429 | record | 记录请求过频 | 短暂冷却并重试 |
| `REVIEW_NOT_READY` | 409 | review | 体重与运动数据不足，无法生成 AI 调整 | 引导先完成核心动作 |
| `REVIEW_RATE_LIMIT` | 429 | review | 复盘生成过频 | 禁用重复生成并提示冷却 |
| `STATS_RATE_LIMIT` | 429 | progress | 趋势/周报查询过频 | 降频刷新 |
| `SUBSCRIPTION_REQUIRED` | 403 | membership | 访问会员专属能力 | 展示权益说明和升级入口 |
| `TRIAL_LIMIT_REACHED` | 403 | membership | 体验额度用尽 | 引导查看会员权益 |
| `REMINDER_WINDOW_CONFLICT` | 409 | reminder | 提醒时间落入静默时段或互相冲突 | 高亮冲突字段 |
| `REMINDER_RATE_LIMIT` | 429 | reminder | 提醒设置或回执查询过频 | 冷却后重试 |
| `DUPLICATE_DELETE_REQUEST` | 409 | account | 已存在有效注销申请 | 展示当前申请状态 |
| `EXPORT_RATE_LIMIT` | 429 | account | 导出创建过频 | 提示稍后重试 |

## 4. 错误码与接口映射

| Method | Path | Errors |
| --- | --- | --- |
| GET | `/api/v1/home/today` | `AUTH_EXPIRED`, `PLAN_FALLBACK_USED`, `INTERNAL_ERROR` |
| POST | `/api/v1/checkins/weight` | `INVALID_PARAMS`, `DUPLICATE_CHECKIN`, `CHECKIN_LIMIT_REACHED`, `CHECKIN_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| POST | `/api/v1/checkins/activity` | `INVALID_PARAMS`, `DUPLICATE_CHECKIN`, `CHECKIN_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| POST | `/api/v1/review/evening` | `INVALID_PARAMS`, `REVIEW_NOT_READY`, `REVIEW_RATE_LIMIT`, `PLAN_FALLBACK_USED`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| GET | `/api/v1/progress/weekly` | `INVALID_PARAMS`, `STATS_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| GET | `/api/v1/progress/monthly` | `INVALID_PARAMS`, `STATS_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| GET | `/api/v1/progress/weekly-report` | `INVALID_PARAMS`, `SUBSCRIPTION_REQUIRED`, `STATS_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| PUT | `/api/v1/reminders/settings` | `INVALID_PARAMS`, `REMINDER_WINDOW_CONFLICT`, `REMINDER_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| POST | `/api/v1/account/export` | `INVALID_PARAMS`, `EXPORT_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |
| POST | `/api/v1/account/delete-request` | `INVALID_PARAMS`, `DUPLICATE_DELETE_REQUEST`, `AUTH_EXPIRED`, `INTERNAL_ERROR` |

## 5. 前后端协作约束

- 饮食和睡眠接口仍可复用现有错误码，但不得影响首页主任务与主 CTA 判定。
- 前端对 `PLAN_FALLBACK_USED` 必须按成功态渲染，不得当作 toast 级错误拦截。
- 首页、进度页、复盘页对核心动作的缺失都优先引导体重或运动，而不是辅助记录。
