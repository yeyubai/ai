# RQ-007 Backend Design - App Shell Tab 栏

owner: backend
requirement_id: rq-007-app-shell-tabbar
prd_ref: docs/product/prd/2026-03-12-prd.md
status: draft

## 1. 需求范围

- 支撑 H5 全局底部 Tab 导航在登录态页面常驻显示。
- 统一 Tab 事件埋点字段约定，供前端上报与数据侧消费。
- 保持现有业务 API 不变。

Out of scope:
- 新增业务接口。
- 导航权限中心与动态下发配置。

## 2. 接口设计

- 无新增后端业务 API。

埋点契约（事件层）：
- `tab_impression`
- `tab_click`

建议字段：
- `tab_key`: `home|checkins|trend|me`
- `from_path`: string
- `to_path`: string
- `is_active_reclick`: boolean
- `event_time`: ISO8601

## 3. 数据模型设计

- 无新增业务表。
- 若接入事件仓，沿用既有 `event_logs` 结构记录新增事件名。

迁移策略与回滚：
- 不涉及数据库迁移。
- 回滚为前端关闭 Tab 埋点上报。

## 4. 业务规则

- 登录态页面显示 Tab，未登录与引导页隐藏。
- 二级页面按前缀归属高亮：
- `/coach/*` -> 首页
- `/checkins/*` -> 打卡
- `/trend*` -> 趋势
- `/settings/*` -> 我的

幂等与并发：
- 事件上报允许重复，数据侧按 `user_id + event_time` 去重。

频控/限流：
- 无新增服务端限流策略。

## 5. 非功能要求

- 无新增 API 性能目标。
- 事件字段需可被现有分析链路解析。
- 不影响现有鉴权与业务接口稳定性。

## 6. 测试方案

- Unit:
- 事件字段合法性校验（若后端接入校验器）。

- Integration:
- 无新增服务链路集成测试。

- Contract:
- 与前端对齐 `tab_impression/tab_click` 字段契约。

## 7. 开发任务拆解

- BE-7.1 审核并确认埋点字段字典
- BE-7.2 数据分析链路登记新增事件名
- BE-7.3 契约评审记录与验收

## 8. 风险与回滚

- 风险：字段口径不统一导致统计误差。
- 风险缓解：在 API/埋点文档中固定字段定义并评审。
- 回滚：临时停用 Tab 事件消费，保留事件原始记录。
