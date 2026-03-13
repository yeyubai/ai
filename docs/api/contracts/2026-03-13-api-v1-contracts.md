# API Contracts（MVP v1）

owner: backend
status: superseded
superseded_by: docs/api/contracts/2026-03-13-api-v2-contracts.md
last_updated: 2026-03-13
prd_ref: docs/product/prd/2026-03-12-prd.md
source_refs:
- docs/tech/design/requirements/rq-001-auth-profile/2026-03-12-rq-001-auth-profile-backend-design.md
- docs/tech/design/requirements/rq-002-checkins/2026-03-13-rq-002-checkins-backend-design.md
- docs/tech/design/requirements/rq-003-ai-coach/2026-03-13-rq-003-ai-coach-backend-design.md
- docs/tech/design/requirements/rq-004-stats-trend/2026-03-13-rq-004-stats-trend-backend-design.md
- docs/tech/design/requirements/rq-005-reminders/2026-03-13-rq-005-reminders-backend-design.md
- docs/tech/design/requirements/rq-006-settings-privacy/2026-03-13-rq-006-settings-privacy-backend-design.md

## 1. 基线约定

- Base Path: `/api/v1`
- Auth: 除 `POST /auth/login` 外均需 `Authorization: Bearer <token>`
- Content-Type: `application/json`
- 追踪: 支持客户端传入 `x-trace-id`，服务端统一返回 `traceId`
- 幂等（写接口建议）:
- 打卡写接口可传 `x-idempotency-key`
- 其余写接口可按业务需要扩展
- 分页: 使用 `page` / `pageSize`，响应返回 `total`

## 2. 统一响应结构

成功/失败均返回：

```json
{
  "code": "OK",
  "message": "success",
  "data": {},
  "traceId": "c2f7f2e8-2a8c-4e28-9ddf-0ce7fd3e4a1a"
}
```

说明：
- `code=OK` 表示业务成功
- 非 `OK` 表示业务失败，具体见 `docs/api/errors/2026-03-13-api-error-codes.md`

## 3. 接口总览

| Domain | Method | Path | 对应 RQ |
| --- | --- | --- | --- |
| Auth | POST | `/api/v1/auth/login` | rq-001-auth-profile |
| Profile | GET | `/api/v1/profile` | rq-001-auth-profile |
| Profile | PUT | `/api/v1/profile` | rq-001-auth-profile |
| Checkins | POST | `/api/v1/checkins/weight` | rq-002-checkins |
| Checkins | POST | `/api/v1/checkins/meal` | rq-002-checkins |
| Checkins | POST | `/api/v1/checkins/activity` | rq-002-checkins |
| Checkins | POST | `/api/v1/checkins/sleep` | rq-002-checkins |
| AI | POST | `/api/v1/ai/plan` | rq-003-ai-coach |
| AI | POST | `/api/v1/ai/review` | rq-003-ai-coach |
| Stats | GET | `/api/v1/stats/weekly` | rq-004-stats-trend |
| Stats | GET | `/api/v1/stats/monthly` | rq-004-stats-trend |
| Reminders | GET | `/api/v1/reminders/settings` | rq-005-reminders |
| Reminders | PUT | `/api/v1/reminders/settings` | rq-005-reminders |
| Reminders | GET | `/api/v1/reminders/receipts` | rq-005-reminders |
| Settings | GET | `/api/v1/settings` | rq-006-settings-privacy |
| Settings | PUT | `/api/v1/settings` | rq-006-settings-privacy |
| Account | POST | `/api/v1/account/export` | rq-006-settings-privacy |
| Account | GET | `/api/v1/account/export/{taskId}` | rq-006-settings-privacy |
| Account | POST | `/api/v1/account/delete-request` | rq-006-settings-privacy |
| Account | GET | `/api/v1/account/delete-request` | rq-006-settings-privacy |
| Account | DELETE | `/api/v1/account/delete-request` | rq-006-settings-privacy |

## 4. 接口契约与示例

### 4.1 Auth & Profile（rq-001）

#### POST /api/v1/auth/login

Request:

```json
{
  "phone": "13800000000",
  "code": "123456"
}
```

