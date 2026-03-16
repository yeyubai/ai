# 项目代码重构规范（工程化版）

## 1. 目标

这份规范不追求“大重构”，只解决当前最影响开发效率和可读性的几个问题：

- 数据流混乱，同一份数据在多个页面、多个接口、多个存储中来回跳转。
- 页面组件承担了过多职责，代码像脚本一样从上往下堆叠。
- 后端 service 同时负责查库、校验、计算、拼 DTO，文件越来越重。
- 文件夹、文件名、变量名不够见名知意，理解成本高。

本轮优化目标只有四个：

- 数据流规范化
- 页面逻辑去流水化
- 分层边界更清晰
- 命名更工程化

## 2. 总体原则

### 2.1 先规范流向，再优化写法

代码优雅的前提不是少写 `if/else`，而是先明确：

- 数据从哪里来
- 在哪里被转换
- 在哪里允许编辑
- 在哪里提交
- 最终由谁负责展示

如果流向不清晰，单纯把代码拆成更多函数，只会把混乱分散到更多文件中。

### 2.2 抽象技术流程，不抽象业务判断

应该抽象：

- 异步加载状态
- 提交状态
- API 错误映射
- 表单草稿同步
- DTO 到 ViewModel 的转换

不应该过早抽象：

- 减脂目标是否合法
- 是否允许游客编辑
- 首页卡片展示顺序

业务规则要显式，技术流程才适合复用。

### 2.3 一个文件只做一层事情

前端页面文件只负责：

- 组装页面所需数据
- 调用 hook
- 传递 ViewModel 给展示组件

后端 service 只负责：

- 调用 repository
- 调用规则函数
- 组织返回结果

不要让一个文件同时承担 4 到 5 层职责。

### 2.4 命名比技巧更重要

优先保证：

- 一眼看懂
- 搜索友好
- 新人能猜到位置
- 改动时不容易误伤

不要为了“高级感”使用含义模糊的缩写、临时命名和过度抽象名称。

## 3. 前端目录规范

### 3.1 总体方向

前端按“功能域”组织，不按“技术类型”平铺整个工程。

建议逐步收敛为：

```text
apps/web/
  app/
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
  components/ui/
  styles/
```

其中：

- `features` 放业务功能
- `shared` 放跨功能复用能力
- `components/ui` 保留基础通用 UI 组件

### 3.2 功能域内部结构

每个 feature 尽量保持同一套结构：

```text
features/me/
  api/
    me.api.ts
    me.mapper.ts
    me.types.ts
  model/
    me.constants.ts
    me.types.ts
    me-form-draft.store.ts
  hooks/
    use-me-profile-resource.ts
    use-save-me-profile-action.ts
  services/
    build-me-profile-view-model.ts
    create-me-profile-payload.ts
  ui/
    pages/
    sections/
    components/
```

说明：

- `api/` 只处理请求、响应、接口类型
- `model/` 只处理前端领域模型、常量、store
- `hooks/` 只处理页面级数据编排和异步流程
- `services/` 放纯函数，负责映射、组装、格式化
- `ui/` 只放视图组件

### 3.3 当前仓库建议收敛方向

建议逐步合并和冻结以下目录：

- `apps/web/features/settings`
- `apps/web/features/profile`
- `apps/web/features/my-center`

主入口逐步收敛到：

- `apps/web/features/me`

建议逐步整理以下领域边界：

- `apps/web/features/home-daily-loop` 收敛为 `apps/web/features/home`
- `apps/web/features/weight-diary` 收敛为 `apps/web/features/weight`
- `apps/web/features/onboarding` 与 `apps/web/features/onboarding-flow` 保留一套主流程，另一套进入 legacy

原则是：

- 新代码只进主域目录
- 旧目录可以先兼容，但不再继续扩写

## 4. 前端文件命名规范

统一使用 `kebab-case` 文件名，导出符号使用 `PascalCase` 或 `camelCase`。

### 4.1 React 组件

- 文件名：`me-profile-section.tsx`
- 导出组件：`MeProfileSection`

适用规则：

- 页面级容器：`xxx-page.tsx`
- 区块组件：`xxx-section.tsx`
- 纯展示组件：`xxx-card.tsx`、`xxx-panel.tsx`、`xxx-dialog.tsx`
- 字段组件：`xxx-field.tsx`

### 4.2 Hook

- `use-me-profile-resource.ts`
- `use-save-me-profile-action.ts`
- `use-weight-trend-resource.ts`

规则：

- 负责加载：`use-xxx-resource`
- 负责提交：`use-xxx-action`
- 负责交互状态：`use-xxx-controller`

不要出现含义过泛的命名：

- `useData`
- `useInfo`
- `useHandleSomething`

### 4.3 纯函数文件

- `build-me-profile-view-model.ts`
- `create-goal-payload.ts`
- `map-goal-response.ts`
- `format-weight-label.ts`

