# RQ-005 Frontend Design - Progress & Insight

owner: engineering
requirement_id: rq-005-progress-insight
prd_ref: docs/product/prd/2026-03-13-prd-v2.md
product_design_refs:
- docs/product/design/2026-03-13-user-journey-and-ia.md
- docs/product/design/2026-03-13-theme-and-voice.md
backend_design_ref: docs/tech/design/requirements/rq-005-progress-insight/2026-03-13-rq-005-progress-insight-backend-design.md
api_contract_ref: docs/api/contracts/2026-03-13-api-v2-contracts.md
status: draft
ac_refs: AC-11, AC-12

## 1. 需求范围

- `/trend` 进度页
- 7 日 / 30 日切换
- 周报摘要与会员深度洞察提示

Out of scope:
- 多图表自由组合
- 饮食 / 睡眠首屏分析

## 2. 页面与路由设计

- `/trend`

页面结构：
1. 范围切换（7 日 / 30 日）
2. 体重变化 / 运动执行率 / 总消耗三张摘要卡
3. 体重趋势列表
4. 当前里程碑 + AI 周回顾
5. 会员锁定提示

## 3. 数据流设计

- 页面进入请求 `GET /api/v1/progress/weekly` 与 `GET /api/v1/progress/weekly-report`
- 切换范围时请求对应的 `weekly` 或 `monthly`
- 不单独请求饮食 / 睡眠进度数据
- 周报锁定区块通过 `lockedSections` 和 `membershipPrompt` 渲染，不阻断基础摘要

## 4. 接口契约映射

- `GET /api/v1/progress/weekly`
- `GET /api/v1/progress/monthly`
- `GET /api/v1/progress/weekly-report`

DTO -> UI Model：
- `weightTrendPoints` -> 体重趋势列表 / 图表数据
- `exerciseCompletionRate` -> 执行率卡
- `burnKcalTotal` -> 总消耗卡
- `milestone` -> 里程碑卡
- `lockedSections` -> 锁定标签

错误态映射：
- `SUBSCRIPTION_REQUIRED` -> 仅在深度区块点击后展示权益说明
- `STATS_RATE_LIMIT` -> 保留当前数据并提示稍后刷新
- `INTERNAL_ERROR` -> 降级为基础说明卡 + 返回首页 CTA

## 5. 交互与状态

- loading：摘要卡和趋势区域骨架屏
- empty：提示“先连续记录几天体重和运动，再回来查看变化”
- success：突出趋势和解释，不夸大单日波动
- error：提供回首页或去记录的 CTA

交互规则：
- 进度页首屏不得出现饮食和睡眠主指标
- 会员提示只出现在用户已经看到基础价值之后
- 页面需要保留返回首页和继续记录的自然回流点

## 6. 埋点设计

- `progress_view`
- `progress_range_switch`
- `weekly_report_view`
- `deep_insight_click`
- `deep_insight_paywall_view`

公共属性：`range`, `has_data`, `membership_plan`, `locked_section_count`

## 7. 测试方案

- Component tests：摘要卡、里程碑卡、锁定提示
- Page flow tests：7 日 / 30 日切换；周报查看；深度洞察提示
- Contract mock tests：`weightTrendPoints`, `milestone`, `lockedSections` 映射

## 8. 开发任务拆解

- FE-5.1 重写趋势页为体重 + 运动双核心洞察
- FE-5.2 接入 weekly / monthly / report 查询
- FE-5.3 补会员锁定提示与回流 CTA
- FE-5.4 补趋势页埋点与回归测试
