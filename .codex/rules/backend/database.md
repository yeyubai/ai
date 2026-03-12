# Backend Database Rules

## Prisma 规范
- schema.prisma 固定在 backend/prisma/schema.prisma
- migrations/ 与 schema.prisma 同级，并纳入版本控制
- 开发环境使用 prisma migrate dev
- 预发/生产使用 prisma migrate deploy
- prisma.config.ts 可用于配置 schema 路径与 migrations 路径
- 使用 @map/@@map 将 Prisma 命名与数据库表/列解耦
- Model 使用 PascalCase，字段使用 camelCase；数据库表/列使用 snake_case
- 迁移命名必须表达意图（如 add_user_goal_index、alter_weight_log_nullable_note）
- 生产迁移前必须先在影子库或预发库验证

## MySQL 规范
- 默认存储引擎使用 InnoDB
- 外键列必须有索引，引用列也必须有索引
- 避免使用 BLOB/TEXT 作为外键列
- 字符集使用 utf8mb4，避免 utf8/utf8mb3
- 所有表结构变更必须通过迁移脚本
- 高频查询条件必须有对应索引，禁止无索引全表扫描进入生产
- 变更大表结构时必须采用零停机策略：先加字段/表、回填数据、切换读写、再清理旧结构
- 删除字段或收紧约束前必须完成灰度与回滚预案
