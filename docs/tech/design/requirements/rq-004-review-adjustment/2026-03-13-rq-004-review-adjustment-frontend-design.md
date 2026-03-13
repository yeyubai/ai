# RQ-004 Frontend Design - Review & Adjustment

owner: engineering
requirement_id: rq-004-review-adjustment
prd_ref: docs/product/prd/2026-03-13-prd-v2.md
product_design_refs:
- docs/product/design/2026-03-13-user-journey-and-ia.md
- docs/product/design/2026-03-13-theme-and-voice.md
backend_design_ref: docs/tech/design/requirements/rq-004-review-adjustment/2026-03-13-rq-004-review-adjustment-backend-design.md
api_contract_ref: docs/api/contracts/2026-03-13-api-v2-contracts.md
status: draft
ac_refs: AC-08, AC-09, AC-10

## 1. 需求范围

- `/coach/review` 复盘页
- 首页 follow-up 到复盘页的承接
- 恢复模式和 `REVIEW_NOT_READY` 的前端表达

Out of scope:
- 聊天式问答界面
- 社交分享卡片

## 2. 页面与路由设计

- `/coach/review`
- 首页中的 follow-up 卡属于首页模块，不拆成主导航

页面块：
1. 复盘准备态判断
2. 今天的体重 / 运动状态摘要
3. 手动触发“生成今晚调整”
4. 执行分数与明日重点
5. 返回首页 / 看本周变化

## 3. 数据流设计

- 进入复盘页后先读取 `GET /api/v1/home/today` 判断今天是否已具备复盘条件
- 用户点击“生成今晚调整”后再调用 `POST /api/v1/review/evening`
- 用户主动跳过时调用 `POST /api/v1/review/skip`
- 复盘成功后返回首页时刷新 `home/today`
- `PLAN_FALLBACK_USED` 视为成功态，不展示错误弹窗

## 4. 接口契约映射

- `POST /api/v1/review/evening`
- `POST /api/v1/review/skip`

DTO -> UI Model：
- `weightStatus` + `activityStatus` -> 复盘准备态与今日摘要
- `reviewSummary.score` -> 分数卡
- `reviewSummary.highlights` -> 正向反馈列表
- `reviewSummary.gaps` -> 明日补位列表
- `tomorrowPreview.focus` -> 次日动作列表
- `recoveryMode` + `fallbackReason` -> 恢复说明条

错误态映射：
- `REVIEW_NOT_READY` -> 引导先完成体重或运动记录
- `PLAN_FALLBACK_USED` -> 展示“先恢复节奏”提示
- `AUTH_EXPIRED` -> 清理会话并回登录页

## 5. 交互与状态

- loading：复盘准备态骨架屏
- ready：展示手动生成入口
- success：突出“明天只关注这几件事”
- error：提供回首页去记录的 CTA

交互规则：
- 所有文案都以恢复型表达为主，不用惩罚式语气
- 复盘页不再出现复杂说明卡或第二主流程 CTA
- 不允许一进入页面就自动开始 AI 生成，必须先判断是否 ready
- 主 CTA 优先回首页，其次看本周变化

## 6. 埋点设计

- `review_view`
- `review_generate_success`
- `review_generate_fallback`
- `review_not_ready_view`
- `review_back_home_click`

公共属性：`trigger_source`, `is_recovery_mode`, `fallback_reason`, `confidence_bucket`

## 7. 测试方案

- Component tests：准备态卡、恢复说明条、分数卡、明日动作列表
- Page flow tests：首页进入复盘 -> ready 判断 -> 手动生成结果 -> 返回首页；not-ready -> 去记录
- Contract mock tests：`weightStatus`, `activityStatus`, `reviewSummary`, `tomorrowPreview`, `PLAN_FALLBACK_USED` 映射

## 8. 开发任务拆解

- FE-4.1 实现复盘页“先判断、再生成”
- FE-4.2 完成 not-ready 与 fallback 表达
- FE-4.3 接首页 follow-up 和返回首页回流
- FE-4.4 补充复盘页埋点与回归测试
