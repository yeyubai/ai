# API Contracts（MVP v3）

owner: backend
status: active
last_updated: 2026-03-13
prd_ref: docs/product/prd/2026-03-13-prd-v2.md
supersedes: docs/api/contracts/2026-03-13-api-v1-contracts.md

## 1. 基线约定

- Base Path：`/api/v1`
- Auth：除 `POST /auth/login` 外，所有接口默认要求 `Authorization: Bearer <token>`
- Content-Type：`application/json`
- Trace：支持客户端传入 `x-trace-id`，服务端统一返回 `traceId`
- Idempotency：所有写接口支持 `x-idempotency-key`
- 分页：统一 `page` / `pageSize`，响应统一带 `total`

## 2. 统一响应结构

标准成功：

```json
{
  "code": "OK",
  "message": "success",
  "data": {},
  "traceId": "c2f7f2e8-2a8c-4e28-9ddf-0ce7fd3e4a1a"
}
```

降级成功：

```json
{
  "code": "PLAN_FALLBACK_USED",
  "message": "fallback plan is used",
  "data": {
    "fallbackReason": "insufficient_recent_logs"
  },
  "traceId": "c2f7f2e8-2a8c-4e28-9ddf-0ce7fd3e4a1a"
}
```

## 3. 接口总览

| Journey | Method | Path |
| --- | --- | --- |
| Entry | POST | `/api/v1/auth/login` |
| Entry | GET | `/api/v1/profile` |
| Entry | PUT | `/api/v1/profile` |
| Entry | POST | `/api/v1/onboarding/assessment` |
| Entry | POST | `/api/v1/onboarding/complete` |
| Home | GET | `/api/v1/home/today` |
| Home | POST | `/api/v1/home/actions/{actionId}/complete` |
| Record | POST | `/api/v1/checkins/weight` |
| Record | POST | `/api/v1/checkins/activity` |
| Record | POST | `/api/v1/checkins/meal` |
| Record | POST | `/api/v1/checkins/sleep` |
| Record | GET | `/api/v1/checkins/today` |
| Record | GET | `/api/v1/checkins/history` |
| Review | POST | `/api/v1/review/evening` |
| Review | POST | `/api/v1/review/skip` |
| Progress | GET | `/api/v1/progress/weekly` |
| Progress | GET | `/api/v1/progress/monthly` |
| Progress | GET | `/api/v1/progress/weekly-report` |
| Membership | GET | `/api/v1/membership/status` |
| Reminder | GET | `/api/v1/reminders/settings` |
| Reminder | PUT | `/api/v1/reminders/settings` |
| Reminder | GET | `/api/v1/reminders/receipts` |
| Account | GET | `/api/v1/settings` |
| Account | PUT | `/api/v1/settings` |
| Account | POST | `/api/v1/account/export` |
| Account | GET | `/api/v1/account/export/{taskId}` |
| Account | POST | `/api/v1/account/delete-request` |
| Account | GET | `/api/v1/account/delete-request` |
| Account | DELETE | `/api/v1/account/delete-request` |

## 4. 接口契约与示例

### 4.1 Entry & Onboarding

#### POST /api/v1/onboarding/assessment

```json
{
  "goalType": "fat_loss",
  "currentWeightKg": 68.2,
  "targetWeightKg": 60,
  "goalWeeks": 16,
  "activityBaseline": "light",
  "workRestPattern": "23:30-07:30",
  "motivationPattern": "restart_after_break"
}
```

### 4.2 Home Daily Loop

