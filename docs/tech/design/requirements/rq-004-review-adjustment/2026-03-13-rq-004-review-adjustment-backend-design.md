# RQ-004 Backend Design - Review & Adjustment

owner: engineering
requirement_id: rq-004-review-adjustment
prd_ref: docs/product/prd/2026-03-13-prd-v2.md
product_design_refs:
- docs/product/design/2026-03-13-user-journey-and-ia.md
- docs/product/design/2026-03-13-theme-and-voice.md
api_contract_ref: docs/api/contracts/2026-03-13-api-v2-contracts.md
api_errors_ref: docs/api/errors/2026-03-13-api-v2-error-codes.md
status: draft
ac_refs: AC-08, AC-09, AC-10

## 1. 需求范围

- 晚间调整接口 `POST /review/evening`
- 跳过接口 `POST /review/skip`
- 恢复模式与次日预览输出

Out of scope:
- 长对话 AI 会话
- 医疗风险诊断

## 2. 接口设计

- `POST /api/v1/review/evening`
  - 输入：`date`, `timezone`, `triggerSource`
  - 输出：`reviewSummary`, `tomorrowPreview`, `recoveryMode`, `fallbackReason`, `confidence`
  - 错误码：`REVIEW_NOT_READY`, `REVIEW_RATE_LIMIT`, `PLAN_FALLBACK_USED`
  - 调用前置条件由前端通过 `GET /api/v1/home/today` 判断；MVP 不新增独立 ready-check 接口
- `POST /api/v1/review/skip`
  - 输入：`date`, `reason`
  - 输出：`skipped`, `reason`

## 3. 数据来源与模型

- 输入主数据：`checkins_weight`, `checkins_activity`
- 运行时状态：`JourneyStateService.reviews` 与恢复模式判定逻辑
- MVP 的 AI 调整以规则模板和结构化输出为主，不依赖饮食 / 睡眠作为主输入

## 4. 业务规则

- 当天只要完成了体重或运动任一核心动作，就允许生成复盘
- 当天体重和运动都缺失时返回 `REVIEW_NOT_READY`
- `REVIEW_NOT_READY` 应发生在用户主动点击生成之后，而不是页面首屏自动请求阶段
- 连续 2 天未称重或连续 2 天未完成运动时进入 `recoveryMode`
- 恢复模式下 `tomorrowPreview.maxTasks` 降为 2，并优先给低门槛动作
- `reviewSummary.highlights`、`gaps`、`tomorrowPreview.focus` 必须是可执行短句
- 输出不得包含羞耻式表达、惩罚式话术和医疗诊断结论
- 饮食 / 睡眠存在时只允许增强解释，不允许改变主任务优先级

## 5. 非功能要求

- 复盘接口 p95 <= 4s
- 结构化通过率 >= 99%
- fallback 与恢复模式事件必须可追踪

## 6. 测试方案

- Unit：数据不足校验、恢复模式阈值、次日任务数量降级
- Integration：今日仅体重 -> 可复盘；今日无核心动作 -> `REVIEW_NOT_READY`；前端先看 `home/today` 再触发生成
- Contract：`recoveryMode`, `fallbackReason`, `confidence`, `tomorrowPreview` 字段稳定

## 7. 开发任务拆解

- BE-4.1 固定 review 输出结构
- BE-4.2 以体重 + 运动完成 + 消耗为主输入重写调整逻辑
- BE-4.3 实现跳过与恢复状态记录
- BE-4.4 补充 fallback 和 review latency 监控

## 8. 风险与回滚

- 风险：用户把复盘理解成复杂 AI 分析，导致期待落差
- 处理：始终输出短句、动作导向结果
- 回滚：即使关闭 AI 生成，也保留规则版复盘模板
