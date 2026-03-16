# 项目级重构方案

## 1. 背景

当前项目的主要问题不是单个文件写法不优雅，而是同一领域存在多套实现、多套协议和多套数据来源，导致：

- 前端页面出现大量重复的 `try/catch`、`if/else`、`loading/error/submitting` 状态代码。
- 后端 service 同时承担查库、业务规则、DTO 组装等多重职责，代码偏流水线。
- 个人资料、目标、偏好设置在 `/profile`、`/me`、`/settings`、`JourneyStateService` 之间并行存在。
- 数据事实来源不统一，已经出现目标体重、单位、设置项显示不一致的问题。
- 仓库中保留了较多半废弃模块，增加理解和维护成本。

## 2. 当前核心问题

### 2.1 领域边界不稳定

- 前端同时存在 `features/settings`、`features/profile`、`features/my-center` 三套“个人中心”相关能力。
- 后端同时存在 `modules/me`、`modules/profile`、`modules/settings` 三套相近领域入口。
- 同一个用户意图可能会经过不同接口、写入不同位置、返回不同结构。

### 2.2 数据源不统一

- `UserProfile` 中仍保留 `currentWeightKg`、`targetWeightKg`。
- `WeightGoal` 中又保存 `startWeightKg`、`targetWeightKg`、`weightUnit`。
- `/me` 新流程写入 `WeightGoal`，但部分页面和后端逻辑仍读取 `UserProfile`。
- `/settings` 和 `JourneyStateService` 还在承载一部分长期用户数据。

### 2.3 前端状态机重复

典型页面都在重复如下模式：

1. `useEffect` 拉取数据
2. `try/catch/finally`
3. 维护 `isLoading`
4. 维护 `error`
5. 维护 `isSubmitting`
6. 提交后刷新局部数据

这类重复流程在多个页面中几乎一致，但没有形成统一抽象。

### 2.4 后端 service 过重

一些 service 同时负责：

- 数据查询
- 业务校验
- 指标计算
- 状态决策
- DTO 输出

这会让文件越来越长，测试也只能依赖集成方式验证，难以拆解和复用。

### 2.5 遗留代码持续抬高成本

- 路由已经重定向，但旧模块和旧 API client 仍保留。
- 新需求如果继续落到旧模块，会进一步增加分叉。
- 团队成员很难快速判断“哪一套才是当前主流程”。

## 3. 重构目标

本轮重构的目标聚焦四件事：

- 统一数据事实来源，让同一份用户数据只有一个明确归属。
- 收敛 API 面，让同一领域只保留一个主协议。
- 降低前端页面中的重复异步状态代码。
- 让后端分层更清晰，service 回归“编排者”角色。

## 4. 重构原则

- 一个领域只保留一个主 API 面。
- 一个核心业务实体只保留一个主数据源。
- 重复的技术流程要抽象，业务规则要显式保留。
- 页面组件只负责编排，不承载所有逻辑。
- 后端 service 只做编排，不做所有层次的工作。
- 旧入口先兼容，再冻结，最后删除。

## 5. 目标架构

### 5.1 前端目标结构

建议逐步收敛为：

```text
apps/web/
  features/
    me/
    home/
    weight/
    coach/
  shared/
    api/
    hooks/
    ui/
    utils/
```

说明：

- `features/me`：承接资料、目标、偏好、导出。
- `features/home`：承接首页聚合视图。
- `features/weight`：承接体重录入、列表、详情、趋势。
- `shared/hooks`：承接通用异步状态 hook。
- `shared/api`：承接通用 API client、错误映射、请求 helper。
- `shared/ui`：承接纯展示组件。

### 5.2 后端目标结构

建议逐步收敛为：

```text
backend/src/
  modules/
    me/
    home/
    weight/
    coach/
  shared/
    db/
    domain/
    http/
    utils/
```

说明：

- `controller`：只接 HTTP 参数和调用应用层。
- `application service`：负责编排。
- `repository`：负责数据访问。
- `domain`：负责纯业务规则和计算。
- `mapper/presenter`：负责 DTO 输出映射。

