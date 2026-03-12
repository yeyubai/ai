# Naming Rules

## 目录与路由
- 目录/路由：kebab-case
- 路由分组：使用 (group)
- 动态路由：使用 [id]、[...slug]、[[...slug]]

## Next.js 文件约定
- page.tsx、layout.tsx、loading.tsx、error.tsx、not-found.tsx
- route.ts（Route Handler）

## 前端文件
- React 组件：PascalCase.tsx
- Hooks：useXxx.ts
- 工具与模块：xxx.util.ts / xxx.helper.ts
- 测试：*.spec.ts / *.spec.tsx

## 后端文件
- NestJS：xxx.module.ts / xxx.controller.ts / xxx.service.ts / xxx.dto.ts
- DTO：XxxDto、XxxQueryDto、XxxResponseDto
- Guards：XxxGuard
- Filters：XxxFilter
- Interceptors：XxxInterceptor
- Pipes：XxxPipe

## 数据库
- Prisma Model：PascalCase
- Prisma 字段：camelCase
- 数据库表/列：snake_case
- 索引：idx_<table>_<column>
- 唯一索引：uk_<table>_<column>
- 外键：fk_<from>_<to>

## AI 与文档
- Prompt：v{major}_{slug}.md
- 数据集：dataset_{slug}.jsonl
- 评分规则：rubric_{slug}.md
- 评测记录：YYYY-MM-DD_{model}_{promptVersion}.json
- 文档：YYYY-MM-DD-xxx.md