规则：

- 构建 UI 数据：`build-xxx-view-model`
- 生成请求体：`create-xxx-payload`
- 映射接口数据：`map-xxx-response`
- 规则判断：`resolve-xxx-status`
- 文案格式化：`format-xxx`

### 4.4 Store 与类型

- `me-form-draft.store.ts`
- `me.types.ts`
- `goal.types.ts`
- `weight.constants.ts`

规则：

- 状态容器：`xxx.store.ts`
- 类型定义：`xxx.types.ts`
- 常量：`xxx.constants.ts`

## 5. 变量命名规范

### 5.1 按数据阶段命名

同一份业务数据，在不同阶段必须用不同名字，避免全部叫 `data`。

推荐命名链路：

- `profileResponse`
- `profileResource`
- `profileDraft`
- `profilePayload`
- `profileViewModel`

目标是让人一眼看出“这份数据当前处于哪一层”。

### 5.2 布尔值必须带语义前缀

统一使用：

- `isLoading`
- `isSubmitting`
- `isDirty`
- `hasGoal`
- `canSubmit`
- `shouldShowRetry`

避免：

- `loading`
- `submitFlag`
- `flag`
- `ok`

### 5.3 列表、映射、配置命名

- 数组使用复数名：`goalCards`、`dashboardActions`
- 映射表使用 `Map` 或 `By`：`labelByUnit`、`actionConfigMap`
- 配置使用 `Config`：`goalPickerConfig`

避免：

- `list`
- `arr`
- `obj`
- `map1`

### 5.4 临时变量也要有含义

不要写：

- `data`
- `res`
- `item`
- `value1`
- `temp`

优先写：

- `goalResponse`
- `updatedProfile`
- `selectedWeightUnit`
- `targetWeightLabel`

## 6. 前端数据流规范

页面中的数据只分三类：

- 服务端数据
- 表单草稿数据
- UI 临时状态

不要把这三类状态混在一起管理。

### 6.1 服务端数据

服务端数据来自 API，是事实来源。

适合放在：

- `resource hook`
- 查询类 hook

典型字段：

- `data`
- `error`
- `isLoading`
- `reload`

### 6.2 表单草稿数据

表单草稿表示“尚未提交但用户正在编辑的数据”。

适合放在：

- feature 内部 store
- 局部 reducer
- 表单控制层 hook

典型字段：

- `profileDraft`
- `goalDraft`
- `isProfileDirty`
- `isGoalDirty`

### 6.3 UI 临时状态

UI 状态不属于业务事实。

只适合放：

- `useState`
- 局部组件内部

例如：

- `isGoalDialogOpen`
- `activeTab`
- `highlightedCardId`

不要把这些状态放进全局 store。

### 6.4 页面标准流向

建议每个复杂页面都遵循下面的链路：

```text
API -> Resource Hook -> Draft Store / Action Hook -> ViewModel Builder -> View
```

拆开理解：

1. `api`
   只负责请求
2. `resource hook`
   只负责加载、错误、重试
3. `draft store`
   只负责编辑态数据
4. `action hook`
   只负责提交与提交结果
5. `view model builder`
   只负责把业务数据转成页面展示数据
6. `view`
   只负责渲染

### 6.5 页面禁止直接堆业务流程

像下面这些职责，不应该全部堆在一个 section 组件里：

- 拉取接口
- 处理接口错误
- 初始化草稿
- 转换单位
- 组装 payload
- 提交接口
- 成功失败文案
- JSX 渲染

如果一个组件同时做这些事，这个组件就已经不是“视图组件”，而是“脚本文件”。

## 7. 页面逻辑去流水化规范

### 7.1 `try/catch` 只放在边界层

推荐放在：

- `api`
- `resource hook`
- `action hook`
- 后端 controller / application service 边界

不推荐：

- 每个点击事件都自己写一遍完整的 `try/catch/finally`
- 每个页面都维护一套重复的错误拼接逻辑

### 7.2 `if/else` 只保留业务判断

应该保留的分支：

- 是否游客
- 目标体重是否合法
- 是否允许提交
- 是否展示某块业务卡片

适合改为配置映射的分支：

- 单位文案
- 状态 badge
- 行为按钮标题
- 首页 action 跳转目标

例如不要反复写：

```ts
if (unit === 'kg') return '公斤';
if (unit === 'lb') return '磅';
return '公斤';
```

更适合统一放进：

```ts
const labelByWeightUnit = {
  kg: '公斤',
  lb: '磅',
} as const;
```

### 7.3 把“转换”抽到纯函数

页面里最容易污染可读性的，不是 JSX，而是各种“顺手加工”：

- 转 DTO
- 拼提示文案
- 算进度百分比
- 拼描述字段

这些都应该下沉到纯函数文件：

