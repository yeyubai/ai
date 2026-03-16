# 项目代码重构规范（数据流优先版）

## 1. 文档目标

这份文档只解决当前项目最影响可读性和维护性的 4 个核心问题：

- 数据流不清晰，同一份数据在页面、store、接口、后端之间反复跳转。
- 页面代码流水化，重复出现 `loading / error / catch / finally / success` 处理逻辑。
- 提示字符串散落在页面、hook、store、api、service 中，口径不统一。
- 目录和文件名可读性不足，导致代码位置难找、边界不明显、耦合持续上升。

这份规范不追求大规模架构重做，只要求做到：

- 数据流清晰
- 目录可读
- 异步处理统一
- 提示文案统一

## 2. 本轮重构只抓四条硬约束

### 2.1 目录契约

看到路径，就应该知道这段代码属于哪一层、做什么、能依赖谁。

### 2.2 数据流契约

一份业务数据必须能清楚回答这 5 个问题：

- 它从哪里来
- 它在哪里被转换
- 它在哪里允许编辑
- 它在哪里提交
- 它最终由谁展示

### 2.3 反馈契约

`loading / empty / error / success / toast / inline message` 必须统一处理，不允许每个页面自己发明一套。

### 2.4 依赖契约

目录层级不是摆设，必须配套导入边界。路径清晰但依赖混乱，最后仍然会退化成一团。

## 3. 前端目录规范

### 3.1 顶层结构

前端按“功能域 + 共享能力”组织，不按“技术类型”全局平铺。

建议统一为：

```text
apps/web/
  app/
  components/
    ui/
  features/
    me/
    home/
    weight/
    coach/
  shared/
    api/
    copy/
    errors/
    feedback/
    hooks/
    lib/
  styles/
```

目录职责固定如下：

- `app/`：Next.js 路由入口、页面装配、Server Component 边界
- `components/ui/`：基础 UI 原子组件，只放通用视觉组件
- `features/`：业务功能域
- `shared/api/`：通用请求封装、请求工具、基础响应处理
- `shared/copy/`：跨功能复用的通用提示文案
- `shared/errors/`：错误归一化、错误码映射
- `shared/feedback/`：统一的加载态、错误态、空态、成功反馈组件
- `shared/hooks/`：跨功能复用的异步 hook
- `shared/lib/`：纯工具函数，仅限无业务含义的通用能力

### 3.2 feature 内部结构

每个 feature 使用固定结构，不再混用 `services / helpers / common / utils2` 这类模糊目录。

标准结构：

```text
features/me/
  api/
    me.api.ts
    me.types.ts
  copy/
    me.messages.ts
  hooks/
    use-me-profile-resource.ts
    use-save-me-profile-action.ts
  model/
    me.constants.ts
    me.types.ts
    me-form-draft.store.ts
  payloads/
    create-me-profile-payload.ts
  view-models/
    build-me-profile-view-model.ts
  ui/
    components/
    sections/
    pages/
  index.ts
```

各目录职责如下：

- `api/`：接口调用、请求参数类型、响应类型
- `copy/`：只放该 feature 的业务提示文案
- `hooks/`：页面级编排 hook，只处理资源加载、提交、页面交互编排
- `model/`：领域类型、常量、draft store
- `payloads/`：把前端草稿转换为请求体的纯函数
- `view-models/`：把接口数据或草稿数据转换为视图数据的纯函数
- `ui/`：展示组件
- `index.ts`：feature 对外唯一出口

说明：

- 没有足够文件时，不必强行创建全部子目录。
- 一旦某类代码达到 2 个以上文件，就应放回对应目录，不要继续堆在 `ui/` 或 `hooks/` 下。

### 3.3 当前仓库的收敛方向

前端主功能域建议逐步收敛为：

- `apps/web/features/me`
- `apps/web/features/home`
- `apps/web/features/weight`
- `apps/web/features/coach`

当前仓库中建议逐步冻结，不再扩写的目录：

