# RQ-003 Frontend Design - Record Center

owner: engineering
requirement_id: rq-003-record-center
prd_ref: docs/product/prd/2026-03-13-prd-v2.md
product_design_refs:
- docs/product/design/2026-03-13-user-journey-and-ia.md
- docs/product/design/2026-03-13-theme-and-voice.md
backend_design_ref: docs/tech/design/requirements/rq-003-record-center/2026-03-13-rq-003-record-center-backend-design.md
api_contract_ref: docs/api/contracts/2026-03-13-api-v2-contracts.md
status: draft
ac_refs: AC-06, AC-07

## 1. 需求范围

- 记录中心首页 `/checkins`
- 体重与运动主记录页
- 饮食与睡眠辅助记录页

Out of scope:
- 复杂图表编辑器
- AI 饮食诊断页

## 2. 页面与路由设计

- `/checkins`
- `/checkins/weight`
- `/checkins/activity`
- `/checkins/meal`
- `/checkins/sleep`

页面职责：
- `/checkins` 首屏只展示今日体重、今日运动、最近 7 天体重、最近 7 天运动
- 饮食和睡眠收纳到“辅助信息”区块，不进入记录页首屏主视觉

## 3. 数据流设计

- 记录中心加载 `GET /api/v1/checkins/today`、`GET /api/v1/checkins/history?type=weight`、`GET /api/v1/checkins/history?type=activity`
- 主记录页写入后失效首页和进度页查询
- 辅助记录页写入后仅刷新对应 feed，不触发首页主 CTA 变化
- 共享类型：`CheckinFeedItem`, `ActivityCheckinPayload`

## 4. 接口契约映射

- `POST /api/v1/checkins/weight`
- `POST /api/v1/checkins/activity`
- `POST /api/v1/checkins/meal`
- `POST /api/v1/checkins/sleep`
- `GET /api/v1/checkins/today`
- `GET /api/v1/checkins/history`

DTO -> UI Model：
- `displayValue` -> 列表摘要文本
- `isBackfill` -> 补录标记
- `completed` + `durationMin` + `estimatedKcal` -> 运动状态卡文案

错误态映射：
- `DUPLICATE_CHECKIN` -> 顶部冲突提示
- `CHECKIN_LIMIT_REACHED` -> 体重页单日上限提示
- `CHECKIN_RATE_LIMIT` -> 提交按钮冷却

## 5. 交互与状态

- 体重和运动页是主记录入口，文案需要明确“已同步到首页 / 进度”
- 运动表单优先字段：是否完成、时长、消耗热量；活动类型和步数为可选
- 饮食和睡眠页文案必须明确“这是辅助记录，不影响首页主任务” 
- 主记录成功后默认引导回首页；辅助记录成功后停留在当前页即可

## 6. 埋点设计

- `record_center_view`
- `checkin_submit`
- `checkin_submit_success`
- `checkin_backfill_selected`
- `record_auxiliary_entry_click`

公共属性：`checkin_type`, `is_backfill`, `from_path`, `completed`

## 7. 测试方案

- Component tests：记录中心摘要卡、补录标记、运动表单 completed 分支
- Page flow tests：体重提交 -> 首页更新；运动提交 -> 进度更新；辅助记录保持可访问
- Contract mock tests：`displayValue`, `completed`, `estimatedKcal` 映射

## 8. 开发任务拆解

- FE-3.1 新增 `/checkins` 记录中心入口
- FE-3.2 收敛主记录文案为体重 / 运动双核心
- FE-3.3 调整辅助记录为次级入口
- FE-3.4 补记录成功后的首页 / 进度回流验证