Success Response:

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "token": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresIn": 7200
  },
  "traceId": "6f4b7f75-11ec-4bc1-a9ea-8c2e3c1cbfd0"
}
```

Error codes: `INVALID_PARAMS`, `AUTH_RATE_LIMIT`, `INTERNAL_ERROR`

#### GET /api/v1/profile

Success Response:

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "gender": "female",
    "age": 29,
    "heightCm": 165,
    "currentWeightKg": 68.2,
    "targetWeightKg": 60,
    "goalWeeks": 16,
    "workRestPattern": "23:30-07:30",
    "dietPreference": "high-protein",
    "allergies": ["peanut"],
    "profileCompleted": true
  },
  "traceId": "57359890-94f9-44b6-aa14-b442f7a6f64a"
}
```

Error codes: `AUTH_EXPIRED`, `INTERNAL_ERROR`

#### PUT /api/v1/profile

Request:

```json
{
  "gender": "female",
  "age": 29,
  "heightCm": 165,
  "currentWeightKg": 68.2,
  "targetWeightKg": 60,
  "goalWeeks": 16,
  "workRestPattern": "23:30-07:30",
  "dietPreference": "high-protein",
  "allergies": ["peanut"]
}
```

Success Response:

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "updated": true
  },
  "traceId": "4fec4fd7-d38e-46c8-a770-e1e9096dad8d"
}
```

Error codes: `INVALID_PARAMS`, `DUPLICATE_PROFILE`, `AUTH_EXPIRED`, `INTERNAL_ERROR`

### 4.2 Checkins（rq-002）

#### POST /api/v1/checkins/weight

Request:

```json
{
  "checkinDate": "2026-03-13",
  "measuredAt": "2026-03-13T07:25:00+08:00",
  "weightKg": 67.8,
  "source": "manual",
  "isBackfill": false
}
```

Success Response:

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "checkinId": "w_123",
    "checkinType": "weight",
    "checkinDate": "2026-03-13",
    "isBackfill": false,
    "createdAt": "2026-03-13T07:25:05+08:00"
  },
  "traceId": "550d03d0-955a-4f4f-b2de-6d9d5fd3fb33"
}
```

Error codes: `INVALID_PARAMS`, `DUPLICATE_CHECKIN`, `CHECKIN_LIMIT_REACHED`, `CHECKIN_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR`

#### POST /api/v1/checkins/meal

Request:

```json
{
  "checkinDate": "2026-03-13",
  "mealType": "lunch",
  "description": "chicken salad",
  "estimatedKcal": 520,
  "imageUrl": "https://cdn.example.com/meal/abc.jpg",
  "isBackfill": false
}
```

Success Response:

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "checkinId": "m_123",
    "checkinType": "meal",
    "checkinDate": "2026-03-13",
    "isBackfill": false,
    "createdAt": "2026-03-13T12:10:10+08:00"
  },
  "traceId": "f991cbfb-16d1-44c4-99e8-ec3d6d2abf86"
}
```

Error codes: `INVALID_PARAMS`, `DUPLICATE_CHECKIN`, `CHECKIN_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR`

#### POST /api/v1/checkins/activity

Request:

```json
{
  "checkinDate": "2026-03-13",
  "activityType": "walk",
  "durationMin": 45,
  "steps": 6300,
  "estimatedKcal": 220,
  "isBackfill": false
}
```

Success Response:

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "checkinId": "a_123",
    "checkinType": "activity",
    "checkinDate": "2026-03-13",
    "isBackfill": false,
    "createdAt": "2026-03-13T18:45:31+08:00"
  },
  "traceId": "f448891b-f0f3-4d9f-b95c-8511324a06f3"
}
```

Error codes: `INVALID_PARAMS`, `DUPLICATE_CHECKIN`, `CHECKIN_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR`

#### POST /api/v1/checkins/sleep

Request:

```json
{
  "checkinDate": "2026-03-13",
  "sleepAt": "2026-03-12T23:40:00+08:00",
  "wakeAt": "2026-03-13T07:10:00+08:00",
  "durationMin": 450,
  "isBackfill": false
}
```