#### GET /api/v1/home/today

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "date": "2026-03-13",
    "dailyMission": [
      {
        "actionId": "weight_checkin",
        "title": "先完成晨起体重记录",
        "type": "checkin",
        "status": "done",
        "recommendedAt": "07:00"
      },
      {
        "actionId": "activity_complete",
        "title": "完成今天的运动并记录消耗",
        "type": "behavior",
        "status": "todo",
        "recommendedAt": "19:00"
      }
    ],
    "completion": {
      "done": 1,
      "total": 3,
      "rate": 0.33
    },
    "weightStatus": {
      "latestWeightKg": 67.8,
      "weighedToday": true,
      "weeklyChangeKg": -0.4,
      "targetWeightKg": 60
    },
    "activityStatus": {
      "completedToday": false,
      "durationMin": 0,
      "estimatedKcal": 0,
      "targetDurationMin": 30,
      "targetBurnKcal": 220,
      "exerciseDays7d": 3
    },
    "nextAction": {
      "actionId": "activity_complete",
      "title": "去完成今天的运动动作",
      "cta": "去记录运动"
    },
    "followUp": {
      "type": "review",
      "title": "完成今天动作后，晚上做 1 分钟 AI 调整",
      "cta": "去做今晚复盘"
    },
    "membershipState": {
      "plan": "free",
      "entitlements": ["basic_review", "basic_trend"]
    },
    "riskFlags": [],
    "recoveryMode": false,
    "fallbackReason": null
  },
  "traceId": "b5efdd32-07ee-4d63-a9b7-43ed90abde00"
}
```

#### POST /api/v1/home/actions/{actionId}/complete

```json
{
  "source": "home_card",
  "completedAt": "2026-03-13T20:30:00+08:00"
}
```

### 4.3 Record Center

#### POST /api/v1/checkins/weight

```json
{
  "checkinDate": "2026-03-13",
  "measuredAt": "2026-03-13T07:25:00+08:00",
  "weightKg": 67.8,
  "isBackfill": false,
  "source": "home_quick_entry"
}
```

#### POST /api/v1/checkins/activity

```json
{
  "checkinDate": "2026-03-13",
  "completed": true,
  "durationMin": 42,
  "estimatedKcal": 260,
  "activityType": "walk",
  "steps": 6800,
  "isBackfill": false
}
```

#### GET /api/v1/checkins/today

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "items": [
      {
        "checkinId": "w_123",
        "type": "weight",
        "checkinDate": "2026-03-13",
        "displayValue": "67.8 kg",
        "isBackfill": false,
        "createdAt": "2026-03-13T07:25:00+08:00"
      },
      {
        "checkinId": "a_456",
        "type": "activity",
        "checkinDate": "2026-03-13",
        "displayValue": "已完成 42 分钟 · 260 kcal",
        "isBackfill": false,
        "createdAt": "2026-03-13T19:10:00+08:00"
      }
    ]
  },
  "traceId": "f5e90f92-1dc4-4d4b-af79-c13f1d0f90d1"
}
```

### 4.4 Review & Adjustment

#### POST /api/v1/review/evening

```json
{
  "date": "2026-03-13",
  "timezone": "Asia/Shanghai",
  "triggerSource": "home_review_card"
}
```

```json
{
  "code": "PLAN_FALLBACK_USED",
  "message": "fallback plan is used",
  "data": {
    "reviewSummary": {
      "score": 72,
      "highlights": ["今天完成了晨起体重记录", "你已经完成了今天的运动动作"],
      "gaps": ["明天继续保持体重记录和运动节奏"]
    },
    "tomorrowPreview": {
      "focus": ["明早先称重", "安排 20 分钟轻运动"],
      "maxTasks": 2
    },
    "recoveryMode": true,
    "fallbackReason": "two_day_dropoff",
    "confidence": 0.68
  },
  "traceId": "3d0c1975-7892-47fd-aeb9-3b6da12c90ba"
}
```

### 4.5 Progress & Insight

#### GET /api/v1/progress/weekly

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "weightTrendPoints": [
      { "date": "2026-03-07", "weightKg": 68.4, "isMissing": false },
      { "date": "2026-03-08", "weightKg": null, "isMissing": true }
    ],
    "exerciseCompletionRate": 0.57,
    "burnKcalTotal": 1380,
    "exerciseDays": 4,
    "weighInDays": 5,
    "milestone": {
      "current": "连续 4 天有运动记录",
      "next": "连续 5 天同时完成体重和运动"
    }
  },
  "traceId": "66e03f4f-a895-4843-b5e8-62270006d9ce"
}
```

#### GET /api/v1/progress/weekly-report

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "summary": {
      "title": "这周你的体重和运动节奏正在对齐",
      "body": "近 7 天完成 4 次运动记录，体重变化开始朝目标方向推进。"
    },
    "lockedSections": ["deep_pattern_analysis", "coach_suggestions"],
    "membershipPrompt": {
      "show": true,
      "reason": "weekly_report_value_moment"
    }
  },
  "traceId": "56d1c5b2-f34c-4d3c-a9f4-a14f9b78fb12"
}
```

## 5. 兼容说明

- `POST /api/v1/checkins/meal` 与 `POST /api/v1/checkins/sleep` 继续保留，作为辅助记录接口。
- 饮食和睡眠不再进入首页主任务、首页主 CTA、首页 follow-up、进度页首屏主指标。
- AI 默认只依赖体重变化、运动完成率、运动消耗与恢复模式状态。
