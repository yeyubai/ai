# Frontend Requirement Design Template

owner: engineering
requirement_id: rq-xxx
prd_ref: docs/product/prd/<prd-file>.md
backend_design_ref: docs/tech/design/requirements/<rq-id>/<backend-file>.md
status: draft|reviewed|approved

## 1. 需求范围
- 页面与交互范围
- Out of scope

## 2. 页面与路由设计
- 路由
- 页面层组件
- 模块层组件

## 3. 数据流设计
- 页面顶层请求
- store 归属（仅共享状态）
- props 传递与事件回调

## 4. 接口契约映射
- 使用的后端接口
- DTO 到 UI Model 映射
- 错误态映射

## 5. 交互与状态
- loading/empty/error/success
- 表单校验与提交
- 重试策略

## 6. 埋点设计
- 事件名
- 触发时机
- 属性字段

## 7. 测试方案
- Component tests
- Page flow tests
- Contract mock tests

## 8. 开发任务拆解
- FE task list
