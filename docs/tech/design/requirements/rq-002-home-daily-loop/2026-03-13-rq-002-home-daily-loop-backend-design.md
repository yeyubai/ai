# RQ-002 Backend Design - Home Daily Loop

owner: engineering
requirement_id: rq-002-home-daily-loop
prd_ref: docs/product/prd/2026-03-13-prd-v2.md
product_design_refs:
- docs/product/design/2026-03-13-user-journey-and-ia.md
- docs/product/design/2026-03-13-theme-and-voice.md
api_contract_ref: docs/api/contracts/2026-03-13-api-v2-contracts.md
api_errors_ref: docs/api/errors/2026-03-13-api-v2-error-codes.md
status: draft
ac_refs: AC-03, AC-04, AC-05

## 1. 需求范围

- 首页聚合接口 `GET /api/v1/home/today`
- 首页动作回写接口 `POST /api/v1/home/actions/{actionId}/complete`
- 首页只围绕 `体重记录 / 运动完成 / 晚间复盘` 三个动作组织

Out of scope:
- 长文本计划管理
- 独立会员卡编排系统
- 饮食、睡眠驱动首页主任务优先级

## 2. 接口设计

- `GET /api/v1/home/today`
  - 输出：`date`, `dailyMission`, `completion`, `weightStatus`, `activityStatus`, `nextAction`, `followUp`, `membershipState`, `riskFlags`, `recoveryMode`, `fallbackReason`
  - `dailyMission.actionId` 仅允许：`weight_checkin`, `activity_complete`, `evening_review`
  - 允许返回成功码 `PLAN_FALLBACK_USED`
- `POST /api/v1/home/actions/{actionId}/complete`
  - 输入：`completedAt`
  - 输出：`actionId`, `status`, `refreshHome`

## 3. 数据来源与模型

- 持久化数据：`user_profiles`, `checkins_weight`, `checkins_activity`
- 运行时状态：`JourneyStateService` 中的 `profileExtras`, `memberships`, `completedActions`, `reviews`
- MVP 不新增首页快照表；首页通过实时聚合 + 前端 query refresh 完成状态同步

## 4. 业务规则

- 首页必须始终给出且只给出一个 `nextAction`
- `nextAction` 优先级固定为：
  1. 今日未称重 -> `weight_checkin`
  2. 今日未完成运动 -> `activity_complete`
  3. 其余情况 -> `evening_review`
- `weightStatus` 负责展示当前体重、今日是否称重、本周变化、目标体重
- `activityStatus` 负责展示今日是否完成、时长、消耗、目标时长、目标消耗、近 7 天运动天数
- 连续 2 天未称重或连续 2 天未完成运动时进入 `recoveryMode`
- 饮食和睡眠不得改变 `nextAction` 的优先级，只允许作为解释增强输入
- 首页不得返回空主状态；无历史数据时默认引导先做首次体重记录
- Tab 显隐与高亮由前端负责，后端不下发导航配置

## 5. 非功能要求

- `GET /api/v1/home/today` p95 <= 1200ms
- 聚合失败时必须降级为可执行的最小任务模板，而不是直接 500
- 降级返回必须带 `fallbackReason` 并可通过 `traceId` 追踪

## 6. 测试方案

- Unit：`nextAction` 优先级、恢复模式判定、fallback 触发条件
- Integration：体重记录后首页切换到运动；运动记录后首页 follow-up 指向复盘或趋势
- Contract：`weightStatus`, `activityStatus`, `followUp`, `PLAN_FALLBACK_USED` 字段稳定

## 7. 开发任务拆解

- BE-2.1 统一首页聚合 DTO
- BE-2.2 接入体重 / 运动 / 复盘 / 会员状态聚合
- BE-2.3 实现首页动作回写
- BE-2.4 补充恢复模式和 fallback 监控

## 8. 风险与回滚

- 风险：首页聚合依赖多数据源，容易出现首屏抖动
- 处理：缺一类数据时优先返回最小动作模板，避免首页空白
- 回滚：前端可暂时仅依赖体重与运动完成度渲染首页主 CTA