## 6. 数据所有权设计

### 6.1 用户资料

`UserProfile` 只保留基础资料：

- `nickname`
- `heightCm`
- `sex`
- `birthDate`
- `avatarUrl`

### 6.2 目标与单位

`WeightGoal` 作为目标领域唯一事实来源：

- `startWeightKg`
- `targetWeightKg`
- `targetDate`
- `weightUnit`

### 6.3 用户偏好

`UserSetting` 作为用户偏好唯一事实来源，建议承接：

- `diaryName`
- `theme`
- `timezone`
- `locale`

如需扩展更多偏好，也继续放在这一层，不再进入 `JourneyStateService`。

### 6.4 JourneyStateService 的边界

`JourneyStateService` 只应保留短生命周期、允许内存态的数据，例如：

- 临时导出任务 mock 状态
- 评估过程中的短期缓存
- 尚未正式建模的临时实验态能力

不应继续承载：

- 用户长期设置
- 用户偏好
- 会被多个页面长期读取的关键资料

## 7. 分阶段重构计划

### 阶段 1：统一数据事实来源

目标：

- 统一资料、目标、偏好的归属。
- 消除当前主流程对旧字段的依赖。

动作：

- 首页、趋势、目标展示全部改为从 `WeightGoal` 读取目标值。
- `/settings` 用户偏好迁移到数据库，不再只存于 `JourneyStateService`。
- `UserProfile.currentWeightKg`、`UserProfile.targetWeightKg` 明确进入 legacy 状态，不再作为主流程读取来源。
- 前后端统一 `weightUnit` 的事实来源和展示口径。

交付结果：

- 修改目标后，首页、我的页、趋势页显示一致。
- 后端重启后，用户设置不会丢失。

### 阶段 2：收敛 API 面，冻结旧接口

目标：

- 同领域只保留一个主 API 面。

动作：

- 前端“我的”相关流程统一走：
  - `/me/profile`
  - `/me/goal`
  - `/me/settings`
  - `/me/export`
- `/profile` 标记为 legacy，只保留兼容，不再新增调用。
- `/settings` 如保留，也必须代理到新的持久化实现。
- 清理旧 API client 的活跃调用入口。

交付结果：

- 新需求不再落到旧接口。
- 团队能够明确回答每个字段的唯一主接口。

### 阶段 3：统一前端异步状态模型

目标：

- 减少重复的 `try/catch`、`loading/error/submitting` 样板代码。

建议新增基础 hook：

- `useAsyncResource(loadFn, deps)`
  - 统一 `data/loading/error/reload`
- `useAsyncAction(actionFn)`
  - 统一 `run/pending/error/success`

动作：

- 优先重构以下页面：
  - `features/settings/ui/sections/me-profile-section.tsx`
  - `features/weight-diary/ui/sections/home-overview-section.tsx`
  - `features/home-daily-loop/ui/sections/home-dashboard-section.tsx`

交付结果：

- 页面组件只保留关键状态分支。
- 大部分重复的异步流程转移到 hook 中。

### 阶段 4：拆分前端大页面

目标：

- 让页面组件只负责编排，不负责全部实现细节。

建议拆法：

- `MeProfileContainer`
- `ProfileCard`
- `GoalCard`
- `QuickRecordDialog`
- `HistoryList`
- `HomeHero`

同时把部分分支改为配置驱动：

- `actionId -> href`
- `actionId -> title`
- `actionId -> cta`

交付结果：

- 页面文件长度下降。
- 组件职责更单一。

### 阶段 5：拆分后端大 service

目标：

- 让 service 回归编排职责。

建议拆法：

以 `weights` 为例：

- `weights.repository.ts`
- `weight-metrics.ts`
- `weight-summary.mapper.ts`
- `weights.service.ts`

以 `home` 为例：

- `home-read.repository.ts`
- `home-decision-engine.ts`
- `home-response.mapper.ts`
- `home.service.ts`

交付结果：

- 业务规则和 DTO 组装不再混在一个文件里。
- 纯规则逻辑可以单测。