- `apps/web/features/settings`
- `apps/web/features/profile`
- `apps/web/features/my-center`
- `apps/web/features/home-daily-loop`
- `apps/web/features/weight-diary`

对应收口目标：

- `settings / profile / my-center` -> `me`
- `home-daily-loop` -> `home`
- `weight-diary` -> `weight`

原则只有两条：

- 新代码只进入主目录
- 旧目录只做兼容，不再新增业务逻辑

## 4. 前端依赖方向规范

### 4.1 允许的依赖方向

前端依赖方向固定为：

```text
app -> features -> shared -> components/ui
```

更具体地说：

- `app/` 可以依赖 `features/`、`shared/`、`components/ui/`
- `features/` 可以依赖 `shared/`、`components/ui/`
- `shared/` 不允许依赖 `features/`
- `components/ui/` 不允许依赖业务 feature

### 4.2 feature 之间的导入规则

feature 之间禁止深层互相引用。

允许：

```ts
import { MeProfileSection } from '@/features/me';
```

不允许：

```ts
import { buildMeProfileViewModel } from '@/features/me/view-models/build-me-profile-view-model';
```

规则：

- feature 对外只通过 `index.ts` 暴露公共能力
- 跨 feature 访问只能走公共导出
- 禁止跨 feature 深层导入 `ui/`、`model/`、`hooks/`、`payloads/` 内部文件

### 4.3 纯函数层依赖规则

以下层必须保持纯净：

- `payloads/`
- `view-models/`
- `shared/lib/`

它们不允许依赖：

- React 组件
- Zustand store
- Next.js 路由
- toast
- DOM

目标是让纯转换逻辑始终可测、可复用、可读。

## 5. 前端数据流规范

### 5.1 页面只允许存在 3 类状态

页面中的状态只分为：

- 服务端数据
- 草稿数据
- UI 临时状态

不要把这 3 类状态混在一起。

### 5.2 服务端数据

服务端数据是事实来源。

适合放在：

- `use-xxx-resource`
- Next.js server page 的初始加载结果

典型字段：

- `data`
- `error`
- `isLoading`
- `reload`

### 5.3 草稿数据

草稿数据表示用户“正在改但还没提交”的编辑态内容。

适合放在：

- feature 内部 draft store
- 局部 reducer
- 专用 controller hook

典型字段：

- `profileDraft`
- `goalDraft`
- `isProfileDirty`
- `isGoalDirty`

### 5.4 UI 临时状态

UI 临时状态不属于业务事实，不应进入全局 store。

例如：

- `isDialogOpen`
- `activeTab`
- `expandedCardId`
- `highlightedField`

这类状态只放：

- `useState`
- 局部组件内部

### 5.5 标准读链路

只读场景统一遵循：

```text
api -> resource hook -> view-model -> view
```

说明：

- `api` 负责请求
- `resource hook` 负责加载、错误、重试
- `view-model` 负责把数据转成页面展示结构
- `view` 只负责渲染

### 5.6 标准编辑链路

可编辑场景统一遵循：

```text
resource hook -> draft store -> payload builder -> action hook -> refresh
```

说明：

- `resource hook` 负责拿到初始事实数据
- `draft store` 负责接管用户编辑态
- `payload builder` 负责生成请求体
- `action hook` 负责提交、成功、失败
- `refresh` 负责提交后的状态回流

### 5.7 页面禁止事项

页面组件中不允许同时堆积以下职责：

- 拉接口
- 初始化草稿
- 转换响应
- 组装 payload
- 捕获异常
- 拼提示文案
- 直接触发 toast
- 渲染 JSX

一个页面文件如果同时承担这些事，它就已经不是“页面”，而是“脚本”。

## 6. Next.js Server / Client 边界规范

### 6.1 默认优先 Server Component

以下场景优先放在 `app/` 下的 Server Component：

- 首屏只读展示
- SEO 相关内容
- 进入页面即可获取的初始数据

### 6.2 以下场景才进入 Client Component

- 需要 `useState`
- 需要 `useEffect`
- 需要本地表单草稿
- 需要用户交互提交
- 需要浏览器能力

