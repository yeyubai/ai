# Docker 本地启动问题排查记录

owner: engineering
date: 2026-03-22
last_updated: 2026-03-22
scope: local-docker

## 问题 1：`backend` 启动时报 `PrismaClientInitializationError: Can't reach database server at mysql:3306`

### 问题现象

`backend` 容器启动时出现如下错误：

```text
PrismaClientInitializationError: Can't reach database server at `mysql:3306`
Please make sure your database server is running at `mysql:3306`.
errorCode: 'P1001'
```

### 排查思路

这个问题需要先区分三种情况：

1. `DATABASE_URL` 写错了，后端连到了不存在的地址。
2. `mysql` 容器根本没起来，或者网络里不可解析。
3. MySQL 会起来，但后端启动时机更早，导致短暂连接失败。

建议按下面顺序排查：

1. 看 compose 服务状态，确认 `mysql`、`backend`、`web` 是否都在运行。
2. 查看 compose 解析后的环境变量，确认 `DATABASE_URL` 到底是什么。
3. 进入 `backend` 容器测试 `mysql` 这个主机名是否可解析。
4. 看 `backend` 的启动日志，判断是永久不可达还是启动瞬间不可达。

### 实际排查命令

```powershell
docker compose -f infra\docker-compose.prod.yml --env-file infra\.env.backend ps
docker compose -f infra\docker-compose.prod.yml --env-file infra\.env.backend config
docker exec ai-weight-coach-backend getent hosts mysql
docker logs --tail 200 ai-weight-coach-backend
```

### 实际定位结果

排查结果如下：

- `DATABASE_URL=mysql://ai_weight_coach:123456@mysql:3306/ai_weight_coach`
- `mysql` 在 compose 网络里可以正常解析
- `mysql` 容器本身是健康的
- `backend` 容器存在“先报 `P1001`，随后重启成功”的现象

这说明问题不是地址写错，也不是容器永远不可达，而是后端在启动时对数据库可用性的波动没有容错。

### 处理方式

为 Prisma 启动阶段增加重试逻辑，修改了：

- [prisma.service.ts](/D:/project/my/ai/ai-weight-coach/backend/src/shared/db/prisma.service.ts)
- [env.config.ts](/D:/project/my/ai/ai-weight-coach/backend/src/shared/config/env.config.ts)

处理内容：

- 对 `P1001`、`P1002`、`ECONNREFUSED`、DNS 暂不可达等错误增加启动重试
- 默认参数：
  - `DB_CONNECT_MAX_RETRIES=15`
  - `DB_CONNECT_RETRY_DELAY_MS=2000`

### 验证方式

```powershell
npm.cmd --prefix backend run build
docker build -t ai-weight-coach-backend:latest -f backend/Dockerfile .
docker compose -f infra\docker-compose.prod.yml --env-file infra\.env.backend up -d backend
docker logs --tail 80 ai-weight-coach-backend
```

### 验证结果

重建后端镜像并重新拉起后：

- `backend` 正常启动
- 健康检查通过
- 容器内已确认存在新的重试逻辑编译产物

## 问题 2：首页一直停留在“临时会话初始化没有成功”

### 问题现象

浏览器访问 Docker 暴露地址 `http://localhost:3000` 后，页面没有进入首页，而是停在错误页：

- 连接失败
- 临时会话初始化没有成功
- 请确认前端和后端本地服务已经启动，然后点击重试

### 排查思路

这个问题不能只盯着前端页面，要先找出“这个页面是被哪一次失败请求触发的”。

建议按下面顺序排查：

1. 找到该页面对应的前端逻辑。
2. 确认页面初始化时会调用哪个接口。
3. 直接绕开前端，请求那个接口，看是否返回 `500`。
4. 如果是 `500`，继续转到后端日志和数据库层排查。

### 实际排查文件

- [page.tsx](/D:/project/my/ai/ai-weight-coach/apps/web/app/page.tsx)
- [auth.store.ts](/D:/project/my/ai/ai-weight-coach/apps/web/features/auth/model/auth.store.ts)
- [auth.api.ts](/D:/project/my/ai/ai-weight-coach/apps/web/features/auth/api/auth.api.ts)