### 阶段 6：清理 legacy 模块与死代码

目标：

- 降低后续维护成本。

建议清理对象：

- 前端：
  - `features/profile`
  - `features/my-center`
  - 不再被路由引用的旧 section
- 后端：
  - legacy `/profile`
  - legacy `/settings`
- 文档：
  - 补一份当前领域边界说明
  - 补一份 API source of truth 说明

交付结果：

- 团队不会再被旧代码误导。
- 新需求默认落到正确层次。

## 8. 任务拆解建议

### 8.1 后端任务

- 将 `/settings` 从 `JourneyStateService` 迁移到数据库。
- 统一首页目标体重读取逻辑，改为从 `WeightGoal` 获取。
- 梳理 `/profile` 和 `/me` 的契约差异，冻结旧接口能力。
- 为 `home` 和 `weights` 拆出纯计算模块。
- 为 `me`、`home`、`weights` 增加更清晰的 mapper/repository 分层。

### 8.2 前端任务

- 新增 `useAsyncResource`。
- 新增 `useAsyncAction`。
- 将 `me-profile-section` 改为容器式组件。
- 将 `home-overview-section` 的快速记录逻辑抽为独立 hook 和 dialog 组件。
- 将 `home-dashboard-section` 中的动作决策改为配置映射。
- 停止新增对旧 `profile.api.ts`、`my-center.api.ts` 的调用。

### 8.3 数据迁移任务

- 定义 `UserSetting` 扩展字段方案。
- 明确 `UserProfile` 中 legacy 体重字段的过渡策略。
- 明确 `WeightGoal` 为目标相关唯一事实来源。
- 评估是否需要一次性数据回填或兼容读取窗口。

## 9. 三周执行节奏建议

### 第 1 周

- 后端统一 settings 持久化。
- 首页目标体重读取切到 `WeightGoal`。
- 明确 `/profile` 与 `/me` 的兼容策略。

### 第 2 周

- 引入 `useAsyncResource`、`useAsyncAction`。
- 重构 `me-profile-section`。
- 重构 `home-overview-section` 的快速记录链路。

### 第 3 周

- 拆 `weights.service`。
- 拆 `home.service`。
- 清理前端旧 `profile` / `my-center` 直接调用入口。

## 10. 风险与控制策略

### 10.1 风险

- 新旧接口并存期间，数据可能继续漂移。
- 页面重构过程中，短期内可能出现交互回归。
- 如果未先统一数据源，抽象 hook 只会掩盖问题，不会解决问题。

### 10.2 控制策略

- 先统一事实来源，再做组件和 service 拆分。
- 每一阶段只处理一个明确目标。
- 旧接口先冻结，不再承接新需求。
- 对关键链路补最少但必要的验证：
  - 目标保存
  - 首页展示
  - 体重快速记录
  - 设置持久化

## 11. 验收标准

重构完成后，应至少满足以下条件：

- 修改目标体重后，首页、我的页、趋势页显示一致。
- 后端重启后，用户设置不丢失。
- 同一类用户资料不再由两套 API 写入两个不同模型。
- 页面中大部分重复的 `loading/error/submitting` 模板代码消失。
- 关键 service 文件长度明显下降，职责更清晰。
- 团队能够明确回答“这个字段的唯一事实来源在哪里”。

## 12. 建议优先落地的三项动作

如果只做最有收益的三个动作，建议优先执行：

1. 将 `/settings` 从 `JourneyStateService` 迁移到数据库。
2. 将首页目标体重统一改为读取 `WeightGoal`。
3. 新增 `useAsyncResource` / `useAsyncAction`，并先重构一个页面验证模式。

## 13. 结论

本项目最需要的不是局部美化，而是一次“数据源统一 + 领域边界收敛 + 异步流程抽象”的系统性重构。只要先把数据事实来源稳定下来，再逐步推进 API 收敛、页面拆分和 service 拆分，代码的可读性、可维护性和扩展性都会明显改善，而且后续新增功能的成本也会持续下降。
