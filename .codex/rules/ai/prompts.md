# AI Prompt Rules

## DashScope 调用规范
- messages 使用 system/user/assistant/tool 角色（按接口定义）
- role 值必须使用固定枚举，禁止自定义
- API Key 必须走环境变量 DASHSCOPE_API_KEY

## 结构化输出
- 结构化输出优先使用 response_format 的 json_schema
- json_schema 建议启用 strict 以确保结构化输出一致性
- 结构化字段必须声明 required 与枚举范围，减少歧义

## 工具调用
- 工具调用参数必须进行校验，失败时返回可恢复错误
- 工具执行超时必须可中断并返回明确错误码

## 版本与追溯
- 提示词必须版本化（v{major}_{slug}.md）
- 每次修改需要更新版本号与变更说明
- 提示词必须记录适用模型与参数范围（temperature/top_p）

## 安全与注入防护
- 禁止把密钥或隐私信息写入 prompt
- 用户输入必须做分隔与转义，避免注入
- 系统指令与用户输入必须显式分区，禁止拼接成同级自由文本

## 评测联动
- 修改提示词必须同步更新 evals 与评分规则
