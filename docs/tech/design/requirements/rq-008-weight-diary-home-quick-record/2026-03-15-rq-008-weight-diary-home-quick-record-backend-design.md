# RQ-008 Backend Design - 首页快捷记录体重

owner: backend
requirement_id: rq-008-weight-diary-home-quick-record
prd_ref: docs/product/prd/2026-03-13-prd-v2.md
status: draft

## 1. 需求范围

- 复用现有体重日记写接口，支撑首页底部弹层的快捷体重记录。
- 明确首页快捷记录与 `POST /api/v1/weights/entries` 的字段、校验和错误反馈契约。
- 保证合法体重值可即时写入，并在首页刷新后立刻可见。

Out of scope:
- 变更体重日记的数据模型。
- 放宽体重取值范围。
- 引入新的首页专用写接口。

## 2. 接口设计

沿用现有接口：
- Endpoint: `/api/v1/weights/entries`
- Method: `POST`

Request DTO:
- `entryDate`: `YYYY-MM-DD`
- `measuredAt`: ISO8601 datetime string
- `weightKg`: number, 最多两位小数
- `bodyFatPct`: optional
- `note`: optional

Response DTO:
- 返回标准 `WeightEntryDto`
- 首页快捷弹层只依赖：
- `id`
- `entryDate`
- `measuredAt`
- `weightKg`
- `deltaFromPreviousKg`
- `syncStatus`

Error codes:
- `INVALID_PARAMS`: 输入值为空、格式错误、超出允许范围
- `AUTH_EXPIRED`: 登录状态失效
- `INTERNAL_ERROR`: 服务异常

## 3. 数据模型设计

- 沿用 `weight_entries`（由 `weightEntry` Prisma model 映射）现有字段：
- `user_id`
- `entry_date`
- `measured_at`
- `weight_kg`
- `body_fat_pct`
- `note`
- `source`
- `deleted_at`

索引与约束：
- 维持现有索引与软删除策略，不新增迁移。

迁移策略与回滚：
- 本需求不涉及数据库迁移。
- 回滚时仅需撤回前端首页快捷记录入口的交互变更。

## 4. 业务规则

- 首页快捷记录必须传入当天 `entryDate` 与实际提交时刻对应的 `measuredAt`。
- `weightKg` 校验保持现状：
- 最小值 `20`
- 最大值 `300`
- 最多两位小数
- `source` 继续由服务端写死为 `manual`。
- 写入成功后，`GET /api/v1/weights/today-summary` 与 `GET /api/v1/weights/entries` 必须能读到最新结果。

幂等与并发：
- 本接口当前不做首页快捷记录的额外幂等控制。
- 多次快速提交时以后写入为准，前端负责避免重复点击。

频控/限流：
- 沿用现有全局鉴权与网关能力，不新增本接口专用限流。

## 5. 非功能要求

- `POST /api/v1/weights/entries` p95 <= 400ms。
- 写成功后首页二次刷新应在 2 秒内拿到新值。
- 错误码需要稳定映射到前端中文提示，不返回首页专用魔法字符串。

## 6. 测试方案

- Unit:
- 保持 `CreateWeightEntryRequestDto` 的范围校验正确。
- 保持 `WeightsService.createEntry` 在合法数据下写入成功。

- Integration:
- 首页快捷记录请求成功后，`today-summary` 与 `entries` 查询结果同步更新。

- Contract:
- `INVALID_PARAMS` 在 `weightKg < 20`、`weightKg > 300`、非数字时稳定返回。

## 7. 开发任务拆解

- BE-8.1 复核首页快捷记录依赖的现有 DTO 与错误码契约
- BE-8.2 保持首页快捷记录无需新增接口或迁移
- BE-8.3 与前端对齐非法输入映射文案

## 8. 风险与回滚

- 风险：前端未做预校验，用户会把范围错误误认为保存故障。
- 风险缓解：在前端弹层内前置校验并对 `INVALID_PARAMS` 做确定性提示。
- 回滚：关闭首页快捷记录弹层的前置校验改动，不影响后端现有写接口。
