# Frontend Structure

根目录：apps/web

## 目录结构
- app/：Next.js App Router（page/layout/loading/error/not-found/route）
- app/api/：Route Handlers（BFF 或前端专用 API）
- app/(group)/：路由分组
- app/**/_components：页面私有组件（仅当前路由使用）
- components/ui/：shadcn/ui 基础组件源码
- components/features/：跨页面业务组件
- components/shared/：通用展示组件
- features/<feature>/：业务功能域
- hooks/：全局自定义 hooks
- stores/：跨业务域的全局状态（可选）
- lib/api/：HTTP 客户端与鉴权
- lib/utils/：通用工具
- lib/validation/：前端校验与 schema
- styles/：全局样式与主题
- public/：静态资源
- tests/：前端测试

## 业务域分层（features/<feature>）
- ui/：页面级 UI 与组合
- ui/components/：模块内可复用组件（仅当前业务域使用）
- ui/sections/：页面区块组件（多用于页面布局拼装）
- model/：状态与业务规则（store）
- api/：该功能域的接口封装
- hooks/：功能域内部 hooks
- types/：类型与 schema
- index.ts：对外入口

## 依赖方向
- app 只能依赖 features/components/lib
- features 只能依赖 components/lib
- components 只能依赖 lib
- lib 不得依赖 features 或 components

新增目录必须在该规则中登记用途。
