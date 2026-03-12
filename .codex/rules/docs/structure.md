# Docs Structure

根目录：docs

结构：
- product/prd：需求文档
- product/roadmap：版本计划
- product/metrics：指标口径
- product/research：用户与市场研究
- product/design：设计规范
- tech/architecture：架构设计
- tech/design：需求实现设计（每个需求一组后端/前端设计文档）
- tech/decisions：技术决策记录（ADR）
- tech/runbooks：运维手册
- tech/changelog：对话与模块变更日志
- api/openapi：API 规范
- api/errors：错误码
- api/contracts：接口契约
- ai/prompts：提示词策略
- ai/evals：评测策略
- ai/safety：安全规范

规范：
- 文档命名统一 YYYY-MM-DD-xxx.md
- `tech/changelog/conversations` 按日期命名为 `YYYY-MM-DD.md`
- 需求/接口/模型/提示词变更必须同步更新对应文档
- ADR 必须包含背景、选型、影响范围与回滚策略
- API 文档变更必须在同一 PR 中包含示例请求与响应
- 文档需标注 owner 与最后更新时间
- 每个 PRD 需求在编码前必须先有详细设计文档，至少包含：
- 对应后端设计文档（接口、数据模型、校验、异常、测试）
- 对应前端设计文档（页面状态、数据流、交互、埋点、异常）
- 编码顺序必须先后端后前端；前端设计依赖后端契约定稿
- 每次对话产生的代码或规则变更，必须在 tech/changelog/conversations 的当天日期文件中追加记录
- 每次对话变更必须同步追加到 tech/changelog/modules 下对应模块日志
