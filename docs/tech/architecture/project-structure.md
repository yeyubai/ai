# 项目结构（方向分层 + 目录细分）

本结构按“前端/后端/AI/文档/基础设施”方向拆分，并在每个方向下继续细分。

## 顶层结构

- apps/：前端与客户端
- backend/：后端服务
- ai/：AI 资产
- docs/：产品与技术文档
- infra/：部署与 CI/CD
- scripts/：脚本
- tests/：跨服务测试

## apps/web（前端）

- app/：Next.js App Router
- components/ui/：shadcn/ui 基础组件
- components/features/：业务组件
- features/：业务功能域
- hooks/：自定义 hooks
- lib/api/：API 客户端与鉴权
- lib/utils/：通用工具
- styles/：全局样式与主题
- public/：静态资源
- tests/：前端测试

## backend（后端）

- src/modules/<feature>/：业务模块
- src/shared/：通用能力（config/db/llm/logger/guards/filters/dto）
- prisma/：schema 与 migrations
- tests/：unit 与 integration
- scripts/：运维脚本

## ai（AI）

- prompts/system/：系统提示词
- prompts/templates/：模板片段
- prompts/versions/：版本化提示词
- evals/datasets/：评测数据集
- evals/rubrics/：评分规则
- evals/runs/：评测记录
- datasets/raw/：原始数据
- datasets/processed：处理后数据
- outputs/reports/：评测报告
- outputs/generations/：生成结果
- safety/：安全与合规
- playground/：实验与快速验证

## docs（文档）

- product/prd：需求文档
- product/roadmap：版本计划
- product/metrics：指标口径
- product/research：用户与市场研究
- product/design：设计规范
- tech/architecture：架构设计
- tech/design：需求实现设计（按需求拆分后端/前端）
- tech/decisions：技术决策记录
- tech/runbooks：运维手册
- api/openapi：API 规范
- api/errors：错误码
- api/contracts：接口契约
- ai/prompts：提示词策略
- ai/evals：评测策略
- ai/safety：安全规范

## infra

- docker：容器化
- k8s：集群部署
- ci：CI/CD
- env：环境模板
