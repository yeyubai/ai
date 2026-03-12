# AI 体重管理教练（WebView + Next.js + NestJS）

本仓库采用“按方向分层、模块内再细分”的结构，目标是让产品、前后端、AI 资产和运维配置都可独立演进且可追溯。

## 依赖安装约定

- 前端依赖在 `apps/web` 安装：`npm install`（cwd: `apps/web`）
- 后端依赖在 `backend` 安装：`npm install --workspaces=false`（cwd: `backend`）
- 根目录 `package.json` 仅作为脚本调度入口，不承载业务依赖安装

## 顶层目录说明

- `.codex/`：项目规则、评审清单、本地技能（skills）
- `apps/`：客户端应用层
- `backend/`：服务端（NestJS + Prisma + MySQL）
- `ai/`：AI 工程资产（prompt、eval、数据、输出）
- `docs/`：产品、技术、API、AI 文档
- `infra/`：部署与 CI/CD 相关配置
- `scripts/`：通用脚本
- `tests/`：跨服务或集成层测试
- `.editorconfig` / `.prettierrc.json` / `.prettierignore`：代码风格与格式化约束

## 目录结构（简版）

```text
.
├─ .codex/
│  ├─ project-rules.md
│  ├─ rules/
│  │  ├─ frontend/
│  │  ├─ backend/
│  │  ├─ ai/
│  │  ├─ native/
│  │  ├─ testing/
│  │  └─ review/
│  └─ skills/
├─ apps/
│  ├─ web/                    # Next.js Web 端
│  └─ native/                 # Android / iOS WebView 壳与 bridge
├─ backend/
│  ├─ src/                    # 业务模块与 shared
│  ├─ prisma/                 # schema 与 migrations
│  ├─ tests/
│  └─ scripts/
├─ ai/
│  ├─ prompts/                # system/templates/versions
│  ├─ evals/                  # datasets/rubrics/runs
│  ├─ datasets/               # raw/processed
│  ├─ outputs/                # reports/generations
│  ├─ safety/
│  └─ playground/
├─ docs/
│  ├─ product/                # prd/roadmap/metrics/research/design
│  ├─ tech/                   # architecture/design/decisions/runbooks/changelog
│  ├─ api/                    # openapi/errors/contracts
│  └─ ai/                     # prompts/evals/safety 文档
├─ infra/
│  ├─ ci/
│  ├─ docker/
│  ├─ env/
│  └─ k8s/
├─ scripts/
└─ tests/
```

## 建议阅读顺序

1. 项目规则入口：`.codex/project-rules.md`
2. 详细架构说明：`docs/tech/architecture/project-structure.md`
3. 对话与模块变更日志：`docs/tech/changelog/README.md`
