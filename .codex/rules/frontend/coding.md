# Frontend Coding Rules

## 编码前置条件
- 每个需求编码前必须存在对应前端设计文档（docs/tech/design/requirements/<rq-id>/*frontend-design*.md）
- 前端设计文档必须引用后端契约版本（接口路径、字段、错误码）
- 开发顺序必须后端先行：无后端设计定稿与契约冻结，前端不得进入编码

## App Router 与组件边界
- 未标记时组件默认在服务端渲染，仅在需要交互或浏览器 API 时使用 "use client"
- "use client" 必须位于文件顶部并定义客户端边界，组件 props 必须可序列化
- Client Components 不可使用仅服务端可用能力
- "use server" 用于 Server Functions，客户端需要调用时必须放在独立文件
- Server Functions 必须进行认证与授权校验

## 错误与 404
- error.tsx 必须是 Client Component
- error.tsx 必须提供 reset() 进行恢复
- notFound() 用于触发 not-found.tsx

## Route Handlers
- 仅在 app 目录使用 route.ts
- Route Handlers 使用 Web Request/Response API

## 数据获取与缓存
- 浏览器端请求统一使用 axios
- Server Components/Route Handlers 仍使用 fetch
- 客户端数据请求统一走后端 API 或 Route Handlers，禁止泄露密钥
- Server 侧 fetch 使用 Next.js 扩展的缓存能力，必须显式声明 cache/revalidate/tags 保证行为可预期
- 路由级 revalidate 使用 route segment config
- revalidateTag/revalidatePath 只能在 Server Actions 或 Route Handlers 中调用

## HTTP 与 axios 规范
- axios 实例统一放在 lib/api/client.ts
- baseURL/timeout/headers 在实例内配置
- 认证信息通过拦截器注入（如 token、traceId）
- 错误统一在拦截器中规范化为业务错误结构
- 禁止在组件内直接 new axios 或配置独立实例

## 接口契约与类型
- 接口响应必须有明确类型定义，并与 docs/api/contracts 对齐
- 外部数据需做运行时校验（优先放在 lib/validation），禁止直接信任数据结构
- 禁止新增裸 `any`，确需使用时必须写明原因并标记 TODO（含截止版本）
- 公共函数与 hooks 的入参/返回值必须显式类型声明
- 布尔命名使用 `is/has/can/should` 前缀，避免语义不明字段

## 取消与并发
- 需要可中断的请求必须在组件卸载时取消（AbortController）
- 搜索/联想/过滤请求必须做防抖与竞态处理（只保留最后一次）

## 错误处理与反馈
- API 错误在 model/store 层转换为统一错误结构
- 用户可感知的错误必须有明确反馈（toast/inline/error boundary）
- 禁止空 `catch`，必须记录日志或转换为可追踪业务错误

## 数据流与状态归属（约束）
- 单一事实来源：同一份业务数据只允许存在一个“源状态”，禁止多处重复保存
- 状态就近：状态应上移到“最近的共同父级”，再通过 props 向下传递
- 页面级数据统一在 page.tsx 或页面级容器请求，子组件仅通过 props 使用数据
- 共享/跨页面状态才进入 store；页面级数据不得写入全局 store（除非确需跨页面复用）
- 子组件禁止直接发起请求或访问 API 客户端，仅通过 props 与回调触发上层 action
- 只存最小必要状态；派生数据通过 selector 或 memo 计算，不写入 store
- store 必须暴露 select 与 action；组件只订阅所需 slice
- 表单编辑态默认保留在组件本地，仅在确需跨页面复用时进入 store
- 禁止把 props 镜像进 state；如需忽略后续更新，必须使用 initial/default 语义明确标注
- feature 内 api 目录仅暴露请求函数与类型，不包含状态

## 分层红线（禁止项）
- 禁止在组件层直接访问 `lib/api/client.ts`
- 禁止在 `components/ui` 和 `components/shared` 写业务状态或业务规则
- 禁止跨 feature 读取内部文件（只能通过 `features/<feature>/index.ts`）
- 禁止在 JSX 内编写复杂业务分支（应上移到 hooks/model/selector）
- 禁止把后端返回对象原样透传到深层组件（页面层先做类型收敛和字段裁剪）

## Zustand 规范
- Zustand 仅用于共享/跨页面状态，页面级数据优先用页面容器的本地 state
- store 文件放在 features/<feature>/model 或全局 stores/，禁止放在 components
- store 需导出 useXxxStore，action 与 state 定义在同一 store 中
- 异步请求必须封装在 store action 内，组件只调用 action
- 组件订阅 store 必须使用 selector，禁止整库订阅
- 复杂 selector 使用 shallow 或等价比较以减少无效渲染
- store 只能在 Client Components 使用，禁止在 Server Components 直接引用
- 跨 store 协作通过 action 调用或 hooks 组合，禁止直接读写其他 store 的内部状态

## Tailwind CSS
- Preflight 自动注入 base layer
- 全局样式通过 @layer 组织
- content 扫描必须覆盖真实源码路径
- 动态类名需显式列出或使用 @source

## shadcn/ui
- 统一使用 shadcn CLI 的 init/add
- components.json 必须存在并与 Tailwind 配置一致
- 组件源码位于 components/ui
- 统一使用 cn() 做类名合并（基于 clsx + tailwind-merge）

## 性能与可访问性
- 长列表必须分页或虚拟化
- 避免在 render 中做重计算，必要时使用 memo/useMemo/useCallback
- 交互组件必须支持键盘操作与基础 aria 属性

## 分层与可维护性
- app 仅负责路由与布局，不直接写业务规则
- 业务逻辑集中在 features/<feature>/model
- 组件只做展示，状态与副作用放在 hooks 或 model
- 跨 feature 依赖必须通过 index.ts
- lib 不得依赖 features 或 components

## 复杂度阈值与重构触发
- 单个 React 组件超过 220 行必须拆分（容器、视图、子区块）
- 单个函数超过 60 行或出现超过 3 层条件分支必须重构
- 页面文件出现 4 个以上独立请求编排时，必须下沉到页面级 hook/use-case
- 出现重复 UI 片段超过 2 处时，必须抽取模块组件

## 可读性约束（常用实践）
- 复杂条件优先使用早返回（early return），避免深层嵌套
- 单个组件 props 超过 12 个字段时，必须重构为对象分组或子组件
- 事件处理函数命名统一为 `handleXxx`，派生计算统一为 `getXxx`/`selectXxx`
- 禁止在同一文件同时定义 UI、请求编排、复杂数据转换三类职责

## 页面级组件与模块组件
- 页面级组件仅服务于单一路由，放在 app/**/_components 或 features/<feature>/ui/sections
- 页面级组件不对外导出，不允许跨页面复用
- 模块组件仅在当前业务域复用，放在 features/<feature>/ui/components
- 跨业务域可复用组件放在 components/shared，不包含业务逻辑
- 基础 UI 组件统一放 components/ui（shadcn/ui），禁止混入业务逻辑