- `map-xxx-response.ts`
- `build-xxx-view-model.ts`
- `resolve-xxx-status.ts`

## 8. 后端目录规范

后端继续按模块组织，但模块内部要分层。

建议逐步统一为：

```text
backend/src/modules/me/
  controllers/
  application/
  repositories/
  rules/
  mappers/
  dto/
```

如果暂时不想改太大，可以采用兼容版：

```text
backend/src/modules/me/
  controllers/
  services/
  repositories/
  rules/
  mappers/
  dto/
```

其中：

- `controllers/` 接收请求参数
- `services/` 或 `application/` 负责编排
- `repositories/` 负责 Prisma 查询
- `rules/` 放纯业务规则
- `mappers/` 负责 DTO 输出
- `dto/` 放输入输出结构

### 8.1 当前仓库建议的主模块

用户资料相关能力，后端建议以 `backend/src/modules/me` 作为主模块。

以下目录逐步进入兼容态：

- `backend/src/modules/profile`
- `backend/src/modules/settings`

原则是：

- 新逻辑优先放 `me`
- 旧模块只做兼容和迁移
- 不再新增第二套同义能力

## 9. 后端代码职责规范

### 9.1 Controller

Controller 只做四件事：

- 取参数
- 调用 service
- 返回结果
- 挂装守卫、拦截器、校验器

不要在 controller 中：

- 手写复杂业务校验
- 拼装大量返回字段
- 直接操作 Prisma

### 9.2 Service

Service 只做编排，不做所有工作。

Service 内允许：

- 调 repository
- 调 rule
- 调 mapper
- 控制事务边界

Service 内不宜长期堆积：

- 复杂 Prisma 查询细节
- 大段状态机判断
- 页面展示文案
- 多套 DTO 拼接代码

### 9.3 Repository

Repository 只负责：

- 查库
- 写库
- 事务中的数据访问

不要在 repository 中：

- 决定业务是否合法
- 返回面向页面的中文文案
- 拼接页面展示结构

### 9.4 Rule / Policy

规则函数必须保持纯净。

例如：

- `validate-weight-goal.ts`
- `resolve-profile-completed.ts`
- `calculate-weight-summary.ts`

规则层不依赖 HTTP，不依赖 NestJS 装饰器，不依赖 Prisma 实例。

### 9.5 Mapper

Mapper 专门负责：

- Prisma model -> DTO
- 多个领域对象 -> response DTO
- 数据字段兼容映射

这样可以避免 service 里出现大量对象字面量拼装。

## 10. 当前仓库的轻量重构建议

以下是最适合先动的点，收益高，风险低。

### 10.1 前端

优先重构：

- `apps/web/features/settings/ui/sections/me-profile-section.tsx`
- `apps/web/features/home-daily-loop/ui/sections/home-dashboard-section.tsx`
- `apps/web/features/weight-diary/ui/sections/home-overview-section.tsx`

改造方向：

- 把加载逻辑抽成 `resource hook`
- 把提交逻辑抽成 `action hook`
- 把 payload 生成和文案映射抽成纯函数
- section 组件只保留渲染和少量事件绑定

### 10.2 后端

优先重构：

- `backend/src/modules/me/services/me.service.ts`
- `backend/src/modules/home/services/home.service.ts`
- `backend/src/modules/weights/services/weights.service.ts`

改造方向：

- 查库下沉到 repository
- 业务判断下沉到 rules
- DTO 组装下沉到 mapper
- service 只保留编排主流程

## 11. 禁止事项

以下写法后续应尽量避免继续增加：

- 一个页面组件既拉接口又转数据又提交又渲染
- 一个 service 同时写查询、校验、计算、格式化、返回 DTO
- 同一业务意图保留两套活跃接口
- 同一字段在多个表、多个接口中同时作为事实来源
- 在 JSX 中直接写复杂判断和格式转换
- 用 `data`、`info`、`item`、`temp` 作为长期存在的变量名
- 用 `common`、`utils2`、`helper` 这类无边界文件夹承载越来越多逻辑

## 12. 推荐的落地顺序

如果只从“代码优化”角度推进，不改协议、不动数据库，建议顺序如下：

1. 先统一新代码目录和命名规则
2. 再抽前端的 `resource hook` 与 `action hook`
3. 再把大页面拆成 `container + view + pure function`
4. 再拆后端大 service
5. 最后清理 legacy 入口和重复文件

这套顺序的好处是：

- 风险低
- 不影响当前主流程
- 每一步都能提升可读性
- 团队可以边开发边收敛

## 13. 一句话标准

以后判断一段代码是否值得保留，优先看这四件事：

- 目录是否一眼能找到
- 文件名是否一眼知道职责
- 变量名是否一眼知道阶段
- 数据流是否一眼知道从哪来、在哪改、往哪去

如果这四件事都不清楚，再“优雅”的写法也只是表面优化。