### 实际定位结果

前端首页会在首次访问时自动执行 `ensureGuestSession()`，进而调用：

```text
POST /api/v1/auth/guest
```

直接请求该接口时，返回的是：

```text
500 INTERNAL_ERROR
```

因此这个问题不是前端页面本身渲染错了，而是首页初始化游客会话时，后端接口真实失败了。

### 实际排查命令

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/v1/auth/guest
docker logs --tail 120 ai-weight-coach-backend
```

### 处理方式

继续向下排查后端接口失败原因，见“问题 3”。

### 验证方式

在后续数据库问题修复完成后，再次访问：

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/v1/auth/guest
```

并在浏览器打开：

```text
http://localhost:3000
```

### 验证结果

修复后：

- `/api/v1/auth/guest` 能正常返回 token
- 首页从“正在进入应用”自动跳转到 `/home`

## 问题 3：`/api/v1/auth/guest` 返回 `500 INTERNAL_ERROR`

### 问题现象

虽然 `backend` 服务本身已经能启动，`/api/v1/health` 也能返回 `200`，但是：

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/v1/auth/guest
```

返回：

```text
500 INTERNAL_ERROR
```

### 排查思路

当健康检查正常但业务接口报 `500` 时，优先怀疑以下几类问题：

1. 业务依赖的数据库表不存在。
2. Prisma schema 和数据库结构不一致。
3. 迁移没有跑完或被失败迁移卡住。

建议按下面顺序排查：

1. 查看接口依赖的 repository，确认它需要访问哪些表。
2. 查看数据库当前实际有哪些表。
3. 查看 Prisma 迁移状态。

### 实际排查文件

- [auth.controller.ts](/D:/project/my/ai/ai-weight-coach/backend/src/modules/auth/controllers/auth.controller.ts)
- [auth.service.ts](/D:/project/my/ai/ai-weight-coach/backend/src/modules/auth/services/auth.service.ts)
- [auth.repository.ts](/D:/project/my/ai/ai-weight-coach/backend/src/modules/auth/repositories/auth.repository.ts)

### 实际排查命令

```powershell
docker exec ai-weight-coach-mysql mysql -uai_weight_coach -p123456 -D ai_weight_coach -e "SHOW TABLES;"
docker exec ai-weight-coach-backend npx prisma migrate status
```

### 实际定位结果

排查发现：

- 数据库里只有 `_prisma_migrations`
- `users`、`auth_sessions` 等业务表根本不存在
- Prisma 显示多条迁移尚未应用

而 `POST /api/v1/auth/guest` 正是依赖：

- `users`
- `auth_sessions`

所以接口返回 `500` 的直接原因，是数据库结构没有初始化完整。

### 处理方式

继续检查迁移为什么没有正常应用，见“问题 4”。

### 验证方式

数据库修复完成后重新执行：

```powershell
docker exec ai-weight-coach-mysql mysql -uai_weight_coach -p123456 -D ai_weight_coach -e "SHOW TABLES;"
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/v1/auth/guest
```

### 验证结果

修复后数据库中出现了完整业务表，`/api/v1/auth/guest` 能返回正常游客会话数据。

## 问题 4：Prisma 迁移被失败记录卡住，后续迁移无法继续执行

### 问题现象

尝试执行：

```powershell
docker exec ai-weight-coach-backend npx prisma migrate deploy
```

返回：

```text
Error: P3009
migrate found failed migrations in the target database
```

### 排查思路

当 Prisma 报 `P3009` 时，重点不是立刻重跑迁移，而是先确认：

1. 是哪一条迁移失败了。
2. 失败时数据库里已经落了多少结构。
3. 当前数据库是不是空库。
4. 失败迁移的 SQL 内容是否和当前仓库历史一致。

建议按下面顺序排查：

1. 查询 `_prisma_migrations` 表里的失败记录。
2. 打开对应迁移文件看 SQL 内容。
3. 对比该迁移是否在代码历史中被改过。

### 实际排查命令

```powershell
docker exec ai-weight-coach-mysql mysql -uai_weight_coach -p123456 -D ai_weight_coach -e "SELECT migration_name,started_at,finished_at,rolled_back_at,logs FROM _prisma_migrations\\G"
Get-Content backend\prisma\migrations\20260313_add_checkins_activity_completed\migration.sql
git diff -- backend\prisma\migrations\20260313_add_checkins_activity_completed\migration.sql backend\prisma\migrations\20260314_weight_diary_foundation\migration.sql
```

### 实际定位结果

定位到失败迁移为：

```text
20260313_add_checkins_activity_completed
```

数据库中记录的失败原因是：

```text
Table 'ai_weight_coach.checkins_activity' doesn't exist
```

进一步对比发现，这条迁移当前文件内容已经不是一个简单的“给 `checkins_activity` 增字段”的 SQL，而更像是被后续改写成了整套初始建库脚本。

也就是说，这里存在迁移历史漂移：

- 迁移名是旧的
- SQL 内容是后改的
- 数据库里已经记过一次失败

这会导致 Prisma 为了保护数据库，拒绝继续往后应用迁移。

### 处理方式

由于本次确认数据库还是本地空库，只有 `_prisma_migrations`，没有真实业务数据，所以可以安全执行：

```powershell
docker exec ai-weight-coach-backend npx prisma migrate resolve --rolled-back 20260313_add_checkins_activity_completed
docker exec ai-weight-coach-backend npx prisma migrate deploy
```

第一步把失败迁移标记为已回滚，第二步重新应用全部迁移。

### 验证方式

```powershell
docker exec ai-weight-coach-backend npx prisma migrate status
docker exec ai-weight-coach-mysql mysql -uai_weight_coach -p123456 -D ai_weight_coach -e "SHOW TABLES;"
```

### 验证结果

迁移全部成功应用，数据库中出现了完整业务表：

- `users`
- `auth_sessions`
- `user_profiles`
- `user_settings`
- `weight_entries`
- `weight_goals`
- `diary_entries`
- `coach_analysis_sessions`
- 其他业务表

## 问题 5：服务都 healthy，但浏览器仍停留在旧错误页

### 问题现象

当后端和数据库已经修好后，浏览器标签页可能仍显示之前那张“临时会话初始化没有成功”的页面，让人误以为问题没有解决。

### 排查思路

这种情况要区分：

1. 当前页面是不是旧状态，没有重新触发初始化流程。
2. 真实接口是否已经恢复。
3. 新打开页面是否能正常进入首页。

建议按下面顺序排查：

1. 再测一次 `/api/v1/auth/guest`。
2. 新开一个浏览器页面访问首页。
3. 观察是否会从 `/` 自动跳到 `/home`。

### 实际排查方式

使用浏览器自动化验证：

- 打开 `http://localhost:3000`
- 等待 2 秒
- 观察是否从 `/` 跳转到 `/home`

