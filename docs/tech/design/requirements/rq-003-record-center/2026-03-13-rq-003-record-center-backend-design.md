# RQ-003 Backend Design - Record Center

owner: engineering
requirement_id: rq-003-record-center
prd_ref: docs/product/prd/2026-03-13-prd-v2.md
product_design_refs:
- docs/product/design/2026-03-13-user-journey-and-ia.md
- docs/product/design/2026-03-13-theme-and-voice.md
api_contract_ref: docs/api/contracts/2026-03-13-api-v2-contracts.md
api_errors_ref: docs/api/errors/2026-03-13-api-v2-error-codes.md
status: draft
ac_refs: AC-06, AC-07

## 1. 需求范围

- 体重主记录 `POST /checkins/weight`
- 运动主记录 `POST /checkins/activity`
- 饮食 / 睡眠兼容记录接口保留，但降级为辅助输入
- 今日记录列表与历史记录查询

Out of scope:
- 图像识别与自动营养估算
- 第三方运动平台同步

## 2. 接口设计

- `POST /api/v1/checkins/weight`
- `POST /api/v1/checkins/activity`
- `POST /api/v1/checkins/meal`
- `POST /api/v1/checkins/sleep`
- `GET /api/v1/checkins/today`
- `GET /api/v1/checkins/history`

主接口要求：
- 体重接口支持 `checkinDate`, `measuredAt`, `weightKg`, `source`, `isBackfill`
- 运动接口支持 `checkinDate`, `completed`, `durationMin`, `estimatedKcal`, `activityType?`, `steps?`, `isBackfill`
- 历史查询支持按 `type`、日期范围和分页筛选

## 3. 数据模型设计

- `checkins_weight`
  - 单日最多保留 1 条有效主记录
- `checkins_activity`
  - 核心字段：`completed`, `duration_min`, `estimated_kcal`, `activity_type`, `steps`, `is_backfill`
  - `completed=false` 时允许 `durationMin=0`, `estimatedKcal=0`
- `checkins_meal`, `checkins_sleep`
  - 继续保留，作为辅助记录兼容能力
- MVP 通过写后重读更新首页和进度，不引入 outbox

## 4. 业务规则

- 首页和记录中心的主入口只能指向体重和运动
- 饮食、睡眠不得阻断体重 / 运动 / 复盘主链路
- 补录窗口固定为最近 7 天
- 体重单日超过 1 条返回 `CHECKIN_LIMIT_REACHED`
- 重复提交返回 `DUPLICATE_CHECKIN`
- 写接口必须支持幂等 key
- 记录成功后首页和进度页通过重新拉取在 2 秒内可见更新
- 主记录接口不额外增加“回跳地址”字段；前端默认按主链路回首页

## 5. 非功能要求

- 体重 / 运动写接口 p95 <= 400ms
- `GET /checkins/today` p95 <= 300ms
- 所有记录写入需要 traceId，便于排查重复提交和同步延迟

## 6. 测试方案

- Unit：补录时间窗、运动 `completed=false` 归一化、体重上限校验
- Integration：体重写入 -> 首页切换到运动；运动写入 -> 进度页消耗更新；主记录成功后前端默认回首页
- Contract：`displayValue`, `isBackfill`, `completed` 字段稳定

## 7. 开发任务拆解

- BE-3.1 为 `checkins_activity` 增补 `completed`
- BE-3.2 收敛主记录模型为体重 / 运动优先
- BE-3.3 提供记录中心 today/history 查询
- BE-3.4 校验主记录成功后的首页 / 进度同步

## 8. 风险与回滚

- 风险：旧活动数据没有 `completed` 字段
- 处理：数据库迁移默认回填 `completed=1`
- 回滚：若新字段未上线，前端仍可按已完成运动默认值兼容渲染
