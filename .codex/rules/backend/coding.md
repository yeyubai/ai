# Backend Coding Rules

## 编码前置条件
- 每个需求编码前必须存在对应后端设计文档（docs/tech/design/requirements/<rq-id>/*backend-design*.md）
- 后端设计文档必须包含：接口契约、数据模型变更、校验与错误码、测试方案
- 无设计文档禁止进入后端编码阶段

## 模块与依赖注入
- 所有功能必须注册在 Module 中，Module 默认封装其 Provider
- 需要跨模块复用的 Provider 必须显式 exports，并在其他模块中 imports
- Provider 必须通过 DI 注入，禁止直接 new

## 分层与职责
- Controller 仅处理请求与响应组装，不写业务逻辑
- Service 承载业务规则与流程编排
- Repository 只负责数据访问，不包含业务判断
- shared 只放横切能力，不允许反向依赖业务模块

## 分层红线（禁止项）
- 禁止 Controller 直接调用 Repository
- 禁止 Repository 依赖其他业务模块的 Service
- 禁止在 Controller/Repository 中写业务规则分支
- 禁止在 Service 中拼接原始 SQL（除非明确性能场景并附注释）
- 禁止把 ORM 实体直接作为 API 响应返回（必须经 DTO 映射）

## 请求生命周期（执行顺序）
- Middleware → Guards → Interceptors(前置) → Pipes → Controller → Service → Interceptors(后置) → Exception Filters
- Guards 负责鉴权与授权，Pipes 负责校验与转换，Interceptors 处理日志与响应包装

## 校验与 DTO
- DTO 必须使用 class-validator + class-transformer
- 全局启用 ValidationPipe，接口级允许覆盖
- 入参必须显式 DTO，禁止直接使用 any
- 对外暴露的 Service 方法必须声明返回类型，禁止隐式 `Promise<any>`

## 异常与错误响应
- 异常统一走 Exception Filters，保持响应结构一致
- 需要依赖注入的全局 Filter 通过 APP_FILTER 注册
- 禁止抛出无上下文的通用错误，必须带业务错误码或可追踪信息

## 日志
- 自定义 Logger 必须实现 LoggerService 并注册为 Provider
- 关键操作与异常必须记录结构化日志

## 事务与一致性
- 跨多表写操作必须显式使用事务
- 事务边界放在 Service 层，Repository 仅执行数据操作
- 禁止在事务中发起外部网络调用（HTTP/LLM/消息队列）

## 幂等与并发
- 创建类接口必须支持幂等（幂等键或唯一约束）
- 更新/扣减类操作必须声明并发控制策略（乐观锁/悲观锁/版本号）
- 禁止“先查后改”无保护写入，必须用事务或原子条件更新

## 外部依赖调用
- 对外 HTTP/LLM 调用必须配置超时、重试上限与熔断/降级策略
- 重试仅用于幂等请求，非幂等请求禁止自动重试
- 外部依赖失败必须转成可观测的业务错误码，禁止吞错
- 禁止在业务代码中散落调用第三方 SDK，必须通过 adapter/service 统一封装

## 测试要求
- Service 层必须有单元测试覆盖核心分支
- Controller 至少覆盖参数校验与错误响应契约
- 关键业务流程必须有集成测试（含数据库交互）

## 复杂度阈值与重构触发
- 单个 Service 方法超过 80 行必须拆分为 use-case/领域函数
- 单个 Controller 方法超过 40 行必须下沉到 Service
- 单个模块出现超过 7 个 Service 方法且职责混杂时，必须按子域拆分模块
- 出现重复业务判断超过 2 处时，必须抽取领域服务或策略类

## 可读性约束（常用实践）
- 业务分支超过 3 类状态时，优先使用策略模式或状态映射表，禁止长链 `if/else`
- 单个文件同时出现 Controller + Service + Repository 逻辑时必须拆分
- 命名必须表达业务含义，禁止 `data/list/info/temp` 等泛化命名作为核心变量
- 工具函数目录禁止演化为“万能 utils”，新增工具需标注业务域与用途

## 防数据流混乱约束
- 入站 DTO、领域模型、出站 DTO 必须分离，禁止同一对象贯穿全流程
- 写操作与读操作建议分离（复杂场景采用 CQRS 风格）
- 对外返回字段必须白名单化，禁止透出内部字段（如 deletedAt/internalNote）

## AI 调用
- LLM 调用仅允许从 src/shared/llm 统一出口
- API Key 只允许环境变量 DASHSCOPE_API_KEY，禁止硬编码
