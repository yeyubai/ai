# RQ-007 Frontend Design - App Shell Tab 栏

owner: frontend
requirement_id: rq-007-app-shell-tabbar
prd_ref: docs/product/prd/2026-03-12-prd.md
backend_design_ref: docs/tech/design/requirements/rq-007-app-shell-tabbar/2026-03-13-rq-007-app-shell-tabbar-backend-design.md
status: draft

## 1. 需求范围

- 增加登录后全局 App Shell（底部 Tab 常驻）。
- Tab 信息架构固定为：首页/打卡/趋势/我的。
- 未登录与引导页隐藏 Tab，登录后页面显示 Tab（含二级页）。

Out of scope:
- 动态 Tab 配置下发。
- 后端导航接口。

## 2. 页面与路由设计

Tab 路由映射：
- 首页：`/dashboard`
- 打卡：`/checkins/weight`
- 趋势：`/trend`
- 我的：`/settings/preferences`（当前落地与 `/settings/profile` 兼容）

二级页高亮归属：
- `/coach/*` -> 首页
- `/checkins/*` -> 打卡
- `/trend*` -> 趋势
- `/settings/*` -> 我的

## 3. 数据流设计

- App Shell 使用 `pathname + token` 决定 Tab 显隐。
- `token` 来自 `auth store`，`pathname` 来自路由层。
- Tab 点击触发导航并上报埋点。

## 4. 接口契约映射

- 无新增后端 API 调用。
- 新增前端导航配置类型：
- `TabItem`: `key`, `label`, `icon`, `href`, `matchPrefixes`

埋点事件：
- `tab_impression`
- `tab_click`

## 5. 交互与状态

- Tab 规格：24px 线性图标 + 文案。
- 触达区域：不小于 44x44。
- 激活态：主色高亮，`aria-current=page`。
- Safe Area：底部增加 `env(safe-area-inset-bottom)` 留白。

显隐规则：
- 隐藏：`/auth/*`, `/onboarding/*`
- 显示：其余登录态页面

## 6. 埋点设计

- `tab_impression`
- `tab_click`

字段：
- `tab_key`: `home|checkins|trend|me`
- `from_path`
- `to_path`
- `is_active_reclick`

## 7. 测试方案

- Component tests:
- Tab 高亮与点击态
- Safe Area 样式与激活态样式

- Page flow tests:
- 登录后页面显示 Tab
- 登录/引导页隐藏 Tab
- 二级页归属高亮正确

- Contract mock tests:
- 埋点事件字段完整性
- `tab_click` 参数正确

## 8. 开发任务拆解

- FE-7.1 App Shell 与 BottomTabBar 组件实现
- FE-7.2 Tab 配置类型与路由归属匹配实现
- FE-7.3 `/trend` 与 `/settings/preferences` 路由补齐
- FE-7.4 Tab 埋点接入
- FE-7.5 导航体验回归测试
