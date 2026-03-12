# Backend Structure

根目录：backend

## 目录结构
- src/main.ts：应用入口
- src/app.module.ts：根模块
- src/modules/<feature>/：业务模块
- src/shared/：通用能力（config/db/llm/logger/guards/filters/interceptors/pipes/dto）
- prisma/：schema.prisma 与 migrations
- tests/：unit 与 integration
- scripts/：运维脚本

## 模块内分层（src/modules/<feature>）
- module.ts
- controllers/：接口层
- services/：业务层
- repositories/：数据访问层
- dto/：输入输出结构
- entities/：实体与聚合
- guards/：权限控制
- pipes/：转换与校验

## 依赖方向
- Controller → Service → Repository → Database
- shared 不得依赖业务模块

新增模块需同步补充 docs/tech/architecture 与接口文档。
