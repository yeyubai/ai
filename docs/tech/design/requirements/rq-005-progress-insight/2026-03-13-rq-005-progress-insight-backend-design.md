# RQ-005 Backend Design - Progress & Insight

owner: engineering
requirement_id: rq-005-progress-insight
prd_ref: docs/product/prd/2026-03-13-prd-v2.md
product_design_refs:
- docs/product/design/2026-03-13-user-journey-and-ia.md
- docs/product/design/2026-03-13-theme-and-voice.md
api_contract_ref: docs/api/contracts/2026-03-13-api-v2-contracts.md
api_errors_ref: docs/api/errors/2026-03-13-api-v2-error-codes.md
status: draft
ac_refs: AC-11, AC-12

## 1. 需求范围

- 7 日 / 30 日进度接口
- 周报摘要接口
- 免费 / 会员洞察边界

Out of scope:
- 医疗级数据解读
- 饮食和睡眠首屏进度指标

## 2. 接口设计

- `GET /api/v1/progress/weekly`
- `GET /api/v1/progress/monthly`
- `GET /api/v1/progress/weekly-report`
  - 免费用户返回摘要 + `lockedSections`
  - 会员权益信息通过 `membershipPrompt` 与 `lockedSections` 表示
  - MVP 不新增 `directionSummary` 字段，首屏“我是否在朝目标前进”由前端根据现有指标派生

## 3. 数据来源与模型

- 主数据源：`checkins_weight`, `checkins_activity`
- `weightTrendPoints` 由日期序列和最近体重记录实时聚合得到
- `exerciseCompletionRate`, `burnKcalTotal`, `exerciseDays`, `weighInDays` 由活动 / 体重记录直接计算
- 周报摘要结合 `JourneyStateService.memberships` 判断是否锁定深度区块
- MVP 不新增 progress snapshot 表，优先保持口径简单可信

## 4. 业务规则

- 进度首屏只展示体重趋势、运动执行率、总消耗、里程碑
- “方向判断”结论必须能由 `weightTrendPoints`、`exerciseCompletionRate`、`exerciseDays`、`weighInDays` 稳定推导
- 缺失体重点必须标记为 `isMissing=true`
- 周报摘要重点解释：本周体重变化、运动执行稳定度、下周建议动作
- 饮食和睡眠不得进入进度页首屏主指标
- 免费用户可看摘要，深度区块以 `lockedSections` 标识

## 5. 非功能要求

- weekly/monthly 接口 p95 <= 800ms
- weekly-report 接口 p95 <= 1200ms
- 指标口径变更必须同步更新 PRD、API 和前端映射

## 6. 测试方案

- Unit：趋势缺失点、执行率、总消耗、里程碑计算、方向判断可推导性
- Integration：体重 / 运动补录后周视图与月视图重算
- Contract：`weightTrendPoints`, `exerciseCompletionRate`, `burnKcalTotal`, `lockedSections` 稳定

## 7. 开发任务拆解

- BE-5.1 基于体重 / 运动聚合 weekly/monthly
- BE-5.2 输出周报摘要和锁定区块
- BE-5.3 对齐免费 / 会员洞察边界
- BE-5.4 补趋势计算与周报监控

## 8. 风险与回滚

- 风险：指标定义漂移会降低用户对趋势的信任
- 处理：维持少而稳定的指标集，不叠加过多解释字段
- 回滚：深度洞察关闭时仍保留基础 weekly-report 摘要
