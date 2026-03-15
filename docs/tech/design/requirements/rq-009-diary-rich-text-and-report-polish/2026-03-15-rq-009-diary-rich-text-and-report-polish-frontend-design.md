# RQ-009 Frontend Design - 日记富文本与报告展示修正

owner: frontend
requirement_id: rq-009-diary-rich-text-and-report-polish
prd_ref: docs/product/prd/2026-03-13-prd-v2.md
backend_design_ref: docs/tech/design/requirements/rq-009-diary-rich-text-and-report-polish/2026-03-15-rq-009-diary-rich-text-and-report-polish-backend-design.md
status: draft

## 1. 需求范围

- 修正首页/历史记录卡片中体重值被省略号截断的问题。
- 修正体重详情页区间轴样式：连续色带、顶部数值指针、体重维度空态降级轴。
- 将 `/diary` 从“体重记录列表页”调整为“日记列表页”。
- 新增 `/diary/new` 与 `/diary/[entryId]` 富文本编辑页，并接入后端同步。

Out of scope:
- 日记协作、分享与评论。
- 独立图片上传服务；MVP 先以内嵌图片内容同步。

## 2. 页面与路由设计

涉及路由：
- `/diary`
- `/diary/new`
- `/diary/[entryId]`
- `/weight/[entryId]`

页面职责：
- `/diary`
  - 展示空态或日记摘要列表
  - 右下角悬浮按钮进入新建页
- `/diary/new`
  - 富文本编辑
  - 顶部返回与保存
  - 底部格式工具栏
- `/diary/[entryId]`
  - 加载已有日记并编辑
- `/weight/[entryId]`
  - 展示三张指标卡和统一风格区间轴

## 3. 数据流设计

日记数据流：
- 列表页调用 `GET /api/v1/diary/entries`
- 编辑页调用 `GET /api/v1/diary/entries/:entryId`
- 保存时调用：
  - 新建 -> `POST /api/v1/diary/entries`
  - 更新 -> `PUT /api/v1/diary/entries/:entryId`

报告详情数据流：
- 继续使用 `fetchWeightEntry(entryId)`
- 前端基于 `ranges` 计算区间轴色带和指针位置

## 4. 接口契约映射

使用接口：
- `GET /api/v1/diary/entries`
- `GET /api/v1/diary/entries/:entryId`
- `POST /api/v1/diary/entries`
- `PUT /api/v1/diary/entries/:entryId`
- `GET /api/v1/weights/entries/:entryId`

错误态映射：
- 日记列表读取失败 -> `日记读取失败，请稍后重试`
- 日记详情读取失败 -> `日记读取失败，请稍后重试`
- 日记保存失败 -> `保存日记失败，请稍后重试`
- 体重详情读取失败 -> `详情加载失败，请稍后重试`

## 5. 交互与状态

列表卡：
- 体重数字不得使用 `truncate`
- 体重值字号缩小一级并使用等宽数字观感
- 保持左右信息块对齐，避免因大字重挤压导致省略号

区间轴：
- 色带为单条连续轨道，不允许段间留白
- 当前值指针位于色带上方，并带数值提示与指向轨道的标记点
- 阈值标签位于轨道上方
- 维度缺少阈值数据时，展示中性降级轨道而不是空白

日记页：
- 空态完全对齐设计图：白底、中央插画、轻提示文案、右下角悬浮新增按钮
- 编辑页采用极简大留白布局
- 工具栏固定在底部，支持文字样式、列表、待办、时间、图片、撤销、重做
- 顶部显示时间与字数
- 保存成功后返回 `/diary` 并回显最新摘要

## 6. 埋点设计

- `diary_list_view`
- `diary_create_open`
- `diary_save`
- `diary_edit_open`
- `weight_report_expand_metric`

字段：
- `entry_id`
- `is_empty`
- `metric`
- `word_count`

## 7. 测试方案

- Component tests:
- 列表卡完整显示体重值
- 区间轴连续色带与当前值指针
- 体重无阈值时的降级轴

- Page flow tests:
- `/diary` 空态 -> 点击 `+` -> 进入富文本页
- 富文本输入 -> 保存 -> 返回列表出现新条目
- 点击日记条目 -> 进入编辑态并回显内容
- `/weight/[entryId]` 展开三个维度均看到区间轴

- Contract mock tests:
- `GET /diary/entries` 与 `GET /diary/entries/:entryId` 返回字段完整

## 8. 开发任务拆解

- FE-9.1 调整 `WeightEntryListCard` 排版与字体
- FE-9.2 重写 `MetricRangePanel` 的连续色带与指针逻辑
- FE-9.3 补体重维度无阈值时的降级区间轴
- FE-9.4 将 `features/diary` 切换到后端 API
- FE-9.5 打通 `/diary` 到富文本编辑流