### 实际定位结果

验证结果表明：

- 首页先显示“正在进入应用”
- 随后自动跳转到 `/home`

因此旧错误页只是浏览器中的前一次失败状态，不代表当前后端仍有问题。

### 处理方式

刷新当前页面，或重新打开首页即可。

### 验证结果

刷新后页面能正常进入应用首页。

## 问题 6：如何复用这次排查顺序

### 排查思路

以后如果再次遇到“Docker 容器看起来都启动了，但应用页面不可用”的情况，建议固定按下面顺序排查：

1. 先看 compose 服务状态：

```powershell
docker compose -f infra\docker-compose.prod.yml --env-file infra\.env.backend ps
```

2. 再看后端健康检查：

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:3001/api/v1/health
```

3. 再测首页关键初始化接口：

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/v1/auth/guest
```

4. 如果业务接口失败，再看数据库表：

```powershell
docker exec ai-weight-coach-mysql mysql -uai_weight_coach -p123456 -D ai_weight_coach -e "SHOW TABLES;"
```

5. 如果业务表不全，再看 Prisma 迁移状态：

```powershell
docker exec ai-weight-coach-backend npx prisma migrate status
```

### 注意事项

- `migrate resolve --rolled-back` 只适合确认过的本地空库，不适合直接套用到有真实数据的环境。
- 已经被任何环境执行过的迁移文件，不应继续修改历史 SQL；应新增补丁迁移。