### 6.3 页面推荐分工

推荐结构：

```text
app/me/page.tsx                -> server page
features/me/ui/pages/me-page.tsx -> client page
features/me/hooks/...          -> client hooks
features/me/view-models/...    -> pure functions
```

推荐思路：

- `page.tsx` 负责页面入口与服务端边界
- feature page 负责客户端交互编排
- section / component 负责视图
- 纯转换逻辑下沉到 `payloads/` 与 `view-models/`

### 6.4 禁止事项

- 不要把整页默认写成客户端大组件
- 不要在 `page.tsx` 里同时写大量交互与视图细节
- 不要把 `use client` 扩散到纯函数文件或全 feature 根目录

## 7. 统一异步处理规范

### 7.1 项目中的重复异步逻辑必须统一收敛

以下流程不允许每个页面重复手写：

- `setLoading(true)`
- `setError(null)`
- `try/catch/finally`
- `isSubmitting`
- `reload`
- `toast.success`
- `toast.error`

这些流程必须统一进共享 hook 和反馈层。

### 7.2 统一使用 `useAsyncResource`

加载类场景统一使用资源 hook。

建议标准返回值：

```ts
type AsyncResourceResult<TData> = {
  data: TData | null;
  error: AppError | null;
  isLoading: boolean;
  reload: () => Promise<void>;
};
```

要求：

- 内部统一捕获异常
- 内部统一走错误归一化
- 统一暴露 `data / error / isLoading / reload`
- 页面不再手写整段加载流程

### 7.3 统一使用 `useAsyncAction`

提交类场景统一使用动作 hook。

建议标准返回值：

```ts
type AsyncActionResult<TPayload, TResult> = {
  run: (payload: TPayload) => Promise<TResult | null>;
  error: AppError | null;
  isPending: boolean;
  isSuccess: boolean;
  reset: () => void;
};
```

要求：

- 动作 hook 内统一处理 `pending / success / error`
- 动作 hook 内统一走错误归一化
- 页面不再手写重复的 `try/catch/finally`
- 成功后的 `reload`、`markSaved`、`toast` 只允许在 action hook 或页面控制层统一调度

### 7.4 页面层允许保留的异步代码

页面层只允许做两件事：

- 调用 `run`
- 根据返回状态渲染反馈

不要在页面层再次重复实现完整异步状态机。

## 8. 统一提示文案规范

### 8.1 提示文案分两层

所有提示文案统一分为两类：

- 通用文案
- feature 业务文案

### 8.2 通用文案位置

放在：

```text
apps/web/shared/copy/common-messages.ts
```

适合放这里的文案：

- 加载失败
- 保存失败
- 保存成功
- 请稍后重试
- 网络连接异常
- 操作成功

### 8.3 feature 文案位置

放在：

```text
apps/web/features/me/copy/me.messages.ts
apps/web/features/weight/copy/weight.messages.ts
```

适合放这里的文案：

- 目标体重需要小于起始体重
- 游客无法执行导出
- 当前草稿与登录账号不一致
- 某业务卡片的专属说明

### 8.4 页面中禁止散写通用文案

禁止在页面、store、api、payload builder 中散写下列通用文案：

- `加载失败，请稍后重试`
- `保存失败，请稍后重试`
- `请求异常，请稍后再试`

这些必须统一来自：

- `shared/copy/common-messages.ts`
- `features/*/copy/*.messages.ts`

### 8.5 提示文案的职责边界

规则如下：

- `api/` 不负责用户提示文案
- `store/` 不负责用户提示文案
- `payloads/` 不负责用户提示文案
- `view-models/` 只负责展示字段转换，不负责错误提示生成
- `action hook` 或页面控制层负责决定提示展示方式

## 9. 统一错误处理规范

### 9.1 所有异常先归一化，再展示

前端禁止直接在 `catch` 中拼接展示文案。

统一走：

```text
error -> normalizeApiError -> AppError -> displayMessage
```

建议放在：