Success Response:

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "checkinId": "s_123",
    "checkinType": "sleep",
    "checkinDate": "2026-03-13",
    "isBackfill": false,
    "createdAt": "2026-03-13T07:12:20+08:00"
  },
  "traceId": "78894a20-2e97-4181-8c6f-45f9c9f0f542"
}
```

Error codes: `INVALID_PARAMS`, `DUPLICATE_CHECKIN`, `CHECKIN_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR`

### 4.3 AI Coach（rq-003）

#### POST /api/v1/ai/plan

Request:

```json
{
  "date": "2026-03-13",
  "forceRefresh": false,
  "timezone": "Asia/Shanghai"
}
```

Success Response:

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "planId": "p_123",
    "date": "2026-03-13",
    "calorieTargetKcal": 1650,
    "meals": [
      {
        "name": "breakfast",
        "suggestion": "oatmeal + boiled egg",
        "kcal": 420
      }
    ],
    "activity": {
      "type": "walk",
      "durationMin": 40,
      "intensity": "low"
    },
    "topActions": ["午餐主食减半", "晚饭后步行 20 分钟"],
    "riskFlags": ["missing_logs"],
    "summaryText": "今天保持轻热量缺口",
    "source": "model"
  },
  "traceId": "4f2f0f78-4df9-4b87-8646-d67aa5f700da"
}
```

Error codes: `INVALID_PARAMS`, `AI_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR`

#### POST /api/v1/ai/review

Request:

```json
{
  "date": "2026-03-13",
  "timezone": "Asia/Shanghai"
}
```

Success Response:

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "reviewId": "r_123",
    "date": "2026-03-13",
    "score": 78,
    "highlights": ["体重打卡连续完成"],
    "gaps": ["晚餐热量偏高"],
    "tomorrowFocus": ["晚餐控制在 600kcal 内"],
    "riskFlags": [],
    "summaryText": "总体执行稳定，晚餐再优化",
    "source": "model"
  },
  "traceId": "9f4bf0da-36e4-4b3f-a4aa-c61ef9f762ef"
}
```

Error codes: `INVALID_PARAMS`, `AI_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR`

### 4.4 Stats Trend（rq-004）

#### GET /api/v1/stats/weekly

Query:

```text
date=2026-03-13&timezone=Asia/Shanghai
```

Success Response:

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "trendPoints": [
      { "date": "2026-03-07", "weightKg": 68.4, "isMissing": false },
      { "date": "2026-03-08", "weightKg": null, "isMissing": true }
    ],
    "checkinCompletionRate": 0.71,
    "planAdoptionRate": 0.5,
    "targetProgress": 0.31
  },
  "traceId": "66e03f4f-a895-4843-b5e8-62270006d9ce"
}
```

Error codes: `INVALID_PARAMS`, `STATS_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR`

#### GET /api/v1/stats/monthly

Query:

```text
date=2026-03-13&timezone=Asia/Shanghai
```

Success Response:

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "trendPoints": [
      { "date": "2026-02-13", "weightKg": 69.8, "isMissing": false },
      { "date": "2026-02-14", "weightKg": 69.7, "isMissing": false }
    ],
    "checkinCompletionRate": 0.64,
    "planAdoptionRate": 0.48,
    "targetProgress": 0.37
  },
  "traceId": "18fcb710-9ed7-4f01-b70a-b1738f4431d7"
}
```

Error codes: `INVALID_PARAMS`, `STATS_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR`

### 4.5 Reminders（rq-005）

#### GET /api/v1/reminders/settings

Success Response:

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "checkinReminderTimes": ["12:00", "20:00"],
    "hydrationEnabled": true,
    "hydrationTimes": ["10:00", "14:00", "16:00", "20:30"],
    "reviewReminderTime": "21:30",
    "quietHours": { "start": "22:30", "end": "08:00" },
    "timezone": "Asia/Shanghai",
    "updatedAt": "2026-03-13T10:00:00+08:00"
  },
  "traceId": "0c6584ab-4d80-4eb7-b3be-3cc66efe9d8d"
}
```

Error codes: `AUTH_EXPIRED`, `INTERNAL_ERROR`

#### PUT /api/v1/reminders/settings

Request:

```json
{
  "checkinReminderTimes": ["12:00", "20:00"],
  "hydrationEnabled": true,
  "hydrationTimes": ["10:00", "14:00", "16:00", "20:30"],
  "reviewReminderTime": "21:30",
  "quietHours": { "start": "22:30", "end": "08:00" },
  "timezone": "Asia/Shanghai"
}
```

