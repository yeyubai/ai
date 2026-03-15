# RQ-009 Backend Design - 日记富文本与报告展示修正

owner: backend
requirement_id: rq-009-diary-rich-text-and-report-polish
prd_ref: docs/product/prd/2026-03-13-prd-v2.md
status: draft

## 1. 需求范围

- 新增日记后端同步能力，支撑 `/diary` 列表页与富文本编辑页。
- 保持现有体重详情接口继续为体重、体脂、BMI 三个维度提供区间展示数据。
- 游客写入的日记在登录并绑定正式账号时需要随其他资产一并迁移。

Out of scope:
- 独立图片上传服务与媒体资源表。
- 日记协作、分享、评论。
- 全文搜索与标签系统。

## 2. 接口设计

新增接口：

- `GET /api/v1/diary/entries`
  - 返回日记摘要列表，按 `updatedAt desc` 排序
- `GET /api/v1/diary/entries/:entryId`
  - 返回单条日记完整内容
- `POST /api/v1/diary/entries`
  - 新建日记
- `PUT /api/v1/diary/entries/:entryId`
  - 更新日记

Request DTO:
- `contentHtml`: string
- `plainText`: string

Response DTO:
- Summary:
  - `id`
  - `preview`
  - `createdAt`
  - `updatedAt`
  - `wordCount`
- Detail:
  - `id`
  - `contentHtml`
  - `plainText`
  - `createdAt`
  - `updatedAt`
  - `wordCount`

Error codes:
- `INVALID_PARAMS`
- `AUTH_EXPIRED`
- `INTERNAL_ERROR`

## 3. 数据模型设计

新增表：
- `diary_entries`

字段：
- `id BIGINT`
- `user_id BIGINT`
- `content_html LONGTEXT`
- `plain_text LONGTEXT`
- `word_count INT`
- `created_at DATETIME`
- `updated_at DATETIME`
- `deleted_at DATETIME NULL`

索引与约束：
- `idx_diary_entries_user_updated_at(user_id, updated_at)`
- `idx_diary_entries_user_created_at(user_id, created_at)`

迁移策略：
- 新增表，不改现有业务表。
- Prisma schema 与 SQL migration 同步落地。

回滚：
- 回滚时停用 diary 路由；保留表数据，不做 destructive drop。

## 4. 业务规则

- `plainText` 作为摘要与字数统计依据。
- `preview` 由服务端从 `plainText` 截取前 72 个字符生成。
- `wordCount` 由服务端按 `plainText.length` 计算并持久化。
- 同一用户只能访问自己的日记。
- 游客账号的 diary 数据在账号绑定时通过 `user_id` 迁移到正式账号。

幂等与并发：
- `POST` 不做幂等复用。
- `PUT` 以后写入为准。

频控/限流：
- 沿用全局鉴权与网关能力，不额外新增 diary 专用限流。

## 5. 非功能要求

- 日记列表 `GET /diary/entries` p95 <= 300ms。
- 单条读取 `GET /diary/entries/:entryId` p95 <= 300ms。
- 新建/更新 `POST|PUT` p95 <= 400ms。

## 6. 测试方案

- Unit:
- 新建日记返回正确摘要字段
- 更新不存在的日记返回 `INVALID_PARAMS`
- 列表按 `updatedAt desc` 排序
- 游客迁移时日记 `user_id` 被正确转移

- Integration:
- 新建后立即可在列表页读取
- 更新后详情与列表摘要同步更新

- Contract:
- `/diary/entries` 与 `/diary/entries/:entryId` 返回结构稳定

## 7. 开发任务拆解

- BE-9.1 新增 `DiaryEntry` Prisma 模型与 migration
- BE-9.2 新增 `DiaryModule`、controller、service、DTO
- BE-9.3 接入游客转正式账号时的日记迁移
- BE-9.4 更新 API 契约与错误码文档

## 8. 风险与回滚

- 风险：富文本内嵌 base64 图片会抬高单条记录体积。
- 风险缓解：MVP 允许小体量内嵌图片，后续再拆媒体上传能力。
- 回滚：关闭 diary 前端入口与后端路由，不删除已写入数据。
