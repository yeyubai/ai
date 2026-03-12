# AI Structure

根目录：ai

结构：
- prompts/system/：系统提示词
- prompts/templates/：模板片段
- prompts/versions/：版本化提示词
- evals/datasets/：评测数据集
- evals/rubrics/：评分规则
- evals/runs/：评测记录
- datasets/raw/：原始数据
- datasets/processed：处理后数据
- outputs/reports/：评测报告
- outputs/generations/：生成结果
- safety/：安全与合规
- playground/：实验与快速验证

规则：
- prompts、evals、datasets 为源资产目录
- outputs、playground 为产物目录，可按周期清理
- 任何线上使用的提示词必须在 prompts/versions 下有版本文件