```text
apps/web/shared/errors/normalize-api-error.ts
apps/web/shared/errors/get-error-display-message.ts
```

### 9.2 `AppError` 建议结构

```ts
type AppError = {
  code: string;
  message: string;
  displayMessage: string;
  retryable: boolean;
};
```

目标：

- 页面不直接判断底层错误结构
- 页面不直接拼接回退提示
- 前端所有错误展示统一走一条链路

### 9.3 页面中禁止的错误写法

禁止继续新增：

```ts
catch (error) {
  setError(isApiError(error) ? error.message : '请稍后重试');
}
```

统一改为：

```ts
const appError = normalizeApiError(error);
setError(appError.displayMessage);
```

## 10. 统一反馈组件规范

### 10.1 反馈状态必须组件化

下列状态统一使用共享反馈组件，不允许每页手写一套：

- Loading
- Error
- Empty
- Success Banner

建议目录：

```text
apps/web/shared/feedback/
  loading-state.tsx
  error-state.tsx
  empty-state.tsx
  success-state.tsx
```

### 10.2 页面内只做状态切换，不重复写样式

页面代码应只保留：

- `if (isLoading) return <LoadingState />`
- `if (error) return <ErrorState />`
- `if (!data) return <EmptyState />`

不要每个页面都重新拼：

- skeleton 样式
- alert 样式
- 默认错误文案
- 重试按钮逻辑

## 11. 后端目录与分层规范

### 11.1 后端模块目录固定结构

建议逐步统一为：

```text
backend/src/modules/me/
  controllers/
  application/
  repositories/
  rules/
  mappers/
  dto/
  errors/
```

目录职责如下：

- `controllers/`：HTTP 入口
- `application/`：应用服务，只负责编排
- `repositories/`：数据库访问
- `rules/`：纯业务规则
- `mappers/`：DTO 组装
- `dto/`：请求和响应结构
- `errors/`：领域错误码、领域异常定义

### 11.2 当前仓库的后端收口方向

用户资料相关能力以：

- `backend/src/modules/me`

作为主模块。

以下目录逐步转为兼容态：

- `backend/src/modules/profile`
- `backend/src/modules/settings`

原则：

- 新逻辑只进主模块
- 旧模块不再扩写
- 不再新增第二套同义接口

## 12. 后端数据流与异常规范

### 12.1 后端标准链路

后端请求处理统一遵循：

```text
controller -> application service -> repository / rules -> mapper -> response
```

### 12.2 Controller 只做四件事

- 取参数
- 调用 application service
- 返回结果
- 挂载守卫、管道、拦截器、过滤器

不允许：

- 直接操作 Prisma
- 写复杂业务判断
- 拼页面展示文案

### 12.3 Application Service 只负责编排

允许：

- 调 repository
- 调 rules
- 控制事务边界
- 调 mapper

不允许：

- 塞满 Prisma 查询细节
- 拼大量 response 字段
- 返回面向页面的中文提示文案

### 12.4 Repository 只做数据访问

允许：

- 查询
- 写入
- 事务中的持久化操作

不允许：

- 决定业务是否合法
- 生成中文提示文案
- 拼装前端视图结构

### 12.5 Rules 必须保持纯净

`rules/` 中的函数不依赖：

- NestJS 装饰器
- Prisma Service
- HTTP Request / Response

适合放：

- `validate-weight-goal.ts`
- `resolve-profile-completed.ts`
- `calculate-weight-summary.ts`

### 12.6 后端错误码要稳定，提示语不要散落

后端应优先稳定返回：

- `code`
- `message`
- `details`

其中最重要的是 `code`。

前端根据 `code` 决定展示文案，避免：

- 后端一句中文
- 前端另一句中文
- 页面自己再拼第三句中文

### 12.7 后端统一异常出口

继续使用项目现有的全局异常过滤器和响应拦截器，不要在 service 中散落 response shape。

目标：

- 错误出口统一
- 响应结构统一
- 前后端更容易对齐错误处理链路

## 13. 文件与变量命名规范