Success Response:

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "updated": true
  },
  "traceId": "ce894070-f08d-45f1-a4fb-81b67fd16b38"
}
```

Error codes: `INVALID_PARAMS`, `DUPLICATE_REMINDER_RULE`, `REMINDER_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR`

#### GET /api/v1/reminders/receipts

Query:

```text
dateFrom=2026-03-01&dateTo=2026-03-13&page=1&pageSize=20
```

Success Response:

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "list": [
      {
        "reminderType": "checkin",
        "scheduledAt": "2026-03-13T20:00:00+08:00",
        "sentAt": "2026-03-13T20:00:01+08:00",
        "status": "sent",
        "openAt": "2026-03-13T20:03:11+08:00"
      }
    ],
    "total": 42
  },
  "traceId": "083f7560-cf96-49f6-8003-d4d1b7d7004d"
}
```

Error codes: `INVALID_PARAMS`, `REMINDER_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR`

### 4.6 Settings & Privacy（rq-006）

#### GET /api/v1/settings

Success Response:

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "weightUnit": "kg",
    "timezone": "Asia/Shanghai",
    "locale": "zh-CN"
  },
  "traceId": "cb9fb8f9-a9c7-4249-a32d-70a9a843af9e"
}
```

Error codes: `AUTH_EXPIRED`, `INTERNAL_ERROR`

#### PUT /api/v1/settings

Request:

```json
{
  "weightUnit": "kg",
  "timezone": "Asia/Shanghai",
  "locale": "zh-CN"
}
```

Success Response:

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "updated": true
  },
  "traceId": "2900c607-fdb2-4a30-b293-c88dd150f2ed"
}
```

Error codes: `INVALID_PARAMS`, `AUTH_EXPIRED`, `INTERNAL_ERROR`

#### POST /api/v1/account/export

Request:

```json
{
  "format": "json"
}
```

Success Response:

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "taskId": "exp_123",
    "status": "processing"
  },
  "traceId": "d89b15d8-eccb-4f86-ac88-b04a29e26b7f"
}
```

Error codes: `INVALID_PARAMS`, `EXPORT_RATE_LIMIT`, `AUTH_EXPIRED`, `INTERNAL_ERROR`

#### GET /api/v1/account/export/{taskId}

Success Response:

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "taskId": "exp_123",
    "status": "done",
    "downloadUrl": "https://cdn.example.com/export/exp_123.json",
    "expiresAt": "2026-03-20T12:00:00+08:00"
  },
  "traceId": "76585349-86e0-4134-ba9a-ddd66e2fac76"
}
```

Error codes: `INVALID_PARAMS`, `AUTH_EXPIRED`, `INTERNAL_ERROR`

#### POST /api/v1/account/delete-request

Request:

```json
{
  "reason": "need a break",
  "confirmText": "DELETE"
}
```

Success Response:

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "status": "pending_cooldown",
    "requestedAt": "2026-03-13T11:00:00+08:00",
    "effectiveAt": "2026-03-20T11:00:00+08:00",
    "canCancel": true
  },
  "traceId": "554ffbd0-5f0a-4a61-84fc-ba07780fe542"
}
```

Error codes: `INVALID_PARAMS`, `DUPLICATE_DELETE_REQUEST`, `AUTH_EXPIRED`, `INTERNAL_ERROR`

#### GET /api/v1/account/delete-request

Success Response:

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "status": "pending_cooldown",
    "requestedAt": "2026-03-13T11:00:00+08:00",
    "effectiveAt": "2026-03-20T11:00:00+08:00",
    "canCancel": true
  },
  "traceId": "7cd4d1f6-e6ef-4488-b7a8-2e3e170e2937"
}
```

Error codes: `AUTH_EXPIRED`, `INTERNAL_ERROR`

#### DELETE /api/v1/account/delete-request

Success Response:

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "canceled": true
  },
  "traceId": "172fd3b0-d80b-4bc8-a024-85f3d786d8a0"
}
```

Error codes: `INVALID_PARAMS`, `AUTH_EXPIRED`, `INTERNAL_ERROR`

