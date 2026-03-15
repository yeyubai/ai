# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个AI体重管理教练应用，采用"按方向分层、模块内再细分"的架构，包含前端(Next.js)、后端(NestJS)、AI资产和文档等多个模块。

## 开发命令

### 常用命令
- **首次安装依赖**: `npm run setup`
- **同时启动前后端**: `npm run dev`
- **单独启动前端**: `npm run dev:web`
- **单独启动后端**: `npm run dev:backend`
- **构建前端**: `npm run build:web`
- **构建后端**: `npm run build:backend`
- **运行所有测试**: `npm test`
- **运行前端测试**: `npm test:web`
- **运行后端测试**: `npm test:backend`
- **代码检查**: `npm run lint`
- **类型检查**: `npm run typecheck`

### Windows PowerShell 注意
如果PowerShell拦截`npm`命令，使用：
- `npm.cmd run setup`
- `npm.cmd run dev`

## 项目结构

### 顶层目录
- `apps/`: 前端与客户端应用
- `backend/`: NestJS后端服务
- `ai/`: AI资产（prompts、evals、数据等）
- `docs/`: 产品与技术文档
- `infra/`: 部署与CI/CD配置
- `scripts/`: 通用脚本
- `tests/`: 跨服务测试

### 前端结构 (apps/web)
- `app/`: Next.js App Router
- `components/ui/`: shadcn/ui基础组件
- `components/features/`: 业务组件
- `features/`: 业务功能域
- `hooks/`: 自定义hooks
- `lib/api/`: API客户端与鉴权
- `lib/utils/`: 通用工具

### 后端结构 (backend)
- `src/modules/<feature>/`: 业务模块
- `src/shared/`: 通用能力（config/db/llm等）
- `prisma/`: schema与migrations

## 开发规范

### 技术栈
- 前端：Next.js + React 18 + TypeScript + Tailwind CSS + shadcn/ui
- 后端：NestJS + Prisma + MySQL
- AI：阿里大模型（DashScope/Qwen API）

### 架构原则
- 分层与依赖方向：前端层次（路由→业务→组件→基础）、后端层次（Controller→Service→Repository→Database）
- 依赖只能自上而下，禁止反向依赖
- 跨模块调用必须通过公开入口或接口契约

### 代码规范
- 单文件单职责，避免超大文件
- UI与业务逻辑分离
- 复杂逻辑必须拆分为可测试的纯函数或独立服务
- 公共能力放shared/lib，业务模块不得反向依赖

### API规范
- 路由前缀统一为 `/api/v1`
- 响应统一结构：code、message、data、traceId
- 需要分页的接口统一使用 page/pageSize 并返回 total
- 外部接口必须鉴权、限流、审计

### 开发流程
- 所有开发任务必须绑定PRD需求编号（如RQ-001）
- 编码前必须先完成需求设计文档评审：后端设计 + 前端设计
- 开发顺序必须为：后端编码 -> 前端编码
- 前端编码不得早于对应后端API契约定稿

## 重要注意事项

1. **环境配置**: 后端启动前需要准备 `backend/.env` 和可用的MySQL数据库连接
2. **端口**: 前端默认端口3000，后端默认端口3001
3. **输出隔离**: Next.js的dev和build输出目录隔离（.next-dev和.next-prod）
4. **端口清理**: `npm run dev`会自动清理 stale 端口
5. **依赖安装**: 前端依赖在`apps/web`安装，后端依赖在`backend`安装

## 文档位置

- 项目规则：`.codex/project-rules.md`
- 架构说明：`docs/tech/architecture/project-structure.md`
- API契约：`docs/api/contracts/`
- 错误码：`docs/api/errors/`
- 技术决策：`docs/tech/decisions/`

遵循这些规范和结构将帮助您更高效地在这个代码库中工作。