### 13.1 文件命名

统一规则：

- 文件使用 `kebab-case`
- React 组件导出使用 `PascalCase`
- 纯函数导出使用 `camelCase`

推荐命名：

- `me-profile-section.tsx`
- `use-me-profile-resource.ts`
- `create-me-profile-payload.ts`
- `build-me-profile-view-model.ts`
- `normalize-api-error.ts`

不要继续新增：

- `helper.ts`
- `common.ts`
- `utils2.ts`
- `data.ts`

### 13.2 变量按数据阶段命名

同一份业务数据在不同阶段必须使用不同名字。

标准命名链路：

- `profileResponse`
- `profileResource`
- `profileDraft`
- `profilePayload`
- `profileViewModel`

这样才能让人一眼看出当前数据处于哪一层。

### 13.3 布尔值必须见名知意

统一使用：

- `isLoading`
- `isPending`
- `isDirty`
- `hasGoal`
- `canSubmit`
- `shouldShowRetry`

不要使用：

- `flag`
- `ok`
- `status1`
- `temp`

## 14. 项目禁止事项

以下写法后续禁止继续增加：

- 页面组件中同时拉接口、组 payload、写 `try/catch/finally`、拼提示文案、渲染 JSX
- 每个页面都单独维护一套 `loading / error / success` 样式和文案
- 在 `catch` 中直接写 `'请稍后重试'`
- 在 `store` 中直接调 API
- 在 `api` 层直接触发 toast
- 在 `payload builder`、`view-model` 中夹带 UI 提示
- feature 之间深层互相导入
- 新代码继续写入 legacy 目录
- 使用 `services / helpers / common / utils2` 这类模糊目录承载越来越多业务逻辑

## 15. 重构完成检查清单

一个页面或模块完成重构后，至少应满足以下检查项：

### 15.1 目录与依赖

- 路径能看出职责
- 文件名能看出用途
- 跨 feature 没有深层导入
- 没有新增模糊目录

### 15.2 数据流

- 事实来源只有一个
- 草稿持有者只有一个
- 页面中没有三套同义状态并存
- payload 不是在 JSX 中临时拼出来的

### 15.3 异步与反馈

- 加载逻辑走 `resource hook`
- 提交逻辑走 `action hook`
- 错误经过统一归一化
- Loading / Error / Empty 使用共享反馈组件
- 通用提示文案不散写在页面里

### 15.4 后端

- controller 不直接查库
- application service 不直接塞满查询细节
- rules 是纯函数
- mapper 不夹带数据库访问
- 错误码稳定，响应出口统一

## 16. 推荐的最小落地顺序

如果只从“代码优化”推进，不改数据库协议，不大动业务流程，建议顺序如下：

1. 先统一目录和导入边界
2. 再补 `useAsyncResource`、`useAsyncAction`
3. 再补 `normalizeApiError`、`common-messages`、共享反馈组件
4. 再重构高频页面的数据流
5. 再拆后端大 service
6. 最后清理 legacy 目录和重复入口

## 17. 当前仓库最优先改造对象

前端优先：

- `apps/web/features/settings/ui/sections/me-profile-section.tsx`
- `apps/web/features/home-daily-loop/ui/sections/home-dashboard-section.tsx`
- `apps/web/features/weight-diary/ui/sections/home-overview-section.tsx`

后端优先：

- `backend/src/modules/me/services/me.service.ts`
- `backend/src/modules/home/services/home.service.ts`
- `backend/src/modules/weights/services/weights.service.ts`

理由：

- 这些文件最典型地承载了重复异步处理、散落提示文案、数据流混杂、分层不清的问题
- 它们重构后的模式最容易复制到全项目

## 18. 一句话标准

以后判断一段代码是否合格，优先看这 5 件事：

- 目录是否一眼能找到
- 文件名是否一眼知道职责
- 数据从哪来是否一眼能看懂
- 提示与错误是否走统一链路
- 页面是否只负责展示和编排

如果这些问题答不上来，代码就还没有真正重构到位。
