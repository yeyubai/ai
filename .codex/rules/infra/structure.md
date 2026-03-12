# Infra Structure

根目录：infra

结构：
- docker：Dockerfile、compose 与本地容器化
- k8s：Kubernetes manifests 或 Helm Chart
- ci：CI/CD 脚本与流水线
- env：环境变量模板（.env.example）

规范：
- 只提交环境模板，禁止提交真实密钥
- 多环境配置使用显式目录或文件名区分
- CI 流水线最少包含：lint、typecheck、test、build
- 主分支部署必须来源于受保护分支与通过检查的提交
- 数据库迁移步骤必须纳入发布流程并可回滚
- 生产发布必须保留版本标识（镜像 tag/commit sha）
- 关键服务必须具备健康检查与告警配置
