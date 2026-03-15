# RQ-001 Backend Design - Entry & Onboarding

owner: engineering
requirement_id: rq-001-entry-onboarding
prd_ref: docs/product/prd/2026-03-13-prd-v2.md
product_design_refs:
- docs/product/design/2026-03-13-user-journey-and-ia.md
- docs/product/design/2026-03-13-theme-and-voice.md
api_contract_ref: docs/api/contracts/2026-03-13-api-v2-contracts.md
api_errors_ref: docs/api/errors/2026-03-13-api-v2-error-codes.md
status: draft
ac_refs: AC-01, AC-02

## 1. 需求范围

- 登录、会话建立、基础档案读写
- 轻评估问卷提交与 onboarding 完成确认
- 首次完成 onboarding 时初始化免费基础版权益

Out of scope:
- 支付、试用扣次、会员购买
- 长问卷画像与临床级健康评估

## 2. 接口设计

- `POST /api/v1/auth/login`
  - 输入：手机号 + 验证码
  - 输出：访问令牌、刷新令牌、`userStatus`
  - 错误码：`INVALID_PARAMS`, `AUTH_RATE_LIMIT`
- `GET /api/v1/profile`
  - 输出：用户基础资料、目标信息、`profileCompleted`
- `PUT /api/v1/profile`
  - 输入：当前体重、目标体重、目标周期、活动基线为最小必填；身高、作息、饮食偏好、失败模式允许由前端使用默认值兜底后再提交
  - 错误码：`INVALID_PARAMS`, `DUPLICATE_PROFILE`
- `POST /api/v1/onboarding/assessment`
  - 输入：目标、周期、活动基线、失败模式标签
  - 输出：`assessmentId`, `recommendedDailyActions`, `membershipState`
- `POST /api/v1/onboarding/complete`
  - 输出：`homeRedirect`, `firstMissionDate`
  - 错误码：`ONBOARDING_LIMIT_REACHED`

## 3. 数据模型设计

- `user_profile`
  - 主键：`user_id`
  - 字段：`height_cm`, `current_weight_kg`, `target_weight_kg`, `goal_weeks`, `work_rest_pattern`, `diet_preference`, `profile_completed`
- `onboarding_assessment`
  - 主键：`assessment_id`
  - 索引：`idx_onboarding_user_created_at (user_id, created_at desc)`
  - 字段：`goal_type`, `activity_baseline`, `motivation_pattern`, `recommended_actions_json`
- `goal_snapshot`
  - 用于保存当前生效目标，支撑后续首页与趋势计算
- `membership_entitlement`
  - 首次 onboarding 完成时创建一条 `plan=free` 的权益快照

迁移策略：
- 优先新增表与新增字段，不做 destructive migration
- 旧 `profile` 数据按默认规则补齐 `membership_entitlement`

## 4. 业务规则

- 未完成 onboarding 的登录用户必须先进入轻评估，不直接进入首页
- `targetWeightKg` 必须小于 `currentWeightKg` 且目标周期处于安全范围
- 最小 onboarding 场景下，身高、作息、饮食偏好、失败模式允许按默认模板补齐，不得因为用户未显式填写而阻断开始
- onboarding 完成是幂等操作；重复完成返回当前首页跳转信息
- 免费基础版初始化默认开启基础记录、基础趋势、基础复盘摘要能力
- 任意评估结论不得输出医疗诊断或疾病风险判定

## 5. 非功能要求

- 登录接口 p95 <= 800ms
- onboarding 提交和完成接口 p95 <= 1500ms
- 关键操作写审计日志：登录成功、档案更新、onboarding 完成、权益初始化

## 6. 测试方案

- Unit：目标范围校验、默认值兜底、onboarding 幂等、权益初始化逻辑
- Integration：登录 -> 最小 onboarding -> 完成 -> 首日任务初始化
- Contract：`userStatus`, `membershipState`, `homeRedirect` 字段与 API 文档一致

## 7. 开发任务拆解

- BE-1.1 登录与档案接口补齐 `userStatus`
- BE-1.2 新增 `onboarding_assessment` / `goal_snapshot` / `membership_entitlement`
- BE-1.3 实现最小 onboarding 所需的默认值兜底、assessment 与 complete 接口
- BE-1.4 写入 onboarding 审计与埋点事件

## 8. 风险与回滚

- 风险：历史用户缺少画像字段，可能导致新首页空状态
- 处理：迁移脚本为老用户补默认值，缺失时回退到最小任务模板
- 回滚：新接口关闭后保留旧 profile 流程，不删除旧字段
