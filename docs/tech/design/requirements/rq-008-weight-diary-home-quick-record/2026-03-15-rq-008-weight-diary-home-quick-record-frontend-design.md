# RQ-008 Frontend Design - 首页快捷记录体重

owner: frontend
requirement_id: rq-008-weight-diary-home-quick-record
prd_ref: docs/product/prd/2026-03-13-prd-v2.md
backend_design_ref: docs/tech/design/requirements/rq-008-weight-diary-home-quick-record/2026-03-15-rq-008-weight-diary-home-quick-record-backend-design.md
status: draft

## 1. 需求范围

- 首页右下角悬浮按钮打开“记录体重”底部弹层。
- 弹层使用数字键盘式输入，支持当天体重的快速录入与保存。
- 保存前前端校验、保存中状态、错误提示、成功关闭与首页原地刷新需要完整闭环。

Out of scope:
- `/weight/new` 完整表单页改版。
- 历史记录列表卡片与详情页结构改版。
- 体脂、备注等扩展输入回填到首页快捷弹层。

## 2. 页面与路由设计

涉及页面：
- `/home`

页面层组件：
- `HomeOverviewSection`

模块层交互：
- 右下角悬浮按钮打开底部 `Dialog`
- 弹层头部展示标题、日期与关闭按钮
- 主区域展示当前输入值、单位、说明文案与错误提示
- 底部按钮执行“记录”

## 3. 数据流设计

- 页面初始化加载：
- `fetchTodaySummary()`
- `fetchSettings()`
- `fetchWeightEntries()`

- 快捷记录提交流：
1. 用户点按数字键盘更新本地 `weightKg`
2. 点击“记录”时执行本地校验
3. 校验通过后调用 `createWeightEntry`
4. 成功后刷新 `today-summary + entries`
5. 刷新成功后关闭弹层、清空输入与局部错误

状态归属：
- 页面级错误：首页首屏加载失败
- 弹层级错误：快捷记录输入非法、保存失败
- `isSubmitting` 仅归属快捷记录按钮

## 4. 接口契约映射

使用接口：
- `POST /api/v1/weights/entries`
- `GET /api/v1/weights/today-summary`
- `GET /api/v1/weights/entries`

请求字段映射：
- `entryDate` -> 当前上海时区当天日期
- `measuredAt` -> 用户点击提交时的上海时区时刻
- `weightKg` -> 数字键盘输入结果

错误态映射：
- 空输入 -> `请输入今天的体重`
- 范围错误 -> `体重需在 20-300kg 之间`
- `INVALID_PARAMS` -> `体重需在 20-300kg 之间`
- 其他失败 -> `保存失败，请稍后重试`

## 5. 交互与状态

- loading:
- 首页骨架屏与当前实现保持一致

- success:
- 按钮进入 `记录中...`
- 请求成功后弹层关闭
- 首页当日记录卡和历史列表原地刷新

- error:
- 错误提示显示在弹层内部，不能只出现在页面顶部
- 错误出现时弹层保持打开，方便用户继续修正

表单校验与提交：
- 仅允许最多 3 位整数 + 2 位小数
- `.` 只能输入一次
- 输入为空时不可直接发请求
- `weightKg` 超出 `20-300kg` 时不可发请求

重试策略：
- 用户修正输入或重新打开弹层时清除上一次弹层错误

## 6. 埋点设计

- `weight_quick_record_open`
- `weight_quick_record_submit`
- `weight_quick_record_success`
- `weight_quick_record_error`

字段：
- `entry_date`
- `input_length`
- `has_decimal`
- `error_code`

## 7. 测试方案

- Component tests:
- 数字键盘输入、删除、小数限制
- 空输入与范围错误提示
- 成功后关闭弹层并清空输入

- Page flow tests:
- 首页打开弹层 -> 输入合法体重 -> 保存成功 -> 当日记录回显
- 首页打开弹层 -> 输入 `1` -> 阻止提交并提示范围错误
- 首页打开弹层 -> 网络失败 -> 弹层不关闭且显示明确错误

- Contract mock tests:
- `INVALID_PARAMS` 映射到中文范围错误提示
- 成功后串行刷新 `today-summary` 与 `entries`

## 8. 开发任务拆解

- FE-8.1 拆分首页级错误与弹层级错误状态
- FE-8.2 增加快捷记录本地校验与错误文案映射
- FE-8.3 保存成功后清空输入并关闭弹层
- FE-8.4 保存失败时在弹层内展示错误并保持可继续输入
- FE-8.5 回归首页快捷记录与历史刷新链路
