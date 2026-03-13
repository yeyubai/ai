# RQ-002 Frontend Design - Home Daily Loop

owner: engineering
requirement_id: rq-002-home-daily-loop
prd_ref: docs/product/prd/2026-03-13-prd-v2.md
product_design_refs:
- docs/product/design/2026-03-13-user-journey-and-ia.md
- docs/product/design/2026-03-13-theme-and-voice.md
backend_design_ref: docs/tech/design/requirements/rq-002-home-daily-loop/2026-03-13-rq-002-home-daily-loop-backend-design.md
api_contract_ref: docs/api/contracts/2026-03-13-api-v2-contracts.md
status: draft
ac_refs: AC-03, AC-04, AC-05

## 1. 需求范围

- 登录后统一 App Shell 与底部 Tab
- `/dashboard` 首页首屏与 `/coach/plan` 说明页
- 首页双核心 CTA、follow-up 与恢复模式表达

Out of scope:
- 首页聊天式交互
- 首页第二主 CTA
- 独立会员说明卡常驻首屏

## 2. 页面与路由设计

- `/dashboard`
- `/coach/plan`
- 登录后共享底部 Tab：`首页 / 记录 / 进度 / 我的`

首页固定块顺序：
1. `今日下一步` hero
2. `体重状态 + 本周变化 + 连续执行`
3. `体重记录卡 + 运动记录卡`
4. `完成今天后怎么继续`

## 3. 数据流设计

- 进入首页请求 `GET /api/v1/home/today`
- 次级说明页同样读取 `home/today`，不再单独请求旧计划接口
- 点击动作后跳转到对应记录页或复盘页，不在首页展示“手动刷新”按钮
- 记录或复盘成功后，通过路由回流 + query refresh 更新首页
- 共享类型：`HomeTodayResult`, `TabItem`

## 4. 接口契约映射

- `GET /api/v1/home/today`
- `POST /api/v1/home/actions/{actionId}/complete`

DTO -> UI Model：
- `nextAction` -> hero 主 CTA
- `weightStatus` -> 体重状态卡
- `activityStatus` -> 运动状态卡
- `followUp` -> 页底 follow-up 卡
- `recoveryMode` + `fallbackReason` -> 恢复提示条

错误态映射：
- `PLAN_FALLBACK_USED` -> 按成功态展示，并渲染恢复说明
- `AUTH_EXPIRED` -> 清理会话并回登录页
- `INTERNAL_ERROR` -> 使用最小首页模板，引导先做体重记录

## 5. 交互与状态

- loading：首页骨架屏
- empty：禁止真实空白，统一使用“先记录今天体重”占位
- success：只突出一个 `nextAction`
- error：保留主 CTA，不把用户留在解释页里

交互规则：
- 首页首屏文案必须是用户能理解的话，不使用“闭环”“单首页”等内部术语
- 首页不展示饮食和睡眠入口
- 二级页完成动作后默认回到首页
- Tab 在登录后页面常驻显示，并适配底部安全区

## 6. 埋点设计

- `home_view`
- `home_next_action_click`
- `home_follow_up_click`
- `home_recovery_banner_view`
- `tab_impression`
- `tab_click`

公共属性：`tab_key`, `from_path`, `to_path`, `is_recovery_mode`, `membership_plan`

## 7. 测试方案

- Component tests：hero CTA、体重卡、运动卡、恢复提示条
- Page flow tests：首页 -> 记录页 -> 返回首页；首页 -> 复盘页 -> 返回首页
- Contract mock tests：`weightStatus`, `activityStatus`, `followUp`, `PLAN_FALLBACK_USED` 映射

## 8. 开发任务拆解

- FE-2.1 重构首页为四块结构
- FE-2.2 接入首页 today query 与路由映射
- FE-2.3 清理内部术语和无意义刷新入口
- FE-2.4 补首页埋点与恢复模式回归测试
