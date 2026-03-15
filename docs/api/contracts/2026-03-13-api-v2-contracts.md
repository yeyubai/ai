# API Contracts（MVP v3）

owner: backend
status: active
last_updated: 2026-03-13
prd_ref: docs/product/prd/2026-03-13-prd-v2.md
supersedes: docs/api/contracts/2026-03-13-api-v1-contracts.md

## 1. 基线约定

- Base Path：`/api/v1`
- Auth：除 `POST /auth/login`、`POST /auth/guest` 外，所有接口默认要求 `Authorization: Bearer <token>`
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
| Entry | POST | `/api/v1/auth/guest` |
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

#### POST /api/v1/auth/guest

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "token": "atk_xxx",
    "refreshToken": "rtk_xxx",
    "expiresIn": 7200,
    "userStatus": "active",
    "userRole": "guest"
  },
  "traceId": "0d8bb0c4-5cb9-41df-9f4d-6fe608c2f55f"
}
```

说明：
- 首次进入应用时，客户端应优先调用本接口创建游客会话。
- 游客会话可直接用于首页、趋势页、日记页和我的页。

#### POST /api/v1/auth/login

```json
{
  "phone": "13800138000",
  "code": "123456",
  "guestToken": "atk_guest_xxx"
}
```

说明：
- `guestToken` 可选；当客户端当前为游客态且用户主动登录时，应携带该字段。
- 服务端在登录成功后，需要把游客期间产生的资料、目标、设置和体重记录迁移到正式账号。

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

说明：
- MVP 前端首屏只强制用户填写 `currentWeightKg`, `targetWeightKg`, `goalWeeks`, `activityBaseline`。
- `workRestPattern`, `dietPreference`, `motivationPattern` 允许由前端按默认模板兜底后提交，不应阻断首次开始。

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

说明：
- `nextAction` 是首页唯一强 CTA 的事实来源；客户端不得并列展示第二个同级主 CTA。
- 首页的方向判断、轻量成就等结论型文案由客户端基于 `weightStatus`, `activityStatus`, `completion` 派生，MVP 不新增专用字段。

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

说明：
- 客户端应先通过 `GET /api/v1/home/today` 判断当天是否已具备复盘条件，再由用户主动触发本接口。
- 当天体重与运动都缺失时，本接口返回 `REVIEW_NOT_READY`。

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

说明：
- 首屏“我是否在朝目标前进”的结论由客户端基于 `weightTrendPoints`, `exerciseCompletionRate`, `exerciseDays`, `weighInDays` 派生。
- MVP 不新增 `directionSummary` 或强游戏化成就字段，避免口径漂移。

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
- 会员价值表达应围绕“解释更清楚、提醒更稳、恢复更快”，不以“更多功能”作为默认主卖点。

## 6. 体重日记扩展说明（2026-03-14）

### 6.1 GET /api/v1/weights/entries

- 列表项用于首页与 `/diary` 的统一记录卡片展示。
- 每项至少包含：
  - `entryDate`
  - `measuredAt`
  - `weightKg`
  - `deltaFromPreviousKg`
  - `syncStatus`

### 6.2 GET /api/v1/weights/entries/:entryId

- 本接口扩展为“报告详情页”数据源。
- 除基础记录字段外，返回：
  - `previousMeasuredAt`
  - `bmi`
  - `bmiLevel`
  - `estimatedBodyFatPct`
  - `bodyFatLevel`
  - `weightLevel`
  - `syncStatus`
  - `ranges`

说明：
- `ranges` 用于前端绘制体重、体脂、BMI 的区间轴。
- 评级口径采用中国常用标准。
- `estimatedBodyFatPct` 为估算值，不代表真实体脂测量结果。

### 6.3 GET /api/v1/diary/entries

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "entries": [
      {
        "id": "12",
        "preview": "今天的体重和状态都记录下来了",
        "createdAt": "2026-03-15T07:15:00.000Z",
        "updatedAt": "2026-03-15T07:15:00.000Z",
        "wordCount": 14
      }
    ]
  },
  "traceId": "9d0d5bc0-bf27-41af-9e53-0ef899ea42fb"
}
```

### 6.4 GET /api/v1/diary/entries/:entryId

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "id": "12",
    "contentHtml": "<p>今天的体重和状态都记录下来了</p>",
    "plainText": "今天的体重和状态都记录下来了",
    "createdAt": "2026-03-15T07:15:00.000Z",
    "updatedAt": "2026-03-15T07:15:00.000Z",
    "wordCount": 14
  },
  "traceId": "a3c539cf-17cf-414f-8710-55c066a53c48"
}
```

### 6.5 POST /api/v1/diary/entries

```json
{
  "contentHtml": "<p>今天的体重和状态都记录下来了</p>",
  "plainText": "今天的体重和状态都记录下来了"
}
```

### 6.6 PUT /api/v1/diary/entries/:entryId

```json
{
  "contentHtml": "<p>今天状态更稳了一点，晚点复盘。</p>",
  "plainText": "今天状态更稳了一点，晚点复盘。"
}
```

说明：
- 日记摘要 `preview` 由服务端根据 `plainText` 截断生成。
- 富文本编辑页使用 `contentHtml` 回显正文。
- 游客写入的 diary 数据在绑定正式账号时需要迁移到正式账号。
