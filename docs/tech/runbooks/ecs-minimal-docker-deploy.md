# ECS 最简 Docker 部署说明

这个项目可以用一台阿里云 ECS、Docker、GitHub Actions 和 Docker 中运行的 MySQL 8 来完成部署。

## 拓扑结构

- `web` 运行在 Docker 中，对外暴露 `3000`
- `backend` 运行在 Docker 中，对外暴露 `3001`
- MySQL 8 运行在 Docker 中
- 这套最简方案不引入 Nginx

对外访问入口：

- `http://<ECS_PUBLIC_IP>:3000`
- `http://<ECS_PUBLIC_IP>:3001/api/v1`

## 数据库连接说明

因为 `backend` 和 `mysql` 都在同一个 Compose 网络中，后端通过服务名连接数据库。

请使用：

```env
DATABASE_URL=mysql://<DB_USER>:<DB_PASSWORD>@mysql:3306/ai_weight_coach
```

数据库容器的数据通过 volume 持久化：

```yaml
volumes:
  mysql-data:
```

这样容器重建后，数据库数据仍然保留。

## 服务器必备文件

首次部署前，请在 `/opt/ai-weight-coach` 下准备这些文件：

- `.env.web`
- `.env.backend`
- `.env.mysql`

`.env.web` 示例：

```env
# 服务器路径: /opt/ai-weight-coach/.env.web
# 将 <ECS_PUBLIC_IP> 替换为你的 ECS 公网 IP，例如 47.xx.xx.xx
PORT=3000
NEXT_PUBLIC_API_BASE_URL=http://<ECS_PUBLIC_IP>:3001/api/v1
```

`.env.backend` 示例：

```env
# 服务器路径: /opt/ai-weight-coach/.env.backend
# <DB_USER> / <DB_PASSWORD> 请与 .env.mysql 中保持一致
# <ECS_PUBLIC_IP> 替换为你的 ECS 公网 IP
# DASHSCOPE_API_KEY 填你的通义千问兼容接口 Key
PORT=3001
DATABASE_URL=mysql://<DB_USER>:<DB_PASSWORD>@mysql:3306/ai_weight_coach
DASHSCOPE_API_KEY=<DASHSCOPE_API_KEY>
AUTH_MOCK_CODE=123456
AUTH_TOKEN_EXPIRES_IN_SECONDS=7200
CORS_ORIGINS=http://<ECS_PUBLIC_IP>:3000
```

`.env.mysql` 示例：

```env
# 服务器路径: /opt/ai-weight-coach/.env.mysql
# MYSQL_USER / MYSQL_PASSWORD 需要与 .env.backend 里的 DATABASE_URL 保持一致
MYSQL_DATABASE=ai_weight_coach
MYSQL_USER=<DB_USER>
MYSQL_PASSWORD=<DB_PASSWORD>
MYSQL_ROOT_PASSWORD=<MYSQL_ROOT_PASSWORD>
```

## GitHub Secrets 配置

请在仓库中配置这些 secrets：

- `ALIYUN_ACR_REGISTRY`
- `ALIYUN_ACR_USERNAME`
- `ALIYUN_ACR_PASSWORD`
- `ACR_WEB_IMAGE_REPOSITORY`
- `ACR_BACKEND_IMAGE_REPOSITORY`
- `PROD_NEXT_PUBLIC_API_BASE_URL`
- `DEPLOY_HOST`
- `DEPLOY_PORT`
- `DEPLOY_USER`
- `DEPLOY_SSH_PRIVATE_KEY`

## 信息填写位置

### 1. GitHub 仓库里填写

路径：

`GitHub 仓库 -> Settings -> Secrets and variables -> Actions -> New repository secret`

建议这样填写：

- `ALIYUN_ACR_REGISTRY`
  例如：`registry.cn-beijing.aliyuncs.com`
- `ALIYUN_ACR_USERNAME`
  填你的阿里云 ACR 用户名
- `ALIYUN_ACR_PASSWORD`
  填你的阿里云 ACR 密码或访问凭证
- `ACR_WEB_IMAGE_REPOSITORY`
  例如：`ai-weight-coach/web`
- `ACR_BACKEND_IMAGE_REPOSITORY`
  例如：`ai-weight-coach/backend`
- `PROD_NEXT_PUBLIC_API_BASE_URL`
  例如：`http://<ECS_PUBLIC_IP>:3001/api/v1`
- `DEPLOY_HOST`
  填你的 ECS 公网 IP
- `DEPLOY_PORT`
  默认一般填 `22`
- `DEPLOY_USER`
  例如：`root`
- `DEPLOY_SSH_PRIVATE_KEY`
  填用于登录 ECS 的私钥全文

### 2. ECS 服务器里填写

路径：

`/opt/ai-weight-coach/.env.web`  
`/opt/ai-weight-coach/.env.backend`  
`/opt/ai-weight-coach/.env.mysql`

可以直接从这些模板复制：

- [infra/.env.web.example](/D:/project/my/ai/ai-weight-coach/infra/.env.web.example)
- [infra/.env.backend.example](/D:/project/my/ai/ai-weight-coach/infra/.env.backend.example)
- [infra/.env.mysql.example](/D:/project/my/ai/ai-weight-coach/infra/.env.mysql.example)

### 3. 你现在至少需要准备的真实信息

- ECS 公网 IP
- SSH 用户名
- SSH 端口
- SSH 私钥
- 阿里云 ACR 登录地址
- 阿里云 ACR 用户名
- 阿里云 ACR 密码或令牌
- `web` 镜像仓库名
- `backend` 镜像仓库名
- `DASHSCOPE_API_KEY`
- 数据库用户名
- 数据库密码
- MySQL root 密码

## ECS 服务器准备

1. 安装 Docker 和 Compose 插件。
2. 创建目录 `/opt/ai-weight-coach`。
3. 将 `.env.web`、`.env.backend`、`.env.mysql` 放到 `/opt/ai-weight-coach`。
4. 在 ECS 安全组中开放 `22`、`3000`、`3001`。
5. 保持 `3306` 不对公网开放。
6. 在宿主机上安装 `curl` 或 `wget`，用于部署脚本执行健康检查。

## 部署流程

每次 push 到 `main` 后，GitHub Actions 会执行：

1. 安装依赖
2. 执行 `npm run typecheck`
3. 执行 `npm run test`
4. 构建 `web` 和 `backend` 镜像
5. 将两个镜像推送到阿里云 ACR
6. 上传 `docker-compose.prod.yml` 和 `deploy.sh` 到 ECS
7. 在远端执行部署脚本

部署脚本会依次执行：

1. 登录 ACR
2. 拉取目标镜像
3. 启动 `mysql`
4. 等待 `mysql` 健康检查通过
5. 执行 `npx prisma migrate deploy`
6. 启动 `backend`
7. 校验 `http://127.0.0.1:3001/api/v1/health`
8. 启动 `web`
9. 校验 `http://127.0.0.1:3000`
10. 如果切换后失败，则回滚到上一版镜像
