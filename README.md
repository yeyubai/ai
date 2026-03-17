# AI 体重管理教练（WebView + Next.js + NestJS）

本仓库采用“按方向分层、模块内再细分”的结构，目标是让产品、前后端、AI 资产和运维配置都可独立演进且可追溯。

## 依赖安装约定

- 前端依赖在 `apps/web` 安装：`npm install`（cwd: `apps/web`）
- 后端依赖在 `backend` 安装：`npm install --workspaces=false`（cwd: `backend`）
- 根目录 `package.json` 仅作为脚本调度入口，不承载业务依赖安装

## 推荐启动方式

如果你在 Codex App 的“运行”面板里直接执行命令，建议统一在仓库根目录运行：

- 首次安装依赖：`npm run setup`
- 同时启动前后端：`npm run dev`
- 单独启动前端：`npm run dev:web`
- 单独启动后端：`npm run dev:backend`
- 安装原生端依赖：`npm run install:native`
- 初始化 Android 容器：`npm run native:android:add`
- 同步原生工程配置：`npm run native:sync`
- 打开 Android 工程：`npm run native:open:android`
- Windows 下如果 PowerShell 拦截 `npm`，直接用：`npm.cmd run setup` / `npm.cmd run dev`
- 也可以直接运行根目录脚本：`.\setup.cmd` / `.\dev.cmd`

这样不需要手动切到 `apps/web` 或 `backend`。

说明：
- 前端默认端口：`3000`
- 后端默认端口：`3001`
- 后端启动前需要先准备好 `backend/.env` 和可用的 MySQL 数据库连接
- 原生 Android 构建需要本机具备 JDK 与 Android Studio；`apps/native` 当前默认用于内部测试阶段的容器接入

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
## Frontend Next.js output isolation

- `apps/web` now isolates Next.js output directories by mode:
- `npm --prefix apps/web run dev` -> `.next-dev`
- `npm --prefix apps/web run build` / `start` -> `.next-prod`
- This avoids the common local 404 issue where `next dev` and `next build` overwrite the same `.next` artifacts and the browser keeps requesting stale chunks.

## Idempotent local dev startup

- `npm run dev` now automatically frees stale local dev ports before starting:
- web: `3000`
- backend: `3001`
- it also clears older fallback web ports `3002` and `3003`
- this is meant to make repeated starts from new terminals safe, instead of requiring manual process cleanup first.
