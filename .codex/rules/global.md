# Global Rules

## 技术生态（已定）
- 前端：Next.js（App Router）+ React 18 + TypeScript + Tailwind CSS + shadcn/ui
- 后端：NestJS + Prisma + MySQL（Node 20+）
- AI：阿里大模型（DashScope/Qwen API，HTTP 调用）
- 客户端：WebView H5 + 原生壳（Android/iOS）

## 规则优先级
- 全局规则约束所有模块
- 模块规则优先级高于全局规则
- 子模块规则优先级高于模块规则

## 分层与依赖方向
- 前端层次：路由(app) → 业务(features) → 展示组件(components) → 基础能力(lib)
- 后端层次：Controller → Service → Repository → Database
- AI 资产层次：prompts → evals → outputs
- 依赖只能自上而下，禁止反向依赖
- 跨模块调用必须通过公开入口或接口契约

## 可维护性与可读性
- 单文件单职责，避免超大文件
- UI 与业务逻辑分离，副作用集中在 hooks 或 services
- 复杂逻辑必须拆分为可测试的纯函数或独立服务
- 公共能力放 shared/lib，业务模块不得反向依赖

## 质量门禁
- 合并前必须通过 lint/typecheck/unit（及模块级 integration，如有）
- 变更必须包含最小可验证用例（测试/截图/日志）之一
- 禁止跳过 CI（紧急修复需记录原因）

## 代码评审清单（强制）
- 是否存在跨层调用（如 Controller 直调 Repository、组件直调 API 客户端）
- 是否引入重复状态/重复业务判断且未抽象
- 是否新增 `any`、魔法值、语义不明命名
- 是否补充必要测试与文档（契约、错误码、迁移说明）

## API 基线
- 路由前缀统一为 /api/v1
- 响应统一结构：code、message、data、traceId
- 需要分页的接口统一使用 page/pageSize 并返回 total
- 外部接口必须鉴权、限流、审计
- 错误码与接口契约必须维护在 docs/api

## 兼容与发布
- 破坏性 API 变更必须升级版本（/api/v2），旧版本保留兼容期
- 数据库变更必须可回滚或提供回滚方案

## 配置与环境
- 环境变量读取集中到 config 层，禁止散落在业务代码
- NEXT_PUBLIC_ 仅用于前端可暴露配置
- 超时与重试必须显式配置（默认禁止无限重试）

## 性能与成本
- 列表接口默认分页，禁止一次性返回全量
- 大量并发外部请求必须做限流/批量/缓存

## 安全与合规
- 对外 API 设计与实现需对照 OWASP API Security Top 10 2023
- 密钥只允许通过环境变量传入，禁止硬编码或入库
- 所有外部输入必须进行校验与清洗
- 日志中禁止输出密钥、Token 与敏感个人数据
- 生产环境禁止调试开关与调试日志泄漏

## 可观测性
- traceId 必须在全链路透传
- 关键业务事件必须埋点并可追溯
- 关键错误必须记录结构化日志

## 文档与变更
- 变更 API、数据模型或 Prompt 必须同步更新 docs
- 重大技术决策记录在 docs/tech/decisions
- 每次对话的改动必须记录到 docs/tech/changelog（日期日志 + 模块日志）

## 需求交付流程（强制）
- 所有开发任务必须绑定 PRD 需求编号（如 RQ-001）
- 编码前必须先完成需求设计文档评审：后端设计 + 前端设计
- 开发顺序必须为：后端编码 -> 前端编码
- 前端编码不得早于对应后端 API 契约定稿
